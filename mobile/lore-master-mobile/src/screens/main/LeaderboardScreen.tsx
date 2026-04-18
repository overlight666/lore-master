import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import ParticleSystem from '../../components/ParticleSystem';
import GameStatusBar from '../../components/GameStatusBar';
import AudioService from '../../services/AudioService';
import ApiService from '../../services/ApiService';

type LeaderboardScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Leaderboard'>;
type LeaderboardScreenRouteProp = RouteProp<AppStackParamList, 'Leaderboard'>;

interface Props {
  navigation: LeaderboardScreenNavigationProp;
  route: LeaderboardScreenRouteProp;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
}

const LeaderboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { level, topic } = route.params;
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      // For now, use mock data since we don't have the actual API
      const mockData: LeaderboardEntry[] = [
        { userId: '1', username: 'QuizMaster', score: 1250, rank: 1 },
        { userId: '2', username: 'LoreSeeker', score: 1180, rank: 2 },
        { userId: '3', username: 'WisdomKeeper', score: 1120, rank: 3 },
        { userId: '4', username: 'TriviaTitan', score: 1050, rank: 4 },
        { userId: '5', username: 'FactFinder', score: 980, rank: 5 },
        { userId: '6', username: 'BrainBender', score: 920, rank: 6 },
        { userId: '7', username: 'KnowledgeNinja', score: 850, rank: 7 },
        { userId: '8', username: 'QuizQueen', score: 780, rank: 8 },
        { userId: '9', username: 'TriviaWarrior', score: 720, rank: 9 },
        { userId: '10', username: 'MindMaster', score: 650, rank: 10 },
      ];
      
      setLeaderboard(mockData);
      
      // Find user's rank
      const currentUserEntry = mockData.find(entry => entry.userId === user?.uid);
      if (currentUserEntry) {
        setUserRank(currentUserEntry.rank);
      } else {
        setUserRank(Math.floor(Math.random() * 50) + 11); // Mock rank outside top 10
      }
      
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    AudioService.playClickSound();
    navigation.goBack();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#FFFFFF';
    }
  };

  return (
    <AnimatedBackground variant="dark">
      <ParticleSystem count={15} emoji="🏆" duration={6000} />
      <ParticleSystem count={10} emoji="⭐" duration={4000} />
      <SafeAreaView style={styles.container}>
        {/* Status Bar */}
        <GameStatusBar
          onEnergyPress={() => {}}
          onCoinsPress={() => {}}
          onStarPress={() => {}}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🏆 Leaderboard</Text>
          <Text style={styles.subtitle}>{topic.name} Champions</Text>
        </View>

        {/* Your Rank */}
        {userRank && (
          <View style={styles.userRankContainer}>
            <Text style={styles.userRankTitle}>Your Rank</Text>
            <View style={styles.userRankCard}>
              <Text style={styles.userRankIcon}>{getRankIcon(userRank)}</Text>
              <Text style={styles.userRankText}>#{userRank}</Text>
              <Text style={styles.userRankName}>{user?.name || 'You'}</Text>
            </View>
          </View>
        )}

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>🏆 Loading champions...</Text>
            </View>
          ) : (
            <View style={styles.leaderboardList}>
              {leaderboard.map((entry, index) => (
                <View 
                  key={entry.userId} 
                  style={[
                    styles.leaderboardItem,
                    entry.userId === user?.uid && styles.currentUserItem
                  ]}
                >
                  <View style={styles.rankContainer}>
                    <Text style={styles.rankIcon}>{getRankIcon(entry.rank)}</Text>
                    <Text style={[styles.rankText, { color: getRankColor(entry.rank) }]}>
                      #{entry.rank}
                    </Text>
                  </View>
                  
                  <View style={styles.userInfo}>
                    <Text style={styles.username}>{entry.username}</Text>
                    <Text style={styles.scoreText}>{entry.score} points</Text>
                  </View>
                  
                  {entry.rank <= 3 && (
                    <View style={styles.crownContainer}>
                      <Text style={styles.crownIcon}>👑</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '600',
  },
  userRankContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  userRankTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  userRankCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  userRankIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  userRankText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD700',
    marginRight: 16,
  },
  userRankName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  currentUserItem: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#FFD700',
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  rankIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  crownContainer: {
    marginLeft: 16,
  },
  crownIcon: {
    fontSize: 24,
  },
});

export default LeaderboardScreen;
