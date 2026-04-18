import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import { useTheme } from '../../contexts/ThemeContext';
import EnhancedAnimatedBackground from '../../components/EnhancedAnimatedBackground';
import EnhancedGameStatusBar from '../../components/EnhancedGameStatusBar';
import EnhancedGameButton from '../../components/EnhancedGameButton';
import EnhancedGameCard from '../../components/EnhancedGameCard';
import LottieAnimation from '../../components/LottieAnimation';
import AudioService from '../../services/AudioService';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const EnhancedHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const { 
    topics, 
    loading, 
    loadTopics, 
    loadEnergyStatus,
    energy 
  } = useGame();
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();
  
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  useEffect(() => {
    // Initialize audio and load data
    AudioService.initialize().catch(() => {});
    
    // Only load API data if user is authenticated
    if (user?.accessToken) {
      console.log('[EnhancedHomeScreen] User authenticated, loading data...');
      loadTopics();
      loadEnergyStatus();
    }
    
    // Start background music
    AudioService.playBackgroundMusic();

    // Set time of day for dynamic theming
    const hour = new Date().getHours();
    if (hour < 6) setCurrentTimeOfDay('night');
    else if (hour < 12) setCurrentTimeOfDay('morning');
    else if (hour < 18) setCurrentTimeOfDay('afternoon');
    else setCurrentTimeOfDay('evening');

    // Hide welcome animation after delay
    const timer = setTimeout(() => {
      setShowWelcomeAnimation(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [user?.accessToken]);

  const handleStartPlaying = () => {
    AudioService.playClickSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Topics');
  };

  const handleStorePress = () => {
    AudioService.playClickSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Store');
  };

  const handleProfilePress = () => {
    AudioService.playClickSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Profile');
  };

  const handleEnergyPress = () => {
    AudioService.playClickSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Show energy modal or navigate to energy screen
  };

  const handleSettingsPress = () => {
    AudioService.playClickSound();
    navigation.navigate('Settings');
  };

  const handleThemeChange = () => {
    const currentIndex = availableThemes.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setTheme(availableThemes[nextIndex]);
    Haptics.selectionAsync();
  };

  const getGreeting = () => {
    const name = user?.name || 'Player';
    switch (currentTimeOfDay) {
      case 'morning':
        return `Good morning, ${name}! ☀️`;
      case 'afternoon':
        return `Good afternoon, ${name}! 🌤️`;
      case 'evening':
        return `Good evening, ${name}! 🌅`;
      case 'night':
        return `Good night, ${name}! 🌙`;
      default:
        return `Hello, ${name}! 👋`;
    }
  };

  const getFeaturedTopics = () => {
    if (!topics || topics.length === 0) return [];
    return topics.slice(0, 3); // Show first 3 topics as featured
  };

  const getBackgroundVariant = () => {
    switch (currentTimeOfDay) {
      case 'morning':
        return 'energy';
      case 'afternoon':
        return 'cosmic';
      case 'evening':
        return 'mystical';
      case 'night':
        return 'dark';
      default:
        return 'default';
    }
  };

  const renderWelcomeAnimation = () => {
    if (!showWelcomeAnimation) return null;

    return (
      <View style={styles.welcomeOverlay}>
        <LottieAnimation
          source={require('../../assets/animations/welcome-animation.json')}
          style={styles.welcomeAnimation}
          loop={false}
          autoPlay={true}
          speed={1.2}
          onAnimationFinish={() => setShowWelcomeAnimation(false)}
        />
        <Text style={styles.welcomeText}>{getGreeting()}</Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleProfilePress}
        >
          <LottieAnimation
            source={require('../../assets/animations/profile-avatar.json')}
            style={styles.profileAvatar}
            loop={true}
            autoPlay={true}
            speed={0.8}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.greeting, { color: currentTheme.colors.text.primary }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.subtitle, { color: currentTheme.colors.text.secondary }]}>
            Ready for your next adventure?
          </Text>
        </View>

        <TouchableOpacity
          style={styles.themeButton}
          onPress={handleThemeChange}
        >
          <LottieAnimation
            source={require('../../assets/animations/theme-switcher.json')}
            style={styles.themeIcon}
            loop={true}
            autoPlay={true}
            speed={0.6}
          />
        </TouchableOpacity>
      </View>

      <EnhancedGameStatusBar
        variant="expanded"
        onEnergyPress={handleEnergyPress}
        animateChanges={true}
      />
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={[styles.sectionTitle, { color: currentTheme.colors.text.primary }]}>
        Quick Actions
      </Text>
      <View style={styles.actionButtons}>
        <EnhancedGameButton
          title="Start Playing"
          onPress={handleStartPlaying}
          variant="primary"
          size="large"
          animationType="energy"
          icon="🎮"
          style={styles.primaryButton}
        />
        
        <View style={styles.secondaryButtons}>
          <EnhancedGameButton
            title="Store"
            onPress={handleStorePress}
            variant="secondary"
            size="medium"
            animationType="sparkle"
            icon="🛒"
            style={styles.secondaryButton}
          />
          
          <EnhancedGameButton
            title="Settings"
            onPress={handleSettingsPress}
            variant="secondary"
            size="medium"
            animationType="glow"
            icon="⚙️"
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </View>
  );

  const renderFeaturedTopics = () => {
    const featuredTopics = getFeaturedTopics();
    
    if (featuredTopics.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <LottieAnimation
            source={currentTheme.animations.loading.source}
            style={styles.loadingAnimation}
            loop={true}
            autoPlay={true}
            speed={1.5}
          />
          <Text style={[styles.loadingText, { color: currentTheme.colors.text.secondary }]}>
            Loading topics...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.featuredSection}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text.primary }]}>
          Featured Topics
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.topicsList}
          contentContainerStyle={styles.topicsContent}
        >
          {featuredTopics.map((topic, index) => (
            <EnhancedGameCard
              key={topic.id}
              title={topic.name}
              subtitle={`${topic.name} topic`}
              description={topic.description}
              onPress={() => navigation.navigate('Subtopics', { topic })}
              difficulty={'medium' as any}
              theme={themeName}
              animationType="float"
              icon={'📚'}
              size="medium"
              progress={0} // You can calculate actual progress here
              style={[
                styles.topicCard,
                { marginLeft: index === 0 ? 20 : 0 }
              ] as any}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderStats = () => (
    <View style={styles.statsSection}>
      <Text style={[styles.sectionTitle, { color: currentTheme.colors.text.primary }]}>
        Your Progress
      </Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: currentTheme.colors.surface[0] }]}>
          <LottieAnimation
            source={require('../../assets/animations/trophy-icon.json')}
            style={styles.statIcon}
            loop={true}
            autoPlay={true}
            speed={0.8}
          />
          <Text style={[styles.statValue, { color: currentTheme.colors.text.primary }]}>
            {topics?.length || 0}
          </Text>
          <Text style={[styles.statLabel, { color: currentTheme.colors.text.secondary }]}>
            Topics Unlocked
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: currentTheme.colors.surface[0] }]}>
          <LottieAnimation
            source={require('../../assets/animations/energy-icon.json')}
            style={styles.statIcon}
            loop={true}
            autoPlay={true}
            speed={0.8}
          />
          <Text style={[styles.statValue, { color: currentTheme.colors.text.primary }]}>
            {energy?.current_energy || 0}
          </Text>
          <Text style={[styles.statLabel, { color: currentTheme.colors.text.secondary }]}>
            Energy
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: currentTheme.colors.surface[0] }]}>
          <LottieAnimation
            source={require('../../assets/animations/star-icon.json')}
            style={styles.statIcon}
            loop={true}
            autoPlay={true}
            speed={0.8}
          />
          <Text style={[styles.statValue, { color: currentTheme.colors.text.primary }]}>
            0
          </Text>
          <Text style={[styles.statLabel, { color: currentTheme.colors.text.secondary }]}>
            Stars Earned
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      
      {/* Enhanced animated background */}
      <EnhancedAnimatedBackground
        variant={getBackgroundVariant()}
        intensity="medium"
        enableParticles={true}
        enableGlow={true}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderQuickActions()}
          {renderFeaturedTopics()}
          {renderStats()}
          
          {/* Extra padding at bottom */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </EnhancedAnimatedBackground>

      {/* Welcome animation overlay */}
      {renderWelcomeAnimation()}

      {/* Floating action button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          { backgroundColor: currentTheme.colors.primary[0] }
        ]}
        onPress={handleStartPlaying}
      >
        <LottieAnimation
          source={require('../../assets/animations/play-button.json')}
          style={styles.floatingIcon}
          loop={true}
          autoPlay={true}
          speed={1.2}
        />
      </TouchableOpacity>
    </View>
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
    flexGrow: 1,
    paddingBottom: 100,
  },
  welcomeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  welcomeAnimation: {
    width: width * 0.6,
    height: width * 0.6,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileButton: {
    width: 50,
    height: 50,
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 15,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  themeButton: {
    width: 40,
    height: 40,
  },
  themeIcon: {
    width: '100%',
    height: '100%',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionButtons: {
    alignItems: 'center',
  },
  primaryButton: {
    width: width * 0.8,
    marginBottom: 15,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.8,
  },
  secondaryButton: {
    width: width * 0.35,
  },
  featuredSection: {
    marginBottom: 30,
  },
  topicsList: {
    marginTop: 10,
  },
  topicsContent: {
    paddingRight: 20,
  },
  topicCard: {
    marginRight: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingAnimation: {
    width: 80,
    height: 80,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: width * 0.28,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 50,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  floatingIcon: {
    width: 30,
    height: 30,
  },
});

export default EnhancedHomeScreen;
