import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateAdmin, auditLog } from '../../middleware/adminAuth';

const router = Router();

router.get(
  '/',
  authenticateAdmin,
  auditLog('read', 'leaderboard'),
  async (req, res) => {
    try {
      const { page = 1, limit = 50, topicId, levelId } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      if (topicId && levelId) {
        const levelRow = await prisma.level.findUnique({ where: { id: levelId as string } });
        if (!levelRow) {
          return res.status(404).json({ error: 'Level not found' });
        }
        if (levelRow.topic_id !== topicId) {
          return res.status(400).json({ error: 'Level does not belong to this topic' });
        }

        const attempts = await prisma.quizAttempt.findMany({ where: { level_id: levelId as string } });
        const userBestAttempts = new Map<
          string,
          { user_id: string; score: number; time_taken: number; completed_at: Date }
        >();

        for (const attempt of attempts) {
          const cur = userBestAttempts.get(attempt.user_id);
          if (
            !cur ||
            attempt.score > cur.score ||
            (attempt.score === cur.score && attempt.time_taken < cur.time_taken)
          ) {
            userBestAttempts.set(attempt.user_id, {
              user_id: attempt.user_id,
              score: attempt.score,
              time_taken: attempt.time_taken,
              completed_at: attempt.completed_at,
            });
          }
        }

        const leaderboardEntries: any[] = [];
        for (const userId of userBestAttempts.keys()) {
          const u = await prisma.user.findUnique({ where: { id: userId } });
          const attemptData = userBestAttempts.get(userId)!;
          if (u) {
            leaderboardEntries.push({
              user_id: userId,
              username: u.username,
              email: u.email,
              score: attemptData.score,
              time_taken: attemptData.time_taken,
              completed_at: attemptData.completed_at,
            });
          }
        }

        const sortedEntries = leaderboardEntries
          .sort((a, b) => {
            if (a.score !== b.score) return b.score - a.score;
            return a.time_taken - b.time_taken;
          })
          .slice(offset, offset + limitNum);

        sortedEntries.forEach((entry, index) => {
          entry.rank = offset + index + 1;
        });

        return res.json({
          items: sortedEntries,
          total: leaderboardEntries.length,
          page: pageNum,
          limit: limitNum,
          hasNext: offset + limitNum < leaderboardEntries.length,
        });
      }

      const attempts = await prisma.quizAttempt.findMany();
      const totals = new Map<string, number>();
      for (const a of attempts) {
        totals.set(a.user_id, (totals.get(a.user_id) || 0) + a.score);
      }

      const sorted = Array.from(totals.entries())
        .filter(([, score]) => score > 0)
        .sort((a, b) => b[1] - a[1]);

      const slice = sorted.slice(offset, offset + limitNum);
      const items = await Promise.all(
        slice.map(async ([uid, total_score], index) => {
          const u = await prisma.user.findUnique({ where: { id: uid } });
          return {
            user_id: uid,
            username: u?.username || 'Anonymous',
            email: u?.email,
            total_score,
            rank: offset + index + 1,
          };
        })
      );

      res.json({
        items,
        total: sorted.length,
        page: pageNum,
        limit: limitNum,
        hasNext: offset + limitNum < sorted.length,
      });
    } catch (error) {
      console.error('Error fetching admin leaderboard:', error);
      res.status(500).json({
        error: 'Failed to fetch leaderboard',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
