import { ColorValue } from 'react-native';

export interface ThemeColors {
  primary: string[];
  secondary: string[];
  accent: string[];
  background: string[];
  surface: string[];
  success: string[];
  warning: string[];
  error: string[];
  text: {
    primary: string;
    secondary: string;
    accent: string;
    inverse: string;
  };
}

export interface AnimationConfig {
  source: any;
  speed: number;
  loop: boolean;
  autoPlay: boolean;
}

export interface EnhancedTheme {
  name: string;
  colors: ThemeColors;
  animations: {
    background: AnimationConfig;
    button: AnimationConfig;
    card: AnimationConfig;
    particles: AnimationConfig;
    glow: AnimationConfig;
    loading: AnimationConfig;
  };
  effects: {
    shadowIntensity: number;
    glowIntensity: number;
    particleDensity: number;
    animationSpeed: number;
  };
}

// Default Theme - Cosmic Blue
export const DefaultTheme: EnhancedTheme = {
  name: 'default',
  colors: {
    primary: ['#667eea', '#764ba2'],
    secondary: ['#4b79a1', '#283e51'],
    accent: ['#f093fb', '#f5576c'],
    background: ['#667eea', '#764ba2', '#f093fb'],
    surface: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
    success: ['#56ab2f', '#a8e6cf'],
    warning: ['#ffb347', '#ff8c00'],
    error: ['#ff6b6b', '#ee5a24'],
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.8)',
      accent: '#f093fb',
      inverse: '#000000',
    },
  },
  animations: {
    background: {
      source: require('../../assets/animations/floating-particles.json'),
      speed: 0.8,
      loop: true,
      autoPlay: true,
    },
    button: {
      source: require('../../assets/animations/button-pulse.json'),
      speed: 1,
      loop: true,
      autoPlay: true,
    },
    card: {
      source: require('../../assets/animations/card-float.json'),
      speed: 0.6,
      loop: true,
      autoPlay: true,
    },
    particles: {
      source: require('../../assets/animations/floating-particles.json'),
      speed: 0.5,
      loop: true,
      autoPlay: true,
    },
    glow: {
      source: require('../../assets/animations/ambient-glow.json'),
      speed: 0.4,
      loop: true,
      autoPlay: true,
    },
    loading: {
      source: require('../../assets/animations/loading-spinner.json'),
      speed: 1.2,
      loop: true,
      autoPlay: true,
    },
  },
  effects: {
    shadowIntensity: 0.3,
    glowIntensity: 0.5,
    particleDensity: 0.7,
    animationSpeed: 1,
  },
};

// Magical Theme - Purple Magic
export const MagicalTheme: EnhancedTheme = {
  name: 'magical',
  colors: {
    primary: ['#aa076b', '#61045f'],
    secondary: ['#833ab4', '#667eea'],
    accent: ['#ff6b6b', '#ffa500'],
    background: ['#1a1a2e', '#16213e', '#0f3460'],
    surface: ['rgba(170,7,107,0.2)', 'rgba(97,4,95,0.1)'],
    success: ['#4CAF50', '#8BC34A'],
    warning: ['#FF9800', '#FFC107'],
    error: ['#F44336', '#FF5722'],
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.9)',
      accent: '#ff6b6b',
      inverse: '#000000',
    },
  },
  animations: {
    background: {
      source: require('../../assets/animations/magic-sparkles.json'),
      speed: 0.9,
      loop: true,
      autoPlay: true,
    },
    button: {
      source: require('../../assets/animations/button-sparkle.json'),
      speed: 1.2,
      loop: true,
      autoPlay: true,
    },
    card: {
      source: require('../../assets/animations/card-sparkle.json'),
      speed: 0.8,
      loop: true,
      autoPlay: true,
    },
    particles: {
      source: require('../../assets/animations/magic-sparkles.json'),
      speed: 0.7,
      loop: true,
      autoPlay: true,
    },
    glow: {
      source: require('../../assets/animations/magical-glow.json'),
      speed: 0.6,
      loop: true,
      autoPlay: true,
    },
    loading: {
      source: require('../../assets/animations/magical-loading.json'),
      speed: 1.5,
      loop: true,
      autoPlay: true,
    },
  },
  effects: {
    shadowIntensity: 0.4,
    glowIntensity: 0.8,
    particleDensity: 1.0,
    animationSpeed: 1.3,
  },
};

// Energy Theme - Orange/Red Energy
export const EnergyTheme: EnhancedTheme = {
  name: 'energy',
  colors: {
    primary: ['#ff6b6b', '#ffa500'],
    secondary: ['#ffed4e', '#ff9ff3'],
    accent: ['#4ecdc4', '#44a08d'],
    background: ['#ff6b6b', '#ffa500', '#ffed4e'],
    surface: ['rgba(255,107,107,0.2)', 'rgba(255,165,0,0.1)'],
    success: ['#56ab2f', '#a8e6cf'],
    warning: ['#ffb347', '#ff8c00'],
    error: ['#e55039', '#c44569'],
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.9)',
      accent: '#4ecdc4',
      inverse: '#000000',
    },
  },
  animations: {
    background: {
      source: require('../../assets/animations/energy-orbs.json'),
      speed: 1.0,
      loop: true,
      autoPlay: true,
    },
    button: {
      source: require('../../assets/animations/button-energy.json'),
      speed: 1.1,
      loop: true,
      autoPlay: true,
    },
    card: {
      source: require('../../assets/animations/card-energy.json'),
      speed: 0.9,
      loop: true,
      autoPlay: true,
    },
    particles: {
      source: require('../../assets/animations/energy-orbs.json'),
      speed: 0.8,
      loop: true,
      autoPlay: true,
    },
    glow: {
      source: require('../../assets/animations/energy-glow.json'),
      speed: 0.7,
      loop: true,
      autoPlay: true,
    },
    loading: {
      source: require('../../assets/animations/energy-loading.json'),
      speed: 1.4,
      loop: true,
      autoPlay: true,
    },
  },
  effects: {
    shadowIntensity: 0.35,
    glowIntensity: 0.7,
    particleDensity: 0.9,
    animationSpeed: 1.2,
  },
};

// Cosmic Theme - Space/Galaxy
export const CosmicTheme: EnhancedTheme = {
  name: 'cosmic',
  colors: {
    primary: ['#667eea', '#764ba2'],
    secondary: ['#f093fb', '#f5576c'],
    accent: ['#4facfe', '#00f2fe'],
    background: ['#0c0c0c', '#1a1a2e', '#16213e'],
    surface: ['rgba(102,126,234,0.2)', 'rgba(118,75,162,0.1)'],
    success: ['#43e97b', '#38f9d7'],
    warning: ['#fa709a', '#fee140'],
    error: ['#fc466b', '#3f5efb'],
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.8)',
      accent: '#4facfe',
      inverse: '#000000',
    },
  },
  animations: {
    background: {
      source: require('../../assets/animations/cosmic-dust.json'),
      speed: 0.6,
      loop: true,
      autoPlay: true,
    },
    button: {
      source: require('../../assets/animations/button-cosmic.json'),
      speed: 0.9,
      loop: true,
      autoPlay: true,
    },
    card: {
      source: require('../../assets/animations/card-cosmic.json'),
      speed: 0.7,
      loop: true,
      autoPlay: true,
    },
    particles: {
      source: require('../../assets/animations/cosmic-dust.json'),
      speed: 0.4,
      loop: true,
      autoPlay: true,
    },
    glow: {
      source: require('../../assets/animations/cosmic-glow.json'),
      speed: 0.3,
      loop: true,
      autoPlay: true,
    },
    loading: {
      source: require('../../assets/animations/cosmic-loading.json'),
      speed: 1.0,
      loop: true,
      autoPlay: true,
    },
  },
  effects: {
    shadowIntensity: 0.5,
    glowIntensity: 0.6,
    particleDensity: 0.8,
    animationSpeed: 0.9,
  },
};

// Victory Theme - Gold/Green Success
export const VictoryTheme: EnhancedTheme = {
  name: 'victory',
  colors: {
    primary: ['#56ab2f', '#a8e6cf'],
    secondary: ['#ffd700', '#ffb347'],
    accent: ['#4facfe', '#00f2fe'],
    background: ['#56ab2f', '#a8e6cf', '#ffd700'],
    surface: ['rgba(86,171,47,0.2)', 'rgba(168,230,207,0.1)'],
    success: ['#27ae60', '#2ecc71'],
    warning: ['#f39c12', '#e67e22'],
    error: ['#e74c3c', '#c0392b'],
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.9)',
      accent: '#ffd700',
      inverse: '#000000',
    },
  },
  animations: {
    background: {
      source: require('../../assets/animations/victory-stars.json'),
      speed: 1.0,
      loop: true,
      autoPlay: true,
    },
    button: {
      source: require('../../assets/animations/button-victory.json'),
      speed: 1.2,
      loop: true,
      autoPlay: true,
    },
    card: {
      source: require('../../assets/animations/card-victory.json'),
      speed: 0.8,
      loop: true,
      autoPlay: true,
    },
    particles: {
      source: require('../../assets/animations/victory-stars.json'),
      speed: 0.9,
      loop: true,
      autoPlay: true,
    },
    glow: {
      source: require('../../assets/animations/victory-glow.json'),
      speed: 0.7,
      loop: true,
      autoPlay: true,
    },
    loading: {
      source: require('../../assets/animations/victory-loading.json'),
      speed: 1.3,
      loop: true,
      autoPlay: true,
    },
  },
  effects: {
    shadowIntensity: 0.25,
    glowIntensity: 0.9,
    particleDensity: 1.2,
    animationSpeed: 1.1,
  },
};

export const themes = {
  default: DefaultTheme,
  magical: MagicalTheme,
  energy: EnergyTheme,
  cosmic: CosmicTheme,
  victory: VictoryTheme,
};

export type ThemeName = keyof typeof themes;
