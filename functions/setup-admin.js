/**
 * Simple admin setup script that can be run directly
 */

// Initialize Firebase Admin with specific project
const admin = require('firebase-admin');

// For local development, we need to authenticate differently
// You can either:
// 1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
// 2. Use firebase login and firebase use your-project-id
// 3. Or use a service account key

console.log('🔧 Setting up admin user with Firebase Admin SDK');

// Try to initialize with different methods
let app;
try {
  // Method 1: Try with default credentials (Cloud environment)
  app = admin.initializeApp({
    projectId: 'loremaster-287f0'
  });
  console.log('✅ Initialized with default credentials');
} catch (error) {
  console.log('⚠️ Default credentials failed, trying alternative...');
  
  // Method 2: Initialize without explicit credentials (uses environment)
  try {
    if (admin.apps.length === 0) {
      app = admin.initializeApp();
    } else {
      app = admin.apps[0];
    }
    console.log('✅ Initialized with environment credentials');
  } catch (error2) {
    console.error('❌ Failed to initialize Firebase Admin:', error2.message);
    console.log('\nTo fix this, run:');
    console.log('1. firebase login');
    console.log('2. firebase use loremaster-287f0');
    console.log('3. Or set GOOGLE_APPLICATION_CREDENTIALS environment variable');
    process.exit(1);
  }
}

const db = admin.firestore();
const auth = admin.auth();

const COLLECTIONS = {
  USERS: 'users'
};

async function setupAdmin() {
  const adminEmail = 'admin@loremaster.com';
  const role = 'super_admin';
  
  try {
    console.log('🔧 Setting up admin user:', adminEmail);
    
    // Get the user from Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(adminEmail);
      console.log('✅ Found user in Firebase Auth:', userRecord.uid);
    } catch (error) {
      console.log('❌ User not found in Firebase Auth');
      console.log('Please create this user first by signing up at the admin login page');
      console.log('Then run this script again');
      console.log('Error details:', error.message);
      return;
    }
    
    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: role,
      permissions: ['read', 'write', 'admin_access']
    });
    console.log('✅ Custom claims set');
    
    // Create/update user in Firestore
    await db.collection(COLLECTIONS.USERS).doc(userRecord.uid).set({
      email: adminEmail,
      role: role,
      displayName: 'Admin User',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      permissions: ['read', 'write', 'admin_access']
    }, { merge: true });
    
    console.log('✅ User document created/updated in Firestore');
    
    // Verify
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userRecord.uid).get();
    const userData = userDoc.data();
    
    console.log('🎉 Setup complete!');
    console.log('User details:', {
      uid: userRecord.uid,
      email: userData.email,
      role: userData.role
    });
    
    console.log('\n⚠️  IMPORTANT: Sign out and sign back in to refresh the token!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupAdmin();
