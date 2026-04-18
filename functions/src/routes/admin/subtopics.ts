import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma';
import { authenticateAdmin, checkPermission, auditLog } from '../../middleware/adminAuth';

const router = Router();

router.get(
  '/',
  authenticateAdmin,
  checkPermission('subtopics', 'read'),
  auditLog('read', 'subtopics'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, search = '', topic_id, isActive } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const where: Prisma.SubtopicWhereInput = {};
      if (topic_id) where.topic_id = topic_id as string;
      if (isActive !== undefined) where.is_active = isActive === 'true';
      if (search) {
        where.name = { contains: search as string, mode: 'insensitive' };
      }

      const [total, rows] = await Promise.all([
        prisma.subtopic.count({ where }),
        prisma.subtopic.findMany({
          where,
          orderBy: { name: 'asc' },
          skip: offset,
          take: limitNum,
        }),
      ]);

      const items = await Promise.all(
        rows.map(async (doc) => {
          const questionCount = await prisma.question.count({
            where: { subtopic_id: doc.id, is_active: true },
          });
          return { ...doc, questionCount };
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
      console.error('Get subtopics error:', error);
      res.status(500).json({
        error: 'Failed to fetch subtopics',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/:id',
  authenticateAdmin,
  checkPermission('subtopics', 'read'),
  auditLog('read', 'subtopic'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const row = await prisma.subtopic.findUnique({ where: { id } });
      if (!row) {
        return res.status(404).json({ error: 'Subtopic not found' });
      }
      res.json({ subtopic: row });
    } catch (error) {
      console.error('Get subtopic error:', error);
      res.status(500).json({
        error: 'Failed to fetch subtopic',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.post(
  '/',
  authenticateAdmin,
  checkPermission('subtopics', 'create'),
  auditLog('create', 'subtopic'),
  async (req, res) => {
    try {
      const {
        topic_id,
        name,
        description,
        icon_url,
        color,
        order,
        difficulty,
        estimatedTime,
        tags,
        requirements,
      } = req.body;

      if (!topic_id || !name) {
        return res.status(400).json({ error: 'topic_id and name are required' });
      }

      const topic = await prisma.topic.findUnique({ where: { id: topic_id } });
      if (!topic) {
        return res.status(400).json({ error: 'Invalid topic ID' });
      }

      const now = new Date();
      const created = await prisma.$transaction(async (tx) => {
        const sub = await tx.subtopic.create({
          data: {
            topic_id,
            name,
            description: description || '',
            icon_url: icon_url || '',
            color: color || '#6366f1',
            order: order || 1,
            is_active: true,
            total_levels: 0,
            difficulty: difficulty || 'medium',
            estimated_time: estimatedTime || 30,
            tags: tags ?? [],
            requirements: requirements ?? [],
            created_at: now,
            updated_at: now,
          },
        });
        await tx.topic.update({
          where: { id: topic_id },
          data: { total_subtopics: { increment: 1 }, updated_at: now },
        });
        return sub;
      });

      res.status(201).json({ subtopic: created });
    } catch (error) {
      console.error('Create subtopic error:', error);
      res.status(500).json({
        error: 'Failed to create subtopic',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.put(
  '/:id',
  authenticateAdmin,
  checkPermission('subtopics', 'update'),
  auditLog('update', 'subtopic'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      delete updateData.id;
      delete updateData.created_at;

      const now = new Date();
      const updated = await prisma.subtopic.update({
        where: { id },
        data: {
          ...updateData,
          ...(updateData.isActive !== undefined ? { is_active: updateData.isActive } : {}),
          ...(updateData.estimatedTime !== undefined ? { estimated_time: updateData.estimatedTime } : {}),
          updated_at: now,
        },
      });

      res.json({ subtopic: updated });
    } catch (error) {
      console.error('Update subtopic error:', error);
      res.status(500).json({
        error: 'Failed to update subtopic',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.delete(
  '/:id',
  authenticateAdmin,
  checkPermission('subtopics', 'delete'),
  auditLog('delete', 'subtopic'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const row = await prisma.subtopic.findUnique({ where: { id } });
      if (!row) {
        return res.status(404).json({ error: 'Subtopic not found' });
      }

      const levelCount = await prisma.level.count({ where: { subtopic_id: id } });
      if (levelCount > 0) {
        return res.status(400).json({
          error: 'Cannot delete subtopic with associated levels. Delete levels first.',
        });
      }

      const now = new Date();
      await prisma.$transaction(async (tx) => {
        await tx.subtopic.delete({ where: { id } });
        await tx.topic.update({
          where: { id: row.topic_id },
          data: { total_subtopics: { decrement: 1 }, updated_at: now },
        });
      });

      res.json({ message: 'Subtopic deleted successfully' });
    } catch (error) {
      console.error('Delete subtopic error:', error);
      res.status(500).json({
        error: 'Failed to delete subtopic',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
