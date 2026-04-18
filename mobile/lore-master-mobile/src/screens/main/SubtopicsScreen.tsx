import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList, Subtopic, Topic } from '../../types';
import ApiService from '../../services/ApiService';

// Define basic colors and styles since theme structure is complex
const Colors = {
  primary: { main: '#6366f1', light: '#818cf8' },
  background: { primary: '#1e1b4b', secondary: '#312e81' },
  text: { white: '#ffffff', light: '#e0e7ff' },
};

const Typography = {
  heading: {
    h2: { fontSize: 24, fontWeight: 'bold' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
  },
  body: {
    medium: { fontSize: 16 },
    small: { fontSize: 14 },
  },
};

const Spacing = {
  small: 8,
  medium: 16,
  large: 24,
};

type SubtopicsScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Subtopics'>;
type SubtopicsScreenRouteProp = RouteProp<AppStackParamList, 'Subtopics'>;

interface Props {
  navigation: SubtopicsScreenNavigationProp;
  route: SubtopicsScreenRouteProp;
}

const SubtopicsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { topic } = route.params;
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubtopics();
  }, []);

  const loadSubtopics = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getSubtopics(topic.id);
      setSubtopics(data);
    } catch (error) {
      console.error('Error loading subtopics:', error);
      Alert.alert('Error', 'Failed to load subtopics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubtopicPress = (subtopic: Subtopic) => {
    navigation.navigate('Categories', { topic, subtopic });
  };

  const renderSubtopic = ({ item }: { item: Subtopic }) => (
    <TouchableOpacity
      style={styles.subtopicCard}
      onPress={() => handleSubtopicPress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[Colors.primary.light, Colors.primary.main]}
        style={styles.subtopicGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.subtopicContent}>
          <View style={styles.subtopicIconContainer}>
            <Ionicons name="library-outline" size={24} color={Colors.text.white} />
          </View>
          <View style={styles.subtopicInfo}>
            <Text style={styles.subtopicName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.subtopicDescription}>{item.description}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.white} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
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
            <Text style={styles.headerTitle}>{topic.name}</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.loadingText}>Loading subtopics...</Text>
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
          <Text style={styles.headerTitle}>{topic.name}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Choose a subtopic to continue your learning journey</Text>

          <FlatList
            data={subtopics}
            renderItem={renderSubtopic}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
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
  listContainer: {
    paddingBottom: Spacing.large,
  },
  subtopicCard: {
    marginBottom: Spacing.medium,
    borderRadius: 16,
    overflow: 'hidden',
  },
  subtopicGradient: {
    padding: Spacing.large,
  },
  subtopicContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtopicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.medium,
  },
  subtopicInfo: {
    flex: 1,
  },
  subtopicName: {
    ...Typography.heading.h3,
    color: Colors.text.white,
    marginBottom: Spacing.small,
  },
  subtopicDescription: {
    ...Typography.body.small,
    color: Colors.text.light,
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

export default SubtopicsScreen;
