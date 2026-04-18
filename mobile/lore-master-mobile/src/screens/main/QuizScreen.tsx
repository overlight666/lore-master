import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList, Question } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useGame } from '../../contexts/GameContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import ParticleSystem from '../../components/ParticleSystem';
import GameButton from '../../components/GameButton';
import AudioService from '../../services/AudioService';
import ApiService from '../../services/ApiService';

type QuizScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Quiz'>;
type QuizScreenRouteProp = RouteProp<AppStackParamList, 'Quiz'>;

interface Props {
  navigation: QuizScreenNavigationProp;
  route: QuizScreenRouteProp;
}

const QuizScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { energy } = useGame();
  const { topic, subtopic, category, level, totalLevels } = route.params;
  const [levelId, setLevelId] = useState(route.params.levelId ?? '');
  const [passingScore, setPassingScore] = useState(route.params.passingScore ?? 70);
  const [questionLimit, setQuestionLimit] = useState(route.params.totalQuestions ?? 10);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      
      // Load questions for the current level and category
  const quizData = await ApiService.getCategoryQuestions(category.id, level, questionLimit);
      
      if (!quizData.questions.length) {
        Alert.alert(
          'No Questions',
          'No questions available for this level.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      setLevelId(quizData.level_id);
      setPassingScore(quizData.passingScore);
      if (quizData.totalQuestions) {
        setQuestionLimit(quizData.totalQuestions);
      }
      setQuestions(quizData.questions);
      setUserAnswers(new Array(quizData.questions.length).fill(''));
      
    } catch (error) {
      console.error('Failed to load questions:', error);
      Alert.alert('Error', 'Failed to load quiz questions');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    if (!user) return;
    
    try {
      // Check energy (simplified for now)
      if ((energy?.current_energy || 0) < 1) {
        Alert.alert('Insufficient Energy', 'You need energy to start a quiz!');
        navigation.goBack();
        return;
      }
      
      setQuizStarted(true);
      AudioService.playSuccessSound();
    } catch (error) {
      Alert.alert('Error', 'Failed to start quiz');
      navigation.goBack();
    }
  };

  const handleAnswerSelect = (answer: string) => {
    AudioService.playClickSound();
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      Alert.alert('Select Answer', 'Please select an answer before continuing.');
      return;
    }

    AudioService.playClickSound();
    
    // Save the answer
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(newAnswers);

    // Animate transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const handleTimeUp = () => {
    AudioService.playErrorSound();
    
    if (currentQuestionIndex < questions.length - 1) {
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = selectedAnswer || '';
      setUserAnswers(newAnswers);
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      finishQuiz([...userAnswers, selectedAnswer || '']);
    }
  };

  const finishQuiz = (finalAnswers: string[]) => {
    AudioService.playSuccessSound();
    
    // Calculate score
    let correctAnswers = 0;
    finalAnswers.forEach((answer, index) => {
      if (answer === questions[index]?.correct_answer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
  const passed = score >= passingScore;
    const perfectScore = score === 100;
    const isLastLevel = level >= totalLevels;

    const result = {
      id: Date.now().toString(),
      user_id: user?.uid || '',
  level_id: levelId || `${category.id}_level_${level}`,
      score,
      percentage: score,
  total_questions: questions.length,
      correct_answers: correctAnswers,
      incorrect_answers: questions.length - correctAnswers,
      time_taken: (questions.length * 30) - timeLeft,
      passed,
      perfect_score: perfectScore,
      energy_consumed: perfectScore ? 0 : 1, // No energy consumed for perfect score
      completed_at: new Date().toISOString(),
      answers: finalAnswers,
      questions
    } as any;

    navigation.navigate('QuizResult', { 
      result, 
      topic, 
      subtopic, 
      category, 
      level, 
      totalLevels,
      isLastLevel,
      levelId: levelId || `${category.id}_level_${level}`,
      passingScore,
      totalQuestions: questions.length
    });
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <AnimatedBackground variant="mystical">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>🧙‍♂️ Preparing your quest...</Text>
          </View>
        </SafeAreaView>
      </AnimatedBackground>
    );
  }

  if (!quizStarted) {
    return (
      <AnimatedBackground variant="energy">
        <ParticleSystem count={15} emoji="⚡" duration={4000} />
        <SafeAreaView style={styles.container}>
          <View style={styles.startContainer}>
            <Text style={styles.startTitle}>🎯 Ready for the Challenge?</Text>
            <Text style={styles.startSubtitle}>{topic.name} Quiz</Text>
            
            <View style={styles.quizInfo}>
              <Text style={styles.infoText}>📝 {questions.length} Questions</Text>
              <Text style={styles.infoText}>⏱️ 30 seconds per question</Text>
              <Text style={styles.infoText}>⚡ 1 Energy required</Text>
              <Text style={styles.infoText}>🎯 {passingScore}% to pass</Text>
            </View>

            <GameButton
              title="🚀 Start Quiz"
              onPress={startQuiz}
              variant="primary"
              size="large"
              glow={true}
              style={styles.startButton}
            />

            <GameButton
              title="← Go Back"
              onPress={() => navigation.goBack()}
              variant="secondary"
              size="medium"
              style={styles.backButton}
            />
          </View>
        </SafeAreaView>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground variant="dark">
      <ParticleSystem count={8} emoji="💫" duration={3000} />
      <SafeAreaView style={styles.container}>
        {/* Quiz Header */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, timeLeft <= 10 && styles.timerWarning]}>
              ⏱️ {timeLeft}s
            </Text>
          </View>
        </View>

        {/* Question */}
        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.questionText}>{currentQuestion?.question}</Text>
          
          <View style={styles.answersContainer}>
            {currentQuestion?.choices?.map((choice: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.answerButton,
                  selectedAnswer === choice && styles.selectedAnswer
                ]}
                onPress={() => handleAnswerSelect(choice)}
              >
                <Text style={[
                  styles.answerText,
                  selectedAnswer === choice && styles.selectedAnswerText
                ]}>
                  {choice}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <GameButton
            title={currentQuestionIndex === questions.length - 1 ? "🏁 Finish Quiz" : "➡️ Next Question"}
            onPress={handleNextQuestion}
            variant="primary"
            size="large"
            disabled={!selectedAnswer}
            style={styles.nextButton}
          />
        </Animated.View>
      </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  startTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  startSubtitle: {
    fontSize: 20,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 32,
  },
  quizInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  startButton: {
    marginBottom: 16,
  },
  backButton: {
    marginTop: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  timerWarning: {
    color: '#FF6B6B',
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
  },
  answersContainer: {
    flex: 1,
    gap: 16,
  },
  answerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedAnswer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: '#FFD700',
  },
  answerText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedAnswerText: {
    color: '#FFD700',
  },
  nextButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});

export default QuizScreen;
