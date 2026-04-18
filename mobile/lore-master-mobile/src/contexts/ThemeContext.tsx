import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, ThemeName, EnhancedTheme } from '../themes/EnhancedThemes';

interface ThemeContextType {
  currentTheme: EnhancedTheme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  availableThemes: ThemeName[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  animationSettings: {
    reducedMotion: boolean;
    highPerformance: boolean;
    particleCount: number;
  };
  updateAnimationSettings: (settings: Partial<ThemeContextType['animationSettings']>) => void;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@lore-master/theme';
const ANIMATION_SETTINGS_KEY = '@lore-master/animation-settings';
const DARK_MODE_KEY = '@lore-master/dark-mode';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'default',
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [animationSettings, setAnimationSettings] = useState({
    reducedMotion: false,
    highPerformance: false,
    particleCount: 50,
  });

  // Load saved preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // Load theme
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && savedTheme in themes) {
        setThemeName(savedTheme as ThemeName);
      }

      // Load dark mode
      const savedDarkMode = await AsyncStorage.getItem(DARK_MODE_KEY);
      if (savedDarkMode !== null) {
        setIsDarkMode(JSON.parse(savedDarkMode));
      }

      // Load animation settings
      const savedAnimationSettings = await AsyncStorage.getItem(ANIMATION_SETTINGS_KEY);
      if (savedAnimationSettings) {
        setAnimationSettings(JSON.parse(savedAnimationSettings));
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }
  };

  const setTheme = async (newThemeName: ThemeName) => {
    try {
      setThemeName(newThemeName);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newThemeName);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(newDarkMode));
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  };

  const updateAnimationSettings = async (
    newSettings: Partial<ThemeContextType['animationSettings']>
  ) => {
    try {
      const updatedSettings = { ...animationSettings, ...newSettings };
      setAnimationSettings(updatedSettings);
      await AsyncStorage.setItem(
        ANIMATION_SETTINGS_KEY,
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.error('Error saving animation settings:', error);
    }
  };

  // Get the current theme with dark mode adjustments
  const getCurrentTheme = (): EnhancedTheme => {
    const baseTheme = themes[themeName];
    
    if (!isDarkMode) {
      return baseTheme;
    }

    // Apply dark mode modifications
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: baseTheme.colors.background.map(color => 
          // Darken background colors
          color.replace(/rgb\(([^)]+)\)/, (match, values) => {
            const [r, g, b] = values.split(',').map((v: string) => Math.max(0, parseInt(v.trim()) - 30));
            return `rgb(${r}, ${g}, ${b})`;
          })
        ),
        surface: baseTheme.colors.surface.map(color =>
          // Darken surface colors
          color.replace(/rgba\(([^)]+)\)/, (match, values) => {
            const parts = values.split(',');
            if (parts.length === 4) {
              const [r, g, b, a] = parts.map((v: string) => 
                parts.indexOf(v) < 3 ? Math.max(0, parseInt(v.trim()) - 20) : parseFloat(v.trim())
              );
              return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
            return color;
          })
        ),
      },
      effects: {
        ...baseTheme.effects,
        shadowIntensity: baseTheme.effects.shadowIntensity + 0.1,
        glowIntensity: baseTheme.effects.glowIntensity - 0.1,
      },
    };
  };

  const currentTheme = getCurrentTheme();

  // Adjust animation settings based on performance mode
  const getOptimizedTheme = (): EnhancedTheme => {
    if (!animationSettings.highPerformance) {
      return currentTheme;
    }

    // Optimize for performance
    return {
      ...currentTheme,
      animations: {
        ...currentTheme.animations,
        background: {
          ...currentTheme.animations.background,
          speed: currentTheme.animations.background.speed * 0.7,
        },
        particles: {
          ...currentTheme.animations.particles,
          speed: currentTheme.animations.particles.speed * 0.5,
        },
      },
      effects: {
        ...currentTheme.effects,
        particleDensity: currentTheme.effects.particleDensity * 0.6,
        glowIntensity: currentTheme.effects.glowIntensity * 0.8,
      },
    };
  };

  const optimizedTheme = getOptimizedTheme();

  // Disable animations if reduced motion is enabled
  const finalTheme: EnhancedTheme = animationSettings.reducedMotion
    ? {
        ...optimizedTheme,
        animations: Object.fromEntries(
          Object.entries(optimizedTheme.animations).map(([key, config]) => [
            key,
            { ...config, autoPlay: false, loop: false, speed: 0 },
          ])
        ) as EnhancedTheme['animations'],
        effects: {
          ...optimizedTheme.effects,
          particleDensity: 0,
          glowIntensity: 0,
        },
      }
    : optimizedTheme;

  const value: ThemeContextType = {
    currentTheme: finalTheme,
    themeName,
    setTheme,
    availableThemes: Object.keys(themes) as ThemeName[],
    isDarkMode,
    toggleDarkMode,
    animationSettings,
    updateAnimationSettings,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
