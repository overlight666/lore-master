import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AudioService from '../services/AudioService';

const { width } = Dimensions.get('window');

interface GameCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  progress?: number;
  locked?: boolean;
  onPress: () => void;
  variant?: 'default' | 'premium' | 'completed';
  size?: 'small' | 'medium' | 'large';
  badge?: string;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  subtitle,
  icon,
  progress = 0,
  locked = false,
  onPress,
  variant = 'default',
  size = 'medium',
  badge,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (variant === 'premium') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [variant]);

  const handlePressIn = () => {
    if (locked) {
      AudioService.playErrorSound();
      return;
    }
    
    AudioService.playClickSound();
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getCardColors = (): [string, string] => {
    if (locked) return ['#374151', '#1F2937'];
    
    switch (variant) {
      case 'premium':
        return ['#F59E0B', '#D97706'];
      case 'completed':
        return ['#10B981', '#059669'];
      default:
        return ['#6366F1', '#4F46E5'];
    }
  };

  const getCardSize = () => {
    const baseWidth = width - 32;
    switch (size) {
      case 'small':
        return { width: baseWidth / 2 - 8, height: 140 };
      case 'medium':
        return { width: baseWidth, height: 160 };
      case 'large':
        return { width: baseWidth, height: 200 };
      default:
        return { width: baseWidth, height: 160 };
    }
  };

  const cardSize = getCardSize();
  const colors = getCardColors();

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        styles.container,
        cardSize,
      ]}
    >
      <TouchableOpacity
        onPress={locked ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <LinearGradient
          colors={colors}
          style={[styles.gradient, cardSize]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {variant === 'premium' && (
            <Animated.View
              style={[
                styles.shimmer,
                {
                  opacity: shimmerAnim,
                  transform: [
                    {
                      translateX: shimmerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-cardSize.width, cardSize.width],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}

          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          <View style={styles.content}>
            {icon && (
              <View style={styles.iconContainer}>
                <Text style={[styles.icon, locked && styles.lockedIcon]}>
                  {locked ? '🔒' : icon}
                </Text>
              </View>
            )}

            <View style={styles.textContainer}>
              <Text style={[styles.title, locked && styles.lockedText]}>
                {title}
              </Text>
              {subtitle && (
                <Text style={[styles.subtitle, locked && styles.lockedText]}>
                  {subtitle}
                </Text>
              )}
            </View>

            {progress > 0 && !locked && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(progress, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 50,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 32,
  },
  lockedIcon: {
    opacity: 0.6,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  lockedText: {
    opacity: 0.6,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
});

export default GameCard;
