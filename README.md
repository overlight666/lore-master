# Lore Master Backend API

A comprehensive REST API for the Lore Master quiz game, built with Firebase Functions, Express.js, and Firestore.

## 🚀 Features

- **User Authentication**: JWT-based auth with signup/login
- **Quiz System**: Topic-based levels with 10 questions each
- **Energy Management**: Daily energy limits with regeneration and ad rewards
- **Lifelines**: 50/50 and Call a Friend mechanics
- **Leaderboards**: Score and time-based rankings per level
- **Store System**: In-app purchases for energy and lifelines
- **Real-time Data**: Firestore integration for live updates

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - User login

### Game Data
- `GET /game/topics` - List all quiz topics
- `GET /game/topics/:topicId/levels` - Get levels for a topic
- `GET /game/levels/:levelId/questions` - Get questions for a level

### Quiz System
- `POST /quiz/submit` - Submit quiz answers and get results
- `GET /quiz/attempts/:userId` - Get user's quiz attempt history

### Energy System
- `GET /energy/status` - Get current energy and ad status
- `POST /energy/watch-ad` - Watch ad to gain energy

### Leaderboards
- `GET /leaderboard/:topicId/:levelId` - Get leaderboard for specific level

### Store System
- `GET /store/lifelines/:userId` - Get user's lifeline inventory
- `POST /store/purchase` - Purchase items from store
- `GET /store/purchases/:userId` - Get user's purchase history

## 🔒 Authentication

All endpoints except `/auth/*` and `/health` require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## 📊 Game Rules

- **Energy**: 6 max daily energy, regenerates 1 every 4 hours
- **Ads**: Up to 5 ads per day for bonus energy
- **Scoring**: 80% required to pass, 100% = no energy consumed
- **Lifelines**: 1× 50/50 and 1× Call a Friend per quiz
- **Questions**: 10 per level, 90 seconds each
- **Leaderboards**: Ranked by score then time

## 🛠️ Setup

1. Install dependencies:
```bash
npm install --prefix functions
```

2. Set environment variables:
```bash
# Set JWT secret (recommended)
firebase functions:config:set jwt.secret="your-secure-secret-key"
```

3. Deploy:
```bash
firebase deploy --only functions
```

## 🗃️ Database Schema

The API uses Firestore with the following collections:

- `users` - User accounts and energy status
- `topics` - Quiz categories (Anime, Games, etc.)
- `levels` - Difficulty levels per topic
- `questions` - Quiz questions with answers
- `quiz_attempts` - User quiz submission records
- `user_answers` - Individual answer records
- `ads_watched` - Ad viewing tracking
- `user_lifelines` - Lifeline inventory
- `purchases` - Store transaction history

## 📝 Sample Requests

### User Signup
```bash
curl -X POST https://your-region-your-project.cloudfunctions.net/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@example.com",
    "password": "securepass123",
    "username": "GameMaster"
  }'
```

### Submit Quiz
```bash
curl -X POST https://your-region-your-project.cloudfunctions.net/api/quiz/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "level_id": "level-uuid",
    "answers": [
      {"question_id": "q1", "selected_option": "A"},
      {"question_id": "q2", "selected_option": "B"}
    ],
    "time_taken": 120,
    "used_5050": false,
    "used_ai_hint": true
  }'
```

## 🔧 Development

### Local Testing
```bash
# Start Firebase emulators
firebase emulators:start

# Test locally
curl http://localhost:5001/your-project/us-central1/api/health
```

### Building
```bash
npm run build --prefix functions
```

### Linting
```bash
npm run lint --prefix functions
```

## 📈 Monitoring

- Check function logs: `firebase functions:log`
- Monitor performance in Firebase Console
- Set up alerts for errors and performance issues

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
# lore-master
