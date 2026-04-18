import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma';
import { authenticateAdmin, checkPermission, auditLog } from '../../middleware/adminAuth';

const router = Router();

router.get(
  '/',
  authenticateAdmin,
  checkPermission('levels', 'read'),
  auditLog('read', 'levels'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        subtopic_id,
        topic_id,
        category_id,
        isActive,
        status,
        search,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const where: Prisma.LevelWhereInput = {};
      if (category_id) where.category_id = category_id as string;
      if (subtopic_id) where.subtopic_id = subtopic_id as string;
      if (topic_id) where.topic_id = topic_id as string;
      if (isActive !== undefined) where.is_active = isActive === 'true';
      if (status !== undefined) where.is_active = status === 'active';

      const allRows = await prisma.level.findMany({
        where,
        orderBy: { level: 'asc' },
      });

      let rows = allRows;
      if (search) {
        const q = (search as string).toLowerCase();
        rows = rows.filter(
          (level) =>
            (level.name && level.name.toLowerCase().includes(q)) ||
            (level.description && level.description.toLowerCase().includes(q))
        );
      }

      const total = rows.length;
      const pageRows = rows.slice(offset, offset + limitNum);

      res.json({
        data: pageRows,
        total,
        page: pageNum,
        limit: limitNum,
        hasNext: offset + limitNum < total,
      });
    } catch (error) {
      console.error('Error fetching levels:', error);
      res.status(500).json({
        error: 'Failed to fetch levels',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.post(
  '/bulk/:subtopicId',
  authenticateAdmin,
  checkPermission('levels', 'create'),
  auditLog('create', 'levels_bulk'),
  async (req, res) => {
    try {
      const { subtopicId } = req.params;
      const { topicId, category_id, totalLevels = 10 } = req.body;

      if (!topicId || !category_id) {
        return res.status(400).json({ error: 'topicId and category_id are required' });
      }

      const existing = await prisma.level.count({ where: { subtopic_id: subtopicId } });
      if (existing > 0) {
        return res.status(409).json({ error: 'Levels already exist for this subtopic' });
      }

      const now = new Date();
      const created = await prisma.$transaction(
        Array.from({ length: totalLevels }, (_, i) => {
          const n = i + 1;
          return prisma.level.create({
            data: {
              topic_id: topicId,
              category_id,
              subtopic_id: subtopicId,
              level: n,
              name: `Level ${n}`,
              description: `Level ${n} questions`,
              total_questions: 20,
              passing_score: 70,
              is_active: true,
              requirements: n > 1 ? [`level_${n - 1}_completed`] : [],
              created_at: now,
              updated_at: now,
            },
          });
        })
      );

      res.status(201).json({
        message: `Created ${totalLevels} levels successfully`,
        levels: created,
      });
    } catch (error) {
      console.error('Bulk create levels error:', error);
      res.status(500).json({
        error: 'Failed to create levels',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/:id',
  authenticateAdmin,
  checkPermission('levels', 'read'),
  auditLog('read', 'level'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const levelRow = await prisma.level.findUnique({ where: { id } });
      if (!levelRow) {
        return res.status(404).json({ error: 'Level not found' });
      }
      const questionCount = await prisma.question.count({ where: { level_id: id } });
      res.json({
        ...levelRow,
        isActive: levelRow.is_active,
        questionCount,
      });
    } catch (error) {
      console.error('Get level error:', error);
      res.status(500).json({
        error: 'Failed to fetch level',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.post(
  '/',
  authenticateAdmin,
  checkPermission('levels', 'create'),
  auditLog('create', 'level'),
  async (req, res) => {
    try {
      const {
        subtopic_id,
        topic_id,
        category_id,
        level,
        name,
        description,
        totalQuestions = 20,
        passingScore = 70,
        isActive = true,
        requirements = [],
      } = req.body;

      if (!subtopic_id || !topic_id || !category_id || level === undefined) {
        return res.status(400).json({
          error: 'Required fields: subtopic_id, topic_id, category_id, level',
        });
      }

      const dup = await prisma.level.findFirst({
        where: { category_id, level: Number(level) },
      });

      if (dup) {
        return res.status(409).json({ error: `Level ${level} already exists for this category` });
      }

      const now = new Date();
      const created = await prisma.level.create({
        data: {
          topic_id,
          category_id,
          subtopic_id,
          level: Number(level),
          name: name || `Level ${level}`,
          description: description || '',
          total_questions: totalQuestions,
          passing_score: passingScore,
          is_active: isActive,
          requirements: requirements as Prisma.InputJsonValue,
          created_at: now,
          updated_at: now,
        },
      });

      res.status(201).json(created);
    } catch (error) {
      console.error('Create level error:', error);
      res.status(500).json({
        error: 'Failed to create level',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.put(
  '/:id',
  authenticateAdmin,
  checkPermission('levels', 'update'),
  auditLog('update', 'level'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      delete updateData.id;
      delete updateData.created_at;

      const now = new Date();
      const updated = await prisma.level.update({
        where: { id },
        data: {
          ...updateData,
          ...(updateData.isActive !== undefined ? { is_active: updateData.isActive } : {}),
          ...(updateData.passingScore !== undefined ? { passing_score: updateData.passingScore } : {}),
          ...(updateData.totalQuestions !== undefined ? { total_questions: updateData.totalQuestions } : {}),
          updated_at: now,
        },
      });

      res.json(updated);
    } catch (error) {
      console.error('Update level error:', error);
      res.status(500).json({
        error: 'Failed to update level',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.delete(
  '/:id',
  authenticateAdmin,
  checkPermission('levels', 'delete'),
  auditLog('delete', 'level'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const qCount = await prisma.question.count({ where: { level_id: id } });
      if (qCount > 0) {
        return res.status(409).json({
          error: 'Cannot delete level with existing questions. Delete questions first.',
        });
      }
      await prisma.level.delete({ where: { id } });
      res.json({ message: 'Level deleted successfully' });
    } catch (error) {
      console.error('Delete level error:', error);
      res.status(500).json({
        error: 'Failed to delete level',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
