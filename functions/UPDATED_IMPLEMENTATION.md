# Updated Quiz Backend Implementation

## Overview
The backend has been updated to properly support a hierarchical quiz structure with a question pool system that eliminates mock data and provides dynamic question selection.

## New Structure

### 1. Hierarchy
```
Topics → SubTopics → Levels (1-10) → Question Pool
```

**Topics**: Main categories (Anime, Movies, TV Shows, etc.)
- Each topic contains multiple subtopics
- Example: "Anime" topic contains "Naruto", "One Piece", etc.

**SubTopics**: Specific subjects within topics
- Each subtopic has 10 levels (difficulty progression)
- Example: "Naruto" subtopic has levels 1-10

**Levels**: Difficulty progression within subtopics
- Level 1-3: Easy difficulty
- Level 4-7: Medium difficulty  
- Level 8-10: Hard difficulty
- Each level pulls 10 random questions from the appropriate difficulty pool

**Question Pool**: Repository of questions per subtopic per difficulty
- 50 questions per difficulty level per subtopic
- Questions are tagged with subtopic_id and difficulty
- Random selection ensures variety in each quiz attempt

### 2. Database Schema

#### Updated Question Model
```typescript
interface Question {
  id: string;
  subtopic_id: string;      // Links to subtopic (replaces level_id)
  difficulty: 'easy' | 'medium' | 'hard';  // Question difficulty
  text: string;
  correct_option: string;   // Hidden from users
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  tags?: string[];          // For categorization
  created_at?: Date;
  updated_at?: Date;
}
```

#### Other Models (Topic, SubTopic, Level)
- Remain the same but now properly connected
- Topics contain subtopics
- SubTopics contain levels
- Levels reference difficulty for question pool selection

### 3. API Endpoints

#### Game Endpoints
```
GET /game/topics
- Returns all active topics

GET /game/topics/:topicId/subtopics  
- Returns subtopics for a topic

GET /game/subtopics/:subtopicId/levels
- Returns levels 1-10 for a subtopic

GET /game/levels/:levelId/questions
- Returns 10 random questions from appropriate difficulty pool
- Level 1-3: easy questions
- Level 4-7: medium questions  
- Level 8-10: hard questions

GET /game/subtopics/:subtopicId/questions/pool
- Returns question pool statistics for a subtopic
```

#### Quiz Endpoints
```
POST /quiz/submit
- Updated to validate questions by ID instead of level_id
- Ensures all questions are from same subtopic and difficulty

GET /quiz/attempts/:userId
- Returns user's quiz attempt history
```

### 4. Question Pool System

#### How It Works
1. **Seeding**: For each subtopic, generate 50 questions per difficulty (150 total per subtopic)
2. **Storage**: Questions stored with `subtopic_id` and `difficulty` tags
3. **Selection**: When a level is accessed, randomly select 10 questions matching the level's difficulty
4. **Variety**: Each quiz attempt gets different questions from the pool

#### Benefits
- **No Mock Data**: All questions are real and contextualized
- **Variety**: Players get different questions each time
- **Scalability**: Easy to add more questions to any pool
- **Balanced Difficulty**: Proper progression from easy to hard

### 5. Implementation Files

#### Updated Files
- `models/types.ts`: Updated Question interface
- `routes/game.ts`: New question selection logic with pool system
- `routes/quiz.ts`: Updated validation for new question structure
- `config/firebase.ts`: Updated game constants
- `scripts/seedComprehensivePart1.ts`: New seeder with question pools
- `scripts/seedComprehensivePart2.ts`: New seeder with question pools

#### New Files
- `scripts/testNewStructure.ts`: Test script to verify implementation
- `scripts/runUpdatedSeeder.ts`: Script to run updated seeder

### 6. Usage Examples

#### Frontend Integration
```typescript
// Get topics
const topics = await fetch('/api/game/topics');

// Get subtopics for a topic
const subtopics = await fetch(`/api/game/topics/${topicId}/subtopics`);

// Get levels for a subtopic  
const levels = await fetch(`/api/game/subtopics/${subtopicId}/levels`);

// Get random questions for a level (10 questions from appropriate difficulty pool)
const quiz = await fetch(`/api/game/levels/${levelId}/questions`);
```

#### Example Response for Questions
```json
{
  "level_id": "level123",
  "level_number": 5,
  "difficulty": "medium", 
  "subtopic_name": "Naruto",
  "total_pool_size": 50,
  "questions": [
    {
      "id": "q1",
      "text": "What is Naruto's favorite food?",
      "option_a": "Ramen",
      "option_b": "Sushi", 
      "option_c": "Rice",
      "option_d": "Noodles"
    }
    // ... 9 more random questions
  ]
}
```

### 7. Deployment Steps

1. **Run Updated Seeder**:
   ```bash
   npm run seed:updated
   ```

2. **Test Structure**:
   ```bash
   npm run test:structure
   ```

3. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```

4. **Update Mobile App**:
   - Update API calls to use new endpoint structure
   - Remove any hardcoded mock data
   - Test topic → subtopic → level → quiz flow

### 8. Benefits for Mobile App

- **Proper Navigation**: Clear hierarchy for UI navigation
- **Dynamic Content**: No more static/mock questions
- **Scalable**: Easy to add new topics/subtopics
- **Engaging**: Different questions each time increases replay value
- **Performance**: Efficient random selection from pre-generated pools
- **Difficulty Progression**: Clear easy → medium → hard progression

This implementation provides a robust, scalable quiz system that properly supports the topic → subtopic → level hierarchy with dynamic question pools for maximum variety and engagement.
