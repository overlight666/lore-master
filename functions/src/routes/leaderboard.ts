import { Router, Request, Response } from 'express';
import { GAME_CONSTANTS } from '../config/constants';
import { prisma } from '../prisma';
import { LeaderboardEntry } from '../models/types';

const router = Router();

router.get('/:topicId/:levelId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { topicId, levelId } = req.params;
    const userId = req.user!.id;

    const levelRow = await prisma.level.findUnique({ where: { id: levelId } });
    if (!levelRow) {
      res.status(404).json({ error: 'Level not found' });
      return;
    }

    if (levelRow.topic_id !== topicId) {
      res.status(400).json({ error: 'Level does not belong to this topic' });
      return;
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: { level_id: levelId },
    });

    const userBestAttempts = new Map<
      string,
      { user_id: string; score: number; time_taken: number; completed_at: Date }
    >();

    for (const attempt of attempts) {
      const currentBest = userBestAttempts.get(attempt.user_id);
      if (
        !currentBest ||
        attempt.score > currentBest.score ||
        (attempt.score === currentBest.score && attempt.time_taken < currentBest.time_taken)
      ) {
        userBestAttempts.set(attempt.user_id, {
          user_id: attempt.user_id,
          score: attempt.score,
          time_taken: attempt.time_taken,
          completed_at: attempt.completed_at,
        });
      }
    }

    const userIds = Array.from(userBestAttempts.keys());
    const users =
      userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true },
          })
        : [];
    const usernames = new Map(users.map((u) => [u.id, u.username]));

    const leaderboardEntries: LeaderboardEntry[] = Array.from(userBestAttempts.values())
      .map((attempt) => ({
        user_id: attempt.user_id,
        username: usernames.get(attempt.user_id) || 'Unknown',
        score: attempt.score,
        time_taken: attempt.time_taken,
        completed_at: attempt.completed_at,
        rank: 0,
      }))
      .sort((a, b) => {
        if (a.score !== b.score) {
          return b.score - a.score;
        }
        return a.time_taken - b.time_taken;
      })
      .slice(0, GAME_CONSTANTS.LEADERBOARD_SIZE);

    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    let userRank: number | null = null;
    const userEntry = leaderboardEntries.find((entry) => entry.user_id === userId);

    if (userEntry) {
      userRank = userEntry.rank;
    } else if (userBestAttempts.has(userId)) {
      const allEntries = Array.from(userBestAttempts.values()).sort((a, b) => {
        if (a.score !== b.score) {
          return b.score - a.score;
        }
        return a.time_taken - b.time_taken;
      });
      userRank = allEntries.findIndex((entry) => entry.user_id === userId) + 1;
    }

    res.status(200).json({
      leaderboard: leaderboardEntries,
      user_rank: userRank,
      total_players: userBestAttempts.size,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
