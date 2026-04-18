import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../prisma';
import { mapTopic, mapSubtopic } from '../utils/apiMappers';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const rows = await prisma.topic.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ topics: rows.map((t) => mapTopic(t)) });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({
      error: 'Failed to fetch topics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/:topicId/subtopics', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const rows = await prisma.subtopic.findMany({
      where: { topic_id: topicId, is_active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ subtopics: rows.map((s) => mapSubtopic(s)) });
  } catch (error) {
    console.error('Error fetching subtopics for topic:', error);
    res.status(500).json({
      error: 'Failed to fetch subtopics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/:topicId', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    const subtopics = await prisma.subtopic.findMany({
      where: { topic_id: topicId, is_active: true },
      orderBy: { order: 'asc' },
    });
    res.json({
      topic: {
        ...mapTopic(topic),
        subtopics: subtopics.map((s) => mapSubtopic(s)),
      },
    });
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({
      error: 'Failed to fetch topic',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/', authenticateToken, async (req, res) => {
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
        color: color || '#6366f1',
        order: order || 1,
        is_active: true,
        total_subtopics: 0,
        difficulty: difficulty || 'medium',
        estimated_time: estimatedTime || 60,
        tags: tags ?? [],
        requirements: requirements ?? [],
        created_at: now,
        updated_at: now,
      },
    });

    res.status(201).json({
      message: 'Topic created successfully',
      topic: mapTopic(created),
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({
      error: 'Failed to create topic',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.put('/:topicId', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const updates = { ...req.body };
    delete updates.id;
    delete updates.created_at;
    updates.updated_at = new Date();

    const existing = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!existing) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const data: Record<string, unknown> = {};
    const mapKey: Record<string, string> = {
      isActive: 'is_active',
      totalSubtopics: 'total_subtopics',
      estimatedTime: 'estimated_time',
      icon_url: 'icon_url',
    };
    for (const [k, v] of Object.entries(updates)) {
      const key = mapKey[k] || k;
      if (['name', 'description', 'icon_url', 'color', 'order', 'is_active', 'total_subtopics', 'difficulty', 'estimated_time', 'tags', 'requirements', 'updated_at'].includes(key)) {
        data[key] = v;
      }
    }

    const updated = await prisma.topic.update({
      where: { id: topicId },
      data: data as any,
    });

    res.json({
      message: 'Topic updated successfully',
      topic: mapTopic(updated),
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({
      error: 'Failed to update topic',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.delete('/:topicId', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const existing = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!existing) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const subCount = await prisma.subtopic.count({ where: { topic_id: topicId } });
    if (subCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete topic with associated subtopics. Delete subtopics first.',
      });
    }

    await prisma.topic.delete({ where: { id: topicId } });
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({
      error: 'Failed to delete topic',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
