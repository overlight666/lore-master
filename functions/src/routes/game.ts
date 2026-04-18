import { Router, Request, Response } from 'express';
import { GAME_CONSTANTS } from '../config/constants';
import { prisma } from '../prisma';
import { mapTopic, mapSubtopic, mapLevel } from '../utils/apiMappers';
import type { Topic, SubTopic, Level } from '../models/types';

const router = Router();

router.get('/topics', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await prisma.topic.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
    });
    res.status(200).json(rows.map((t) => mapTopic(t)) as unknown as Topic[]);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/topics/:topicId/subtopics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { topicId } = req.params;
    const rows = await prisma.subtopic.findMany({
      where: { topic_id: topicId, is_active: true },
      orderBy: { order: 'asc' },
    });
    res.status(200).json(rows.map((s) => mapSubtopic(s)) as unknown as SubTopic[]);
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/subtopics/:subtopicId/levels', async (req: Request, res: Response): Promise<void> => {
  try {
    const { subtopicId } = req.params;
    const rows = await prisma.level.findMany({
      where: { subtopic_id: subtopicId, is_active: true },
      orderBy: { level: 'asc' },
    });
    res.status(200).json(rows.map((l) => mapLevel(l)) as unknown as Level[]);
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/levels/:levelId/questions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { levelId } = req.params;

    const levelRow = await prisma.level.findUnique({ where: { id: levelId } });
    if (!levelRow) {
      res.status(404).json({ error: 'Level not found' });
      return;
    }

    const difficulty = levelRow.difficulty || 'medium';

    const subtopicRow = await prisma.subtopic.findUnique({ where: { id: levelRow.subtopic_id } });
    if (!subtopicRow) {
      res.status(404).json({ error: 'Subtopic not found' });
      return;
    }

    const pool = await prisma.question.findMany({
      where: {
        subtopic_id: levelRow.subtopic_id,
        OR: [
          { difficulty_word: difficulty },
          { difficulty_word: difficulty.toLowerCase() },
        ],
      },
    });

    if (pool.length === 0) {
      res.status(404).json({ error: 'No questions found for this difficulty level' });
      return;
    }

    const allQuestions = pool.map((q) => ({
      id: q.id,
      subtopic_id: q.subtopic_id,
      difficulty: q.difficulty ?? q.difficulty_word,
      text: q.text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
    }));

    const selectedQuestions = shuffleArray(allQuestions).slice(0, GAME_CONSTANTS.QUESTIONS_PER_LEVEL);

    res.status(200).json({
      level_id: levelId,
      level_number: levelRow.level,
      difficulty: difficulty,
      subtopic_name: subtopicRow.name,
      total_pool_size: allQuestions.length,
      questions: selectedQuestions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/subtopics/:subtopicId/questions/pool', async (req: Request, res: Response): Promise<void> => {
  try {
    const { subtopicId } = req.params;

    const subtopicRow = await prisma.subtopic.findUnique({ where: { id: subtopicId } });
    if (!subtopicRow) {
      res.status(404).json({ error: 'Subtopic not found' });
      return;
    }

    const difficulties = ['easy', 'medium', 'hard'] as const;
    const questionPool: Record<string, number> = {};

    for (const d of difficulties) {
      const count = await prisma.question.count({
        where: {
          subtopic_id: subtopicId,
          difficulty_word: d,
        },
      });
      questionPool[d] = count;
    }

    res.status(200).json({
      subtopic_id: subtopicId,
      subtopic_name: subtopicRow.name,
      question_pool: questionPool,
      total_questions: Object.values(questionPool).reduce((sum, count) => sum + count, 0),
    });
  } catch (error) {
    console.error('Error fetching question pool info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default router;
