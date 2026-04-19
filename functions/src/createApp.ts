import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth';
import topicsRoutes from './routes/topics';
import subtopicsRoutes from './routes/subtopics';
import categoriesRoutes from './routes/categories';
import gameRoutes from './routes/game';
import quizRoutes from './routes/quiz';
import energyRoutes from './routes/energy';
import leaderboardRoutes from './routes/leaderboard';
import storeRoutes from './routes/store';
import aiRoutes from './routes/ai';

import adminAuthRoutes from './routes/admin/auth-simple';
import adminDashboardRoutes from './routes/admin/dashboard';
import adminTopicsRoutes from './routes/admin/topics';
import adminSubtopicsRoutes from './routes/admin/subtopics';
import adminCategoriesRoutes from './routes/admin/categories';
import adminQuestionsRoutes from './routes/admin/questions';
import adminUsersRoutes from './routes/admin/users';
import adminLeaderboardRoutes from './routes/admin/leaderboard';
import adminLevelsRoutes from './routes/admin/levels';
import adminDataRoutes from './routes/admin/data';

import { authenticateToken } from './middleware/auth';

function parseCorsOrigins(): string[] | boolean {
  const raw = process.env.CORS_ORIGINS;
  if (!raw || raw === '*') {
    return true;
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());

  const corsOptions: cors.CorsOptions = {
    origin: parseCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.options('*', (req: express.Request, res: express.Response) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).send();
  });

  const healthPayload = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Lore Master API',
    version: '2.0.0',
    database: 'postgresql',
  };

  app.get('/health', (req: express.Request, res: express.Response) => {
    res.status(200).json(healthPayload);
  });

  // Alias for load balancers / docs that expect /api/health
  app.get('/api/health', (req: express.Request, res: express.Response) => {
    res.status(200).json(healthPayload);
  });

  app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).json({
      service: 'Lore Master API',
      health: '/health',
      healthAlt: '/api/health',
    });
  });

  app.use('/auth', authRoutes);
  app.use('/admin/auth', adminAuthRoutes);
  app.use('/admin/dashboard', adminDashboardRoutes);
  app.use('/admin/topics', adminTopicsRoutes);
  app.use('/admin/subtopics', adminSubtopicsRoutes);
  app.use('/admin/categories', adminCategoriesRoutes);
  app.use('/admin/questions', adminQuestionsRoutes);
  app.use('/admin/users', adminUsersRoutes);
  app.use('/admin/leaderboard', adminLeaderboardRoutes);
  app.use('/admin/levels', adminLevelsRoutes);
  app.use('/admin/data', adminDataRoutes);

  app.use('/topics', authenticateToken, topicsRoutes);
  app.use('/subtopics', authenticateToken, subtopicsRoutes);
  app.use('/categories', authenticateToken, categoriesRoutes);
  app.use('/game', authenticateToken, gameRoutes);
  app.use('/quiz', authenticateToken, quizRoutes);
  app.use('/energy', authenticateToken, energyRoutes);
  app.use('/leaderboard', authenticateToken, leaderboardRoutes);
  app.use('/store', authenticateToken, storeRoutes);
  app.use('/ai', authenticateToken, aiRoutes);

  app.use('*', (req: express.Request, res: express.Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
