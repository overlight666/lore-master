import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieAnimation from './LottieAnimation';
import { useGame } from '../contexts/GameContext';
import AudioService from '../services/AudioService';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface EnhancedGameStatusBarProps {
  variant?: 'compact' | 'expanded' | 'minimal';
  showCoins?: boolean;
  showGems?: boolean;
  showLevel?: boolean;
  showXP?: boolean;
  onEnergyPress?: () => void;
  onCoinsPress?: () => void;
  onGemsPress?: () => void;
  animateChanges?: boolean;
}

const EnhancedGameStatusBar: React.FC<EnhancedGameStatusBarProps> = ({
  variant = 'expanded',
  showCoins = true,
  showGems = true,
  showLevel = true,
  showXP = true,
  onEnergyPress,
  onCoinsPress,
  onGemsPress,
  animateChanges = true,
}) => {
  const { energy, loading } = useGame();
  const [prevEnergy, setPrevEnergy] = useState(energy?.current_energy || 0);
  const [prevCoins, setPrevCoins] = useState(0);
  const [prevGems, setPrevGems] = useState(0);
  const [energyChanged, setEnergyChanged] = useState(false);
  const [coinsChanged, setCoinsChanged] = useState(false);
  const [gemsChanged, setGemsChanged] = useState(false);

  // Detect changes and trigger animations
  useEffect(() => {
    if (energy?.current_energy !== prevEnergy) {
      setEnergyChanged(true);
      setPrevEnergy(energy?.current_energy || 0);
      setTimeout(() => setEnergyChanged(false), 2000);
    }
  }, [energy?.current_energy, prevEnergy]);

  useEffect(() => {
    // Placeholder for coin changes animation
  }, [prevCoins]);

  useEffect(() => {
    // Placeholder for gem changes animation
  }, [prevGems]);

  const getEnergyPercentage = () => {
    if (!energy) return 0;
    return (energy.current_energy / energy.max_energy) * 100;
  };

  const getXPPercentage = () => {
    return 0; // Placeholder
  };

  const getEnergyColor = () => {
    const percentage = getEnergyPercentage();
    if (percentage > 70) return ['#4CAF50', '#8BC34A'];
    if (percentage > 30) return ['#FF9800', '#FFC107'];
    return ['#F44336', '#FF5722'];
  };

  const handleEnergyPress = () => {
    if (onEnergyPress) {
      AudioService.playClickSound();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onEnergyPress();
    }
  };

  const handleCoinsPress = () => {
    if (onCoinsPress) {
      AudioService.playClickSound();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onCoinsPress();
    }
  };

  const handleGemsPress = () => {
    if (onGemsPress) {
      AudioService.playClickSound();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onGemsPress();
    }
  };

  const renderEnergySection = () => (
    <TouchableOpacity
      style={styles.statusItem}
      onPress={handleEnergyPress}
      disabled={!onEnergyPress}
    >
      <View style={styles.iconContainer}>
        <LottieAnimation
          source={
            energyChanged
              ? require('../../assets/animations/energy-gain.json')
              : require('../../assets/animations/energy-idle.json')
          }
          style={styles.statusIcon}
          loop={energyChanged}
          autoPlay={true}
          speed={energyChanged ? 1.5 : 0.8}
        />
      </View>
      
      <View style={styles.statusInfo}>
        <Text style={styles.statusValue}>
          {energy?.current_energy || 0}/{energy?.max_energy || 6}
        </Text>
        {variant === 'expanded' && (
          <View style={styles.energyBar}>
            <LinearGradient
              colors={getEnergyColor() as any}
              style={[
                styles.energyFill,
                { width: `${getEnergyPercentage()}%` }
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        )}
      </View>
      
      {energyChanged && animateChanges && (
        <LottieAnimation
          source={require('../../assets/animations/value-change-effect.json')}
          style={styles.changeEffect}
          loop={false}
          autoPlay={true}
          speed={1.2}
        />
      )}
    </TouchableOpacity>
  );

  const renderCoinsSection = () => {
    if (!showCoins) return null;
    
    return (
      <TouchableOpacity
        style={styles.statusItem}
        onPress={handleCoinsPress}
        disabled={!onCoinsPress}
      >
        <View style={styles.iconContainer}>
          <LottieAnimation
            source={
              coinsChanged
                ? require('../../assets/animations/coins-gain.json')
                : require('../../assets/animations/coins-idle.json')
            }
            style={styles.statusIcon}
            loop={coinsChanged}
            autoPlay={true}
            speed={coinsChanged ? 1.5 : 0.8}
          />
        </View>
        
        <View style={styles.statusInfo}>
          <Text style={styles.statusValue}>
            {'0'}
          </Text>
          {variant === 'expanded' && (
            <Text style={styles.statusLabel}>Coins</Text>
          )}
        </View>
        
        {coinsChanged && animateChanges && (
          <LottieAnimation
            source={require('../../assets/animations/value-change-effect.json')}
            style={styles.changeEffect}
            loop={false}
            autoPlay={true}
            speed={1.2}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderGemsSection = () => {
    if (!showGems) return null;
    
    return (
      <TouchableOpacity
        style={styles.statusItem}
        onPress={handleGemsPress}
        disabled={!onGemsPress}
      >
        <View style={styles.iconContainer}>
          <LottieAnimation
            source={
              gemsChanged
                ? require('../../assets/animations/gems-gain.json')
                : require('../../assets/animations/gems-idle.json')
            }
            style={styles.statusIcon}
            loop={gemsChanged}
            autoPlay={true}
            speed={gemsChanged ? 1.5 : 0.8}
          />
        </View>
        
        <View style={styles.statusInfo}>
          <Text style={styles.statusValue}>
            {'0'}
          </Text>
          {variant === 'expanded' && (
            <Text style={styles.statusLabel}>Gems</Text>
          )}
        </View>
        
        {gemsChanged && animateChanges && (
          <LottieAnimation
            source={require('../../assets/animations/value-change-effect.json')}
            style={styles.changeEffect}
            loop={false}
            autoPlay={true}
            speed={1.2}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderLevelSection = () => {
    if (!showLevel) return null;
    
    return (
      <View style={styles.levelContainer}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>LV.1</Text>
          {variant === 'expanded' && showXP && (
            <View style={styles.xpBar}>
              <LinearGradient
                colors={['#9C27B0', '#E91E63']}
                style={[
                  styles.xpFill,
                  { width: `${getXPPercentage()}%` }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          )}
        </View>
        
        <LottieAnimation
          source={require('../../assets/animations/level-badge.json')}
          style={styles.levelIcon}
          loop={true}
          autoPlay={true}
          speed={0.6}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LottieAnimation
          source={require('../../assets/animations/status-loading.json')}
          style={styles.loadingAnimation}
          loop={true}
          autoPlay={true}
          speed={1.2}
        />
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      variant === 'compact' && styles.compactContainer,
      variant === 'minimal' && styles.minimalContainer,
    ]}>
      {/* Background gradient */}
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Background animation */}
      <LottieAnimation
        source={require('../../assets/animations/status-bar-background.json')}
        style={styles.backgroundAnimation}
        loop={true}
        autoPlay={true}
        speed={0.5}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Left side - Energy and Currency */}
        <View style={styles.leftSection}>
          {renderEnergySection()}
          {renderCoinsSection()}
          {renderGemsSection()}
        </View>

        {/* Right side - Level and XP */}
        <View style={styles.rightSection}>
          {renderLevelSection()}
        </View>
      </View>

      {/* Glow effect */}
      <LottieAnimation
        source={require('../../assets/animations/status-bar-glow.json')}
        style={styles.glowEffect}
        loop={true}
        autoPlay={true}
        speed={0.7}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 20,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 15,
    overflow: 'hidden',
    minHeight: 80,
  },
  compactContainer: {
    minHeight: 60,
  },
  minimalContainer: {
    minHeight: 50,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
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
    opacity: 0.3,
  },
  glowEffect: {
    position: 'absolute',
    left: -5,
    right: -5,
    top: -5,
    bottom: -5,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    zIndex: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    position: 'relative',
  },
  iconContainer: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  statusIcon: {
    width: '100%',
    height: '100%',
  },
  statusInfo: {
    alignItems: 'flex-start',
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    opacity: 0.7,
  },
  energyBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    borderRadius: 2,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelInfo: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  xpBar: {
    width: 80,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    marginTop: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  levelIcon: {
    width: 40,
    height: 40,
  },
  changeEffect: {
    position: 'absolute',
    left: -10,
    right: -10,
    top: -10,
    bottom: -10,
    zIndex: 2,
  },
  loadingAnimation: {
    width: 60,
    height: 60,
  },
});

export default EnhancedGameStatusBar;
