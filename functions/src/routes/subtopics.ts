import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../prisma';
import { mapSubtopic, mapCategory } from '../utils/apiMappers';

const router = Router();

router.get('/:subtopicId', authenticateToken, async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const row = await prisma.subtopic.findUnique({ where: { id: subtopicId } });
    if (!row) {
      return res.status(404).json({ error: 'Subtopic not found' });
    }
    res.json({ subtopic: mapSubtopic(row) });
  } catch (error) {
    console.error('Error fetching subtopic:', error);
    res.status(500).json({
      error: 'Failed to fetch subtopic',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/:subtopicId/categories', authenticateToken, async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const rows = await prisma.category.findMany({
      where: { subtopic_id: subtopicId, is_active: true },
      orderBy: { name: 'asc' },
    });
    res.json(rows.map((c) => mapCategory(c)));
  } catch (error) {
    console.error('Error fetching categories for subtopic:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/', authenticateToken, async (req, res) => {
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
      return res.status(400).json({ error: 'Topic ID and name are required' });
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
        data: {
          total_subtopics: { increment: 1 },
          updated_at: now,
        },
      });
      return sub;
    });

    res.status(201).json({
      message: 'Subtopic created successfully',
      subtopic: mapSubtopic(created),
    });
  } catch (error) {
    console.error('Error creating subtopic:', error);
    res.status(500).json({
      error: 'Failed to create subtopic',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.put('/:subtopicId', authenticateToken, async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;
    updates.updated_at = new Date();

    const existing = await prisma.subtopic.findUnique({ where: { id: subtopicId } });
    if (!existing) {
      return res.status(404).json({ error: 'Subtopic not found' });
    }

    const data: Record<string, unknown> = {};
    const mapKey: Record<string, string> = {
      isActive: 'is_active',
      totalLevels: 'total_levels',
      estimatedTime: 'estimated_time',
      topic_id: 'topic_id',
    };
    for (const [k, v] of Object.entries(updates)) {
      const key = mapKey[k] || k;
      if (
        [
          'name',
          'description',
          'icon_url',
          'color',
          'order',
          'is_active',
          'total_levels',
          'difficulty',
          'estimated_time',
          'tags',
          'requirements',
          'updated_at',
        ].includes(key)
      ) {
        data[key] = v;
      }
    }

    const updated = await prisma.subtopic.update({
      where: { id: subtopicId },
      data: data as any,
    });

    res.json({
      message: 'Subtopic updated successfully',
      subtopic: mapSubtopic(updated),
    });
  } catch (error) {
    console.error('Error updating subtopic:', error);
    res.status(500).json({
      error: 'Failed to update subtopic',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.delete('/:subtopicId', authenticateToken, async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const sub = await prisma.subtopic.findUnique({ where: { id: subtopicId } });
    if (!sub) {
      return res.status(404).json({ error: 'Subtopic not found' });
    }

    const levelCount = await prisma.level.count({ where: { subtopic_id: subtopicId } });
    if (levelCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete subtopic with associated levels. Delete levels first.',
      });
    }

    const now = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.subtopic.delete({ where: { id: subtopicId } });
      await tx.topic.update({
        where: { id: sub.topic_id },
        data: {
          total_subtopics: { decrement: 1 },
          updated_at: now,
        },
      });
    });

    res.json({ message: 'Subtopic deleted successfully' });
  } catch (error) {
    console.error('Error deleting subtopic:', error);
    res.status(500).json({
      error: 'Failed to delete subtopic',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
