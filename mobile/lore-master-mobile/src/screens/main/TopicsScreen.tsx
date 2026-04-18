import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../types';
import { useGame } from '../../contexts/GameContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import GameStatusBar from '../../components/GameStatusBar';
import GameCard from '../../components/GameCard';
import GameButton from '../../components/GameButton';
import AudioService from '../../services/AudioService';

type TopicsScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Topics'>;

interface Props {
  navigation: TopicsScreenNavigationProp;
}

const TopicsScreen: React.FC<Props> = ({ navigation }) => {
  const { 
    topics = [], // Default to empty array if undefined
    loading, 
    loadTopics, 
    selectTopic,
    loadEnergyStatus 
  } = useGame();

  useEffect(() => {
    loadTopics();
    loadEnergyStatus();
  }, []);

  const handleTopicPress = (topic: any) => {
    AudioService.playClickSound();
    selectTopic(topic);
    navigation.navigate('Subtopics', { topic });
  };

  const handleBackPress = () => {
    AudioService.playClickSound();
    navigation.goBack();
  };

  const onRefresh = () => {
    loadTopics();
    loadEnergyStatus();
  };

  const getTopicIcon = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('history')) return '🏛️';
    if (lowerName.includes('science')) return '🧪';
    if (lowerName.includes('literature')) return '📚';
    if (lowerName.includes('art')) return '🎨';
    if (lowerName.includes('music')) return '🎵';
    if (lowerName.includes('sports')) return '⚽';
    if (lowerName.includes('technology')) return '💻';
    if (lowerName.includes('nature')) return '🌿';
    if (lowerName.includes('geography')) return '🗺️';
    if (lowerName.includes('mathematics')) return '🔢';
    return '📖';
  };

  return (
    <AnimatedBackground variant="default">
      <View style={styles.container}>
        {/* Status Bar */}
        <GameStatusBar
          onEnergyPress={() => navigation.navigate('Store')}
          onCoinsPress={() => navigation.navigate('Store')}
          onStarPress={() => navigation.navigate('Profile')}
        />

        {/* Header */}
        <View style={styles.header}>
          <GameButton
            title="← Back"
            onPress={handleBackPress}
            variant="secondary"
            size="small"
            style={styles.backButton}
          />
          <Text style={styles.title}>Choose Your Quest</Text>
          <Text style={styles.subtitle}>Select a topic to begin your adventure</Text>
        </View>

        {/* Topics List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading.topics}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
              colors={['#6366F1']}
            />
          }
        >
          {loading.topics && (!topics || topics.length === 0) ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading magical topics...</Text>
            </View>
          ) : (
            <View style={styles.topicsGrid}>
              {topics && topics.length > 0 ? topics.map((topic, index) => (
                <GameCard
                  key={topic.id}
                  title={topic.name}
                  subtitle={topic.description || 'No description available'}
                  icon={getTopicIcon(topic.name)}
                  onPress={() => handleTopicPress(topic)}
                  variant={index % 3 === 0 ? 'premium' : 'default'}
                  size="medium"
                  progress={0} // You can add progress tracking later
                />
              )) : null}
              
              {/* Show placeholder cards if no topics loaded */}
              {(!topics || topics.length === 0) && !loading.topics && (
                <>
                  <GameCard
                    title="Ancient History"
                    subtitle="Explore the mysteries of ancient civilizations"
                    icon="🏛️"
                    onPress={() => {}}
                    variant="default"
                    size="medium"
                    locked={true}
                  />
                  <GameCard
                    title="Science & Nature"
                    subtitle="Discover the wonders of the natural world"
                    icon="🧪"
                    onPress={() => {}}
                    variant="default"
                    size="medium"
                    locked={true}
                  />
                  <GameCard
                    title="Literature & Arts"
                    subtitle="Journey through classic works and masterpieces"
                    icon="📚"
                    onPress={() => {}}
                    variant="premium"
                    size="medium"
                    locked={true}
                  />
                </>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  topicsGrid: {
    gap: 8,
  },
});

export default TopicsScreen;
