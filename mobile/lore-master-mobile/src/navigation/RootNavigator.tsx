import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { AuthStackParamList, AppStackParamList } from '../types';
import AudioService from '../services/AudioService';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Main App Screens
import HomeScreen from '../screens/main/HomeScreen';
import TopicsScreen from '../screens/main/TopicsScreen';
import SubtopicsScreen from '../screens/main/SubtopicsScreen';
import CategoriesScreen from '../screens/main/CategoriesScreen';
import LevelQuizScreen from '../screens/main/LevelQuizScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import StoreScreen from '../screens/main/StoreScreen';
import LeaderboardScreen from '../screens/main/LeaderboardScreen';
import QuizScreen from '../screens/main/QuizScreen';
import LevelsScreen from '../screens/main/LevelsScreen';
import ResultsScreen from '../screens/main/ResultsScreen';

// Loading Screen
import LoadingScreen from '../screens/common/LoadingScreen';

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<AppStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: 'transparent' },
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            opacity: current.progress,
          },
        }),
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: 'transparent' },
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            opacity: current.progress,
          },
        }),
      }}
    >
      <MainStack.Screen name="Home" component={HomeScreen} />
      <MainStack.Screen name="Topics" component={TopicsScreen} />
      <MainStack.Screen name="Subtopics" component={SubtopicsScreen} />
      <MainStack.Screen name="Categories" component={CategoriesScreen} />
      <MainStack.Screen name="LevelQuiz" component={LevelQuizScreen} />
      <MainStack.Screen name="Profile" component={ProfileScreen} />
      <MainStack.Screen name="Store" component={StoreScreen} />
      <MainStack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <MainStack.Screen name="Quiz" component={QuizScreen} />
      <MainStack.Screen name="LevelSelect" component={LevelsScreen} />
      <MainStack.Screen name="QuizResult" component={ResultsScreen} />
    </MainStack.Navigator>
  );
};

const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Initialize audio service non-blocking and catch errors silently
    AudioService.initialize().catch(() => {});
    
    return () => {
      AudioService.cleanup();
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
