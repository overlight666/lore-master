import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../contexts/GameContext';
import AudioService from '../services/AudioService';

const { width } = Dimensions.get('window');

interface GameStatusBarProps {
  onEnergyPress?: () => void;
  onCoinsPress?: () => void;
  onStarPress?: () => void;
}

const GameStatusBar: React.FC<GameStatusBarProps> = ({
  onEnergyPress,
  onCoinsPress,
  onStarPress,
}) => {
  const { energy, loading } = useGame();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const energyFillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate energy bar fill
    if (energy) {
      const energyPercentage = (energy.current_energy / energy.max_energy) * 100;
      Animated.timing(energyFillAnim, {
        toValue: energyPercentage,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      // Pulse animation when energy is low
      if (energy.current_energy <= 2) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        pulseAnim.setValue(1);
      }
    }
  }, [energy]);

  const handleEnergyPress = () => {
    AudioService.playClickSound();
    onEnergyPress?.();
  };

  const handleCoinsPress = () => {
    AudioService.playClickSound();
    onCoinsPress?.();
  };

  const handleStarPress = () => {
    AudioService.playClickSound();
    onStarPress?.();
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getEnergyColor = () => {
    if (!energy) return '#10B981';
    const percentage = (energy.current_energy / energy.max_energy) * 100;
    if (percentage <= 25) return '#EF4444';
    if (percentage <= 50) return '#F59E0B';
    return '#10B981';
  };

  if (loading.energy && !energy) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.6)']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.6)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Energy Section */}
          <TouchableOpacity
            style={styles.statContainer}
            onPress={handleEnergyPress}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Text style={styles.icon}>⚡</Text>
            </Animated.View>
            <View style={styles.statInfo}>
              <View style={styles.energyBarContainer}>
                <View style={styles.energyBar}>
                  <Animated.View
                    style={[
                      styles.energyFill,
                      {
                        width: energyFillAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                          extrapolate: 'clamp',
                        }),
                        backgroundColor: getEnergyColor(),
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.statText}>
                {energy ? `${energy.current_energy}/${energy.max_energy}` : '0/5'}
              </Text>
              {energy && energy.current_energy < energy.max_energy && energy.next_regen_at && (
                <Text style={styles.regenText}>
                  Regenerating...
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Coins Section */}
          <TouchableOpacity
            style={styles.statContainer}
            onPress={handleCoinsPress}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🪙</Text>
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statText}>1,250</Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
          </TouchableOpacity>

          {/* Stars Section */}
          <TouchableOpacity
            style={styles.statContainer}
            onPress={handleStarPress}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⭐</Text>
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statText}>89</Text>
              <Text style={styles.statLabel}>Stars</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    paddingHorizontal: 16,
    paddingTop: 50, // Account for status bar
    paddingBottom: 8,
  },
  gradient: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  icon: {
    fontSize: 20,
  },
  statInfo: {
    flex: 1,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '500',
  },
  energyBarContainer: {
    marginBottom: 2,
  },
  energyBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    borderRadius: 3,
  },
  regenText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '500',
  },
});

export default GameStatusBar;
