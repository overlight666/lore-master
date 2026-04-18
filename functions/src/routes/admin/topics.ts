import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateAdmin, checkPermission, auditLog } from '../../middleware/adminAuth';
import { Prisma } from '@prisma/client';

const router = Router();

router.get(
  '/',
  authenticateAdmin,
  checkPermission('topics', 'read'),
  auditLog('read', 'topics'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, search = '', isActive, difficulty } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const where: Prisma.TopicWhereInput = {};
      if (isActive !== undefined) {
        where.is_active = isActive === 'true';
      }
      if (difficulty) {
        where.difficulty = difficulty as string;
      }
      if (search) {
        where.name = { contains: search as string, mode: 'insensitive' };
      }

      const [total, rows] = await Promise.all([
        prisma.topic.count({ where }),
        prisma.topic.findMany({
          where,
          orderBy: { name: 'asc' },
          skip: offset,
          take: limitNum,
        }),
      ]);

      const items = await Promise.all(
        rows.map(async (doc) => {
          const subtopicsCount = await prisma.subtopic.count({
            where: { topic_id: doc.id, is_active: true },
          });
          const subIds = await prisma.subtopic.findMany({
            where: { topic_id: doc.id },
            select: { id: true },
          });
          const questionCount = await prisma.question.count({
            where: {
              OR: [
                { topic_id: doc.id },
                { subtopic_id: { in: subIds.map((s) => s.id) } },
              ],
              is_active: true,
            },
          });
          return {
            id: doc.id,
            ...doc,
            isActive: doc.is_active,
            totalSubtopics: doc.total_subtopics,
            estimatedTime: doc.estimated_time,
            subtopicsCount,
            questionCount,
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
      console.error('Get topics error:', error);
      res.status(500).json({
        error: 'Failed to fetch topics',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/:id',
  authenticateAdmin,
  checkPermission('topics', 'read'),
  auditLog('read', 'topic'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const topic = await prisma.topic.findUnique({ where: { id } });
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      const subtopics = await prisma.subtopic.findMany({
        where: { topic_id: id },
        orderBy: { name: 'asc' },
      });
      res.json({
        topic: {
          ...topic,
          isActive: topic.is_active,
          subtopics,
        },
      });
    } catch (error) {
      console.error('Get topic error:', error);
      res.status(500).json({
        error: 'Failed to fetch topic',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/:id/subtopics',
  authenticateAdmin,
  checkPermission('topics', 'read'),
  auditLog('read', 'subtopics'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const topic = await prisma.topic.findUnique({ where: { id } });
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      const subtopics = await prisma.subtopic.findMany({
        where: { topic_id: id },
        orderBy: { name: 'asc' },
      });
      const items = await Promise.all(
        subtopics.map(async (doc) => {
          const questionCount = await prisma.question.count({
            where: { subtopic_id: doc.id, is_active: true },
          });
          return { ...doc, questionCount };
        })
      );
      res.json({
        items,
        total: items.length,
        page: 1,
        limit: items.length,
      });
    } catch (error) {
      console.error('Get subtopics error:', error);
      res.status(500).json({
        error: 'Failed to fetch subtopics',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.post(
  '/bulk',
  authenticateAdmin,
  checkPermission('topics', 'update'),
  auditLog('bulk_update', 'topics'),
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
          const topic = await prisma.topic.findUnique({ where: { id } });
          if (!topic) {
            errors.push(`Topic ${id} not found`);
            continue;
          }

          switch (action) {
            case 'activate':
              await prisma.topic.update({ where: { id }, data: { is_active: true, updated_at: now } });
              break;
            case 'deactivate':
              await prisma.topic.update({ where: { id }, data: { is_active: false, updated_at: now } });
              break;
            case 'update_difficulty':
              if (data?.difficulty) {
                await prisma.topic.update({
                  where: { id },
                  data: { difficulty: data.difficulty, updated_at: now },
                });
              }
              break;
            case 'add_tags':
              if (data?.tags && Array.isArray(data.tags)) {
                const prev = (topic.tags as string[]) || [];
                await prisma.topic.update({
                  where: { id },
                  data: { tags: [...prev, ...data.tags], updated_at: now },
                });
              }
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

router.put(
  '/reorder',
  authenticateAdmin,
  checkPermission('topics', 'update'),
  auditLog('reorder', 'topics'),
  async (req, res) => {
    try {
      const { topicIds } = req.body;
      if (!topicIds || !Array.isArray(topicIds)) {
        return res.status(400).json({ error: 'topicIds array is required' });
      }
      const now = new Date();
      await prisma.$transaction(
        topicIds.map((id: string, index: number) =>
          prisma.topic.update({
            where: { id },
            data: { order: index, updated_at: now },
          })
        )
      );
      res.json({ message: 'Topics reordered successfully' });
    } catch (error) {
      console.error('Reorder topics error:', error);
      res.status(500).json({
        error: 'Failed to reorder topics',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.post(
  '/',
  authenticateAdmin,
  checkPermission('topics', 'create'),
  auditLog('create', 'topic'),
  async (req, res) => {
    try {
      const {
        name,
        description,
        icon_url,
        color,
        order,
        difficulty,
        estimatedTime,
        tags,
        requirements,
        isActive = true,
      } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Topic name is required' });
      }

      const now = new Date();
      const created = await prisma.topic.create({
        data: {
          name,
          description: description || '',
          icon_url: icon_url || '',
          color: color || '#3B82F6',
          order: order || 0,
          difficulty: difficulty || 'beginner',
          estimated_time: estimatedTime || 30,
          tags: tags ?? [],
          requirements: requirements ?? [],
          is_active: isActive,
          total_subtopics: 0,
          created_at: now,
          updated_at: now,
        },
      });

      res.status(201).json({ topic: created });
    } catch (error) {
      console.error('Create topic error:', error);
      res.status(500).json({
        error: 'Failed to create topic',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.put(
  '/:id',
  authenticateAdmin,
  checkPermission('topics', 'update'),
  auditLog('update', 'topic'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      delete updateData.id;

      const existing = await prisma.topic.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      const now = new Date();
      const updated = await prisma.topic.update({
        where: { id },
        data: {
          ...updateData,
          ...(updateData.isActive !== undefined ? { is_active: updateData.isActive } : {}),
          ...(updateData.estimatedTime !== undefined ? { estimated_time: updateData.estimatedTime } : {}),
          updated_at: now,
        },
      });

      res.json({ topic: updated });
    } catch (error) {
      console.error('Update topic error:', error);
      res.status(500).json({
        error: 'Failed to update topic',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.delete(
  '/:id',
  authenticateAdmin,
  checkPermission('topics', 'delete'),
  auditLog('delete', 'topic'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const subCount = await prisma.subtopic.count({ where: { topic_id: id } });
      if (subCount > 0) {
        return res.status(400).json({
          error: 'Cannot delete topic with existing subtopics. Delete subtopics first.',
        });
      }
      await prisma.topic.delete({ where: { id } });
      res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
      console.error('Delete topic error:', error);
      res.status(500).json({
        error: 'Failed to delete topic',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
