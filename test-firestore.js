const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK with service account
const serviceAccount = {
  type: "service_account",
  project_id: "loremaster-287f0",
  private_key_id: "bc0097fc1cdad06356d1b83183b3694ba4e82a3f",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC58Dho2FxRzpzJ\nFQM0qqbLdejxxhyOE30ouxeeMXggUulR70wWauCDZL3fmxdIXN8DfKrynPm7AhEp\nWPWI9vxb3B3toRwrHrvM90ztrPSug7vNJGxx6ZJd5x1tDjXxFgI1r/+3MJftGh3z\nPSL2dRnP/SEGA1RB2ECQRr1sBK1RBlXt0Tkfoy3M4f3pmJvm6VOHDfuaJpcM/o3I\nKJ35NzGQdyiNfA5KTh6jYgnvVvvjS6qPjVE3JrZiE0kvHeWrote3JsdU2D+BrmGNu097XPcVvqjibW\nPpqJLXFtt7TKRRmwirs4wWDtq+ZTV+ZnH99DEhM0gCtwFaIfb+rSQFuDMFwCOmos\nAzne6EpyTQKBgHCxSUD3g7OwbSrGnKQppOUFHERNKGwOzXLlb4t6Dl0rNbkq4rwj\nESx1oq+0jCjL3PBIFTb/SCQQCQQiG9/s9pXs4JZgB5s37kA2/7elKl8FpgGh1wx8\nFUe36HOd0C2PmzJeGx8fZsJDSCqwPd/KmyCXiCQ2TUutH+H+3htb1z0hAoGAYdxV\n5KYSK/xK9XQtHMl1jgYUAgNhUiCrfYc+a/0CdJhUlvpcaWXMyFfEZifT+ZlhhUSQ\nXZYH2/qTE2PPYrhk9S+AHK65PB1xbSfjmL4VVrkV0K7CjjIoHMYLNYLRxyosRbBX\nlrEu39dkWVqkEtiaxBQY3iBGwWIT5BhUTGdnzT0CgYAlBbAxFiucOIhIrrKp+skQ\nYyLUWQjBqPlEFY6JRTfIX4U/nfOaAfk7PwvqtNj2iHAWCS2cfje11qBCf6Igjbeo\nosGMuQiVYSVTaIQNXdxXHilHunthaSL3C/NiTiOJ77BYmfzQGV9v5kdM2TN3sExl\nRsjlYJfww6vhFjzlygYfLA==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@loremaster-287f0.iam.gserviceaccount.com",
  client_id: "109516175141445698592",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40loremaster-287f0.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

async function testFirestoreConnection() {
  try {
    // Initialize Firebase
    initializeApp({
      credential: cert(serviceAccount),
      projectId: "loremaster-287f0"
    });
    console.log('✅ Firebase Admin SDK initialized');

    // Get Firestore instance
    const db = getFirestore();
    console.log('✅ Firestore instance created');

    // Test reading from users collection
    console.log('🔍 Testing Firestore read access...');
    const usersSnapshot = await db.collection('users').limit(1).get();
    console.log(`✅ Successfully read users collection (${usersSnapshot.size} documents)`);

    // Test specific user lookup (the admin user we created)
    const adminUserDoc = await db.collection('users').doc('new_admin@admin.com').get();
    if (adminUserDoc.exists) {
      const userData = adminUserDoc.data();
      console.log('✅ Admin user found:', {
        email: userData.email,
        role: userData.role,
        createdAt: userData.createdAt
      });
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('❌ Firestore test failed:', error);
  }
}

testFirestoreConnection();
