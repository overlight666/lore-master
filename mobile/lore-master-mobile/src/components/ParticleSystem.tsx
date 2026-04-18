import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

interface ParticleSystemProps {
  count?: number;
  emoji?: string;
  duration?: number;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  count = 5,
  emoji = '✨',
  duration = 3000,
}) => {
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    // Initialize particles
    particles.current = Array.from({ length: count }, (_, index) => ({
      id: index,
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(height + 50),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }));

    // Start animation loop
    const animateParticles = () => {
      particles.current.forEach((particle, index) => {
        // Reset particle position
        const startX = Math.random() * width;
        const endX = startX + (Math.random() - 0.5) * 100;
        
        particle.x.setValue(startX);
        particle.y.setValue(height + 50);
        particle.opacity.setValue(0);
        particle.scale.setValue(0);

        // Animate particle
        Animated.parallel([
          Animated.timing(particle.y, {
            toValue: -50,
            duration: duration + (Math.random() * 1000),
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: endX,
            duration: duration + (Math.random() * 1000),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0.8,
              duration: duration - 300,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          // Restart animation for this particle after a delay
          setTimeout(() => {
            if (particles.current[index]) {
              animateParticles();
            }
          }, Math.random() * 2000);
        });
      });
    };

    animateParticles();

    return () => {
      particles.current.forEach(particle => {
        particle.x.stopAnimation();
        particle.y.stopAnimation();
        particle.opacity.stopAnimation();
        particle.scale.stopAnimation();
      });
    };
  }, [count, duration]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((particle) => (
        <Animated.Text
          key={particle.id}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          {emoji}
        </Animated.Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  particle: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default ParticleSystem;
