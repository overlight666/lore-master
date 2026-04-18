# Mobile App Updates for Backend Hierarchy Support

## Overview
This document outlines the comprehensive updates made to the mobile app to support the new backend hierarchy: **Topics → SubTopics → Levels → Questions** with question pool system.

## Updated Mobile Components

### 1. ApiService.ts ✅
**Location**: `/mobile/lore-master-qa/src/services/ApiService.ts`

**Changes Made**:
- **Updated Types**: Added `SubTopic` interface and updated `Level` and `Question` interfaces
- **New Endpoint**: Added `getSubTopics(topicId: string)` method
- **Updated Endpoint**: Modified `getLevels()` to accept `subtopicId` instead of `topicId`
- **Enhanced Questions**: Added `getQuestions(levelId: string)` method for direct question fetching

**New Interfaces**:
```typescript
export interface SubTopic {
  id: string;
  topic_id: string;
  name: string;
  order: number;
}

export interface Level {
  id: string;
  subtopic_id: string;  // Changed from topic_id
  level: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Question {
  id: string;
  subtopic_id: string;  // Changed from level_id
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

**New API Methods**:
- `getSubTopics(topicId: string): Promise<SubTopic[]>`
- `getLevels(subtopicId: string): Promise<Level[]>` (updated)
- `getQuestions(levelId: string): Promise<Question[]>`

### 2. GameContext.tsx ✅
**Location**: `/mobile/lore-master-qa/src/store/GameContext.tsx`

**Changes Made**:
- **State Updates**: Added `subtopics` and `currentSubTopic` to game state
- **New Actions**: Added `SET_SUBTOPICS` and `SET_CURRENT_SUBTOPIC` actions
- **New Function**: Added `loadSubTopics(topicId: string)` context function
- **Updated Function**: Modified `loadLevels()` to accept `subtopicId`

**Updated State Interface**:
```typescript
interface GameState {
  // Game data
  topics: Topic[];
  currentTopic: Topic | null;
  subtopics: SubTopic[];      // NEW
  currentSubTopic: SubTopic | null;  // NEW
  levels: Level[];
  currentLevel: Level | null;
  // ... rest of state
}
```

### 3. Screen Components

#### 3.1 SubTopicSelectScreen.tsx ✅ (NEW)
**Location**: `/mobile/lore-master-qa/src/screens/SubTopicSelectScreen.tsx`

**Features**:
- **Hierarchical Navigation**: Displays subtopics for selected topic
- **Visual Design**: Consistent with app's design language
- **Energy Display**: Shows current energy status
- **Loading States**: Proper loading indicators
- **Navigation Flow**: Topics → **SubTopics** → Levels → Quiz

#### 3.2 TopicSelectScreen.tsx ✅ (UPDATED)
**Changes Made**:
- **Navigation Update**: Now navigates to `SubTopicSelect` instead of `LevelSelect`
- **Parameter Updates**: Passes `topicId` and `topicName` to subtopic screen

#### 3.3 LevelSelectScreen.tsx ✅ (UPDATED)
**Changes Made**:
- **Route Parameters**: Now expects `subtopicId`, `subtopicName`, and `topicName`
- **Data Loading**: Uses `subtopicId` to load levels instead of `topicId`
- **Context Update**: Calls `loadLevels(subtopicId)` with new parameter

### 4. Navigation Structure ✅
**Location**: `/mobile/lore-master-qa/App.tsx`

**Changes Made**:
- **Route Addition**: Added `SubTopicSelect` screen to navigation stack
- **Parameter Types**: Updated `RootStackParamList` with new navigation parameters

**Updated Navigation Flow**:
```typescript
export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  TopicSelect: undefined;
  SubTopicSelect: { topicId: string; topicName: string };     // NEW
  LevelSelect: { subtopicId: string; subtopicName: string; topicName: string };  // UPDATED
  Quiz: { levelId: string; levelNumber: number; topicName: string };
  Results: { score: number; totalQuestions: number; timeTaken: number };
  Energy: undefined;
  Store: undefined;
  Leaderboard: { topicId?: string; levelId?: string };
};
```

## Navigation Flow

### Old Flow (2 levels):
```
Topics → Levels → Quiz → Results
```

### New Flow (3 levels):
```
Topics → SubTopics → Levels → Quiz → Results
```

## API Endpoint Mapping

### Mobile App → Backend Integration:
1. **Topics**: `ApiService.getTopics()` → `GET /game/topics`
2. **SubTopics**: `ApiService.getSubTopics(topicId)` → `GET /game/topics/{topicId}/subtopics`
3. **Levels**: `ApiService.getLevels(subtopicId)` → `GET /game/subtopics/{subtopicId}/levels`
4. **Questions**: `ApiService.getQuestions(levelId)` → `GET /game/levels/{levelId}/questions`

## Question Pool Integration

### Random Question Selection:
- **Pool Size**: 50 questions per difficulty per subtopic
- **Selection**: Random 10 questions per quiz attempt
- **Variety**: No duplicate questions within same quiz session
- **Difficulty**: Questions match level difficulty (easy/medium/hard)

## Benefits of New Structure

### 1. Enhanced User Experience:
- **Better Organization**: Logical progression through topic hierarchy
- **More Content**: Expanded question variety with pools
- **Improved Navigation**: Clear breadcrumb-style progression

### 2. Scalability:
- **Easy Expansion**: Add new subtopics and levels without structural changes
- **Content Management**: Organized question pools for better content curation
- **Difficulty Progression**: Clear easy → medium → hard progression within subtopics

### 3. Technical Improvements:
- **Type Safety**: Improved TypeScript interfaces for better development experience
- **API Consistency**: RESTful endpoints following hierarchical structure
- **State Management**: Clean separation of concerns in context

## Testing

### Manual Testing Checklist:
- [ ] Topics load correctly on TopicSelectScreen
- [ ] SubTopics load when topic is selected
- [ ] Levels load when subtopic is selected
- [ ] Questions are random and match difficulty
- [ ] Navigation back button works at each level
- [ ] Energy system integration works
- [ ] Loading states display properly

### API Integration Testing:
- [ ] All endpoints return proper hierarchical data
- [ ] Question randomization works (different questions on multiple requests)
- [ ] Error handling for missing data
- [ ] Authentication integration works

## Future Enhancements

### Potential Improvements:
1. **Progress Tracking**: Track completion across the hierarchy
2. **Adaptive Difficulty**: Adjust question selection based on performance
3. **Social Features**: Leaderboards per subtopic and level
4. **Offline Mode**: Cache questions for offline play
5. **Personalization**: Recommend subtopics based on interests

## Migration Notes

### For Existing Users:
- **Data Migration**: Existing level-based progress can be mapped to new structure
- **Backward Compatibility**: Old API endpoints can be maintained temporarily
- **Gradual Rollout**: Feature can be rolled out progressively

### Development Team:
- **Testing**: Comprehensive testing of new navigation flow required
- **Documentation**: Update user guides to reflect new hierarchy
- **Analytics**: Track user behavior through new navigation structure

## Conclusion

The mobile app has been successfully updated to support the new backend hierarchy structure. This provides a much more organized and scalable foundation for the quiz game, with better user experience and enhanced content management capabilities.

The implementation maintains consistency with the existing design language while introducing the necessary structural changes to support the Topics → SubTopics → Levels → Questions flow with randomized question pools.
