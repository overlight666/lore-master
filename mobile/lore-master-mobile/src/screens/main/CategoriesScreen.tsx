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
import { AppStackParamList, Category, Topic, Subtopic } from '../../types';
import ApiService from '../../services/ApiService';

// Define basic colors and styles
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

type CategoriesScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Categories'>;
type CategoriesScreenRouteProp = RouteProp<AppStackParamList, 'Categories'>;

interface Props {
  navigation: CategoriesScreenNavigationProp;
  route: CategoriesScreenRouteProp;
}

const CategoriesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { topic, subtopic } = route.params;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCategories(subtopic.id);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('LevelQuiz', { topic, subtopic, category });
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[Colors.primary.light, Colors.primary.main]}
        style={styles.categoryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.categoryContent}>
          <View style={styles.categoryIconContainer}>
            <Ionicons name="folder-outline" size={24} color={Colors.text.white} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.categoryDescription}>{item.description}</Text>
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
            <Text style={styles.headerTitle}>{subtopic.name}</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.loadingText}>Loading categories...</Text>
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
          <Text style={styles.headerTitle}>{subtopic.name}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Choose a category to start your quiz journey</Text>

          <FlatList
            data={categories}
            renderItem={renderCategory}
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
  categoryCard: {
    marginBottom: Spacing.medium,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: Spacing.large,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.medium,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...Typography.heading.h3,
    color: Colors.text.white,
    marginBottom: Spacing.small,
  },
  categoryDescription: {
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

export default CategoriesScreen;
