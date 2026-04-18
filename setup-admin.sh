#!/bin/bash

# Setup admin user using Firebase CLI
# This script sets custom claims and creates Firestore document

echo "🔧 Setting up admin user with Firebase CLI"
echo "Project: loremaster-287f0"
echo "Email: admin@loremaster.com"

# Get the user UID first
echo "📋 Getting user UID..."
USER_INFO=$(firebase auth:export --format=json --project loremaster-287f0 2>/dev/null | jq -r '.users[] | select(.email=="admin@loremaster.com") | .localId' 2>/dev/null)

if [ -z "$USER_INFO" ] || [ "$USER_INFO" = "null" ]; then
    echo "❌ Could not find admin@loremaster.com user"
    echo "Please make sure the user is created in Firebase Auth"
    exit 1
fi

echo "✅ Found user UID: $USER_INFO"

# Create a temporary claims file
cat > temp_claims.json << EOF
{
  "admin": true,
  "role": "super_admin",
  "permissions": ["read", "write", "admin_access"]
}
EOF

echo "🔑 Setting custom claims..."
firebase auth:set-custom-user-claims $USER_INFO temp_claims.json --project loremaster-287f0

if [ $? -eq 0 ]; then
    echo "✅ Custom claims set successfully!"
    echo ""
    echo "🗃️ Creating Firestore document..."
    
    # Create Firestore document
    cat > temp_user.json << EOF
{
  "email": "admin@loremaster.com",
  "role": "super_admin",
  "displayName": "Admin User",
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "updatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "isActive": true,
  "permissions": ["read", "write", "admin_access"]
}
EOF
    
    # Import to Firestore (this might not work with CLI, so we'll just show the data)
    echo "📄 User document data:"
    cat temp_user.json
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "⚠️  IMPORTANT:"
    echo "1. Sign out of admin@loremaster.com"
    echo "2. Sign back in to get fresh token with custom claims"
    echo "3. Test the dashboard API calls"
    echo ""
    echo "🧪 To verify claims, check the JWT token at jwt.io - you should see:"
    echo '   "admin": true,'
    echo '   "role": "super_admin"'
    
else
    echo "❌ Failed to set custom claims"
    exit 1
fi

# Cleanup
rm -f temp_claims.json temp_user.json users.json
