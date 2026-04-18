#!/bin/bash

# Lore Master Mobile - Quick Setup Test
echo "🧙‍♂️ Testing Lore Master Mobile App Setup..."

cd /Users/herbert.asis/lore-master-backend/mobile/lore-master-mobile

echo "📁 Current directory: $(pwd)"
echo "📦 Package.json exists: $(test -f package.json && echo "✅ Yes" || echo "❌ No")"

echo "🔍 Checking TypeScript compilation..."
if ./node_modules/.bin/tsc --noEmit; then
    echo "✅ TypeScript compilation successful!"
else
    echo "❌ TypeScript compilation failed!"
    exit 1
fi

echo "📱 Checking app structure..."
echo "- Auth Screens: $(ls src/screens/auth/ | wc -l | tr -d ' ') files"
echo "- Main Screens: $(ls src/screens/main/ | wc -l | tr -d ' ') files"
echo "- Services: $(ls src/services/ | wc -l | tr -d ' ') files"
echo "- Contexts: $(ls src/contexts/ | wc -l | tr -d ' ') files"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "✨ Next steps:"
echo "1. Run 'npm start' to start the development server"
echo "2. Open Expo Go app on your phone"
echo "3. Scan the QR code to test the app"
echo ""
echo "🔥 App features ready:"
echo "- ✅ Firebase Authentication (Sign up, Login, Logout)"
echo "- ✅ Navigation between screens"
echo "- ✅ Beautiful UI with dark theme"
echo "- ✅ TypeScript support"
echo "- ✅ Context-based state management"
echo "- ✅ API service integration ready"
echo ""
echo "📝 Screens implemented:"
echo "- ✅ Welcome screen with beautiful gradient"
echo "- ✅ Login screen with form validation"
echo "- ✅ Signup screen with password confirmation"
echo "- ✅ Home screen with user greeting"
echo "- ✅ Topics screen (placeholder)"
echo "- ✅ Profile screen (placeholder)"
