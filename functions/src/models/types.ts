// TypeScript interfaces for Lore Master database schema

export interface User {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  energy: number;
  energy_updated_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  color?: string;
  order: number;
  isActive: boolean;
  totalSubtopics: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes to complete all subtopics
  tags: string[];
  requirements?: string[]; // prerequisite topic IDs
  created_at: Date;
  updated_at: Date;
}

export interface SubTopic {
  id: string;
  topic_id: string; // Reference to parent topic
  name: string;
  description?: string;
  icon_url?: string;
  color?: string;
  order: number; // Order within the topic
  isActive: boolean;
  totalLevels: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes to complete
  tags: string[];
  requirements?: string[]; // prerequisite subtopic IDs
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  topic_id: string;
  subtopic_id: string;
  name: string;
  description?: string;
  icon_url?: string;
  color?: string;
  order?: number;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Level {
  id: string;
  topic_id: string; // Reference to parent topic
  category_id: string; // Reference to parent category
  subtopic_id: string; // Reference to parent subtopic
  level: number; // 1-10
  name?: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes to complete
  totalQuestions: number;
  passingScore: number; // percentage required to pass
  isActive: boolean;
  requirements?: string[]; // prerequisite level IDs
  created_at: Date;
  updated_at: Date;
}

export interface Question {
  id: string;
  subtopic_id: string; // Reference to subtopic for question pool
  level_id?: string; // Optional: for backward compatibility
  difficulty: number; // Question difficulty level (1, 2, 3, etc.)
  text: string;
  correct_option: string; // Hidden from users
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  tags?: string[]; // Optional tags for categorization
  created_at?: Date;
  updated_at?: Date;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  level_id: string;
  score: number; // 0-100 percentage
  time_taken: number; // seconds
  completed_at: Date;
  used_5050: boolean;
  used_ai_hint: boolean;
  energy_consumed: boolean;
}

export interface UserAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option: string;
  is_correct: boolean;
  answered_at: Date;
}

export interface AdWatched {
  id: string;
  user_id: string;
  watched_at: Date;
}

export interface UserLifeline {
  id: string;
  user_id: string;
  type: 'fiftyFifty' | 'callFriend';
  quantity: number;
  updated_at: Date;
}

export interface Purchase {
  id: string;
  user_id: string;
  item_type: 'energy' | 'fiftyFifty' | 'callFriend';
  quantity: number;
  purchased_at: Date;
  price: number; // decimal
}

// DTOs (Data Transfer Objects) for API requests/responses
export interface CreateUserRequest {
  email: string;
  password: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password_hash'>;
}

export interface QuestionResponse {
  id: string;
  level_id: string;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  // Note: correct_option is excluded for security
}

export interface SubmitQuizRequest {
  level_id: string;
  answers: {
    question_id: string;
    selected_option: string;
  }[];
  time_taken: number;
  used_5050: boolean;
  used_ai_hint: boolean;
}

export interface QuizResult {
  attempt_id: string;
  score: number;
  passed: boolean; // >= 80%
  energy_consumed: boolean;
  answers: {
    question_id: string;
    selected_option: string;
    is_correct: boolean;
  }[];
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  score: number;
  time_taken: number;
  completed_at: Date;
  rank: number;
}

export interface EnergyStatus {
  current_energy: number;
  max_energy: number;
  next_energy_at?: Date;
  ads_watched_today: number;
  max_ads_per_day: number;
}

export interface LifelinesInventory {
  fiftyFifty: number;
  callFriend: number;
}
