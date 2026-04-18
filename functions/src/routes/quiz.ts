import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GAME_CONSTANTS } from '../config/constants';
import { prisma } from '../prisma';
import { SubmitQuizRequest, QuizResult, QuizAttempt, UserAnswer, Question } from '../models/types';

const router = Router();

function correctAnswerForQuestion(q: Question & { correct_answer?: string }): string {
  return (q as any).correct_option || (q as any).correct_answer || '';
}

router.post('/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { level_id, answers, time_taken, used_5050, used_ai_hint }: SubmitQuizRequest = req.body;

    if (!level_id || !answers || !Array.isArray(answers) || answers.length !== GAME_CONSTANTS.QUESTIONS_PER_LEVEL) {
      res.status(400).json({ error: 'Invalid quiz submission' });
      return;
    }

    const userRow = await prisma.user.findUnique({ where: { id: userId } });
    if (!userRow) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (userRow.energy <= 0) {
      res.status(400).json({ error: 'Insufficient energy' });
      return;
    }

    const questionIds = answers.map((answer) => answer.question_id);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    if (questions.length !== GAME_CONSTANTS.QUESTIONS_PER_LEVEL) {
      res.status(400).json({ error: 'Invalid questions or incomplete question set' });
      return;
    }

    const mapped: Question[] = questions.map((q) => ({
      id: q.id,
      subtopic_id: q.subtopic_id || '',
      difficulty: typeof q.difficulty === 'number' ? q.difficulty : 0,
      text: q.text || '',
      correct_option: q.correct_option || q.correct_answer || '',
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
    })) as Question[];

    const firstQuestion = mapped[0];
    const allSameSubtopic = mapped.every((q) => q.subtopic_id === firstQuestion.subtopic_id);
    const allSameDifficulty = mapped.every((q) => q.difficulty === firstQuestion.difficulty);

    if (!allSameSubtopic || !allSameDifficulty) {
      res.status(400).json({ error: 'Questions must be from same subtopic and difficulty level' });
      return;
    }

    let correctAnswers = 0;
    const answerResults: { question_id: string; selected_option: string; is_correct: boolean }[] = [];

    for (const answer of answers) {
      const question = mapped.find((q) => q.id === answer.question_id);
      if (!question) {
        res.status(400).json({ error: 'Invalid question ID' });
        return;
      }

      const expected = correctAnswerForQuestion(question as any);
      const isCorrect = answer.selected_option === expected;
      if (isCorrect) {
        correctAnswers++;
      }

      answerResults.push({
        question_id: answer.question_id,
        selected_option: answer.selected_option,
        is_correct: isCorrect,
      });
    }

    const score = (correctAnswers / GAME_CONSTANTS.QUESTIONS_PER_LEVEL) * 100;
    const isPerfectScore = score === GAME_CONSTANTS.PERFECT_SCORE;
    const energyConsumed = !isPerfectScore;

    const attemptId = uuidv4();
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.quizAttempt.create({
        data: {
          id: attemptId,
          user_id: userId,
          level_id,
          score,
          time_taken,
          completed_at: now,
          used_5050,
          used_ai_hint,
          energy_consumed: energyConsumed,
        },
      });

      for (const ar of answerResults) {
        await tx.userAnswer.create({
          data: {
            id: uuidv4(),
            attempt_id: attemptId,
            question_id: ar.question_id,
            selected_option: ar.selected_option,
            is_correct: ar.is_correct,
            answered_at: now,
          },
        });
      }

      if (energyConsumed) {
        await tx.user.update({
          where: { id: userId },
          data: {
            energy: userRow.energy - 1,
            energy_updated_at: now,
            updated_at: now,
          },
        });
      }
    });

    const result: QuizResult = {
      attempt_id: attemptId,
      score,
      passed: score >= GAME_CONSTANTS.PASSING_SCORE,
      energy_consumed: energyConsumed,
      answers: answerResults,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/attempts/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user!.id;

    if (userId !== requestingUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const rows = await prisma.quizAttempt.findMany({
      where: { user_id: userId },
      orderBy: { completed_at: 'desc' },
    });

    const attempts: QuizAttempt[] = rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      level_id: r.level_id,
      score: r.score,
      time_taken: r.time_taken,
      completed_at: r.completed_at,
      used_5050: r.used_5050,
      used_ai_hint: r.used_ai_hint,
      energy_consumed: r.energy_consumed,
    }));

    res.status(200).json(attempts);
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
