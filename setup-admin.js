#!/usr/bin/env node

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with service account
const serviceAccount = {
  type: "service_account",
  project_id: "loremaster-287f0",
  private_key_id: "bc0097fc1cdad06356d1b83183b3694ba4e82a3f",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC58Dho2FxRzpzJ\nFQM0qqbLdejxxhyOE30ouxeeMXggUulR70wWauCDZL3fmxdIXN8DfKrynPm7AhEp\nWPWI9vxb3B3toRwrHrvM90ztrPSug7vNJGxx6ZJd5x1tDjXxFgI1r/+3MJftGh3z\nPSL2dRnP/SEGA1RB2ECQRr1sBK1RBlXt0Tkfoy3M4f3pmJvm6VOHDfuaJpcM/o3I\nKJ35NzGQdyiNfA5KTh6jYgnvVvvjS6qPjVE3JrZiE0kvWesvxjMCgEDyNpSmFVd8\nP4HKdQSmp1RAdex5i+a1uhDD7r6ql3/5QKlDbvnZjWu3bHOfxv2pmwx5JCxngBYK\nih4BqJzBAgMBAAECggEAAxQrCEgQ20VAYQSpOBgynoArem632VMRnvjeGWn4nbxn\nDaAYkpnJcZOGS1YOQCNS3q6+m+QlLxyye7dJNYU1b4XztD7B2yWX9tBfeeNZF9dU\nPD+D+4I3wLigyvCnIatQymJ0KayIeiNqZzUrcjOag6Wi2YPOQ4WDqCqWXLFad1LM\nGXlWHKRPbNS+HH+MT4y1/ipf8YnhxhHzda0xb8SEa994LlM2CTFyZzI4c9kTzPY0\nDi7pTbBAbT3OHMPs0/KzR0f11rLUdKyJW4YYmGyvGNxi7/Uu7gDVD64jdCpVwWnk\nSdMe2NcVd/3gOY5XZGi0WDy+EFSztZzZm1fh+F5leQKBgQDy4ZLpLLFcgdv+jNNN\ncFmQr6lU37YgY5/WZsw3CfvAGPGw73bu39ngIhJ/wgCmsXM0X68r4hbK7duqbG9H\nzYqzDBxQjn9AuFnqFn6bnwgvR8VU3E9TNFiqX6OxHiNAuOJQoTdoAr5Y2k3XHx7q\nDDcNbNhLa2/i24agazkh05IGRQKBgQDD+0XrdQb0cwyJtIfHii0aHgonmBPBpwlZ\niYwbiByc0kEAdA3EJFCPWUF31rZkIFkbO1Exk3JsdU2D+BrmGNu097XPcVvqjibW\nPpqJLXFtt7TKRRmwirs4wWDtq+ZTV+ZnH99DEhM0gCtwFaIfb+rSQFuDMFwCOmos\nAzne6EpyTQKBgHCxSUD3g7OwbSrGnKQppOUFHERNKGwOzXLlb4t6Dl0rNbkq4rwj\nESx1oq+0jCjL3PBIFTb/SCQQCQQiG9/s9pXs4JZgB5s37kA2/7elKl8FpgGh1wx8\nFUe36HOd0C2PmzJeGx8fZsJDSCqwPd/KmyCXiCQ2TUutH+H+3htb1z0hAoGAYdxV\n5KYSK/xK9XQtHMl1jgYUAgNhUiCrfYc+a/0CdJhUlvpcaWXMyFfEZifT+ZlhhUSQ\nXZYH2/qTE2PPYrhk9S+AHK65PB1xbSfjmL4VVrkV0K7CjjIoHMYLNYLRxyosRbBX\nlrEu39dkWVqkEtiaxBQY3iBGwWIT5BhUTGdnzT0CgYAlBbAxFiucOIhIrrKp+skQ\nYyLUWQjBqPlEFY6JRTfIX4U/nfOaAfk7PwvqtNj2iHAWCS2cfje11qBCf6Igjbeo\nosGMuQiVYSVTaIQNXdxXHilHunthaSL3C/NiTiOJ77BYmfzQGV9v5kdM2TN3sExl\nRsjlYJfww6vhFjzlygYfLA==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@loremaster-287f0.iam.gserviceaccount.com",
  client_id: "109516175141445698592",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40loremaster-287f0.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createAdminUser() {
  try {
    console.log('🎮 Creating admin user for Lore Master...');
    
    // Create user in Firebase Auth
    console.log('📝 Creating Firebase Auth user...');
    const userRecord = await admin.auth().createUser({
      email: 'admin@loremaster.com',
      password: 'admin123',
      displayName: 'Admin User'
    });
    
    console.log('✅ Firebase Auth user created:', userRecord.uid);

    // Add user document to Firestore with admin role
    console.log('📄 Adding user document to Firestore...');
    await db.collection('users').doc(userRecord.uid).set({
      email: 'admin@loremaster.com',
      username: 'Admin',
      role: 'super_admin',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      permissions: [
        {
          resource: 'topics',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          resource: 'questions',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          resource: 'users',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          resource: 'analytics',
          actions: ['read']
        }
      ]
    });

    console.log('✅ Admin user document created in Firestore');
    console.log('');
    console.log('🎉 Admin user setup complete!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('   Email: admin@loremaster.com');
    console.log('   Password: admin123');
    console.log('   Role: super_admin');
    console.log('');
    console.log('🚀 You can now login to the admin dashboard!');
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  User already exists in Firebase Auth');
      
      // Try to get the existing user and update Firestore
      const userRecord = await admin.auth().getUserByEmail('admin@loremaster.com');
      
      console.log('📄 Updating Firestore document for existing user...');
      await db.collection('users').doc(userRecord.uid).set({
        email: 'admin@loremaster.com',
        username: 'Admin',
        role: 'super_admin',
        isActive: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        permissions: [
          {
            resource: 'topics',
            actions: ['create', 'read', 'update', 'delete']
          },
          {
            resource: 'questions',
            actions: ['create', 'read', 'update', 'delete']
          },
          {
            resource: 'users',
            actions: ['create', 'read', 'update', 'delete']
          },
          {
            resource: 'analytics',
            actions: ['read']
          }
        ]
      }, { merge: true });
      
      console.log('✅ Existing user updated with admin role');
      console.log('🚀 You can now login to the admin dashboard!');
      
    } else {
      console.error('❌ Error creating admin user:', error);
      process.exit(1);
    }
  }
}

createAdminUser();
