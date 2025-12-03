# Dynamic Quiz Generation Implementation

## Overview
Successfully implemented a dynamic quiz generation system that retrieves content from the books2.db SQLite database and uses AI to generate contextual quizzes and personalized insights.

## Changes Made

### 1. Database Service (`src/services/database.js`)
- Created a new database service to interact with books2.db
- Functions implemented:
  - `getDatabase()`: Initialize and return database instance
  - `getRandomChunks(count)`: Get random content chunks for quiz generation
  - `searchContent(query, limit)`: Search database content
  - `getTotalChunks()`: Get total chunk count
  - `getDatabaseStats()`: Get database statistics
- Added asset copying logic to ensure database is available on device

### 2. AI Service Updates (`src/services/ai.js`)
- Added `generateQuizQuestions(numberOfQuestions)`: Generates quiz questions from database content using AI
  - Retrieves random chunks from the database
  - Uses AI model to create contextual MCQs based on textbook content
  - Includes fallback questions based on Chemistry textbook content
  - Validates and parses AI responses
  
- Added `generateQuizInsights(session, contentChunks)`: Generates personalized feedback
  - Analyzes student performance
  - Provides contextual insights based on actual quiz content
  - Includes encouraging, educational feedback
  - Has fallback messages for different performance levels

### 3. Quiz Screen Updates (`src/screens/QuizScreen.js`)
- Modified to generate questions dynamically instead of using hardcoded questions
- Added states:
  - `isGeneratingQuiz`: Track quiz generation status
  - `contentChunks`: Store content used for quiz (for insights)
  - Loading state display during quiz generation
- Updated `handleStartQuiz` to be async and generate questions
- Modified insights generation to use `generateQuizInsights` with content context

### 4. Quiz Components Updates
- **QuizHome.js**: Added `isGenerating` prop to disable buttons during quiz generation
- **QuizSubjectCard.js**: Added `disabled` prop support to prevent multiple quiz generations
- **QuizPlay.js**: No changes needed - works with dynamic questions

### 5. Configuration Updates
- **metro.config.js**: Added 'db' extension to asset extensions for database bundling

## Features Implemented

✅ **Dynamic Quiz Generation**
- Quizzes are generated from actual textbook content stored in books2.db
- Each quiz can have different questions based on random content selection
- AI creates contextual, educational questions

✅ **AI-Powered Insights**
- Personalized feedback based on student performance
- Insights reference actual content from the quiz
- Encouraging and constructive tone
- Fallback messages for reliability

✅ **Content-Based Learning**
- Questions derived from Chemistry textbook (875 chunks)
- Full-text search capability for future enhancements
- Scalable to add more textbooks

✅ **Error Handling**
- Graceful fallbacks when AI generation fails
- Loading states for better UX
- Database initialization with proper asset management

## Database Structure
```
books2.db:
- books table: Stores book metadata
- books_fts table (FTS5): Full-text search virtual table
  - content: Text chunks from textbooks
  - book_id: Reference to books table
  - chunk_index: Position in the book
```

## Dependencies Required
- expo-sqlite (already installed)
- expo-file-system (needs installation)
- expo-asset (already installed)
- llama.rn (already installed)

## To Complete Setup
Run: `npm install expo-file-system`

## Future Enhancements
- Search-based quiz generation (specific topics)
- Difficulty levels
- Adaptive learning based on performance
- Support for multiple subjects/textbooks
- Progress tracking
- Spaced repetition system
