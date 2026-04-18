#!/bin/bash

# Lore Master Backend Local Testing Script

echo "🧪 Starting Lore Master Backend Local Testing..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install --prefix functions

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build --prefix functions

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the compilation errors."
    exit 1
fi

# Start Firebase emulators
echo "🔥 Starting Firebase emulators..."
echo ""
echo "🌐 Local endpoints will be available at:"
echo "  - API: http://localhost:5001/YOUR_PROJECT_ID/us-central1/api"
echo "  - Firestore UI: http://localhost:4000"
echo "  - Auth UI: http://localhost:4000"
echo ""
echo "📝 Test the health endpoint:"
echo "  curl http://localhost:5001/YOUR_PROJECT_ID/us-central1/api/health"
echo ""
echo "🛑 Press Ctrl+C to stop the emulators"
echo ""

firebase emulators:start
