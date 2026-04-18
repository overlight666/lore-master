import type { Topic as PTopic, Subtopic as PSubtopic, Category as PCategory, Level as PLevel } from '@prisma/client';

export function mapTopic(t: PTopic): Record<string, unknown> {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    icon_url: t.icon_url,
    color: t.color,
    order: t.order,
    isActive: t.is_active,
    totalSubtopics: t.total_subtopics,
    difficulty: t.difficulty,
    estimatedTime: t.estimated_time,
    tags: t.tags,
    requirements: t.requirements,
    created_at: t.created_at,
    updated_at: t.updated_at,
  };
}

export function mapSubtopic(s: PSubtopic): Record<string, unknown> {
  return {
    id: s.id,
    topic_id: s.topic_id,
    name: s.name,
    description: s.description,
    icon_url: s.icon_url,
    color: s.color,
    order: s.order,
    isActive: s.is_active,
    totalLevels: s.total_levels,
    difficulty: s.difficulty,
    estimatedTime: s.estimated_time,
    tags: s.tags,
    requirements: s.requirements,
    created_at: s.created_at,
    updated_at: s.updated_at,
  };
}

export function mapCategory(c: PCategory): Record<string, unknown> {
  return {
    id: c.id,
    topic_id: c.topic_id,
    subtopic_id: c.subtopic_id,
    name: c.name,
    description: c.description,
    icon_url: c.icon_url,
    color: c.color,
    order: c.order,
    isActive: c.is_active,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

export function mapLevel(l: PLevel): Record<string, unknown> {
  return {
    id: l.id,
    topic_id: l.topic_id,
    category_id: l.category_id,
    subtopic_id: l.subtopic_id,
    level: l.level,
    name: l.name,
    description: l.description,
    difficulty: l.difficulty,
    estimatedTime: l.estimated_time,
    totalQuestions: l.total_questions,
    passingScore: l.passing_score,
    isActive: l.is_active,
    requirements: l.requirements,
    created_at: l.created_at,
    updated_at: l.updated_at,
  };
}
