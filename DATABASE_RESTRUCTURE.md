# Database Structure Update: Topics → SubTopics → Levels

## Overview

The Lore Master database has been restructured to support a hierarchical organization as requested:

**Previous Structure:**
```
Topics → Levels → Questions
```

**New Structure:**
```
Topics → SubTopics → Levels → Questions
```

## Example: Anime Topic Structure

```
1. Anime (Topic)
   ├── Naruto (SubTopic)
   │   ├── Genin Level (Level 1)
   │   ├── Chunin Level (Level 2)
   │   └── Jonin Level (Level 3)
   ├── One Piece (SubTopic)
   │   ├── East Blue Arc (Level 1)
   │   ├── Grand Line Arc (Level 2)
   │   └── New World Arc (Level 3)
   └── Attack on Titan (SubTopic)
       ├── Wall Maria Arc (Level 1)
       ├── Clash of Titans Arc (Level 2)
       └── Final Season Arc (Level 3)
```

## Updated Collections

### 1. Topics Collection
```typescript
interface Topic {
  id: string;
  name: string;                    // e.g., "Anime"
  description?: string;
  icon_url?: string;
  color?: string;
  order: number;
  isActive: boolean;
  totalSubtopics: number;         // Auto-calculated
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;          // Total minutes for all subtopics
  tags: string[];
  requirements?: string[];         // Prerequisite topic IDs
  created_at: Date;
  updated_at: Date;
}
```

### 2. SubTopics Collection (NEW)
```typescript
interface SubTopic {
  id: string;
  topic_id: string;               // Reference to parent topic
  name: string;                   // e.g., "Naruto"
  description?: string;
  icon_url?: string;
  color?: string;
  order: number;                  // Order within the topic
  isActive: boolean;
  totalLevels: number;            // Auto-calculated
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;          // Minutes to complete
  tags: string[];
  requirements?: string[];         // Prerequisite subtopic IDs
  created_at: Date;
  updated_at: Date;
}
```

### 3. Levels Collection (UPDATED)
```typescript
interface Level {
  id: string;
  subtopic_id: string;            // Changed from topic_id
  level: number;                  // 1-10
  name?: string;                  // e.g., "Genin Level"
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;          // Minutes to complete
  totalQuestions: number;
  passingScore: number;           // Percentage required to pass
  isActive: boolean;
  requirements?: string[];         // Prerequisite level IDs
  created_at: Date;
  updated_at: Date;
}
```

### 4. Questions Collection (UNCHANGED)
```typescript
interface Question {
  id: string;
  level_id: string;               // No change
  text: string;
  correct_option: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}
```

## Updated API Endpoints

### Topics Endpoints
- `GET /topics` - List all topics
- `GET /topics/:topicId` - Get topic with subtopics
- `POST /topics` - Create topic (admin)
- `PUT /topics/:topicId` - Update topic (admin)
- `DELETE /topics/:topicId` - Delete topic (admin)

### SubTopics Endpoints (NEW)
- `GET /topics/:topicId/subtopics` - List subtopics for a topic
- `GET /subtopics/:subtopicId` - Get specific subtopic
- `POST /subtopics` - Create subtopic (admin)
- `PUT /subtopics/:subtopicId` - Update subtopic (admin)
- `DELETE /subtopics/:subtopicId` - Delete subtopic (admin)

### Game Endpoints (UPDATED)
- `GET /game/topics` - List all topics for game
- `GET /game/topics/:topicId/subtopics` - List subtopics for game
- `GET /game/subtopics/:subtopicId/levels` - List levels for game
- `GET /game/levels/:levelId/questions` - Get questions (unchanged)

### Legacy Support
- `GET /game/topics/:topicId/levels` - Deprecated but supported for backward compatibility

## Mobile App Updates

### Updated ApiService Methods
```typescript
// New methods
async getSubTopics(topicId: string): Promise<SubTopic[]>
async getLevels(subtopicId: string): Promise<Level[]>

// Updated method
async getTopics(): Promise<Topic[]> // Now returns enhanced Topic objects

// Legacy method (deprecated)
async getLevelsByTopic(topicId: string): Promise<Level[]>
```

### Updated Interfaces
The mobile app now includes the full `Topic`, `SubTopic`, and `Level` interfaces with all properties for enhanced UI capabilities.

## Migration Notes

### Database Migration
1. All existing `levels` need their `topic_id` changed to `subtopic_id`
2. New `subtopics` collection needs to be populated
3. Existing `topics` need to be updated with new fields

### Code Migration
1. Any code using `level.topic_id` should use `level.subtopic_id`
2. UI flows should be updated: Topic Selection → SubTopic Selection → Level Selection
3. Navigation logic needs to handle the extra hierarchy level

### Seeding Data
Run the seeding script to populate sample data:
```bash
cd functions/src/scripts
npx ts-node runSeed.ts
```

## Benefits of New Structure

1. **Better Organization**: Topics can now contain multiple subtopics (e.g., Anime → Naruto, One Piece, etc.)
2. **Scalability**: Easy to add new anime series without creating new top-level topics
3. **User Experience**: More intuitive navigation and content discovery
4. **Content Management**: Easier to manage and organize quiz content
5. **Analytics**: Better insights into which subtopics are popular within each topic

## Sample Data Included

The seeding script creates:
- **3 Topics**: Anime, Science, History
- **6 SubTopics**: Naruto, One Piece, Attack on Titan, Physics, Chemistry, Biology
- **3 Levels**: Genin, Chunin, Jonin (for Naruto subtopic)
- **5 Questions**: Sample Naruto questions for Genin level

This provides a complete example of the new hierarchical structure in action.
