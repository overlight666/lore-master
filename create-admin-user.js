// Usage: node create-admin-user.js
// Make sure you have your Firebase service account key as serviceAccount.json in the same directory

const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createAdminUser() {
  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: 'admin@loremaster.com',
      password: 'admin123',
      displayName: 'Admin'
    });

    // Add user document to Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: 'admin@loremaster.com',
      username: 'Admin',
      role: 'super_admin',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Admin user created successfully:', userRecord.uid);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();
