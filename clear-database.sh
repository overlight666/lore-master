#!/bin/bash

# Lore Master Database Clear Script

echo "🗑️ Starting Lore Master Database Clear..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if we're logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Warning prompt
echo "⚠️  WARNING: This will delete ALL data in your Firestore database!"
echo "This action cannot be undone."
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "❌ Operation cancelled."
    exit 0
fi

# Install firebase-admin if not already installed
echo "📦 Checking dependencies..."
if ! node -e "require('firebase-admin')" 2>/dev/null; then
    echo "Installing firebase-admin..."
    npm install firebase-admin
fi

# Check if service account key exists
SERVICE_ACCOUNT_KEY="loremaster-287f0-firebase-adminsdk-fbsvc-a010b53c8c.json"
if [ ! -f "$SERVICE_ACCOUNT_KEY" ]; then
    echo "❌ Service account key file not found: $SERVICE_ACCOUNT_KEY"
    echo "Please place your Firebase service account JSON file in the project root."
    exit 1
fi

# Run the clear script
echo "🗑️ Clearing all Firestore collections..."
node scripts/clearFirestore.js

if [ $? -eq 0 ]; then
    echo "✅ Database cleared successfully!"
    echo ""
    echo "🧹 All Firestore collections and documents have been deleted."
    echo "Your database is now empty and ready for fresh data."
else
    echo "❌ Database clear failed. Check the errors above."
    exit 1
fi
