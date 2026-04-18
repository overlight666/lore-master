/**
 * Sample data seeding script for Lore Master
 * Run this to populate your Firestore with sample topics, subtopics, and levels
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin
initializeApp({
  projectId: 'loremaster-287f0'
});
const db = getFirestore();

const COLLECTIONS = {
  TOPICS: 'topics',
  SUBTOPICS: 'subtopics',
  LEVELS: 'levels',
  QUESTIONS: 'questions',
};

// Sample data
const sampleTopics = [
  {
    id: uuidv4(),
    name: 'Anime & Manga',
    description: 'Test your knowledge of anime and manga series',
    icon_url: 'https://example.com/anime-icon.png',
    isActive: true,
    difficulty: 'medium',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Video Games',
    description: 'Gaming knowledge across all platforms and genres',
    icon_url: 'https://example.com/games-icon.png',
    isActive: true,
    difficulty: 'medium',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Movies & TV',
    description: 'Cinema and television trivia',
    icon_url: 'https://example.com/movies-icon.png',
    isActive: true,
    difficulty: 'easy',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Science & Technology',
    description: 'Scientific discoveries and technological innovations',
    icon_url: 'https://example.com/science-icon.png',
    isActive: true,
    difficulty: 'hard',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Subtopics for each topic
const subtopicsData = {
  'Anime & Manga': [
    { name: 'Shonen Anime', description: 'Popular shonen series like Naruto, One Piece, Dragon Ball' },
    { name: 'Studio Ghibli', description: 'Hayao Miyazaki and Studio Ghibli films' },
    { name: 'Manga Artists', description: 'Famous manga creators and their works' }
  ],
  'Video Games': [
    { name: 'Nintendo Games', description: 'Nintendo franchises and characters' },
    { name: 'RPG Games', description: 'Role-playing games and their mechanics' },
    { name: 'Indie Games', description: 'Independent game development and titles' }
  ],
  'Movies & TV': [
    { name: 'Hollywood Classics', description: 'Classic Hollywood films and actors' },
    { name: 'TV Series', description: 'Popular television shows and characters' },
    { name: 'Directors', description: 'Famous movie directors and their styles' }
  ],
  'Science & Technology': [
    { name: 'Physics', description: 'Fundamental physics concepts and discoveries' },
    { name: 'Computer Science', description: 'Programming, algorithms, and computing history' },
    { name: 'Biology', description: 'Life sciences and biological processes' }
  ]
};

async function seedData() {
  try {
    console.log('Starting data seeding...');

    // Seed topics
    console.log('Seeding topics...');
    for (const topic of sampleTopics) {
      await db.collection(COLLECTIONS.TOPICS).doc(topic.id).set(topic);
      console.log(`Created topic: ${topic.name}`);
    }

    // Seed subtopics and levels
    console.log('Seeding subtopics and levels...');
    
    for (const topic of sampleTopics) {
      const subtopicsForTopic = subtopicsData[topic.name as keyof typeof subtopicsData];
      
      if (subtopicsForTopic) {
        for (const subtopicData of subtopicsForTopic) {
          const subtopicId = uuidv4();
          const subtopic = {
            id: subtopicId,
            name: subtopicData.name,
            description: subtopicData.description,
            topic_id: topic.id,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await db.collection(COLLECTIONS.SUBTOPICS).doc(subtopicId).set(subtopic);
          console.log(`Created subtopic: ${subtopic.name}`);

          // Create 10 levels for each subtopic
          for (let levelNum = 1; levelNum <= 10; levelNum++) {
            const levelId = uuidv4();
            const level = {
              id: levelId,
              topic_id: topic.id,
              subtopic_id: subtopicId,
              level: levelNum,
              name: `Level ${levelNum}`,
              description: `${subtopicData.name} - Level ${levelNum}`,
              totalQuestions: 20,
              passingScore: 70,
              isActive: true,
              requirements: levelNum > 1 ? [`Complete Level ${levelNum - 1}`] : [],
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await db.collection(COLLECTIONS.LEVELS).doc(levelId).set(level);
          }
          
          console.log(`Created 10 levels for subtopic: ${subtopic.name}`);
        }
      }
    }

    console.log('Data seeding completed successfully!');
    console.log(`Created ${sampleTopics.length} topics`);
    
    const totalSubtopics = Object.values(subtopicsData).reduce((sum, subtopics) => sum + subtopics.length, 0);
    console.log(`Created ${totalSubtopics} subtopics`);
    console.log(`Created ${totalSubtopics * 10} levels (10 per subtopic)`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run the script
seedData().then(() => {
  console.log('Seeding completed');
  process.exit(0);
});
