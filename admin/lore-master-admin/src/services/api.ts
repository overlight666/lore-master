import axios from 'axios';
import { getGoogleIdToken } from '@/lib/authToken';
import {
  User,
  Topic,
  Subtopic,
  Category,
  Level,
  Question,
  TopicFormData,
  SubtopicFormData,
  CategoryFormData,
  QuestionFormData,
  PaginatedResponse,
  DashboardStats,
  LeaderboardEntry,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_ADMIN_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = getGoogleIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error attaching Google ID token:', error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async () => {
    throw new Error('Use Google Sign-In on the login page');
  },
  logout: async () => {
    throw new Error('Use AuthContext logout');
  },
  verifyToken: async () => {
    throw new Error('Use verifyAdminRole');
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
};

export const topicsApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Topic>> => {
    const response = await api.get('/admin/topics', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Topic> => {
    const response = await api.get(`/admin/topics/${id}`);
    return response.data;
  },
  create: async (data: TopicFormData): Promise<Topic> => {
    const response = await api.post('/admin/topics', data);
    return response.data;
  },
  update: async (id: string, data: Partial<TopicFormData>): Promise<Topic> => {
    const response = await api.put(`/admin/topics/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/topics/${id}`);
  },
  toggleStatus: async (id: string): Promise<Topic> => {
    const response = await api.patch(`/admin/topics/${id}/toggle-status`);
    return response.data;
  },
};

export const subtopicsApi = {
  getAll: async (params?: {
    topic_id?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Subtopic>> => {
    const response = await api.get('/admin/subtopics', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Subtopic> => {
    const response = await api.get(`/admin/subtopics/${id}`);
    return response.data;
  },
  create: async (data: SubtopicFormData): Promise<Subtopic> => {
    const response = await api.post('/admin/subtopics', data);
    return response.data;
  },
  update: async (id: string, data: Partial<SubtopicFormData>): Promise<Subtopic> => {
    const response = await api.put(`/admin/subtopics/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/subtopics/${id}`);
  },
  toggleStatus: async (id: string): Promise<Subtopic> => {
    const response = await api.patch(`/admin/subtopics/${id}/toggle-status`);
    return response.data;
  },
};

export const categoriesApi = {
  getAll: async (params?: {
    topic_id?: string;
    subtopic_id?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Category>> => {
    const response = await api.get('/admin/categories', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/admin/categories/${id}`);
    return response.data;
  },
  create: async (data: CategoryFormData): Promise<Category> => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },
  update: async (id: string, data: Partial<CategoryFormData>): Promise<Category> => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/categories/${id}`);
  },
  toggleStatus: async (id: string): Promise<Category> => {
    const response = await api.patch(`/admin/categories/${id}/toggle-status`);
    return response.data;
  },
};

export const levelsApi = {
  getAll: async (params?: {
    topic_id?: string;
    subtopic_id?: string;
    category_id?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Level>> => {
    const response = await api.get('/admin/levels', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Level> => {
    const response = await api.get(`/admin/levels/${id}`);
    return response.data;
  },
  create: async (data: Record<string, unknown>): Promise<Level> => {
    const response = await api.post('/admin/levels', data);
    return response.data;
  },
  update: async (id: string, data: Record<string, unknown>): Promise<Level> => {
    const response = await api.put(`/admin/levels/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/levels/${id}`);
  },
  toggleStatus: async (id: string): Promise<Level> => {
    const response = await api.patch(`/admin/levels/${id}/toggle-status`);
    return response.data;
  },
};

export const questionsApi = {
  getAll: async (params?: {
    topicId?: string;
    subtopicId?: string;
    categoryId?: string;
    difficulty?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Question>> => {
    const response = await api.get('/admin/questions', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Question> => {
    const response = await api.get(`/admin/questions/${id}`);
    return response.data;
  },
  create: async (data: QuestionFormData): Promise<Question> => {
    const response = await api.post('/admin/questions', data);
    return response.data;
  },
  update: async (id: string, data: Partial<QuestionFormData>): Promise<Question> => {
    const response = await api.put(`/admin/questions/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/questions/${id}`);
  },
  toggleStatus: async (id: string): Promise<Question> => {
    const response = await api.patch(`/admin/questions/${id}/toggle-status`);
    return response.data;
  },
  bulkCreate: async (data: {
    topicId: string;
    subtopicId: string;
    categoryId: string;
    questionsData: Record<string, unknown>[];
  }): Promise<Record<string, unknown>> => {
    const response = await api.post('/admin/questions/bulk-create', data);
    return response.data;
  },
  bulkImport: async (data: {
    questions: Record<string, unknown>[];
    levelId?: string;
    categoryId?: string;
    subtopicId?: string;
    topicId?: string;
  }): Promise<Record<string, unknown>> => {
    const response = await api.post('/admin/questions/import', data);
    return response.data;
  },
  uploadBulk: async (formData: FormData): Promise<Record<string, unknown>> => {
    const response = await api.post('/admin/questions/upload-bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  parseDocx: async (formData: FormData): Promise<Record<string, unknown>> => {
    const response = await api.post('/admin/questions/parse-docx', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  validateDocx: async (formData: FormData): Promise<Record<string, unknown>> => {
    const response = await api.post('/admin/questions/validate-docx', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  checkDuplicates: async (
    questions: string[],
    categoryId: string
  ): Promise<{ duplicates: string[] }> => {
    const response = await api.post('/admin/questions/check-duplicates', {
      questions,
      categoryId,
    });
    return response.data;
  },
};

export const usersApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  toggleStatus: async (id: string): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/toggle-status`);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};

export const leaderboardApi = {
  getTop: async (limit: number = 100): Promise<LeaderboardEntry[]> => {
    const response = await api.get(`/admin/leaderboard/top/${limit}`);
    return response.data;
  },
};

export default api;
