import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateAdmin, auditLog } from '../../middleware/adminAuth';

const router = Router();

router.get(
  '',
  authenticateAdmin,
  auditLog('view', 'dashboard_stats'),
  async (req, res) => {
    try {
      const isDevelopment =
        process.env.NODE_ENV === 'development' ||
        process.env.FUNCTIONS_EMULATOR === 'true' ||
        req.hostname?.includes('localhost') ||
        req.hostname?.includes('127.0.0.1');

      if (isDevelopment) {
        const mockStats = {
          totalUsers: 247,
          activeUsers: 89,
          totalTopics: 12,
          totalQuestions: 156,
          totalQuizzes: 1423,
          averageScore: 78.5,
          recentActivity: [
            {
              id: 'mock1',
              type: 'create_question',
              description: 'create question by admin@loremaster.com',
              timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
              userId: 'mock-admin',
              username: 'admin@loremaster.com',
            },
          ],
        };
        return res.json(mockStats);
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [totalUsers, activeUsers, totalTopics, totalQuestions, totalQuizzes, quizAttempts, recentLogs] =
        await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { updated_at: { gte: thirtyDaysAgo } } }),
          prisma.topic.count({ where: { is_active: true } }),
          prisma.question.count({ where: { is_active: true } }),
          prisma.quizAttempt.count(),
          prisma.quizAttempt.findMany({ select: { score: true } }),
          prisma.adminAuditLog.findMany({
            orderBy: { created_at: 'desc' },
            take: 50,
          }),
        ]);

      const avg =
        quizAttempts.length > 0
          ? quizAttempts.reduce((s, q) => s + q.score, 0) / quizAttempts.length
          : 0;

      const recentActivity = recentLogs.map((d) => ({
        id: d.id,
        type: `${d.action}_${d.resource}`,
        description: `${d.action} ${d.resource}`,
        timestamp: d.created_at.toISOString(),
        userId: d.user_id,
        username: d.user_id,
      }));

      res.json({
        totalUsers,
        activeUsers,
        totalTopics,
        totalQuestions,
        totalQuizzes,
        averageScore: Math.round(avg * 100) / 100,
        recentActivity,
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch dashboard stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/analytics',
  authenticateAdmin,
  auditLog('view', 'analytics'),
  async (req, res) => {
    try {
      const { period = '30d' } = req.query;
      let startDate = new Date();
      if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      const usersSince = await prisma.user.findMany({
        where: { created_at: { gte: startDate } },
        select: { created_at: true },
      });

      const usersByDate = new Map<string, number>();
      for (const u of usersSince) {
        const date = u.created_at.toISOString().split('T')[0];
        usersByDate.set(date, (usersByDate.get(date) || 0) + 1);
      }
      const userGrowth = Array.from(usersByDate.entries()).map(([date, newUsers]) => ({
        date,
        newUsers,
        activeUsers: newUsers,
      }));

      const attempts = await prisma.quizAttempt.findMany({
        where: { completed_at: { gte: startDate } },
      });

      const topicStats = new Map<
        string,
        { topicId: string; topicName: string; totalQuizzes: number; totalScore: number; completedQuizzes: number }
      >();

      for (const quiz of attempts) {
        const level = await prisma.level.findUnique({ where: { id: quiz.level_id } });
        if (!level) continue;
        const sub = await prisma.subtopic.findUnique({ where: { id: level.subtopic_id } });
        if (!sub) continue;
        const topic = await prisma.topic.findUnique({ where: { id: sub.topic_id } });
        if (!topic) continue;
        const topicId = sub.topic_id;
        if (!topicStats.has(topicId)) {
          topicStats.set(topicId, {
            topicId,
            topicName: topic.name,
            totalQuizzes: 0,
            totalScore: 0,
            completedQuizzes: 0,
          });
        }
        const stats = topicStats.get(topicId)!;
        stats.totalQuizzes++;
        stats.totalScore += quiz.score;
        stats.completedQuizzes++;
      }

      const popularTopics = Array.from(topicStats.values())
        .map((stats) => ({
          ...stats,
          averageScore: stats.completedQuizzes > 0 ? stats.totalScore / stats.completedQuizzes : 0,
          completionRate: stats.totalQuizzes > 0 ? (stats.completedQuizzes / stats.totalQuizzes) * 100 : 0,
        }))
        .sort((a, b) => b.totalQuizzes - a.totalQuizzes);

      const totalQuizAttempts = attempts.length;
      const completedQuizzesCount = attempts.length;
      const quizCompletionRate = totalQuizAttempts > 0 ? (completedQuizzesCount / totalQuizAttempts) * 100 : 0;

      let totalTimeSpent = 0;
      let validQuizzes = 0;
      for (const q of attempts) {
        if (q.time_taken > 0) {
          totalTimeSpent += q.time_taken;
          validQuizzes++;
        }
      }
      const averageTimeSpent = validQuizzes > 0 ? totalTimeSpent / validQuizzes : 0;

      const totalQuestionsCount = await prisma.question.count();

      const analytics = {
        totalUsers: usersSince.length,
        activeUsers: usersSince.length,
        totalQuizzes: totalQuizAttempts,
        totalQuestions: totalQuestionsCount,
        averageScore:
          popularTopics.length > 0
            ? popularTopics.reduce((sum, topic) => sum + topic.averageScore, 0) / popularTopics.length
            : 0,
        popularTopics: popularTopics.slice(0, 10),
        userGrowth,
        quizCompletionRate,
        averageTimeSpent,
      };

      res.json(analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
