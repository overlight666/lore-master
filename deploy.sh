#!/bin/bash

# Lore Master Backend Deployment Script

echo "🚀 Starting Lore Master Backend Deployment..."

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

# Install dependencies
echo "📦 Installing dependencies..."
npm install --prefix functions

# Run linting
echo "🔍 Running linter..."
npm run lint --prefix functions

if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix the errors before deploying."
    exit 1
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build --prefix functions

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the compilation errors."
    exit 1
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your Lore Master Backend API is now live!"
    echo ""
    echo "📡 Available endpoints:"
    echo "  - Health Check: GET /health"
    echo "  - Authentication: POST /auth/signup, POST /auth/login"
    echo "  - Game Data: GET /game/topics, GET /game/topics/:topicId/levels"
    echo "  - Quiz System: POST /quiz/submit, GET /quiz/attempts/:userId"
    echo "  - Energy: GET /energy/status, POST /energy/watch-ad"
    echo "  - Leaderboards: GET /leaderboard/:topicId/:levelId"
    echo "  - Store: POST /store/purchase, GET /store/lifelines/:userId"
    echo "  - AI Hints: POST /ai/hint"
    echo ""
    echo "📚 See README.md for detailed API documentation"
else
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi
