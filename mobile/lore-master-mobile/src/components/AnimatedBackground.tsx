import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  variant?: 'default' | 'dark' | 'mystical' | 'energy';
  children?: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'default',
  children,
}) => {
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const floatingAnim3 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Floating animations
    const createFloatingAnimation = (animValue: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Rotation animation with longer duration for smoother performance
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      })
    );

    // Pulse animation with longer duration
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    // Start animations with reduced frequency for better performance
    createFloatingAnimation(floatingAnim1, 6000).start();
    createFloatingAnimation(floatingAnim2, 8000).start();
    createFloatingAnimation(floatingAnim3, 10000).start();
    rotationAnimation.start();
    pulseAnimation.start();

    return () => {
      floatingAnim1.stopAnimation();
      floatingAnim2.stopAnimation();
      floatingAnim3.stopAnimation();
      rotateAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, []);

  const getGradientColors = (): [string, string, string] => {
    switch (variant) {
      case 'dark':
        return ['#0F172A', '#1E293B', '#334155'];
      case 'mystical':
        return ['#1E1B4B', '#3730A3', '#6366F1'];
      case 'energy':
        return ['#065F46', '#047857', '#10B981'];
      default:
        return ['#1E40AF', '#3B82F6', '#60A5FA'];
    }
  };

  const colors = getGradientColors();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating particles */}
        <Animated.View
          style={[
            styles.particle,
            styles.particle1,
            {
              transform: [
                {
                  translateY: floatingAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -50],
                  }),
                },
                {
                  translateX: floatingAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 30],
                  }),
                },
              ],
              opacity: floatingAnim1.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 1, 0.3],
              }),
            },
          ]}
        />

        <Animated.View
          style={[
            styles.particle,
            styles.particle2,
            {
              transform: [
                {
                  translateY: floatingAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -80],
                  }),
                },
                {
                  translateX: floatingAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -40],
                  }),
                },
              ],
              opacity: floatingAnim2.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.2, 0.8, 0.2],
              }),
            },
          ]}
        />

        <Animated.View
          style={[
            styles.particle,
            styles.particle3,
            {
              transform: [
                {
                  translateY: floatingAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -60],
                  }),
                },
                {
                  translateX: floatingAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 20],
                  }),
                },
              ],
              opacity: floatingAnim3.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.25, 0.9, 0.25],
              }),
            },
          ]}
        />

        {/* Rotating background element */}
        <Animated.View
          style={[
            styles.rotatingElement,
            {
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                { scale: pulseAnim },
              ],
            },
          ]}
        />

        {/* Content */}
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  particle1: {
    width: 80,
    height: 80,
    top: height * 0.2,
    left: width * 0.1,
  },
  particle2: {
    width: 60,
    height: 60,
    top: height * 0.6,
    right: width * 0.15,
  },
  particle3: {
    width: 40,
    height: 40,
    top: height * 0.4,
    left: width * 0.7,
  },
  rotatingElement: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    top: -width * 0.3,
    left: -width * 0.25,
  },
});

export default AnimatedBackground;
