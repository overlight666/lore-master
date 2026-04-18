import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AudioService from '../services/AudioService';

interface GameButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  shadow?: boolean;
  glow?: boolean;
}

const GameButton: React.FC<GameButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  style,
  textStyle,
  shadow = true,
  glow = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled) return;
    AudioService.playClickSound();
    const animations = [
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: false,
      }),
    ];
    if (glow) {
      animations.push(
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        })
      );
    }
    Animated.parallel(animations).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    const animations = [
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
      }),
    ];
    if (glow) {
      animations.push(
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        })
      );
    }
    Animated.parallel(animations).start();
  };

  const getButtonColors = (): [string, string] => {
    switch (variant) {
      case 'primary':
        return ['#6366F1', '#4F46E5'];
      case 'secondary':
        return ['#6B7280', '#4B5563'];
      case 'success':
        return ['#10B981', '#059669'];
      case 'warning':
        return ['#F59E0B', '#D97706'];
      case 'danger':
        return ['#EF4444', '#DC2626'];
      default:
        return ['#6366F1', '#4F46E5'];
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 };
      case 'medium':
        return { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 };
      case 'large':
        return { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 };
      default:
        return { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  const colors = getButtonColors();
  const buttonSize = getButtonSize();
  const fontSize = getFontSize();

  const glowStyle = glow ? {
    shadowColor: colors[0],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnim,
    shadowRadius: 20,
    elevation: glowAnim,
  } : {};

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        glowStyle,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
        style={[styles.container, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={disabled ? ['#9CA3AF', '#6B7280'] : colors}
          style={[
            styles.gradient,
            buttonSize,
            shadow && styles.shadow,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            {icon && <Text style={[styles.icon, { fontSize: fontSize + 2 }]}>{icon}</Text>}
            <Text
              style={[
                styles.text,
                { fontSize },
                disabled && styles.disabledText,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: '#D1D5DB',
  },
});

export default GameButton;
