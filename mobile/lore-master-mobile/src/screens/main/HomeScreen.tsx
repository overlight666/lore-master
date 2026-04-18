import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import GameStatusBar from '../../components/GameStatusBar';
import GameButton from '../../components/GameButton';
import GameCard from '../../components/GameCard';
import ParticleSystem from '../../components/ParticleSystem';
import AudioService from '../../services/AudioService';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const { 
    topics, 
    loading, 
    loadTopics, 
    loadEnergyStatus,
    energy 
  } = useGame();

  useEffect(() => {
    // Initialize audio and load data
    AudioService.initialize().catch(() => {});
    
    // Only load API data if user is authenticated
    if (user?.accessToken) {
      console.log('[HomeScreen] User authenticated, loading data...');
      loadTopics();
      loadEnergyStatus();
    } else {
      console.log('[HomeScreen] User not authenticated yet, skipping API calls');
    }
    
    // Start background music when user successfully logs in
    AudioService.playBackgroundMusic();
  }, [user?.accessToken]); // Add dependency on auth token

  const handleStartPlaying = () => {
    AudioService.playClickSound();
    navigation.navigate('Topics');
  };

  const handleProfilePress = () => {
    AudioService.playClickSound();
    navigation.navigate('Profile');
  };

  const handleLeaderboardPress = () => {
    AudioService.playClickSound();
    // For now, navigate to a general leaderboard without specific level/topic
    navigation.navigate('Leaderboard', { 
      level: { id: 'general', topic_id: 'general' } as any, 
      topic: { id: 'general', name: 'General' } as any 
    });
  };

  const handleStorePress = () => {
    AudioService.playClickSound();
    navigation.navigate('Store');
  };

  const handleSignOut = async () => {
    try {
      AudioService.playClickSound();
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const completedTopics = topics.length; // Simplified for now
  const totalStars = 42; // Mock data for now

  return (
    <AnimatedBackground variant="mystical">
      <ParticleSystem count={8} emoji="✨" duration={4000} />
      <View style={styles.container}>
        {/* Status Bar */}
        <GameStatusBar
          onEnergyPress={() => navigation.navigate('Store')}
          onCoinsPress={() => navigation.navigate('Store')}
          onStarPress={() => navigation.navigate('Profile')}
        />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{user?.name || 'Lore Master'}!</Text>
            <Text style={styles.subtitleText}>
              Ready to continue your magical journey?
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{completedTopics}</Text>
              <Text style={styles.statLabel}>Topics Mastered</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalStars}</Text>
              <Text style={styles.statLabel}>Stars Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{energy?.current_energy || 0}</Text>
              <Text style={styles.statLabel}>Energy</Text>
            </View>
          </View>

          {/* Main Action */}
          <View style={styles.actionSection}>
            <GameButton
              title="🎯 Start Playing"
              onPress={handleStartPlaying}
              variant="primary"
              size="large"
              glow={true}
              style={styles.playButton}
            />
          </View>

          {/* Quick Access Cards */}
          <View style={styles.quickAccessSection}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            
            <View style={styles.cardRow}>
              <GameCard
                title="📊 Leaderboard"
                subtitle="See your ranking"
                icon="🏆"
                onPress={handleLeaderboardPress}
                size="small"
                variant="default"
              />
              <GameCard
                title="🛒 Store"
                subtitle="Buy power-ups"
                icon="💎"
                onPress={handleStorePress}
                size="small"
                variant="premium"
              />
            </View>

            <GameCard
              title="👤 Profile & Settings"
              subtitle="View your progress and achievements"
              icon="⚙️"
              onPress={handleProfilePress}
              size="medium"
              variant="default"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.signOutButton} 
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  nameText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
    marginVertical: 4,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  playButton: {
    marginVertical: 8,
  },
  quickAccessSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
});

export default HomeScreen;
