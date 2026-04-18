import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.post('/hint', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question_id } = req.body;

    if (!question_id) {
      res.status(400).json({ error: 'Question ID is required' });
      return;
    }

    const question = await prisma.question.findUnique({ where: { id: question_id } });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const text = question.text || question.question || '';
    const hint = generateAIHint(text, {
      option_a: question.option_a || '',
      option_b: question.option_b || '',
      option_c: question.option_c || '',
      option_d: question.option_d || '',
    });

    res.status(200).json({ hint });
  } catch (error) {
    console.error('Error generating AI hint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function generateAIHint(
  questionText: string,
  options: { option_a: string; option_b: string; option_c: string; option_d: string }
): string {
  const hints = [
    'Think about the most well-known character or fact related to this topic.',
    'Consider the main protagonist or most famous element mentioned.',
    'Remember the classic or original version of this series/game.',
    'Focus on the most popular or widely recognized answer.',
    'Think about what beginners in this topic would know first.',
    "Consider the answer that's been consistent throughout the series.",
    'Look for the option that stands out as most iconic.',
    'Remember what made this series/game famous in the first place.',
  ];

  if (questionText.toLowerCase().includes('main character') || questionText.toLowerCase().includes('protagonist')) {
    return "Your friend says: 'Think about who the story revolves around - usually the first character introduced or the one on the cover!'";
  }

  if (questionText.toLowerCase().includes('first') || questionText.toLowerCase().includes('original')) {
    return "Your friend says: 'Go with your gut on the earliest or most classic option. It's usually the foundation of everything else!'";
  }

  if (questionText.toLowerCase().includes('name') || questionText.toLowerCase().includes('called')) {
    return "Your friend says: 'Think about the most memorable or catchy name - it's probably the one that stuck in popular culture!'";
  }

  const randomHint = hints[Math.floor(Math.random() * hints.length)];
  return `Your friend says: '${randomHint}'`;
}

export default router;
