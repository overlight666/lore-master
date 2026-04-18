import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma';
import { authenticateAdmin, checkPermission, auditLog } from '../../middleware/adminAuth';

const router = Router();

router.get(
  '/',
  authenticateAdmin,
  checkPermission('users', 'read'),
  auditLog('read', 'users'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        role,
        isActive,
        sort = 'createdAt',
        order = 'desc',
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const isDevelopment =
        process.env.NODE_ENV === 'development' ||
        process.env.FUNCTIONS_EMULATOR === 'true' ||
        req.hostname?.includes('localhost') ||
        req.hostname?.includes('127.0.0.1');

      if (isDevelopment) {
        const mockUsers = [
          {
            id: 'user1',
            email: 'john.doe@example.com',
            displayName: 'John Doe',
            username: 'johndoe',
            role: 'user',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
      level: 5,
            totalScore: 850,
            questionsAnswered: 42,
          },
        ];
        return res.json({
          users: mockUsers,
          pagination: { page: pageNum, limit: limitNum, total: mockUsers.length, pages: 1 },
        });
      }

      const where: Prisma.UserWhereInput = {};
      if (isActive !== undefined) where.is_active = isActive === 'true';
      if (role) where.role = role as string;
      if (search) {
        where.OR = [
          { username: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const orderBy: Prisma.UserOrderByWithRelationInput =
        sort === 'createdAt' && order === 'desc'
          ? { created_at: 'desc' }
          : { created_at: 'asc' };

      const [total, rows] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          orderBy,
          skip: offset,
          take: limitNum,
        }),
      ]);

      const items = await Promise.all(
        rows.map(async (u) => {
          const attempts = await prisma.quizAttempt.findMany({ where: { user_id: u.id } });
          const completedQuizzes = attempts.length;
          const averageScore =
            completedQuizzes > 0
              ? attempts.reduce((s, a) => s + a.score, 0) / completedQuizzes
              : 0;
          return {
            ...u,
            isActive: u.is_active,
            totalQuizzes: attempts.length,
            completedQuizzes,
            averageScore: Math.round(averageScore * 100) / 100,
          };
        })
      );

      res.json({
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.post(
  '/bulk',
  authenticateAdmin,
  checkPermission('users', 'update'),
  auditLog('bulk_update', 'users'),
  async (req, res) => {
    try {
      const { action, itemIds, data } = req.body;

      if (!action || !itemIds || !Array.isArray(itemIds)) {
        return res.status(400).json({ error: 'Action and itemIds array are required' });
      }

      const errors: string[] = [];
      let processedCount = 0;
      const now = new Date();

      for (const id of itemIds) {
        try {
          const userRow = await prisma.user.findUnique({ where: { id } });
          if (!userRow) {
            errors.push(`User ${id} not found`);
            continue;
          }

          if (userRow.role === 'admin' || userRow.role === 'super_admin') {
            errors.push(`Cannot perform bulk operations on admin user ${id}`);
            continue;
          }

          switch (action) {
            case 'activate':
              await prisma.user.update({ where: { id }, data: { is_active: true, updated_at: now } });
              break;
            case 'deactivate':
              await prisma.user.update({ where: { id }, data: { is_active: false, updated_at: now } });
              break;
            case 'reset_energy':
              await prisma.user.update({
                where: { id },
                data: {
                  energy: data?.maxEnergy || 10,
                  energy_updated_at: now,
                  updated_at: now,
                },
              });
              break;
            default:
              errors.push(`Unknown action: ${action}`);
              continue;
          }
          processedCount++;
        } catch (e) {
          errors.push(`Error processing ${id}: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      }

      res.json({
        success: true,
        processedCount,
        failedCount: errors.length,
        errors,
      });
    } catch (error) {
      console.error('Bulk operation error:', error);
      res.status(500).json({
        error: 'Bulk operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/:id/progress',
  authenticateAdmin,
  checkPermission('users', 'read'),
  auditLog('read', 'user_progress'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const userRow = await prisma.user.findUnique({ where: { id } });
      if (!userRow) {
        return res.status(404).json({ error: 'User not found' });
      }

      const quizzes = await prisma.quizAttempt.findMany({
        where: { user_id: id },
        orderBy: { completed_at: 'desc' },
      });

      const topicProgress = new Map();

      for (const quiz of quizzes) {
        const level = await prisma.level.findUnique({ where: { id: quiz.level_id } });
        if (!level) continue;
        const sub = await prisma.subtopic.findUnique({ where: { id: level.subtopic_id } });
        if (!sub) continue;
        const topic = await prisma.topic.findUnique({ where: { id: sub.topic_id } });
        if (!topic) continue;

        const topicId = sub.topic_id;
        if (!topicProgress.has(topicId)) {
          topicProgress.set(topicId, {
            topicId,
            topicName: topic.name,
            subtopics: new Map(),
          });
        }
        const t = topicProgress.get(topicId);
        const subtopicId = level.subtopic_id;
        if (!t.subtopics.has(subtopicId)) {
          t.subtopics.set(subtopicId, {
            subtopicId,
            subtopicName: sub.name,
            levels: new Map(),
          });
        }
        const st = t.subtopics.get(subtopicId);
        const levelId = quiz.level_id;
        if (!st.levels.has(levelId)) {
          st.levels.set(levelId, {
            levelId,
            levelName: level.name,
            attempts: 0,
            bestScore: 0,
            completed: false,
          });
        }
        const lv = st.levels.get(levelId);
        lv.attempts++;
        if (quiz.score > lv.bestScore) lv.bestScore = quiz.score;
        if (quiz.score >= (level.passing_score || 70)) lv.completed = true;
      }

      const progress: Record<
        string,
        {
          topicId: string;
          topicName: string;
          subtopics: Record<
            string,
            {
              subtopicId: string;
              subtopicName: string;
              levels: Record<
                string,
                {
                  levelId: string;
                  levelName: string | null;
                  attempts: number;
                  bestScore: number;
                  completed: boolean;
                }
              >;
            }
          >;
        }
      > = {};

      for (const [topicId, topic] of topicProgress) {
        progress[topicId] = {
          topicId: topic.topicId,
          topicName: topic.topicName,
          subtopics: {},
        };
        for (const [subtopicId, subtopic] of topic.subtopics) {
          progress[topicId].subtopics[subtopicId] = {
            subtopicId: subtopic.subtopicId,
            subtopicName: subtopic.subtopicName,
            levels: {},
          };
          for (const [levelId, level] of subtopic.levels) {
            progress[topicId].subtopics[subtopicId].levels[levelId] = level;
          }
        }
      }

      res.json({
        progress,
        recentQuizzes: quizzes.slice(0, 10),
      });
    } catch (error) {
      console.error('Get user progress error:', error);
      res.status(500).json({
        error: 'Failed to fetch user progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/:id/quizzes',
  authenticateAdmin,
  checkPermission('users', 'read'),
  auditLog('read', 'user_quizzes'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const userRow = await prisma.user.findUnique({ where: { id } });
      if (!userRow) {
        return res.status(404).json({ error: 'User not found' });
      }

      const total = await prisma.quizAttempt.count({ where: { user_id: id } });
      const items = await prisma.quizAttempt.findMany({
        where: { user_id: id },
        orderBy: { completed_at: 'desc' },
        skip: offset,
        take: limitNum,
      });

      res.json({
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error('Get user quizzes error:', error);
      res.status(500).json({
        error: 'Failed to fetch user quizzes',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/:id',
  authenticateAdmin,
  checkPermission('users', 'read'),
  auditLog('read', 'user'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const userRow = await prisma.user.findUnique({ where: { id } });
      if (!userRow) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: userRow });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.put(
  '/:id',
  authenticateAdmin,
  checkPermission('users', 'update'),
  auditLog('update', 'user'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      delete updateData.id;
      delete updateData.createdAt;

      const now = new Date();
      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...updateData,
          ...(updateData.isActive !== undefined ? { is_active: updateData.isActive } : {}),
          updated_at: now,
        },
      });

      res.json({ user: updated });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.delete(
  '/:id',
  authenticateAdmin,
  checkPermission('users', 'delete'),
  auditLog('delete', 'user'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const userRow = await prisma.user.findUnique({ where: { id } });
      if (!userRow) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (userRow.role === 'admin' || userRow.role === 'super_admin') {
        return res.status(400).json({ error: 'Cannot delete admin users' });
      }

      await prisma.user.update({
        where: { id },
        data: { is_active: false, updated_at: new Date() },
      });

      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
