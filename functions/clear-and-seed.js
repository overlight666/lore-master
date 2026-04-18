const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin with project ID
initializeApp({ projectId: 'loremaster-287f0' });
const db = getFirestore();

async function clearDatabase() {
  try {
    console.log('Starting database cleanup (excluding users)...');
    
    const collections = [
      'topics',
      'subtopics', 
      'categories',
      'levels',
      'questions',
      'sessions',
      'progress',
      'leaderboard',
      'game_sessions',
      'user_progress',
      'analytics'
    ];

    let totalDeleted = 0;

    for (const collectionName of collections) {
      console.log(`Clearing collection: ${collectionName}`);
      
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      if (snapshot.docs.length > 0) {
        await batch.commit();
        totalDeleted += snapshot.docs.length;
        console.log(`Deleted ${snapshot.docs.length} documents from ${collectionName}`);
      }
    }

    console.log(`Database cleanup completed! Total documents deleted: ${totalDeleted}`);
    return totalDeleted;
    
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log('Starting data seeding...');

    // Sample topics
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
        name: 'Games',
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
      }
    ];

    // New enhanced data structure: Topic -> Subtopic -> Category
    const dataStructure = {
      'Anime & Manga': {
        subtopics: {
          'Anime': {
            description: 'Japanese animated series and films',
            categories: [
              { name: 'Naruto', description: 'The ninja world of Naruto Uzumaki' },
              { name: 'One Piece', description: 'The adventures of Monkey D. Luffy and the Straw Hat Pirates' },
              { name: 'Dragon Ball', description: 'Goku\'s journey and the world of Dragon Ball' }
            ]
          },
          'Manga/Manhwa': {
            description: 'Japanese manga and Korean manhwa series',
            categories: [
              { name: 'Attack on Titan', description: 'The battle against titans' },
              { name: 'Demon Slayer', description: 'Tanjiro\'s quest to save his sister' },
              { name: 'Solo Leveling', description: 'Sung Jin-Woo\'s rise to power' }
            ]
          },
          'Comics': {
            description: 'Western comics and graphic novels',
            categories: [
              { name: 'Marvel', description: 'Marvel Comics universe' },
              { name: 'DC Comics', description: 'DC Comics universe' }
            ]
          },
          'Cartoons': {
            description: 'Western animated series and films',
            categories: [
              { name: 'Disney', description: 'Disney animated films and characters' },
              { name: 'Cartoon Network', description: 'Cartoon Network shows' }
            ]
          }
        }
      },
      'Games': {
        subtopics: {
          'Console': {
            description: 'Console gaming platforms and exclusive games',
            categories: [
              { name: 'PlayStation', description: 'Sony PlayStation exclusive games' },
              { name: 'Xbox', description: 'Microsoft Xbox exclusive games' },
              { name: 'Nintendo', description: 'Nintendo console games and characters' }
            ]
          },
          'TRPG': {
            description: 'Tabletop role-playing games',
            categories: [
              { name: 'Dungeons & Dragons', description: 'The classic fantasy tabletop RPG' },
              { name: 'Pathfinder', description: 'The fantasy RPG system' },
              { name: 'Magic The Gathering', description: 'The collectible card game' }
            ]
          },
          'Card Games': {
            description: 'Trading card games and digital card games',
            categories: [
              { name: 'Pokemon TCG', description: 'Pokemon Trading Card Game' },
              { name: 'Yu-Gi-Oh!', description: 'Yu-Gi-Oh! Trading Card Game' },
              { name: 'Hearthstone', description: 'Blizzard\'s digital card game' }
            ]
          },
          'Board Games': {
            description: 'Traditional and modern board games',
            categories: [
              { name: 'Strategy Games', description: 'Strategic board games' },
              { name: 'Party Games', description: 'Social and party board games' }
            ]
          },
          'PC Games': {
            description: 'PC gaming and online games',
            categories: [
              { name: 'Steam Games', description: 'Popular Steam platform games' },
              { name: 'MMORPGs', description: 'Massively multiplayer online RPGs' }
            ]
          }
        }
      },
      'Movies & TV': {
        subtopics: {
          'Series': {
            description: 'Television series and streaming shows',
            categories: [
              { name: 'Game of Thrones', description: 'The epic fantasy series' },
              { name: 'Breaking Bad', description: 'Walter White\'s transformation' },
              { name: 'The Office', description: 'The mockumentary workplace comedy' }
            ]
          },
          'Movies': {
            description: 'Cinema and film trivia',
            categories: [
              { name: 'Marvel Cinematic Universe', description: 'MCU films and characters' },
              { name: 'Classic Hollywood', description: 'Golden age of Hollywood films' },
              { name: 'Sci-Fi Movies', description: 'Science fiction cinema' }
            ]
          },
          'Educational': {
            description: 'Educational and documentary content',
            categories: [
              { name: 'Nature Documentaries', description: 'Wildlife and nature documentaries' },
              { name: 'History Documentaries', description: 'Historical documentaries and series' }
            ]
          }
        }
      }
    };

    let createdTopics = 0;
    let createdSubtopics = 0;
    let createdCategories = 0;
    let createdLevels = 0;

    // Seed topics
    console.log('Seeding topics...');
    for (const topic of sampleTopics) {
      await db.collection('topics').doc(topic.id).set(topic);
      createdTopics++;
      console.log(`Created topic: ${topic.name}`);
    }

    // Seed subtopics, categories, and levels
    console.log('Seeding subtopics, categories, and levels...');
    
    for (const topic of sampleTopics) {
      const topicData = dataStructure[topic.name];
      
      if (topicData && topicData.subtopics) {
        for (const [subtopicName, subtopicData] of Object.entries(topicData.subtopics)) {
          const subtopicId = uuidv4();
          const subtopic = {
            id: subtopicId,
            name: subtopicName,
            description: subtopicData.description,
            topic_id: topic.id,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await db.collection('subtopics').doc(subtopicId).set(subtopic);
          createdSubtopics++;
          console.log(`Created subtopic: ${subtopic.name}`);

          // Create categories for this subtopic
          for (const categoryData of subtopicData.categories) {
            const categoryId = uuidv4();
            const category = {
              id: categoryId,
              name: categoryData.name,
              description: categoryData.description,
              topic_id: topic.id,
              subtopic_id: subtopicId,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await db.collection('categories').doc(categoryId).set(category);
            createdCategories++;
            console.log(`Created category: ${category.name}`);

            // Create 5 levels for each category
            for (let levelNum = 1; levelNum <= 5; levelNum++) {
              const levelId = uuidv4();
              const level = {
                id: levelId,
                topic_id: topic.id,
                subtopic_id: subtopicId,
                category_id: categoryId,
                level: levelNum,
                name: `Level ${levelNum}`,
                description: `${categoryData.name} - Level ${levelNum}`,
                totalQuestions: 20,
                passingScore: 70,
                isActive: true,
                requirements: levelNum > 1 ? [`Complete Level ${levelNum - 1}`] : [],
                createdAt: new Date(),
                updatedAt: new Date()
              };

              await db.collection('levels').doc(levelId).set(level);
              createdLevels++;
            }
            
            console.log(`Created 5 levels for category: ${category.name}`);
          }
        }
      }
    }

    console.log('Data seeding completed successfully!');
    
    return {
      topics: createdTopics,
      subtopics: createdSubtopics,
      categories: createdCategories,
      levels: createdLevels
    };
    
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('=== Database Management Tool ===');
    
    // Clear database
    console.log('\n1. Clearing database...');
    await clearDatabase();
    
    // Seed database
    console.log('\n2. Seeding database...');
    const results = await seedDatabase();
    
    console.log('\n=== Operation Complete ===');
    console.log(`Created: ${results.topics} topics, ${results.subtopics} subtopics, ${results.categories} categories, ${results.levels} levels`);
    
    process.exit(0);
  } catch (error) {
    console.error('Operation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
