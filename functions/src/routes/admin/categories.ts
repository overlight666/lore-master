import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma';
import { authenticateAdmin, checkPermission, auditLog } from '../../middleware/adminAuth';

const router = Router();

router.get(
  '/',
  authenticateAdmin,
  checkPermission('categories', 'read'),
  auditLog('read', 'categories'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, search = '', subtopic_id, topic_id, isActive } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const where: Prisma.CategoryWhereInput = {};
      if (subtopic_id) where.subtopic_id = subtopic_id as string;
      if (topic_id) where.topic_id = topic_id as string;
      if (isActive !== undefined) where.is_active = isActive === 'true';
      if (search) {
        where.name = { contains: search as string, mode: 'insensitive' };
      }

      const [total, rows] = await Promise.all([
        prisma.category.count({ where }),
        prisma.category.findMany({
          where,
          orderBy: { name: 'asc' },
          skip: offset,
          take: limitNum,
        }),
      ]);

      const items = await Promise.all(
        rows.map(async (doc) => {
          const questionCount = await prisma.question.count({
            where: { category_id: doc.id, is_active: true },
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
      console.error('Get categories error:', error);
      res.status(500).json({
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/:id',
  authenticateAdmin,
  checkPermission('categories', 'read'),
  auditLog('read', 'category'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const row = await prisma.category.findUnique({ where: { id } });
      if (!row) {
        return res.status(404).json({ error: 'Category not found' });
      }
      const questionCount = await prisma.question.count({ where: { category_id: id } });
      res.json({ category: { ...row, questionCount } });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        error: 'Failed to fetch category',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.post(
  '/',
  authenticateAdmin,
  checkPermission('categories', 'create'),
  auditLog('create', 'category'),
  async (req, res) => {
    try {
      const { topic_id, subtopic_id, name, description, icon_url, color, order, isActive = true } = req.body;

      if (!topic_id || !subtopic_id || !name) {
        return res.status(400).json({ error: 'topic_id, subtopic_id, and name are required' });
      }

      const now = new Date();
      const created = await prisma.category.create({
        data: {
          topic_id,
          subtopic_id,
          name,
          description: description || '',
          icon_url: icon_url || '',
          color: color || '#6366f1',
          order: order || 0,
          is_active: isActive,
          created_at: now,
          updated_at: now,
        },
      });

      res.status(201).json({ category: created });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.put(
  '/:id',
  authenticateAdmin,
  checkPermission('categories', 'update'),
  auditLog('update', 'category'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      delete updateData.id;

      const now = new Date();
      const updated = await prisma.category.update({
        where: { id },
        data: {
          ...updateData,
          ...(updateData.isActive !== undefined ? { is_active: updateData.isActive } : {}),
          updated_at: now,
        },
      });

      res.json({ category: updated });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        error: 'Failed to update category',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.delete(
  '/:id',
  authenticateAdmin,
  checkPermission('categories', 'delete'),
  auditLog('delete', 'category'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const levelCount = await prisma.level.count({ where: { category_id: id } });
      if (levelCount > 0) {
        return res.status(400).json({
          error: 'Cannot delete category with associated levels. Delete levels first.',
        });
      }

      const qCount = await prisma.question.count({ where: { category_id: id } });
      if (qCount > 0) {
        return res.status(400).json({
          error: 'Cannot delete category with associated questions. Delete questions first.',
        });
      }

      await prisma.category.delete({ where: { id } });
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        error: 'Failed to delete category',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
