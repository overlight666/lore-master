import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList, Category, Topic, Subtopic, Level } from '../../types';
import ApiService from '../../services/ApiService';

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
    h2: { fontSize: 24, fontWeight: 'bold' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    h4: { fontSize: 16, fontWeight: '600' as const },
  },
  body: {
    medium: { fontSize: 16 },
    small: { fontSize: 14 },
    large: { fontSize: 18 },
  },
};

const Spacing = {
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
};

type LevelQuizScreenNavigationProp = StackNavigationProp<AppStackParamList, 'LevelQuiz'>;
type LevelQuizScreenRouteProp = RouteProp<AppStackParamList, 'LevelQuiz'>;

interface Props {
  navigation: LevelQuizScreenNavigationProp;
  route: LevelQuizScreenRouteProp;
}

const LevelQuizScreen: React.FC<Props> = ({ navigation, route }) => {
  const { topic, subtopic, category } = route.params;
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalLevels, setTotalLevels] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startingQuiz, setStartingQuiz] = useState(false);

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCategoryLevels(category.id);
      setLevels(data);
      
      if (data.length > 0) {
        // Find the maximum level number
        const maxLevel = Math.max(...data.map(level => level.level));
        setTotalLevels(maxLevel);
        
        // TODO: Load user progress to determine current level
        // For now, start from level 1
        setCurrentLevel(1);
      }
    } catch (error) {
      console.error('Error loading levels:', error);
      Alert.alert('Error', 'Failed to load levels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      setStartingQuiz(true);
      
      // Check if there are questions for this level
      const currentLevelInfo = levels.find(level => level.level === currentLevel);
      const questionLimit = currentLevelInfo?.totalQuestions ?? 10;

      const quizData = await ApiService.getCategoryQuestions(category.id, currentLevel, questionLimit);

      if (!quizData.questions.length) {
        Alert.alert(
          'No Questions',
          `No questions available for level ${currentLevel}. Please try again later.`
        );
        return;
      }

      // Navigate to quiz screen
      navigation.navigate('Quiz', {
        topic,
        subtopic,
        category,
        level: currentLevel,
        totalLevels,
        levelId: quizData.level_id,
        passingScore: quizData.passingScore,
        totalQuestions: quizData.totalQuestions,
      });
    } catch (error) {
      console.error('Error starting quiz:', error);
      Alert.alert('Error', 'Failed to load quiz questions. Please try again.');
    } finally {
      setStartingQuiz(false);
    }
  };

  const currentLevelInfo = levels.find(level => level.level === currentLevel);
  const passingScore = currentLevelInfo?.passingScore ?? 70;
  const questionCount = currentLevelInfo?.totalQuestions ?? 10;

  const getLevelColor = (level: number) => {
    if (level < currentLevel) return Colors.success.main; // Completed
    if (level === currentLevel) return Colors.primary.main; // Current
    return '#6b7280'; // Locked
  };

  const getLevelIcon = (level: number) => {
    if (level < currentLevel) return 'checkmark-circle';
    if (level === currentLevel) return 'play-circle';
    return 'lock-closed';
  };

  const renderLevelIndicator = (level: number) => (
    <View key={level} style={styles.levelIndicatorContainer}>
      <View style={[styles.levelIndicator, { backgroundColor: getLevelColor(level) }]}>
        <Ionicons
          name={getLevelIcon(level)}
          size={20}
          color={Colors.text.white}
        />
      </View>
      <Text style={[styles.levelText, { color: getLevelColor(level) }]}>
        Level {level}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[Colors.background.primary, Colors.background.secondary]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{category.name}</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.loadingText}>Loading quiz levels...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background.primary, Colors.background.secondary]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category.name}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Progress through each level sequentially</Text>

          {/* Progress Path */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>Your Journey</Text>
            <View style={styles.levelPath}>
              {Array.from({ length: totalLevels }, (_, i) => i + 1).map(renderLevelIndicator)}
            </View>
          </View>

          {/* Current Level Info */}
          <View style={styles.currentLevelCard}>
            <LinearGradient
              colors={[Colors.primary.light, Colors.primary.main]}
              style={styles.currentLevelGradient}
            >
              <Text style={styles.currentLevelTitle}>Current Level</Text>
              <Text style={styles.currentLevelNumber}>{currentLevel}</Text>
              <Text style={styles.currentLevelDescription}>
                Score at least {passingScore}% across {questionCount} questions to pass
              </Text>
            </LinearGradient>
          </View>

          {/* Quiz Rules */}
          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>Quiz Rules</Text>
            <View style={styles.ruleItem}>
              <Ionicons name="flash" size={16} color={Colors.warning.main} />
              <Text style={styles.ruleText}>Each quiz consumes energy (unless perfect score)</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="trending-up" size={16} color={Colors.success.main} />
              <Text style={styles.ruleText}>Must complete levels in order</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="help-circle" size={16} color={Colors.primary.main} />
              <Text style={styles.ruleText}>{questionCount} questions randomly selected each attempt</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="trophy" size={16} color={Colors.primary.main} />
              <Text style={styles.ruleText}>Passing Score: {passingScore}%</Text>
            </View>
          </View>

          {/* Start Quiz Button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartQuiz}
            disabled={startingQuiz}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.success.light, Colors.success.main]}
              style={styles.startButtonGradient}
            >
              {startingQuiz ? (
                <ActivityIndicator color={Colors.text.white} />
              ) : (
                <>
                  <Ionicons name="play" size={24} color={Colors.text.white} />
                  <Text style={styles.startButtonText}>Start Level {currentLevel}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.large,
    paddingTop: Spacing.medium,
    paddingBottom: Spacing.large,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.heading.h2,
    color: Colors.text.white,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.large,
  },
  subtitle: {
    ...Typography.body.medium,
    color: Colors.text.light,
    textAlign: 'center',
    marginBottom: Spacing.large,
  },
  progressContainer: {
    marginBottom: Spacing.large,
  },
  progressTitle: {
    ...Typography.heading.h3,
    color: Colors.text.white,
    textAlign: 'center',
    marginBottom: Spacing.medium,
  },
  levelPath: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelIndicatorContainer: {
    alignItems: 'center',
    marginHorizontal: Spacing.small,
    marginVertical: Spacing.small,
  },
  levelIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.small,
  },
  levelText: {
    ...Typography.body.small,
    fontWeight: '600',
  },
  currentLevelCard: {
    marginBottom: Spacing.large,
    borderRadius: 16,
    overflow: 'hidden',
  },
  currentLevelGradient: {
    padding: Spacing.large,
    alignItems: 'center',
  },
  currentLevelTitle: {
    ...Typography.heading.h4,
    color: Colors.text.white,
    marginBottom: Spacing.small,
  },
  currentLevelNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text.white,
    marginBottom: Spacing.small,
  },
  currentLevelDescription: {
    ...Typography.body.medium,
    color: Colors.text.light,
    textAlign: 'center',
  },
  rulesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: Spacing.large,
    marginBottom: Spacing.large,
  },
  rulesTitle: {
    ...Typography.heading.h4,
    color: Colors.text.white,
    marginBottom: Spacing.medium,
    textAlign: 'center',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.small,
  },
  ruleText: {
    ...Typography.body.small,
    color: Colors.text.light,
    marginLeft: Spacing.small,
    flex: 1,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 'auto',
    marginBottom: Spacing.large,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.large,
    paddingHorizontal: Spacing.large,
  },
  startButtonText: {
    ...Typography.body.large,
    color: Colors.text.white,
    fontWeight: '600',
    marginLeft: Spacing.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body.medium,
    color: Colors.text.light,
    marginTop: Spacing.medium,
  },
});

export default LevelQuizScreen;
