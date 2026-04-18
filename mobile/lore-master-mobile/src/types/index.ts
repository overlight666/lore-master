// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Authentication Types
// AUTH TYPES
export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
  accessToken: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// Game Data Types
export interface Topic {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  color?: string;
  order: number;
  isActive: boolean;
  totalSubtopics?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Subtopic {
  id: string;
  topic_id: string;
  name: string;
  description?: string;
  icon_url?: string;
  color?: string;
  order: number;
  isActive: boolean;
  totalLevels?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Level {
  id: string;
  topic_id: string;
  subtopic_id: string;
  category_id: string;
  level: number;
  name?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
  totalQuestions: number;
  passingScore: number;
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  level_id?: string;
  category_id?: string;
  subtopic_id?: string;
  question: string;
  choices: string[];
  correct_answer: string;
  explanation?: string;
  difficulty?: number;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Quiz Types
export interface QuizAnswer {
  question_id: string;
  selected_option: string;
  is_correct?: boolean;
  time_taken?: number;
}

export interface QuizSubmission {
  level_id: string;
  answers: QuizAnswer[];
  time_taken: number;
  used_5050: boolean;
  used_ai_hint: boolean;
}

export interface QuizResult {
  id: string;
  user_id: string;
  level_id: string;
  category_id?: string;
  topic_id?: string;
  subtopic_id?: string;
  level?: number;
  score: number;
  percentage: number;
  time_taken: number;
  passed: boolean;
  perfect_score: boolean;
  energy_consumed: number;
  used_5050: boolean;
  used_ai_hint: boolean;
  submitted_at: string;
  answers: QuizAnswer[];
  total_questions?: number;
  correct_answers?: number;
  incorrect_answers?: number;
}

// Energy System Types
export interface EnergyStatus {
  current_energy: number;
  max_energy: number;
  next_regen_at: string;
  ads_watched_today: number;
  max_ads_per_day: number;
  can_watch_ad: boolean;
}

export interface AdReward {
  energy_gained: number;
  new_total: number;
  next_ad_available_at?: string;
}

// Lifeline Types
export interface UserLifelines {
  fifty_fifty: number;
  call_friend: number;
}

export interface LifelineUsage {
  type: 'fifty_fifty' | 'call_friend';
  question_id: string;
  used_at: string;
}

// Store Types
export interface StoreItem {
  id: string;
  name: string;
  description: string;
  type: 'energy' | 'lifeline';
  item_id: string;
  quantity: number;
  price: number;
  currency: 'coins' | 'real_money';
  is_active: boolean;
}

export interface Purchase {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  total_price: number;
  currency: 'coins' | 'real_money';
  purchased_at: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  user_id: string;
  username: string;
  score: number;
  time_taken: number;
  rank: number;
  submitted_at: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  user_rank?: number;
  total_participants: number;
}

// AI Hint Types
export interface AiHintRequest {
  question_id: string;
  question_text: string;
  options: string[];
}

export interface AiHintResponse {
  hint: string;
  confidence?: number;
}

// Navigation Types
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Topics: undefined;
  Subtopics: { topic: Topic };
  Categories: { topic: Topic; subtopic: Subtopic };
  LevelQuiz: { topic: Topic; subtopic: Subtopic; category: Category };
  Quiz: { 
    topic: Topic; 
    subtopic: Subtopic; 
    category: Category; 
    level: number;
    totalLevels: number;
    levelId?: string;
    passingScore?: number;
    totalQuestions?: number;
  };
  QuizResult: { 
    result: QuizResult; 
    topic: Topic; 
    subtopic: Subtopic; 
    category: Category; 
    level: number;
    totalLevels: number;
    isLastLevel: boolean;
    levelId: string;
    passingScore: number;
    totalQuestions: number;
  };
  Profile: undefined;
  Store: undefined;
  Energy: undefined;
  Settings: undefined;
  // Legacy routes (kept for compatibility)
  TopicDetail: { topic: Topic };
  LevelSelect: { topic: Topic };
  Leaderboard: { level: Level; topic: Topic };
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;

// Context Types
export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getIdToken: () => Promise<string | null>;
}

export interface GameContextType {
  // State
  topics: Topic[];
  currentTopic: Topic | null;
  levels: Level[];
  currentLevel: Level | null;
  questions: Question[];
  energy: EnergyStatus | null;
  lifelines: UserLifelines | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTopics: () => Promise<void>;
  loadLevels: (topicId: string) => Promise<void>;
  loadQuestions: (levelId: string) => Promise<void>;
  loadEnergy: () => Promise<void>;
  loadLifelines: () => Promise<void>;
  submitQuiz: (submission: QuizSubmission) => Promise<QuizResult>;
  watchAd: () => Promise<AdReward>;
  purchaseItem: (itemId: string, quantity: number) => Promise<void>;
  setCurrentTopic: (topic: Topic | null) => void;
  setCurrentLevel: (level: Level | null) => void;
  clearError: () => void;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}
