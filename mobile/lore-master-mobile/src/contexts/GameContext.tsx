import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Topic,
  Level,
  Question,
  QuizResult,
  EnergyStatus,
  UserLifelines,
  LeaderboardEntry,
  StoreItem,
} from '../types';
import ApiService from '../services/ApiService';
import { useAuth } from './AuthContext';

interface GameState {
  // Content Data
  topics: Topic[];
  selectedTopic: Topic | null;
  levels: Level[];
  selectedLevel: Level | null;
  questions: Question[];
  
  // Quiz State
  currentQuestionIndex: number;
  answers: { [questionId: string]: string };
  quizResults: QuizResult[];
  
  // User Progress
  energy: EnergyStatus | null;
  lifelines: UserLifelines | null;
  
  // Leaderboard
  leaderboard: LeaderboardEntry[];
  
  // Store
  storeItems: StoreItem[];
  
  // Loading States
  loading: {
    topics: boolean;
    levels: boolean;
    questions: boolean;
    quiz: boolean;
    energy: boolean;
    leaderboard: boolean;
    store: boolean;
  };
  
  // Error States
  errors: {
    topics: string | null;
    levels: string | null;
    questions: string | null;
    quiz: string | null;
    energy: string | null;
    leaderboard: string | null;
    store: string | null;
  };
}

interface GameContextType extends GameState {
  // Actions
  loadTopics: () => Promise<void>;
  selectTopic: (topic: Topic) => void;
  loadLevels: (topicId: string) => Promise<void>;
  selectLevel: (level: Level) => void;
  loadQuestions: (levelId: string) => Promise<void>;
  
  // Quiz Actions
  answerQuestion: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => Promise<QuizResult | null>;
  resetQuiz: () => void;
  
  // Energy Actions
  loadEnergyStatus: () => Promise<void>;
  watchAd: () => Promise<void>;
  
  // Lifelines Actions
  loadLifelines: () => Promise<void>;
  useLifeline: (type: 'fifty_fifty' | 'call_friend') => void;
  
  // Leaderboard Actions
  loadLeaderboard: (topicId: string, levelId: string) => Promise<void>;
  
  // Store Actions
  loadStoreItems: () => Promise<void>;
  purchaseItem: (params: {
    item_type: 'energy' | 'fiftyFifty' | 'callFriend';
    quantity: number;
    price: number;
  }) => Promise<void>;
  
  // Utility
  clearErrors: () => void;
  resetGame: () => void;
}

const initialGameState: GameState = {
  topics: [],
  selectedTopic: null,
  levels: [],
  selectedLevel: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  quizResults: [],
  energy: null,
  lifelines: null,
  leaderboard: [],
  storeItems: [],
  loading: {
    topics: false,
    levels: false,
    questions: false,
    quiz: false,
    energy: false,
    leaderboard: false,
    store: false,
  },
  errors: {
    topics: null,
    levels: null,
    questions: null,
    quiz: null,
    energy: null,
    leaderboard: null,
    store: null,
  },
};

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const { isAuthenticated, user } = useAuth();

  // Reset game state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      resetGame();
    }
  }, [isAuthenticated]);

  const updateLoadingState = (key: keyof GameState['loading'], value: boolean) => {
    setGameState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }));
  };

  const updateErrorState = (key: keyof GameState['errors'], value: string | null) => {
    setGameState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: value }
    }));
  };

  // Content Loading Functions
  const loadTopics = async (): Promise<void> => {
    console.log('[GameContext] loadTopics called');
    try {
      updateLoadingState('topics', true);
      updateErrorState('topics', null);
      
      console.log('[GameContext] About to call ApiService.getTopics()');
      const topicsData = await ApiService.getTopics();
      console.log('[GameContext] Topics received:', topicsData);
      
      // Ensure we always have an array
      const safeTopics = Array.isArray(topicsData) ? topicsData : [];
      setGameState(prev => ({ ...prev, topics: safeTopics }));
    } catch (error) {
      console.error('[GameContext] Error loading topics:', error);
      updateErrorState('topics', error instanceof Error ? error.message : 'Failed to load topics');
      // Set empty array on error to maintain array type
      setGameState(prev => ({ ...prev, topics: [] }));
    } finally {
      updateLoadingState('topics', false);
    }
  };

  const selectTopic = (topic: Topic): void => {
    setGameState(prev => ({
      ...prev,
      selectedTopic: topic,
      levels: [],
      selectedLevel: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
    }));
  };

  const loadLevels = async (topicId: string): Promise<void> => {
    try {
      updateLoadingState('levels', true);
      updateErrorState('levels', null);
      
      const levels = await ApiService.getLevels(topicId);
      setGameState(prev => ({ ...prev, levels }));
    } catch (error) {
      console.error('Error loading levels:', error);
      updateErrorState('levels', error instanceof Error ? error.message : 'Failed to load levels');
    } finally {
      updateLoadingState('levels', false);
    }
  };

  const selectLevel = (level: Level): void => {
    setGameState(prev => ({
      ...prev,
      selectedLevel: level,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
    }));
  };

  const loadQuestions = async (levelId: string): Promise<void> => {
    try {
      updateLoadingState('questions', true);
      updateErrorState('questions', null);
      
      const questions = await ApiService.getQuestions(levelId);
      setGameState(prev => ({ ...prev, questions }));
    } catch (error) {
      console.error('Error loading questions:', error);
      updateErrorState('questions', error instanceof Error ? error.message : 'Failed to load questions');
    } finally {
      updateLoadingState('questions', false);
    }
  };

  // Quiz Functions
  const answerQuestion = (questionId: string, answer: string): void => {
    setGameState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }));
  };

  const nextQuestion = (): void => {
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1)
    }));
  };

  const previousQuestion = (): void => {
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0)
    }));
  };

  const submitQuiz = async (): Promise<QuizResult | null> => {
    if (!gameState.selectedLevel) {
      updateErrorState('quiz', 'No level selected');
      return null;
    }

    try {
      updateLoadingState('quiz', true);
      updateErrorState('quiz', null);

      const answers = Object.entries(gameState.answers).map(([question_id, selected_option]) => ({
        question_id,
        selected_option,
      }));

      const submission = {
        level_id: gameState.selectedLevel.id,
        answers,
        time_taken: 0, // You might want to track this
        used_5050: false,
        used_ai_hint: false,
      };

      const result = await ApiService.submitQuiz(submission);
      setGameState(prev => ({
        ...prev,
        quizResults: [...prev.quizResults, result]
      }));
      
      return result;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      updateErrorState('quiz', error instanceof Error ? error.message : 'Failed to submit quiz');
      return null;
    } finally {
      updateLoadingState('quiz', false);
    }
  };

  const resetQuiz = (): void => {
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: 0,
      answers: {},
    }));
  };

  // Energy Functions
  const loadEnergyStatus = async (): Promise<void> => {
    console.log('[GameContext] loadEnergyStatus called');
    try {
      updateLoadingState('energy', true);
      updateErrorState('energy', null);
      
      console.log('[GameContext] About to call ApiService.getEnergyStatus()');
      const energy = await ApiService.getEnergyStatus();
      console.log('[GameContext] Energy status received:', energy);
      setGameState(prev => ({ ...prev, energy }));
    } catch (error) {
      console.error('[GameContext] Error loading energy status:', error);
      updateErrorState('energy', error instanceof Error ? error.message : 'Failed to load energy status');
    } finally {
      updateLoadingState('energy', false);
    }
  };

  const watchAd = async (): Promise<void> => {
    try {
      updateLoadingState('energy', true);
      updateErrorState('energy', null);
      
      const reward = await ApiService.watchAd();
      // Update energy status
      await loadEnergyStatus();
    } catch (error) {
      console.error('Error watching ad:', error);
      updateErrorState('energy', error instanceof Error ? error.message : 'Failed to watch ad');
    } finally {
      updateLoadingState('energy', false);
    }
  };

  // Lifelines Functions
  const loadLifelines = async (): Promise<void> => {
    try {
      if (!user?.uid) {
        return;
      }
      const lifelines = await ApiService.getUserLifelines(user.uid);
      setGameState(prev => ({ ...prev, lifelines }));
    } catch (error) {
      console.error('Error loading lifelines:', error);
    }
  };

  const useLifeline = (type: 'fifty_fifty' | 'call_friend'): void => {
    if (!gameState.lifelines) return;
    
    setGameState(prev => ({
      ...prev,
      lifelines: prev.lifelines ? {
        ...prev.lifelines,
        [type]: prev.lifelines[type] - 1
      } : null
    }));
  };

  // Leaderboard Functions
  const loadLeaderboard = async (topicId: string, levelId: string): Promise<void> => {
    try {
      updateLoadingState('leaderboard', true);
      updateErrorState('leaderboard', null);

      if (!topicId || !levelId) {
        setGameState(prev => ({ ...prev, leaderboard: [] }));
        return;
      }

      const leaderboardData = await ApiService.getLeaderboard(topicId, levelId);
      setGameState(prev => ({ ...prev, leaderboard: leaderboardData.entries }));
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      updateErrorState('leaderboard', error instanceof Error ? error.message : 'Failed to load leaderboard');
    } finally {
      updateLoadingState('leaderboard', false);
    }
  };

  // Store Functions
  const loadStoreItems = async (): Promise<void> => {
    try {
      updateLoadingState('store', true);
      updateErrorState('store', null);
      
      const storeItems = await ApiService.getStoreItems();
      setGameState(prev => ({ ...prev, storeItems }));
    } catch (error) {
      console.error('Error loading store items:', error);
      updateErrorState('store', error instanceof Error ? error.message : 'Failed to load store items');
    } finally {
      updateLoadingState('store', false);
    }
  };

  const purchaseItem = async (params: {
    item_type: 'energy' | 'fiftyFifty' | 'callFriend';
    quantity: number;
    price: number;
  }): Promise<void> => {
    try {
      updateLoadingState('store', true);
      updateErrorState('store', null);
      
      await ApiService.purchaseItem(params);
      // Refresh lifelines and energy after purchase
      await Promise.all([loadLifelines(), loadEnergyStatus()]);
    } catch (error) {
      console.error('Error purchasing item:', error);
      updateErrorState('store', error instanceof Error ? error.message : 'Failed to purchase item');
    } finally {
      updateLoadingState('store', false);
    }
  };

  // Utility Functions
  const clearErrors = (): void => {
    setGameState(prev => ({
      ...prev,
      errors: {
        topics: null,
        levels: null,
        questions: null,
        quiz: null,
        energy: null,
        leaderboard: null,
        store: null,
      }
    }));
  };

  const resetGame = (): void => {
    setGameState(initialGameState);
  };

  const value: GameContextType = {
    ...gameState,
    loadTopics,
    selectTopic,
    loadLevels,
    selectLevel,
    loadQuestions,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
    loadEnergyStatus,
    watchAd,
    loadLifelines,
    useLifeline,
    loadLeaderboard,
    loadStoreItems,
    purchaseItem,
    clearErrors,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  // Ensure topics is always an array
  return {
    ...context,
    topics: Array.isArray(context.topics) ? context.topics : [],
  };
};
