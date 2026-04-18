import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieAnimation from './LottieAnimation';
import AudioService from '../services/AudioService';
import * as Haptics from 'expo-haptics';

interface EnhancedGameButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'magical' | 'cosmic' | 'energy';
  size?: 'small' | 'medium' | 'large' | 'xl';
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  shadow?: boolean;
  glow?: boolean;
  loading?: boolean;
  animationType?: 'pulse' | 'glow' | 'sparkle' | 'energy' | 'bounce' | 'shimmer';
  hapticFeedback?: boolean;
  soundEffect?: boolean;
}

const EnhancedGameButton: React.FC<EnhancedGameButtonProps> = ({
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
  loading = false,
  animationType = 'pulse',
  hapticFeedback = true,
  soundEffect = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return ['#667eea', '#764ba2'];
      case 'secondary':
        return ['#4b79a1', '#283e51'];
      case 'success':
        return ['#56ab2f', '#a8e6cf'];
      case 'warning':
        return ['#ffb347', '#ff8c00'];
      case 'danger':
        return ['#ff6b6b', '#ee5a24'];
      case 'magical':
        return ['#aa076b', '#61045f'];
      case 'cosmic':
        return ['#667eea', '#764ba2'];
      case 'energy':
        return ['#ff6b6b', '#ffa500'];
      default:
        return ['#667eea', '#764ba2'];
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { height: 40, paddingHorizontal: 16, fontSize: 14 };
      case 'large':
        return { height: 60, paddingHorizontal: 32, fontSize: 18 };
      case 'xl':
        return { height: 70, paddingHorizontal: 40, fontSize: 20 };
      default:
        return { height: 50, paddingHorizontal: 24, fontSize: 16 };
    }
  };

  const getAnimationSource = () => {
    if (loading) {
      return require('../../assets/animations/button-loading.json');
    }
    
    switch (animationType) {
      case 'glow':
        return require('../../assets/animations/button-glow.json');
      case 'sparkle':
        return require('../../assets/animations/button-sparkle.json');
      case 'energy':
        return require('../../assets/animations/button-energy.json');
      case 'bounce':
        return require('../../assets/animations/button-bounce.json');
      case 'shimmer':
        return require('../../assets/animations/button-shimmer.json');
      default:
        return require('../../assets/animations/button-pulse.json');
    }
  };

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (soundEffect) {
      AudioService.playClickSound();
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    if (disabled || loading) return;
    onPress();
  };

  const buttonSize = getButtonSize();
  const gradientColors = getGradientColors();

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.container,
        style,
        {
          height: buttonSize.height,
          paddingHorizontal: buttonSize.paddingHorizontal,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: isPressed ? 0.95 : 1 }],
        },
        shadow && styles.shadow,
      ]}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={gradientColors as any}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Glow effect */}
      {glow && (
        <LottieAnimation
          source={require('../../assets/animations/button-outer-glow.json')}
          style={styles.glowEffect}
          loop={true}
          autoPlay={true}
          speed={0.8}
        />
      )}

      {/* Main animation overlay */}
      <LottieAnimation
        source={getAnimationSource()}
        style={styles.animationOverlay}
        loop={!loading}
        autoPlay={true}
        speed={loading ? 1.5 : 1}
      />

      {/* Content container */}
      <View style={styles.content}>
        {icon && !loading && (
          <Text style={[styles.icon, { fontSize: buttonSize.fontSize + 2 }]}>
            {icon}
          </Text>
        )}
        
        {loading ? (
          <LottieAnimation
            source={require('../../assets/animations/loading-spinner.json')}
            style={styles.loadingSpinner}
            loop={true}
            autoPlay={true}
            speed={1.2}
          />
        ) : (
          <Text
            style={[
              styles.text,
              { fontSize: buttonSize.fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </View>

      {/* Press feedback animation */}
      {isPressed && (
        <LottieAnimation
          source={require('../../assets/animations/button-press-ripple.json')}
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
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 25,
  },
  glowEffect: {
    position: 'absolute',
    left: -10,
    right: -10,
    top: -10,
    bottom: -10,
    zIndex: 1,
  },
  animationOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  icon: {
    marginRight: 8,
    color: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingSpinner: {
    width: 24,
    height: 24,
  },
  pressEffect: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 4,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default EnhancedGameButton;
