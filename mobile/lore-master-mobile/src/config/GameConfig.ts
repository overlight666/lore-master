// Game Configuration Constants
export const GAME_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: 'https://api-pjqcolhhra-uc.a.run.app',
    TIMEOUT: 10000,
  },

  // Colors
  COLORS: {
    PRIMARY: '#6366F1',
    SECONDARY: '#8B5CF6',
    ACCENT: '#EC4899',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    
    // Background Colors
    BACKGROUND: '#0F172A',
    SURFACE: '#1E293B',
    CARD: '#334155',
    
    // Text Colors
    TEXT_PRIMARY: '#F8FAFC',
    TEXT_SECONDARY: '#CBD5E1',
    TEXT_MUTED: '#64748B',
    TEXT_LIGHT: '#FFFFFF',
    
    // Game Specific Colors
    ENERGY_BLUE: '#3B82F6',
    COIN_GOLD: '#F59E0B',
    STAR_YELLOW: '#FCD34D',
    
    // Input Colors
    INPUT_BACKGROUND: '#1E293B',
    INPUT_BORDER: '#475569',
    
    // Utility
    SHADOW: '#000000',
    TRANSPARENT: 'transparent',
  },

  // Typography
  FONTS: {
    SIZE: {
      SMALL: 12,
      MEDIUM: 14,
      LARGE: 16,
      XLARGE: 18,
      XXLARGE: 20,
      XXXLARGE: 24,
    },
    WEIGHT: {
      NORMAL: '400',
      MEDIUM: '500',
      SEMIBOLD: '600',
      BOLD: '700',
    },
  },

  // Spacing
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 20,
    XL: 24,
    XXL: 32,
    XXXL: 48,
  },

  // Border Radius
  BORDER_RADIUS: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 12,
    XLARGE: 16,
    ROUND: 50,
  },

  // Animations
  ANIMATIONS: {
    FAST: 200,
    MEDIUM: 300,
    SLOW: 500,
    EXTRA_SLOW: 800,
  },

  // Game Rules
  GAME_RULES: {
    MAX_ENERGY: 6,
    ENERGY_REGEN_HOURS: 4,
    MAX_ADS_PER_DAY: 5,
    QUESTIONS_PER_LEVEL: 10,
    QUESTION_TIME_LIMIT: 90, // seconds
    PASS_PERCENTAGE: 80,
    PERFECT_SCORE_PERCENTAGE: 100,
  },

  // UI Constants
  UI: {
    HEADER_HEIGHT: 60,
    TAB_HEIGHT: 80,
    CARD_ELEVATION: 4,
    MODAL_OVERLAY_OPACITY: 0.5,
  },

  // Screen Dimensions (will be updated at runtime)
  SCREEN: {
    WIDTH: 375, // default, updated at runtime
    HEIGHT: 667, // default, updated at runtime
  },

  // Asset Paths
  ASSETS: {
    ICONS: {
      ENERGY: '⚡',
      COIN: '🪙',
      STAR: '⭐',
    },
    IMAGES: {
      LOGO: require('../../assets/images/logo.png'),
      BACKGROUND: require('../../assets/images/background.png'),
    },
    // ...existing code...
  },
} as const;

// Type definitions for better TypeScript support
export type GameColors = typeof GAME_CONFIG.COLORS;
export type GameSpacing = typeof GAME_CONFIG.SPACING;
export type GameFonts = typeof GAME_CONFIG.FONTS;
