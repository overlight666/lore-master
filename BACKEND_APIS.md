# Lore Master Backend API Documentation

This document provides a comprehensive guide to all backend API endpoints for the Lore Master quiz system, including usage instructions, sample payloads, and responses. For quiz content structure, see `COMPREHENSIVE_STRUCTURE.md`.

---

## API Endpoints Overview

### Topics & Subtopics
- `GET /topics`
  - **Description:** Retrieve all 20 major topics.
  - **Sample Response:**
    ```json
    [
      { "id": "anime", "name": "Anime", "icon": "🎌" },
      { "id": "tv-shows", "name": "TV Shows", "icon": "📺" },
      // ...18 more
    ]
    ```

- `GET /topics/:id/subtopics`
  - **Description:** Get 10 subtopics for a given topic.
  - **Sample Response:**
    ```json
    [
      { "id": "naruto", "name": "Naruto", "description": "The ninja saga..." },
      // ...9 more
    ]
    ```

### Levels & Questions
- `GET /subtopics/:id/levels`
  - **Description:** List 10 levels for a subtopic, with difficulty info.
  - **Sample Response:**
    ```json
    [
      { "id": "level1", "difficulty": "Beginner" },
      // ...9 more
    ]
    ```

- `GET /levels/:id/questions`
  - **Description:** Get 20 questions for a level (10 used per quiz).
  - **Sample Response:**
    ```json
    [
      { "id": "q1", "question": "Who is the main character in Naruto?", "choices": ["Naruto", "Sasuke", "Sakura"], "answer": "Naruto" },
      // ...19 more
    ]
    ```

### Quiz Mechanics
- `POST /quiz/start`
  - **Description:** Start a quiz for a given level.
  - **Payload:**
    ```json
    { "levelId": "level1", "userId": "abc123" }
    ```
  - **Sample Response:**
    ```json
    { "quizId": "xyz789", "questions": [ /* 10 questions */ ] }
    ```

- `POST /quiz/submit`
  - **Description:** Submit answers for a quiz.
  - **Payload:**
    ```json
    { "quizId": "xyz789", "answers": ["Naruto", "Leaf", ...] }
    ```
  - **Sample Response:**
    ```json
    { "score": 8, "passed": true, "unlockedLevel": "level2" }
    ```

### User Progress & Energy
- `GET /user/:id/progress`
  - **Description:** Get user's progress across topics, subtopics, and levels.
  - **Sample Response:**
    ```json
    { "anime": { "naruto": { "level": 3, "score": 24 } }, ... }
    ```

- `GET /user/:id/energy`
  - **Description:** Get current energy (lives/attempts).
  - **Sample Response:**
    ```json
    { "energy": 5, "maxEnergy": 10, "nextRefill": "2025-08-05T12:00:00Z" }
    ```

- `POST /user/:id/energy/use`
  - **Description:** Consume energy for a quiz attempt.
  - **Payload:**
    ```json
    { "amount": 1 }
    ```
  - **Sample Response:**
    ```json
    { "energy": 4 }
    ```

### Store & Rewards
- `GET /store/items`
  - **Description:** List available store items (power-ups, refills, etc).
  - **Sample Response:**
    ```json
    [
      { "id": "energy-refill", "name": "Energy Refill", "cost": 100 },
      // ...more items
    ]
    ```

- `POST /store/purchase`
  - **Description:** Purchase an item.
  - **Payload:** 
    ```json
    { "userId": "abc123", "itemId": "energy-refill" }
    ```
  - **Sample Response:**
    ```json
    { "success": true, "energy": 10 }
    ```

### Leaderboard
- `GET /leaderboard`
  - **Description:** Get top users by score.
  - **Sample Response:**
    ```json
    [
      { "userId": "abc123", "username": "QuizMaster", "score": 1200 },
      // ...more users
    ]
    ```

### Authentication
- `POST /auth/register`
  - **Description:** Register a new user.
  - **Payload:**
    ```json
    { "username": "newuser", "email": "user@email.com", "password": "secret" }
    ```
  - **Sample Response:**
    ```json
    { "userId": "abc123", "token": "jwt-token" }
    ```

- `POST /auth/login`
  - **Description:** Login and receive JWT token.
  - **Payload:**
    ```json
    { "email": "user@email.com", "password": "secret" }
    ```
  - **Sample Response:**
    ```json
    { "userId": "abc123", "token": "jwt-token" }
    ```

---

## Usage Guide

- All endpoints return JSON.
- Auth endpoints return JWT token for authenticated requests.
- Quiz endpoints require energy; energy refills over time or via store.
- Progression: Pass a level (≥70%) to unlock the next.
- Leaderboard ranks users by cumulative score.
- Store allows purchase of power-ups and energy refills.

---

## Error Handling

- Standard error response:
  ```json
  { "error": "Invalid request", "details": "Missing field: email" }
  ```
- Auth errors:
  ```json
  { "error": "Unauthorized", "details": "Invalid token" }
  ```
- Quiz errors:
  ```json
  { "error": "Quiz not found" }
  ```

---

## See Also
- Quiz content structure: `COMPREHENSIVE_STRUCTURE.md`
- For more details, see backend route files in `/functions/src/routes/`
