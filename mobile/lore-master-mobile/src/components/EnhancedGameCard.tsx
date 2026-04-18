import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieAnimation from './LottieAnimation';
import AudioService from '../services/AudioService';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface EnhancedGameCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  locked?: boolean;
  completed?: boolean;
  progress?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  theme?: 'default' | 'magical' | 'cosmic' | 'energy' | 'mystical' | 'victory';
  size?: 'small' | 'medium' | 'large';
  showBadge?: boolean;
  badgeText?: string;
  animationType?: 'float' | 'pulse' | 'glow' | 'sparkle' | 'energy';
  icon?: string;
  level?: number;
  stars?: number;
  hapticFeedback?: boolean;
}

const EnhancedGameCard: React.FC<EnhancedGameCardProps> = ({
  title,
  subtitle,
  description,
  onPress,
  style,
  disabled = false,
  locked = false,
  completed = false,
  progress = 0,
  difficulty = 'medium',
  theme = 'default',
  size = 'medium',
  showBadge = false,
  badgeText,
  animationType = 'float',
  icon,
  level,
  stars = 0,
  hapticFeedback = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getThemeColors = () => {
    switch (theme) {
      case 'magical':
        return ['#aa076b', '#61045f', '#833ab4'];
      case 'cosmic':
        return ['#667eea', '#764ba2', '#f093fb'];
      case 'energy':
        return ['#ff6b6b', '#ffa500', '#ffed4e'];
      case 'mystical':
        return ['#1a1a2e', '#16213e', '#0f3460'];
      case 'victory':
        return ['#56ab2f', '#a8e6cf', '#ffd700'];
      default:
        return ['#667eea', '#764ba2', '#f093fb'];
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'hard':
        return '#FF9800';
      case 'expert':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getCardSize = () => {
    switch (size) {
      case 'small':
        return { width: width * 0.4, height: 120 };
      case 'large':
        return { width: width * 0.9, height: 200 };
      default:
        return { width: width * 0.85, height: 160 };
    }
  };

  const getAnimationSource = () => {
    if (locked) {
      return require('../../assets/animations/card-locked.json');
    }
    if (completed) {
      return require('../../assets/animations/card-completed.json');
    }

    switch (animationType) {
      case 'pulse':
        return require('../../assets/animations/card-pulse.json');
      case 'glow':
        return require('../../assets/animations/card-glow.json');
      case 'sparkle':
        return require('../../assets/animations/card-sparkle.json');
      case 'energy':
        return require('../../assets/animations/card-energy.json');
      default:
        return require('../../assets/animations/card-float.json');
    }
  };

  const handlePressIn = () => {
    if (disabled || locked) return;
    
    setIsPressed(true);
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    AudioService.playClickSound();
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    if (disabled || locked) return;
    onPress();
  };

  const cardSize = getCardSize();
  const themeColors = getThemeColors();

  const renderStars = () => {
    if (stars === 0) return null;
    
    return (
      <View style={styles.starsContainer}>
        {Array.from({ length: 3 }, (_, index) => (
          <Text
            key={index}
            style={[
              styles.star,
              { opacity: index < stars ? 1 : 0.3 }
            ]}
          >
            ⭐
          </Text>
        ))}
      </View>
    );
  };

  const renderProgressBar = () => {
    if (progress === 0 && !completed) return null;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={['#4CAF50', '#8BC34A']}
            style={[
              styles.progressFill,
              { width: `${completed ? 100 : progress}%` }
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.progressText}>
          {completed ? '100%' : `${Math.round(progress)}%`}
        </Text>
      </View>
    );
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || locked}
      style={[
        styles.container,
        {
          width: cardSize.width,
          height: cardSize.height,
          opacity: disabled || locked ? 0.6 : 1,
          transform: [{ scale: isPressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={themeColors as any}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Background animation */}
      <LottieAnimation
        source={getAnimationSource()}
        style={styles.backgroundAnimation}
        loop={!locked}
        autoPlay={true}
        speed={locked ? 0 : 0.8}
      />

      {/* Overlay for better text readability */}
      <View style={styles.overlay} />

      {/* Badge */}
      {showBadge && badgeText && (
        <View style={[styles.badge, { backgroundColor: getDifficultyColor() }]}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}

      {/* Lock overlay */}
      {locked && (
        <View style={styles.lockOverlay}>
          <LottieAnimation
            source={require('../../assets/animations/lock-icon.json')}
            style={styles.lockIcon}
            loop={false}
            autoPlay={true}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {icon && (
            <Text style={styles.icon}>{icon}</Text>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          {level && (
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>LV.{level}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {renderProgressBar()}
          {renderStars()}
        </View>
      </View>

      {/* Completion effect */}
      {completed && (
        <LottieAnimation
          source={require('../../assets/animations/completion-effect.json')}
          style={styles.completionEffect}
          loop={true}
          autoPlay={true}
          speed={0.6}
        />
      )}

      {/* Press ripple effect */}
      {isPressed && !locked && (
        <LottieAnimation
          source={require('../../assets/animations/card-press-ripple.json')}
          style={styles.pressEffect}
          loop={false}
          autoPlay={true}
          speed={2}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginHorizontal: 8,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backgroundAnimation: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 2,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  lockOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  lockIcon: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    zIndex: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  levelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
    lineHeight: 16,
  },
  footer: {
    marginTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  star: {
    fontSize: 12,
    marginLeft: 2,
  },
  completionEffect: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 6,
  },
  pressEffect: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 7,
  },
});

export default EnhancedGameCard;
