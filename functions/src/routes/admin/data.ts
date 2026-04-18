import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../prisma';

const router = express.Router();

router.delete('/clear', async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.userAnswer.deleteMany(),
      prisma.quizAttempt.deleteMany(),
      prisma.adsWatched.deleteMany(),
      prisma.userLifeline.deleteMany(),
      prisma.purchase.deleteMany(),
      prisma.question.deleteMany(),
      prisma.level.deleteMany(),
      prisma.category.deleteMany(),
      prisma.subtopic.deleteMany(),
      prisma.topic.deleteMany(),
      prisma.adminAuditLog.deleteMany(),
    ]);

    res.json({
      success: true,
      message: 'Content tables cleared (users preserved)',
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear database',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const now = new Date();
    const topicId = uuidv4();
    const subtopicId = uuidv4();
    const categoryId = uuidv4();

    await prisma.$transaction(async (tx) => {
      await tx.topic.create({
        data: {
          id: topicId,
          name: 'Anime',
          description: 'Anime trivia',
          icon_url: '',
          color: '#6366f1',
          order: 1,
          is_active: true,
          total_subtopics: 1,
          difficulty: 'medium',
          estimated_time: 60,
          tags: [],
          requirements: [],
          created_at: now,
          updated_at: now,
        },
      });

      await tx.subtopic.create({
        data: {
          id: subtopicId,
          topic_id: topicId,
          name: 'Classic Series',
          description: 'Sample subtopic',
          icon_url: '',
          color: '#6366f1',
          order: 1,
          is_active: true,
          total_levels: 1,
          difficulty: 'medium',
          estimated_time: 30,
          tags: [],
          requirements: [],
          created_at: now,
          updated_at: now,
        },
      });

      await tx.category.create({
        data: {
          id: categoryId,
          topic_id: topicId,
          subtopic_id: subtopicId,
          name: 'General',
          description: 'General category',
          icon_url: '',
          color: '#6366f1',
          order: 1,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      });

      const levelId = uuidv4();
      await tx.level.create({
        data: {
          id: levelId,
          topic_id: topicId,
          subtopic_id: subtopicId,
          category_id: categoryId,
          level: 1,
          name: 'Level 1',
          description: 'First level',
          difficulty: 'easy',
          estimated_time: 15,
          total_questions: 10,
          passing_score: 80,
          is_active: true,
          requirements: [],
          created_at: now,
          updated_at: now,
        },
      });

      for (let i = 0; i < 10; i++) {
        await tx.question.create({
          data: {
            id: uuidv4(),
            topic_id: topicId,
            subtopic_id: subtopicId,
            category_id: categoryId,
            level_id: levelId,
            level: 1,
            difficulty: 1,
            difficulty_word: 'easy',
            question: `Sample question ${i + 1}?`,
            text: `Sample question ${i + 1}?`,
            option_a: 'A',
            option_b: 'B',
            option_c: 'C',
            option_d: 'D',
            correct_option: 'A',
            choices: ['A', 'B', 'C', 'D'],
            correct_answer: 'A',
            is_active: true,
            created_at: now,
            updated_at: now,
          },
        });
      }
    });

    res.json({ success: true, message: 'Seed data created', topicId, subtopicId, categoryId });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
