import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList, QuizResult } from '../../types';
import AudioService from '../../services/AudioService';

const { width } = Dimensions.get('window');

// Define basic colors and styles
const Colors = {
  primary: { main: '#6366f1', light: '#818cf8' },
  background: { primary: '#1e1b4b', secondary: '#312e81' },
  text: { white: '#ffffff', light: '#e0e7ff' },
  success: { main: '#10b981', light: '#34d399' },
  warning: { main: '#f59e0b', light: '#fbbf24' },
  error: { main: '#ef4444', light: '#f87171' },
};

const Typography = {
  heading: {
    h1: { fontSize: 32, fontWeight: 'bold' as const },
    h2: { fontSize: 24, fontWeight: 'bold' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
  },
  body: {
    large: { fontSize: 18 },
    medium: { fontSize: 16 },
    small: { fontSize: 14 },
  },
};

const Spacing = {
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
};

type ResultsScreenNavigationProp = StackNavigationProp<AppStackParamList, 'QuizResult'>;
type ResultsScreenRouteProp = RouteProp<AppStackParamList, 'QuizResult'>;

interface Props {
  navigation: ResultsScreenNavigationProp;
  route: ResultsScreenRouteProp;
}

const ResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { result, topic, subtopic, category, level, totalLevels, isLastLevel, levelId, passingScore, totalQuestions } = route.params;

  useEffect(() => {
    // Play result sound
    if (result.perfect_score) {
      AudioService.playSuccessSound();
    } else if (result.passed) {
      AudioService.playSuccessSound();
    } else {
      AudioService.playErrorSound();
    }
  }, []);

  const getResultColor = () => {
    if (result.perfect_score) return Colors.success.main;
    if (result.passed) return Colors.primary.main;
    return Colors.error.main;
  };

  const getResultIcon = () => {
    if (result.perfect_score) return 'trophy';
    if (result.passed) return 'checkmark-circle';
    return 'close-circle';
  };

  const getResultTitle = () => {
    if (result.perfect_score) return 'Perfect Score!';
    if (result.passed) return 'Well Done!';
    return 'Try Again!';
  };

  const getResultMessage = () => {
    if (result.perfect_score) {
      return 'Outstanding! You got every question right. No energy consumed!';
    }
    if (result.passed) {
      return `Great job! You passed level ${level}. You can now proceed to the next level.`;
    }
    return `You scored ${result.score}%. You need ${passingScore}% or higher to pass.`;
  };

  const handleNextLevel = () => {
    AudioService.playClickSound();
    if (isLastLevel) {
      Alert.alert(
        'Congratulations!',
        'You have completed all levels in this category!',
        [
          {
            text: 'Choose Another Category',
            onPress: () => navigation.navigate('Categories', { topic, subtopic }),
          },
        ]
      );
    } else {
      navigation.navigate('Quiz', {
        topic,
        subtopic,
        category,
        level: level + 1,
        totalLevels,
      });
    }
  };

  const handleRetryLevel = () => {
    AudioService.playClickSound();
    navigation.navigate('Quiz', {
      topic,
      subtopic,
      category,
      level,
      totalLevels,
      levelId,
      passingScore,
      totalQuestions,
    });
  };

  const handleBackToLevels = () => {
    AudioService.playClickSound();
    navigation.navigate('LevelQuiz', { topic, subtopic, category });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background.primary, Colors.background.secondary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Result Icon */}
          <View style={[styles.resultIconContainer, { backgroundColor: getResultColor() }]}>
            <Ionicons name={getResultIcon()} size={60} color={Colors.text.white} />
          </View>

          {/* Result Title */}
          <Text style={styles.resultTitle}>{getResultTitle()}</Text>
          
          {/* Score */}
          <Text style={styles.scoreText}>{result.score}%</Text>
          
          {/* Result Message */}
          <Text style={styles.resultMessage}>{getResultMessage()}</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{result.correct_answers}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{result.incorrect_answers}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.floor(result.time_taken / 60)}:{(result.time_taken % 60).toString().padStart(2, '0')}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
          </View>

          {/* Energy Info */}
          <View style={styles.energyInfo}>
            <Ionicons name="flash" size={16} color={Colors.warning.main} />
            <Text style={styles.energyText}>
              {result.perfect_score ? 'No energy consumed!' : '1 energy consumed'}
            </Text>
          </View>

          <View style={styles.metaInfo}>
            <Ionicons name="stats-chart" size={16} color={Colors.text.light} />
            <Text style={styles.metaText}>
              Passing Score: {passingScore}% • Questions Attempted: {totalQuestions}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {result.passed && !isLastLevel && (
              <TouchableOpacity style={styles.primaryButton} onPress={handleNextLevel}>
                <LinearGradient
                  colors={[Colors.success.light, Colors.success.main]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="arrow-forward" size={20} color={Colors.text.white} />
                  <Text style={styles.primaryButtonText}>Next Level</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {result.passed && isLastLevel && (
              <TouchableOpacity style={styles.primaryButton} onPress={handleNextLevel}>
                <LinearGradient
                  colors={[Colors.success.light, Colors.success.main]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="trophy" size={20} color={Colors.text.white} />
                  <Text style={styles.primaryButtonText}>Category Complete!</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {!result.passed && (
              <TouchableOpacity style={styles.primaryButton} onPress={handleRetryLevel}>
                <LinearGradient
                  colors={[Colors.primary.light, Colors.primary.main]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="refresh" size={20} color={Colors.text.white} />
                  <Text style={styles.primaryButtonText}>Retry Level</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToLevels}>
              <Text style={styles.secondaryButtonText}>Back to Levels</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.large,
  },
  resultIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.large,
  },
  resultTitle: {
    ...Typography.heading.h1,
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: Spacing.medium,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: Spacing.medium,
  },
  resultMessage: {
    ...Typography.body.large,
    color: Colors.text.light,
    textAlign: 'center',
    marginBottom: Spacing.large,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: Spacing.large,
    marginBottom: Spacing.large,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.heading.h2,
    color: Colors.text.white,
  },
  statLabel: {
    ...Typography.body.small,
    color: Colors.text.light,
    marginTop: Spacing.small,
  },
  energyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.large,
  },
  energyText: {
    ...Typography.body.medium,
    color: Colors.text.light,
    marginLeft: Spacing.small,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.large,
  },
  metaText: {
    ...Typography.body.medium,
    color: Colors.text.light,
    marginLeft: Spacing.small,
  },
  actionButtons: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.medium,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.large,
    paddingHorizontal: Spacing.large,
  },
  primaryButtonText: {
    ...Typography.body.large,
    color: Colors.text.white,
    fontWeight: '600',
    marginLeft: Spacing.small,
  },
  secondaryButton: {
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.large,
  },
  secondaryButtonText: {
    ...Typography.body.medium,
    color: Colors.text.light,
    textAlign: 'center',
  },
});

export default ResultsScreen;
