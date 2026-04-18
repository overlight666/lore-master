import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieAnimation from './LottieAnimation';

const { width, height } = Dimensions.get('window');

interface EnhancedAnimatedBackgroundProps {
  variant?: 'default' | 'dark' | 'mystical' | 'energy' | 'cosmic' | 'magical' | 'victory' | 'loading';
  children?: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  enableParticles?: boolean;
  enableGlow?: boolean;
  overlay?: boolean;
}

const EnhancedAnimatedBackground: React.FC<EnhancedAnimatedBackgroundProps> = ({
  variant = 'default',
  children,
  intensity = 'medium',
  enableParticles = true,
  enableGlow = true,
  overlay = true,
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'dark':
        return ['#0a0a0a', '#1a1a2e', '#16213e'];
      case 'mystical':
        return ['#1a1a2e', '#16213e', '#0f3460'];
      case 'energy':
        return ['#ff6b6b', '#ffa500', '#ffed4e'];
      case 'cosmic':
        return ['#667eea', '#764ba2', '#f093fb'];
      case 'magical':
        return ['#aa076b', '#61045f', '#833ab4'];
      case 'victory':
        return ['#56ab2f', '#a8e6cf', '#ffd700'];
      case 'loading':
        return ['#4facfe', '#00f2fe', '#43e97b'];
      default:
        return ['#667eea', '#764ba2', '#f093fb'];
    }
  };

  const getParticleAnimation = () => {
    // In a real implementation, these would be actual Lottie JSON files
    // For now, we'll use placeholder objects that represent different particle animations
    switch (variant) {
      case 'mystical':
        return require('../../assets/animations/mystical-particles.json');
      case 'energy':
        return require('../../assets/animations/energy-orbs.json');
      case 'cosmic':
        return require('../../assets/animations/cosmic-dust.json');
      case 'magical':
        return require('../../assets/animations/magic-sparkles.json');
      case 'victory':
        return require('../../assets/animations/victory-stars.json');
      case 'loading':
        return require('../../assets/animations/loading-dots.json');
      default:
        return require('../../assets/animations/floating-particles.json');
    }
  };

  const getGlowAnimation = () => {
    switch (intensity) {
      case 'low':
        return require('../../assets/animations/gentle-glow.json');
      case 'high':
        return require('../../assets/animations/intense-glow.json');
      default:
        return require('../../assets/animations/medium-glow.json');
    }
  };

  const getOpacity = () => {
    switch (intensity) {
      case 'low':
        return 0.3;
      case 'high':
        return 0.8;
      default:
        return 0.5;
    }
  };

  return (
    <View style={styles.container}>
      {/* Base gradient background */}
      <LinearGradient
        colors={getGradientColors() as any}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating particles animation */}
      {enableParticles && (
        <LottieAnimation
          source={getParticleAnimation()}
          style={[
            styles.particleLayer,
            { opacity: getOpacity() }
          ] as any}
          loop={true}
          autoPlay={true}
          speed={intensity === 'high' ? 1.5 : intensity === 'low' ? 0.5 : 1}
        />
      )}

      {/* Glow effect animation */}
      {enableGlow && (
        <LottieAnimation
          source={getGlowAnimation()}
          style={[
            styles.glowLayer,
            { opacity: getOpacity() * 0.7 }
          ] as any}
          loop={true}
          autoPlay={true}
          speed={0.8}
        />
      )}

      {/* Ambient light animation */}
      <LottieAnimation
        source={require('../../assets/animations/ambient-light.json')}
        style={[
          styles.ambientLayer,
          { opacity: getOpacity() * 0.4 }
        ] as any}
        loop={true}
        autoPlay={true}
        speed={0.6}
      />

      {/* Overlay for depth */}
      {overlay && (
        <View style={[styles.overlay, { opacity: 0.1 }]} />
      )}

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  particleLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  glowLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
  ambientLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 3,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 4,
  },
  content: {
    flex: 1,
    zIndex: 5,
  },
});

export default EnhancedAnimatedBackground;
