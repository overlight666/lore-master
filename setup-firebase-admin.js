const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK with default credentials
initializeApp();

const auth = getAuth();
const db = getFirestore();

async function createAdminUser() {
  const adminEmail = 'new_admin@admin.com';
  const adminPassword = 'AdminPassword123!';
  const adminUsername = 'admin';

  try {
    console.log('🔄 Creating admin user in Firebase Auth...');
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: adminUsername,
      emailVerified: true
    });

    console.log(`✅ Firebase Auth user created: ${userRecord.uid}`);

    // Create user document in Firestore
    console.log('🔄 Creating user document in Firestore...');
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: adminEmail,
      username: adminUsername,
      role: 'super_admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profileData: {
        firstName: 'Super',
        lastName: 'Admin',
        avatar: null
      },
      preferences: {
        notifications: true,
        theme: 'light'
      }
    });

    console.log('✅ User document created in Firestore');
    console.log('🎉 Admin user setup complete!');
    console.log(`   - Email: ${adminEmail}`);
    console.log(`   - Password: ${adminPassword}`);
    console.log(`   - UID: ${userRecord.uid}`);
    console.log(`   - Role: super_admin`);

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  User already exists in Firebase Auth');
      
      // Get existing user
      const userRecord = await auth.getUserByEmail(adminEmail);
      console.log(`   - UID: ${userRecord.uid}`);
      
      // Update Firestore document
      console.log('🔄 Updating Firestore document...');
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: adminEmail,
        username: adminUsername,
        role: 'super_admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profileData: {
          firstName: 'Super',
          lastName: 'Admin',
          avatar: null
        },
        preferences: {
          notifications: true,
          theme: 'light'
        }
      }, { merge: true });
      
      console.log('✅ Firestore document updated');
      console.log('🎉 Admin user setup complete!');
      
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }
}

createAdminUser();
