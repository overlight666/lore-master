import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../prisma';
import { authenticateAdmin, checkPermission, auditLog } from '../../middleware/adminAuth';

const router = Router();

router.get(
  '/',
  authenticateAdmin,
  checkPermission('questions', 'read'),
  auditLog('read', 'questions'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        levelId,
        level,
        categoryId,
        subtopicId,
        topicId,
        difficulty,
        isActive,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const where: Prisma.QuestionWhereInput = {};
      const and: Prisma.QuestionWhereInput[] = [];

      if (isActive !== undefined) where.is_active = isActive === 'true';
      if (difficulty !== undefined && difficulty !== '') {
        const d = difficulty as string;
        const asNum = parseInt(d, 10);
        const diffOr: Prisma.QuestionWhereInput[] = [{ difficulty_word: d }];
        if (!Number.isNaN(asNum)) {
          diffOr.unshift({ difficulty: asNum });
        }
        and.push({ OR: diffOr });
      }
      if (topicId) where.topic_id = topicId as string;
      if (subtopicId) where.subtopic_id = subtopicId as string;
      if (categoryId) where.category_id = categoryId as string;
      if (levelId) where.level_id = levelId as string;
      if (level) where.level = parseInt(level as string, 10);
      if (search) {
        and.push({
          OR: [
            { question: { contains: search as string, mode: 'insensitive' } },
            { text: { contains: search as string, mode: 'insensitive' } },
          ],
        });
      }
      if (and.length > 0) {
        where.AND = and;
      }

      const [topics, subtopics, categories, levels, total, rows] = await Promise.all([
        prisma.topic.findMany(),
        prisma.subtopic.findMany(),
        prisma.category.findMany(),
        prisma.level.findMany(),
        prisma.question.count({ where }),
        prisma.question.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip: offset,
          take: limitNum,
        }),
      ]);

      const tmap = new Map(topics.map((t) => [t.id, t]));
      const smap = new Map(subtopics.map((s) => [s.id, s]));
      const cmap = new Map(categories.map((c) => [c.id, c]));
      const lmap = new Map(levels.map((l) => [l.id, l]));

      const items = rows.map((q) => {
        const topicName = q.topic_id ? tmap.get(q.topic_id)?.name || '' : '';
        const subtopicName = q.subtopic_id ? smap.get(q.subtopic_id)?.name || '' : '';
        const categoryName = q.category_id ? cmap.get(q.category_id)?.name || '' : '';
        const levelRow = q.level_id ? lmap.get(q.level_id) : undefined;
        const levelName = levelRow?.name || '';
        return {
          ...q,
          topicName,
          subtopicName,
          categoryName,
          levelName,
          level: q.level ?? 1,
        };
      });

      res.json({
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error('Get questions error:', error);
      res.status(500).json({
        error: 'Failed to fetch questions',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/stats',
  authenticateAdmin,
  checkPermission('questions', 'read'),
  auditLog('read', 'questions_stats'),
  async (req, res) => {
    try {
      const total = await prisma.question.count();
      const active = await prisma.question.count({ where: { is_active: true } });
      res.json({ total, active });
    } catch (error) {
      console.error('Get question stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
);

router.post(
  '/bulk-create',
  authenticateAdmin,
  checkPermission('questions', 'create'),
  auditLog('create', 'questions_bulk'),
  async (req, res) => {
    try {
      const { questions } = req.body;
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'questions array required' });
      }

      const now = new Date();
      await prisma.$transaction(
        questions.map((q: Record<string, unknown>) =>
          prisma.question.create({
            data: {
              id: (q.id as string) || uuidv4(),
              topic_id: q.topic_id as string | undefined,
              subtopic_id: q.subtopic_id as string | undefined,
              category_id: q.category_id as string | undefined,
              level_id: q.level_id as string | undefined,
              level: q.level != null ? Number(q.level) : undefined,
              difficulty: q.difficulty != null ? Number(q.difficulty) : undefined,
              difficulty_word: q.difficulty_word as string | undefined,
              text: (q.text as string) || (q.question as string) || '',
              question: (q.question as string) || (q.text as string) || '',
              option_a: q.option_a as string | undefined,
              option_b: q.option_b as string | undefined,
              option_c: q.option_c as string | undefined,
              option_d: q.option_d as string | undefined,
              correct_option: (q.correct_option as string) || (q.correct_answer as string) || '',
              choices: (q.choices as Prisma.InputJsonValue) ?? undefined,
              correct_answer: (q.correct_answer as string) || (q.correctAnswer as string) || '',
              explanation: q.explanation as string | undefined,
              is_active: q.isActive !== false,
              created_at: now,
              updated_at: now,
            },
          })
        )
      );

      res.status(201).json({ success: true, count: questions.length });
    } catch (error) {
      console.error('Bulk create questions error:', error);
      res.status(500).json({
        error: 'Failed to bulk create questions',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.post('/import', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'CSV import not implemented for PostgreSQL in this build' });
});

router.post('/bulk-import', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'Bulk import not implemented for PostgreSQL in this build' });
});

router.post('/upload-bulk', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'Upload bulk not implemented for PostgreSQL in this build' });
});

router.post('/parse-docx', authenticateAdmin, async (req, res) => {
  res.status(501).json({ error: 'DOCX parse not implemented for PostgreSQL in this build' });
});

router.get(
  '/:id',
  authenticateAdmin,
  checkPermission('questions', 'read'),
  auditLog('read', 'question'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const row = await prisma.question.findUnique({ where: { id } });
      if (!row) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.json({ question: row });
    } catch (error) {
      console.error('Get question error:', error);
      res.status(500).json({
        error: 'Failed to fetch question',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.post(
  '/',
  authenticateAdmin,
  checkPermission('questions', 'create'),
  auditLog('create', 'question'),
  async (req, res) => {
    try {
      const body = req.body;
      const now = new Date();
      const created = await prisma.question.create({
        data: {
          id: body.id || uuidv4(),
          topic_id: body.topic_id,
          subtopic_id: body.subtopic_id,
          category_id: body.category_id,
          level_id: body.level_id,
          level: body.level,
          difficulty: body.difficulty,
          difficulty_word: body.difficulty_word,
          text: body.text || body.question,
          question: body.question || body.text,
          option_a: body.option_a,
          option_b: body.option_b,
          option_c: body.option_c,
          option_d: body.option_d,
          correct_option: body.correct_option || body.correct_answer,
          choices: body.choices,
          correct_answer: body.correct_answer,
          explanation: body.explanation,
          is_active: body.isActive !== false,
          created_at: now,
          updated_at: now,
        },
      });
      res.status(201).json({ question: created });
    } catch (error) {
      console.error('Create question error:', error);
      res.status(500).json({
        error: 'Failed to create question',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.put(
  '/:id',
  authenticateAdmin,
  checkPermission('questions', 'update'),
  auditLog('update', 'question'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const now = new Date();
      const data: Prisma.QuestionUpdateInput = { updated_at: now };
      const assign = <K extends keyof Prisma.QuestionUpdateInput>(key: K, val: unknown) => {
        if (val !== undefined) {
          (data as Record<string, unknown>)[key as string] = val;
        }
      };
      assign('topic_id', body.topic_id);
      assign('subtopic_id', body.subtopic_id);
      assign('category_id', body.category_id);
      assign('level_id', body.level_id);
      assign('level', body.level);
      assign('difficulty', body.difficulty);
      assign('difficulty_word', body.difficulty_word);
      assign('text', body.text);
      assign('question', body.question);
      assign('option_a', body.option_a);
      assign('option_b', body.option_b);
      assign('option_c', body.option_c);
      assign('option_d', body.option_d);
      if (body.correct_option !== undefined || body.correct_answer !== undefined) {
        data.correct_option = body.correct_option ?? body.correct_answer;
      }
      assign('choices', body.choices);
      assign('correct_answer', body.correct_answer);
      assign('explanation', body.explanation);
      assign('tags', body.tags);
      if (body.isActive !== undefined) {
        data.is_active = body.isActive;
      } else if (body.is_active !== undefined) {
        data.is_active = body.is_active;
      }

      const updated = await prisma.question.update({
        where: { id },
        data,
      });

      res.json({ question: updated });
    } catch (error) {
      console.error('Update question error:', error);
      res.status(500).json({
        error: 'Failed to update question',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.delete(
  '/:id',
  authenticateAdmin,
  checkPermission('questions', 'delete'),
  auditLog('delete', 'question'),
  async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.question.delete({ where: { id } });
      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      console.error('Delete question error:', error);
      res.status(500).json({
        error: 'Failed to delete question',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
