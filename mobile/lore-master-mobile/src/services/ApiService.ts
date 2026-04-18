import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { GAME_CONFIG } from '../config/GameConfig';
import {
  ApiResponse,
  Topic,
  Level,
  Question,
  Subtopic,
  Category,
  QuizSubmission,
  QuizResult,
  EnergyStatus,
  AdReward,
  UserLifelines,
  StoreItem,
  Purchase,
  LeaderboardResponse,
  AiHintRequest,
  AiHintResponse,
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    console.log(`[API Service] Initializing with base URL: ${GAME_CONFIG.API.BASE_URL}`);
    
    this.api = axios.create({
      baseURL: GAME_CONFIG.API.BASE_URL,
      timeout: GAME_CONFIG.API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token and logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        console.log(`[API Request] Auth token available:`, this.authToken ? 'Yes' : 'No');
        
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
          console.log(`[API Request] Authorization header added`);
        } else {
          console.log(`[API Request] No auth token - request will be unauthenticated`);
        }
        
        console.log(`[API Request] Headers:`, config.headers);
        if (config.data) {
          console.log(`[API Request] Data:`, config.data);
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and logging
    this.api.interceptors.response.use(
      (response) => {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        console.log(`[API Response] Data:`, response.data);
        return response;
      },
      (error) => {
        console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        console.error(`[API Error] Status: ${error.response?.status}`);
        console.error(`[API Error] Response:`, error.response?.data);
        console.error(`[API Error] Full error:`, error);
        
        if (error.response?.status === 401) {
          // Handle unauthorized - clear auth token
          this.authToken = null;
        }
        
        const message = error.response?.data?.message || error.message || 'An error occurred';
        throw new Error(message);
      }
    );
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    console.log('[API Service] Setting auth token:', token ? 'Token provided' : 'Token cleared');
    this.authToken = token;
  }

  /**
   * Get authentication token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  // GAME DATA ENDPOINTS

  /**
   * Get all topics
   */
  async getTopics(): Promise<Topic[]> {
    try {
      const response = await this.api.get<{ topics: Topic[] }>('/topics');
      const topics = Array.isArray(response.data) ? response.data : response.data?.topics;
      return topics || [];
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  }

  /**
   * Legacy: Get levels for a subtopic (game routes)
   */
  async getLevels(subtopicId: string): Promise<Level[]> {
    try {
      const response = await this.api.get<Level[]>(`/game/subtopics/${subtopicId}/levels`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching levels:', error);
      throw error;
    }
  }

  /**
   * Legacy: Get questions for a level (game routes)
   */
  async getQuestions(levelId: string): Promise<Question[]> {
    try {
      const response = await this.api.get<{ questions: any[] }>(`/game/levels/${levelId}/questions`);
      const data = response.data;
      if (!data) return [];

      const questions = Array.isArray(data)
        ? data
        : Array.isArray(data.questions)
          ? data.questions
          : [];

      return questions.map((question: any) => ({
        id: question.id,
        level_id: levelId,
        question: question.question ?? question.text,
        choices: (question.choices ?? [question.option_a, question.option_b, question.option_c, question.option_d]).filter(Boolean),
        correct_answer: question.correct_answer ?? question.correctAnswer ?? question.correct_option ?? '',
        explanation: question.explanation,
        difficulty: question.difficulty,
      }));
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  // QUIZ ENDPOINTS

  /**
   * Submit quiz answers
   */
  async submitQuiz(submission: QuizSubmission): Promise<QuizResult> {
    try {
      const response = await this.api.post<ApiResponse<QuizResult> | QuizResult>('/quiz/submit', submission);
      const raw = response.data as ApiResponse<QuizResult> & QuizResult;
      if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
        return raw.data as QuizResult;
      }
      if (raw && 'attempt_id' in raw) {
        return raw as unknown as QuizResult;
      }
      throw new Error('Invalid quiz submission response');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  }

  /**
   * Get quiz attempts for user
   */
  async getQuizAttempts(userId?: string): Promise<QuizResult[]> {
    try {
      const endpoint = userId ? `/quiz/attempts/${userId}` : '/quiz/attempts';
      const response = await this.api.get<ApiResponse<QuizResult[]> | QuizResult[]>(endpoint);
      const raw = response.data;
      if (Array.isArray(raw)) {
        return raw;
      }
      if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as ApiResponse<QuizResult[]>).data)) {
        return (raw as ApiResponse<QuizResult[]>).data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      throw error;
    }
  }

  // ENERGY ENDPOINTS

  /**
   * Get current energy status
   */
  async getEnergyStatus(): Promise<EnergyStatus> {
    try {
      const response = await this.api.get<EnergyStatus & { next_energy_at?: string | Date }>('/energy/status');
      console.log('[API] Energy status response:', response.data);
      if (!response.data) {
        throw new Error('Invalid energy status response');
      }
      const d = response.data;
      const nextRaw = (d as { next_regen_at?: string }).next_regen_at ?? d.next_energy_at;
      let next_regen_at = '';
      if (nextRaw) {
        next_regen_at = typeof nextRaw === 'string' ? nextRaw : (nextRaw as Date).toISOString();
      }
      const maxAds = d.max_ads_per_day ?? 5;
      const adsWatched = d.ads_watched_today ?? 0;
      return {
        current_energy: d.current_energy,
        max_energy: d.max_energy,
        next_regen_at,
        ads_watched_today: adsWatched,
        max_ads_per_day: maxAds,
        can_watch_ad: adsWatched < maxAds,
      };
    } catch (error) {
      console.error('Error fetching energy status:', error);
      throw error;
    }
  }
  /**
   * Get subtopics for a topic
   */
  async getSubtopics(topicId: string): Promise<Subtopic[]> {
    try {
      const response = await this.api.get<{ subtopics: Subtopic[] }>(`/topics/${topicId}/subtopics`);
      const subtopics = Array.isArray(response.data) ? response.data : response.data?.subtopics;
      return subtopics || [];
    } catch (error) {
      console.error('Error fetching subtopics:', error);
      throw error;
    }
  }

  /**
   * Get categories for a subtopic
   */
  async getCategories(subtopicId: string): Promise<Category[]> {
    try {
      const response = await this.api.get<Category[]>(`/subtopics/${subtopicId}/categories`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get levels for a category
   */
  async getCategoryLevels(categoryId: string): Promise<Level[]> {
    try {
      const response = await this.api.get<Level[]>(`/categories/${categoryId}/levels`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching category levels:', error);
      throw error;
    }
  }

  /**
   * Get questions for a specific level in a category
   */
  async getCategoryQuestions(
    categoryId: string,
    level: number,
    limit: number = 10
  ): Promise<{
    level_id: string;
    level_number: number;
    totalQuestions: number;
    passingScore: number;
    questions: Question[];
  }> {
    try {
      const response = await this.api.get(`/categories/${categoryId}/questions`, {
        params: { level, limit }
      });
      const data = response.data;

      return {
        level_id: data.level_id,
        level_number: data.level_number,
        totalQuestions: data.totalQuestions,
        passingScore: data.passingScore,
        questions: (data.questions || []).map((question: any) => ({
          id: question.id,
          level_id: data.level_id,
          category_id: categoryId,
          question: question.question ?? question.text,
          choices: (question.choices ?? [question.option_a, question.option_b, question.option_c, question.option_d]).filter(Boolean),
          correct_answer: question.correct_answer ?? question.correctAnswer ?? question.correct_option ?? '',
          explanation: question.explanation,
          difficulty: question.difficulty,
        })),
      };
    } catch (error) {
      console.error('Error fetching category questions:', error);
      throw error;
    }
  }
  /**
   * Get user progress
   */
  async getUserProgress(userId: string): Promise<any> {
    try {
      const response = await this.api.get<any>(`/user/${userId}/progress`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }
  /**
   * Use energy for a quiz attempt
   */
  async useEnergy(userId: string, amount: number): Promise<any> {
    try {
      const response = await this.api.post<any>(`/user/${userId}/energy/use`, { amount });
      return response.data || {};
    } catch (error) {
      console.error('Error using energy:', error);
      throw error;
    }
  }

  /**
   * Watch ad to gain energy
   */
  async watchAd(): Promise<AdReward> {
    try {
      const response = await this.api.post<ApiResponse<AdReward> | { new_energy?: number; message?: string }>(
        '/energy/watch-ad'
      );
      const raw = response.data as ApiResponse<AdReward> & { new_energy?: number };
      if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
        return raw.data as AdReward;
      }
      if (raw && typeof raw.new_energy === 'number') {
        return {
          energy_gained: 1,
          new_total: raw.new_energy,
        };
      }
      throw new Error('Invalid ad reward response');
    } catch (error) {
      console.error('Error watching ad:', error);
      throw error;
    }
  }

  // LEADERBOARD ENDPOINTS

  /**
   * Get leaderboard for a topic + level (backend: GET /leaderboard/:topicId/:levelId)
   */
  async getLeaderboard(topicId: string, levelId: string): Promise<LeaderboardResponse> {
    try {
      const response = await this.api.get<{
        leaderboard?: Array<{
          user_id: string;
          username: string;
          score: number;
          time_taken: number;
          rank: number;
          completed_at?: string;
        }>;
        user_rank?: number | null;
        total_players?: number;
      }>(`/leaderboard/${topicId}/${levelId}`);
      const data = response.data;
      const entries = (data.leaderboard || []).map((row) => ({
        user_id: row.user_id,
        username: row.username,
        score: row.score,
        time_taken: row.time_taken,
        rank: row.rank,
        submitted_at: row.completed_at || '',
      }));
      return {
        entries,
        user_rank: data.user_rank ?? undefined,
        total_participants: data.total_players ?? entries.length,
      };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  // STORE ENDPOINTS

  /**
   * Get user lifelines (backend: GET /store/lifelines/:userId)
   */
  async getUserLifelines(userId: string): Promise<UserLifelines> {
    try {
      const response = await this.api.get<{ fiftyFifty?: number; callFriend?: number } | ApiResponse<UserLifelines>>(
        `/store/lifelines/${userId}`
      );
      const raw = response.data as { fiftyFifty?: number; callFriend?: number } & ApiResponse<UserLifelines>;
      if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
        return raw.data;
      }
      return {
        fifty_fifty: raw.fiftyFifty ?? 0,
        call_friend: raw.callFriend ?? 0,
      };
    } catch (error) {
      console.error('Error fetching lifelines:', error);
      throw error;
    }
  }

  /**
   * Get store items
   */
  async getStoreItems(): Promise<StoreItem[]> {
    try {
      const response = await this.api.get<StoreItem[]>('/store/items');
      console.log('[API] Store items response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching store items:', error);
      // Return mock store items if endpoint doesn't exist
      if (error instanceof Error && error.message.includes('404')) {
        console.log('[API] Store items endpoint not found, returning mock data');
        return [
          {
            id: 'fifty-fifty-item',
            name: '50/50 Lifeline',
            description: 'Removes two incorrect answers',
            type: 'lifeline',
            item_id: 'fifty-fifty',
            quantity: 1,
            price: 100,
            currency: 'coins',
            is_active: true,
          },
          {
            id: 'call-friend-item',
            name: 'Call a Friend',
            description: 'Get a hint from a friend',
            type: 'lifeline',
            item_id: 'call-friend',
            quantity: 1,
            price: 150,
            currency: 'coins',
            is_active: true,
          },
        ] as StoreItem[];
      }
      throw error;
    }
  }

  /**
   * Purchase item (backend expects item_type, quantity, price)
   */
  async purchaseItem(body: {
    item_type: 'energy' | 'fiftyFifty' | 'callFriend';
    quantity: number;
    price: number;
  }): Promise<Purchase> {
    try {
      const response = await this.api.post<ApiResponse<Purchase> | { purchase_id?: string; message?: string }>(
        '/store/purchase',
        body
      );
      const raw = response.data as ApiResponse<Purchase> & { purchase_id?: string };
      if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
        return raw.data as Purchase;
      }
      return {
        id: raw.purchase_id || '',
        user_id: '',
        item_id: body.item_type,
        quantity: body.quantity,
        total_price: body.price,
        currency: 'coins',
        purchased_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error purchasing item:', error);
      throw error;
    }
  }

  /**
   * Get purchase history
   */
  async getPurchaseHistory(userId?: string): Promise<Purchase[]> {
    try {
      const endpoint = userId ? `/store/purchases/${userId}` : '/store/purchases';
      const response = await this.api.get<ApiResponse<Purchase[]>>(endpoint);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      throw error;
    }
  }

  // AI ENDPOINTS

  /**
   * Get AI hint for question
   */
  async getAiHint(request: AiHintRequest): Promise<AiHintResponse> {
    try {
      const response = await this.api.post<ApiResponse<AiHintResponse> | AiHintResponse>('/ai/hint', request);
      const raw = response.data as ApiResponse<AiHintResponse> & AiHintResponse;
      if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
        return raw.data as AiHintResponse;
      }
      if (raw && 'hint' in raw && typeof (raw as AiHintResponse).hint === 'string') {
        return raw as AiHintResponse;
      }
      throw new Error('Invalid AI hint response');
    } catch (error) {
      console.error('Error getting AI hint:', error);
      throw error;
    }
  }

  // UTILITY ENDPOINTS

  /**
   * Initialize user in backend database
   */
  async initializeUser(): Promise<any> {
    try {
      const response = await this.api.post<any>('/auth/init-user');
      console.log('[API] User initialization response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await this.api.get<ApiResponse<{ status: string }> & { status?: string }>('/health');
      const raw = response.data;
      if (raw && typeof raw === 'object' && 'data' in raw && raw.data?.status) {
        return { status: raw.data.status };
      }
      if (raw && 'status' in raw && typeof raw.status === 'string') {
        return { status: raw.status };
      }
      return { status: 'unknown' };
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
}

export default new ApiService();
