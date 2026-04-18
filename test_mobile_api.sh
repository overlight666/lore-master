#!/bin/bash

echo "🔧 Testing Mobile API Integration with Updated Backend..."

# Test Topics endpoint
echo "📋 Testing Topics endpoint..."
curl -X GET "http://127.0.0.1:4000/game/topics" \
  -H "Content-Type: application/json" \
  --silent | jq '.'

# Test SubTopics endpoint (using a topic ID from topics response)
echo -e "\n📋 Testing SubTopics endpoint for topic 'anime'..."
curl -X GET "http://127.0.0.1:4000/game/topics/anime/subtopics" \
  -H "Content-Type: application/json" \
  --silent | jq '.'

# Test Levels endpoint (using a subtopic ID)
echo -e "\n📋 Testing Levels endpoint for subtopic 'anime_characters'..."
curl -X GET "http://127.0.0.1:4000/game/subtopics/anime_characters/levels" \
  -H "Content-Type: application/json" \
  --silent | jq '.'

# Test Questions endpoint (using a level ID)
echo -e "\n📋 Testing Questions endpoint for level 'anime_characters_easy'..."
curl -X GET "http://127.0.0.1:4000/game/levels/anime_characters_easy/questions" \
  -H "Content-Type: application/json" \
  --silent | jq '.'

echo -e "\n✅ Mobile API Integration Test Complete!"
echo "🔍 Check above outputs for proper hierarchical structure:"
echo "   - Topics should include anime, tv_shows, etc."
echo "   - SubTopics should be ordered within each topic"
echo "   - Levels should have easy/medium/hard difficulties"
echo "   - Questions should be randomized from the pool (10 per request)"
