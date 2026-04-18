# 🧙‍♂️ Lore Master Mobile

A React Native/Expo mobile application for the Lore Master quiz game. Built with TypeScript, Firebase Authentication, and modern React patterns.

## 🚀 Features

- **🔐 Authentication**: Complete signup/login flow with Firebase
- **📱 Cross-platform**: Runs on iOS, Android, and Web
- **🎨 Beautiful UI**: Dark theme with gradient designs
- **⚡ TypeScript**: Full type safety throughout the app
- **🔄 State Management**: React Context for auth and game state
- **🌐 API Ready**: Integrated with backend Firebase Functions
- **📊 Real-time**: Ready for live data and leaderboards

## 📁 Project Structure

```
src/
├── config/
│   ├── firebaseConfig.ts     # Firebase initialization
│   └── GameConfig.ts         # App-wide configuration
├── contexts/
│   ├── AuthContext.tsx       # Authentication state
│   └── GameContext.tsx       # Game state management
├── navigation/
│   └── RootNavigator.tsx     # Navigation setup
├── screens/
│   ├── auth/                 # Authentication screens
│   │   ├── WelcomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── SignupScreen.tsx
│   ├── main/                 # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── TopicsScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── common/
│       └── LoadingScreen.tsx
├── services/
│   ├── AuthService.ts        # Firebase auth service
│   └── ApiService.ts         # Backend API service
└── types/
    └── index.ts              # TypeScript definitions
```

## 🛠️ Tech Stack

- **Framework**: Expo SDK 53 with React Native
- **Language**: TypeScript
- **Authentication**: Firebase Auth v9
- **Navigation**: React Navigation v6
- **State Management**: React Context + Hooks
- **Styling**: React Native StyleSheet
- **HTTP Client**: Axios
- **Storage**: AsyncStorage

## 📦 Dependencies

### Core
- `expo` - Expo framework
- `react` & `react-native` - React Native framework
- `typescript` - Type safety

### Navigation
- `@react-navigation/native` - Navigation library
- `@react-navigation/stack` - Stack navigator
- `react-native-screens` - Native screen optimization
- `react-native-safe-area-context` - Safe area handling

### Firebase
- `firebase` - Firebase SDK v9

### UI/UX
- `expo-linear-gradient` - Gradient components
- `@expo/vector-icons` - Icon library
- `expo-haptics` - Haptic feedback
- `expo-status-bar` - Status bar control

### Storage & HTTP
- `@react-native-async-storage/async-storage` - Local storage
- `axios` - HTTP client

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18 or later)
2. **npm** or **yarn**
3. **Expo CLI**: `npm install -g @expo/cli`
4. **Expo Go app** on your phone (for testing)

### Installation

1. **Navigate to the mobile app directory**:
   ```bash
   cd mobile/lore-master-mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Test on device**:
   - Install Expo Go on your phone
   - Scan the QR code from the terminal
   - The app will load on your device

### Running on Simulators

**iOS Simulator** (macOS only):
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

**Web Browser**:
```bash
npm run web
```

## 🔧 Configuration

### Firebase Setup

1. **Create a Firebase project** at https://console.firebase.google.com
2. **Enable Authentication** with Email/Password provider
3. **Add your web app** and copy the config
4. **Update** `src/config/firebaseConfig.ts` with your credentials:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

### Backend API

Update the API base URL in `src/config/GameConfig.ts`:

```typescript
const GAME_CONFIG = {
  API: {
    BASE_URL: 'https://your-backend-url.com',
    // ...
  },
  // ...
};
```

## 📱 Screens Overview

### 🔐 Authentication Flow

1. **Welcome Screen**: Beautiful onboarding with call-to-action buttons
2. **Login Screen**: Email/password login with validation
3. **Signup Screen**: Registration with password confirmation

### 🏠 Main App Flow

1. **Home Screen**: Dashboard with user greeting and quick actions
2. **Topics Screen**: Browse available quiz topics
3. **Profile Screen**: User profile and settings

### 🔄 Navigation Flow

```
Welcome Screen
├── Login Screen → Home Screen
└── Signup Screen → Home Screen

Home Screen
├── Topics Screen
└── Profile Screen
```

## 🎨 Design System

### Colors
- **Primary**: `#6366F1` (Indigo)
- **Secondary**: `#8B5CF6` (Purple)
- **Background**: `#0F172A` (Dark slate)
- **Text**: `#F8FAFC` (Light)

### Typography
- **Small**: 12px
- **Medium**: 14px
- **Large**: 16px
- **XL**: 18px
- **XXL**: 20px
- **XXXL**: 24px

### Spacing
- **XS**: 4px, **SM**: 8px, **MD**: 16px
- **LG**: 24px, **XL**: 32px, **XXL**: 48px

## 🔒 Authentication

The app uses Firebase Authentication with the following features:

- **Email/Password** signup and login
- **Persistent sessions** with AsyncStorage
- **Automatic token refresh**
- **Error handling** with user-friendly messages
- **Loading states** during auth operations

### Auth Context Usage

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  return user ? <AuthenticatedView /> : <LoginView />;
}
```

## 🌐 API Integration

The app is ready to integrate with the backend Firebase Functions:

### Available Services

- **Game Data**: Topics, levels, questions
- **Quiz System**: Submit answers, get results
- **Energy System**: Track energy, watch ads
- **Leaderboards**: Competition data
- **Store**: Purchase lifelines and power-ups
- **AI Hints**: Get smart hints for questions

### Usage Example

```typescript
import ApiService from '../services/ApiService';

// Get topics
const topics = await ApiService.getTopics();

// Submit quiz
const result = await ApiService.submitQuiz({
  level_id: 'level123',
  answers: [{ question_id: 'q1', selected_option: 'A' }],
  time_taken: 120,
  used_5050: false,
  used_ai_hint: false
});
```

## 🚧 Next Steps

### Phase 1: Complete Core Screens
- [ ] Implement LevelsScreen with real data
- [ ] Build QuizScreen with questions and timer
- [ ] Create ResultsScreen with score display
- [ ] Add LeaderboardScreen with rankings

### Phase 2: Game Features
- [ ] Integrate energy system
- [ ] Add lifelines (50/50, AI hints)
- [ ] Implement store functionality
- [ ] Add sound effects and animations

### Phase 3: Advanced Features
- [ ] Push notifications
- [ ] Offline mode support
- [ ] Social sharing
- [ ] Achievement system

## 🐛 Troubleshooting

### Common Issues

**Metro bundler cache issues**:
```bash
npx expo start --clear
```

**TypeScript errors**:
```bash
npm run type-check
```

**Navigation issues**:
- Check that all screen imports are correct
- Verify navigation param types match

**Firebase auth errors**:
- Ensure Firebase config is correct
- Check that Email/Password auth is enabled

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Firebase v9 Guide](https://firebase.google.com/docs/web/modular-upgrade)
- [React Native TypeScript](https://reactnative.dev/docs/typescript)

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Add proper error handling
4. Test on both iOS and Android
5. Update documentation for new features

---

**Built with ❤️ for the Lore Master quest!** 🧙‍♂️✨
