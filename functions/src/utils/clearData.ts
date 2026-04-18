/**
 * Clear all database data except users
 * Run this to reset your Firestore database while preserving user data
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
  QUIZ_SESSIONS: 'quizSessions',
  USER_PROGRESS: 'userProgress',
  LEADERBOARD: 'leaderboard',
  ENERGY: 'energy',
  STORE_PURCHASES: 'storePurchases',
  ADMIN_LOGS: 'adminLogs'
};

async function clearCollection(collectionName: string) {
  console.log(`Clearing collection: ${collectionName}`);
  
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log(`Collection ${collectionName} is already empty`);
    return;
  }

  console.log(`Found ${snapshot.size} documents in ${collectionName}`);
  
  // Delete documents in batches of 500 (Firestore limit)
  const batchSize = 500;
  const batches = [];
  
  for (let i = 0; i < snapshot.docs.length; i += batchSize) {
    const batch = db.batch();
    const batchDocs = snapshot.docs.slice(i, i + batchSize);
    
    batchDocs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    batches.push(batch);
  }
  
  // Execute all batches
  await Promise.all(batches.map(batch => batch.commit()));
  console.log(`Cleared ${snapshot.size} documents from ${collectionName}`);
}

async function clearData() {
  try {
    console.log('Starting database cleanup (excluding users)...');
    
    const collectionsToaClear = [
      COLLECTIONS.TOPICS,
      COLLECTIONS.SUBTOPICS,
      COLLECTIONS.LEVELS,
      COLLECTIONS.QUESTIONS,
      COLLECTIONS.QUIZ_SESSIONS,
      COLLECTIONS.USER_PROGRESS,
      COLLECTIONS.LEADERBOARD,
      COLLECTIONS.ENERGY,
      COLLECTIONS.STORE_PURCHASES,
      COLLECTIONS.ADMIN_LOGS
    ];

    for (const collection of collectionsToaClear) {
      await clearCollection(collection);
    }

    console.log('Database cleanup completed successfully!');
    console.log('Users collection was preserved.');
    
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

// Run the script
clearData().then(() => {
  console.log('Script completed');
  process.exit(0);
});
