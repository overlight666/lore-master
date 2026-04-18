const admin = require('firebase-admin');

// Use the exported users data to avoid authentication issues
const usersData = {
  "users": [
    {
      "localId": "BPMy6HeaEPgeYMQzMSyrYChTf3E3",
      "email": "admin@loremaster.com",
      "emailVerified": false,
      "displayName": "Admin",
      "customAttributes": "{\"admin\":true}",
      "createdAt": "1754405307519"
    }
  ]
};

console.log('🎉 Admin user already has custom claims!');
console.log('User ID:', usersData.users[0].localId);
console.log('Email:', usersData.users[0].email);
console.log('Custom Attributes:', usersData.users[0].customAttributes);
console.log('');
console.log('✅ Setup is complete! The admin user has:');
console.log('- UID: BPMy6HeaEPgeYMQzMSyrYChTf3E3');
console.log('- Email: admin@loremaster.com');
console.log('- Custom claims: {"admin": true}');
console.log('');
console.log('🔄 Next steps:');
console.log('1. Sign out of admin@loremaster.com in your browser');
console.log('2. Sign back in to get a fresh token');
console.log('3. Go to dashboard and click "Debug Auth" button');
console.log('4. Check console - you should see admin: true in the token');
console.log('');
console.log('🧪 To test immediately:');
console.log('- Go to http://localhost:3000/dashboard');
console.log('- Click the red "Debug Auth" button');
console.log('- Check browser console for token details');
console.log('');
console.log('If API calls still fail, the issue might be:');
console.log('- Token not refreshed (sign out/in again)');
console.log('- Backend middleware not recognizing claims');
console.log('- Network/CORS issues');
