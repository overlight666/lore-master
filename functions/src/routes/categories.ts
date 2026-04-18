import { Router, Request, Response } from 'express';
import { GAME_CONSTANTS } from '../config/constants';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../prisma';
import { mapCategory, mapLevel } from '../utils/apiMappers';

type QuestionDocument = {
  id: string;
  category_id: string;
  level: number;
  question: string;
  choices: string[];
  correctAnswer: string;
  difficulty: number;
  explanation?: string;
};

const router = Router();

router.get('/:categoryId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const row = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!row) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.status(200).json(mapCategory(row));
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

router.get('/:categoryId/levels', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const rows = await prisma.level.findMany({
      where: { category_id: categoryId, is_active: true },
      orderBy: { level: 'asc' },
    });
    res.status(200).json(rows.map((l) => mapLevel(l)));
  } catch (error) {
    console.error('Error fetching category levels:', error);
    res.status(500).json({ error: 'Failed to fetch category levels' });
  }
});

router.get('/:categoryId/questions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const level = parseInt((req.query.level as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || `${GAME_CONSTANTS.QUESTIONS_PER_LEVEL}`, 10);

    if (Number.isNaN(level) || level < 1) {
      res.status(400).json({ error: 'Invalid level parameter' });
      return;
    }

    const levelRow = await prisma.level.findFirst({
      where: { category_id: categoryId, level, is_active: true },
    });

    if (!levelRow) {
      res.status(404).json({ error: 'Level not found for this category' });
      return;
    }

    const questions = await prisma.question.findMany({
      where: {
        category_id: categoryId,
        level,
        is_active: true,
      },
    });

    if (questions.length === 0) {
      res.status(404).json({ error: 'No questions found for this category level' });
      return;
    }

    const mapped: QuestionDocument[] = questions.map((q) => {
      const choices = (q.choices as string[] | null) || [
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
      ].filter(Boolean) as string[];
      const correctAnswer = q.correct_answer || q.correct_option || '';
      return {
        id: q.id,
        category_id: categoryId,
        level: q.level ?? level,
        question: q.question || q.text || '',
        choices,
        correctAnswer,
        difficulty: q.difficulty ?? 0,
        explanation: q.explanation ?? undefined,
      };
    });

    const selectedQuestions = shuffleArray(mapped).slice(0, Math.min(limit, mapped.length));

    res.status(200).json({
      category_id: categoryId,
      level_id: levelRow.id,
      level_number: levelRow.level,
      totalQuestions: levelRow.total_questions ?? GAME_CONSTANTS.QUESTIONS_PER_LEVEL,
      passingScore: levelRow.passing_score ?? GAME_CONSTANTS.PASSING_SCORE,
      questions: selectedQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        choices: q.choices,
        correct_answer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      })),
    });
  } catch (error) {
    console.error('Error fetching category questions:', error);
    res.status(500).json({ error: 'Failed to fetch category questions' });
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
