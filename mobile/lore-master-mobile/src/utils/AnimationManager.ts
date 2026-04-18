import { Platform } from 'react-native';

// Animation sources for different categories
export const AnimationSources = {
  // UI Elements
  buttons: {
    pulse: require('../../assets/animations/button-pulse.json'),
    glow: require('../../assets/animations/button-glow.json'),
    sparkle: require('../../assets/animations/button-sparkle.json'),
    energy: require('../../assets/animations/button-energy.json'),
    bounce: require('../../assets/animations/button-bounce.json'),
    shimmer: require('../../assets/animations/button-shimmer.json'),
    loading: require('../../assets/animations/button-loading.json'),
    pressRipple: require('../../assets/animations/button-press-ripple.json'),
    outerGlow: require('../../assets/animations/button-outer-glow.json'),
  },

  // Cards
  cards: {
    float: require('../../assets/animations/card-float.json'),
    pulse: require('../../assets/animations/card-pulse.json'),
    glow: require('../../assets/animations/card-glow.json'),
    sparkle: require('../../assets/animations/card-sparkle.json'),
    energy: require('../../assets/animations/card-energy.json'),
    locked: require('../../assets/animations/card-locked.json'),
    completed: require('../../assets/animations/card-completed.json'),
    pressRipple: require('../../assets/animations/card-press-ripple.json'),
    cosmic: require('../../assets/animations/card-cosmic.json'),
    victory: require('../../assets/animations/card-victory.json'),
  },

  // Backgrounds
  backgrounds: {
    floatingParticles: require('../../assets/animations/floating-particles.json'),
    mysticalParticles: require('../../assets/animations/mystical-particles.json'),
    energyOrbs: require('../../assets/animations/energy-orbs.json'),
    cosmicDust: require('../../assets/animations/cosmic-dust.json'),
    magicSparkles: require('../../assets/animations/magic-sparkles.json'),
    victoryStars: require('../../assets/animations/victory-stars.json'),
    loadingDots: require('../../assets/animations/loading-dots.json'),
    ambientLight: require('../../assets/animations/ambient-light.json'),
  },

  // Glows and Effects
  effects: {
    gentleGlow: require('../../assets/animations/gentle-glow.json'),
    mediumGlow: require('../../assets/animations/medium-glow.json'),
    intenseGlow: require('../../assets/animations/intense-glow.json'),
    statusBarGlow: require('../../assets/animations/status-bar-glow.json'),
    statusBarBackground: require('../../assets/animations/status-bar-background.json'),
    valueChangeEffect: require('../../assets/animations/value-change-effect.json'),
    completionEffect: require('../../assets/animations/completion-effect.json'),
    magicalGlow: require('../../assets/animations/magical-glow.json'),
    energyGlow: require('../../assets/animations/energy-glow.json'),
    cosmicGlow: require('../../assets/animations/cosmic-glow.json'),
    victoryGlow: require('../../assets/animations/victory-glow.json'),
  },

  // Icons and Status
  icons: {
    energyIdle: require('../../assets/animations/energy-idle.json'),
    energyGain: require('../../assets/animations/energy-gain.json'),
    coinsIdle: require('../../assets/animations/coins-idle.json'),
    coinsGain: require('../../assets/animations/coins-gain.json'),
    gemsIdle: require('../../assets/animations/gems-idle.json'),
    gemsGain: require('../../assets/animations/gems-gain.json'),
    levelBadge: require('../../assets/animations/level-badge.json'),
    lockIcon: require('../../assets/animations/lock-icon.json'),
    trophyIcon: require('../../assets/animations/trophy-icon.json'),
    energyIcon: require('../../assets/animations/energy-icon.json'),
    starIcon: require('../../assets/animations/star-icon.json'),
    profileAvatar: require('../../assets/animations/profile-avatar.json'),
    themeSwitcher: require('../../assets/animations/theme-switcher.json'),
    playButton: require('../../assets/animations/play-button.json'),
  },

  // Loading States
  loading: {
    spinner: require('../../assets/animations/loading-spinner.json'),
    statusLoading: require('../../assets/animations/status-loading.json'),
    magicalLoading: require('../../assets/animations/magical-loading.json'),
    energyLoading: require('../../assets/animations/energy-loading.json'),
    cosmicLoading: require('../../assets/animations/cosmic-loading.json'),
    victoryLoading: require('../../assets/animations/victory-loading.json'),
  },

  // Special Animations
  special: {
    welcomeAnimation: require('../../assets/animations/welcome-animation.json'),
  },
};

// Animation configurations for different performance levels
export const AnimationConfigs = {
  // High performance mode - reduced animations
  highPerformance: {
    speed: 0.5,
    reducedMotion: true,
    particleDensity: 0.3,
    glowIntensity: 0.2,
  },

  // Balanced mode - good performance with visual appeal
  balanced: {
    speed: 1.0,
    reducedMotion: false,
    particleDensity: 0.7,
    glowIntensity: 0.5,
  },

  // High quality mode - full animations
  highQuality: {
    speed: 1.2,
    reducedMotion: false,
    particleDensity: 1.0,
    glowIntensity: 0.8,
  },
};

// Performance optimization utilities
export class AnimationManager {
  private static instance: AnimationManager;
  private performanceMode: keyof typeof AnimationConfigs = 'balanced';
  private isReducedMotionEnabled = false;

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  setPerformanceMode(mode: keyof typeof AnimationConfigs) {
    this.performanceMode = mode;
  }

  getPerformanceMode() {
    return this.performanceMode;
  }

  setReducedMotion(enabled: boolean) {
    this.isReducedMotionEnabled = enabled;
  }

  getReducedMotion() {
    return this.isReducedMotionEnabled;
  }

  // Get optimized animation config based on current settings
  getAnimationConfig(baseConfig: any) {
    const perfConfig = AnimationConfigs[this.performanceMode];
    
    if (this.isReducedMotionEnabled) {
      return {
        ...baseConfig,
        autoPlay: false,
        loop: false,
        speed: 0,
      };
    }

    return {
      ...baseConfig,
      speed: (baseConfig.speed || 1) * perfConfig.speed,
    };
  }

  // Check if device supports high-quality animations
  static shouldUseHighQuality(): boolean {
    // For React Native, we can check platform and other device characteristics
    if (Platform.OS === 'ios') {
      return true; // iOS generally has better performance
    }
    
    // For Android, you might want to check device specs
    // This is a simplified check - in a real app, you'd check actual device capabilities
    const androidVersion = typeof Platform.Version === 'number' ? Platform.Version : parseInt(Platform.Version, 10);
    return androidVersion >= 23; // Android 6.0+
  }

  // Preload critical animations
  static preloadAnimations() {
    const criticalAnimations = [
      AnimationSources.buttons.pulse,
      AnimationSources.loading.spinner,
      AnimationSources.backgrounds.floatingParticles,
      AnimationSources.icons.energyIdle,
    ];

    // In a real implementation, you'd preload these animations
    // Lottie doesn't have a built-in preload, but you can cache the JSON
    criticalAnimations.forEach(animation => {
      // Preload logic here
    });
  }
}

// Theme-based animation selector
export const getThemeAnimations = (themeName: string) => {
  switch (themeName) {
    case 'magical':
      return {
        background: AnimationSources.backgrounds.magicSparkles,
        button: AnimationSources.buttons.sparkle,
        card: AnimationSources.cards.sparkle,
        glow: AnimationSources.effects.magicalGlow,
        loading: AnimationSources.loading.magicalLoading,
      };
    
    case 'energy':
      return {
        background: AnimationSources.backgrounds.energyOrbs,
        button: AnimationSources.buttons.energy,
        card: AnimationSources.cards.energy,
        glow: AnimationSources.effects.energyGlow,
        loading: AnimationSources.loading.energyLoading,
      };
    
    case 'cosmic':
      return {
        background: AnimationSources.backgrounds.cosmicDust,
        button: AnimationSources.buttons.glow,
        card: AnimationSources.cards.cosmic,
        glow: AnimationSources.effects.cosmicGlow,
        loading: AnimationSources.loading.cosmicLoading,
      };
    
    case 'victory':
      return {
        background: AnimationSources.backgrounds.victoryStars,
        button: AnimationSources.buttons.shimmer,
        card: AnimationSources.cards.victory,
        glow: AnimationSources.effects.victoryGlow,
        loading: AnimationSources.loading.victoryLoading,
      };
    
    default:
      return {
        background: AnimationSources.backgrounds.floatingParticles,
        button: AnimationSources.buttons.pulse,
        card: AnimationSources.cards.float,
        glow: AnimationSources.effects.mediumGlow,
        loading: AnimationSources.loading.spinner,
      };
  }
};

// Utility to get animation by category and type
export const getAnimation = (category: keyof typeof AnimationSources, type: string) => {
  const categoryAnimations = AnimationSources[category] as any;
  return categoryAnimations[type] || null;
};

// Color filters for Lottie animations (if supported)
export const getThemeColorFilters = (themeName: string) => {
  switch (themeName) {
    case 'magical':
      return [
        { keypath: '**', color: '#aa076b' },
        { keypath: '**/*', color: '#61045f' },
      ];
    
    case 'energy':
      return [
        { keypath: '**', color: '#ff6b6b' },
        { keypath: '**/*', color: '#ffa500' },
      ];
    
    case 'cosmic':
      return [
        { keypath: '**', color: '#667eea' },
        { keypath: '**/*', color: '#764ba2' },
      ];
    
    default:
      return [];
  }
};

export default AnimationManager;
