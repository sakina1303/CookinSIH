# Quiz Generation Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Clicks Subject
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      QuizScreen.js                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ handleStartQuiz()                                          │  │
│  │ - Sets loading state                                       │  │
│  │ - Calls generateQuizQuestions(10)                         │  │
│  │ - Gets content chunks for insights                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                │                            │
                ▼                            ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   Database Service       │    │     AI Service          │
│   (database.js)          │    │     (ai.js)             │
│                          │    │                         │
│ • getDatabase()          │◄───│ • generateQuizQuestions()│
│ • getRandomChunks(n)     │    │ • generateQuizInsights() │
│ • searchContent()        │    │ • getFallbackQuestions() │
│ • getTotalChunks()       │    │ • getFallbackInsight()   │
└──────────────────────────┘    └──────────────────────────┘
                │                            │
                ▼                            │
┌──────────────────────────┐                │
│      books2.db           │                │
│  ┌────────────────────┐  │                │
│  │  books_fts (FTS5)  │  │                │
│  │  • content         │  │◄───────────────┘
│  │  • book_id         │  │  Reads content chunks
│  │  • chunk_index     │  │  for AI processing
│  └────────────────────┘  │
│  875 chunks from         │
│  Chemistry textbook      │
└──────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│                   AI Model (llama.rn)                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ qwen2.5-1.5b-q4_k_m.gguf                              │  │
│  │ • Analyzes textbook content                           │  │
│  │ • Generates MCQ questions                             │  │
│  │ • Creates personalized insights                       │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│              Generated Quiz Questions (JSON)                  │
│  [                                                            │
│    {                                                         │
│      "question": "What happens...",                          │
│      "options": ["A", "B", "C", "D"],                       │
│      "correct": 1                                           │
│    },                                                        │
│    ... (10 questions)                                        │
│  ]                                                           │
└──────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│                    QuizPlay Component                         │
│  • Displays questions one by one                             │
│  • Tracks user answers                                       │
│  • Shows progress                                            │
└──────────────────────────────────────────────────────────────┘
                │
                │ User completes quiz
                ▼
┌──────────────────────────────────────────────────────────────┐
│                   QuizResults Component                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Calls: generateQuizInsights(session, contentChunks)   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│              AI-Generated Insights (Text)                     │
│  "Great job! You scored 8 out of 10! You have a strong      │
│   understanding of chemical reactions. Review the concept    │
│   of balancing equations. Keep up the excellent work! 🌟"    │
└──────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│                    Display to User                            │
│  • Score and percentage                                      │
│  • AI insights                                               │
│  • Buttons: Retake Quiz | Go Home                           │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow Summary

1. **User Action** → Clicks subject in Quiz section
2. **Loading** → Shows "Generating quiz from textbook content..."
3. **Database Query** → Retrieves 3-5 random chunks from books2.db
4. **AI Processing** → Sends content to AI model for question generation
5. **Validation** → Validates and parses JSON response
6. **Fallback** → Uses chemistry questions if AI fails
7. **Display** → Shows quiz with 10 questions
8. **User Interaction** → User answers questions
9. **Evaluation** → Calculates score and analyzes mistakes
10. **Insight Generation** → AI creates personalized feedback
11. **Results** → Displays score and AI insights

## Key Components

### Database Layer
- **Asset Management**: Copies books2.db from bundle to app directory
- **Full-Text Search**: Uses FTS5 for efficient content retrieval
- **Random Selection**: Ensures quiz variety

### AI Layer
- **On-Device**: No internet required
- **Context-Aware**: Uses actual textbook content
- **Adaptive**: Generates different questions each time

### UI Layer
- **Loading States**: Clear feedback during generation
- **Error Handling**: Graceful fallbacks
- **Smooth Experience**: No breaking changes

## Error Handling Flow

```
AI Generation Attempt
        │
        ├─ Success → Use generated questions
        │
        └─ Failure → Log error
                    → Use fallback questions
                    → Continue quiz flow
```

## Performance Considerations

- **Database Init**: ~1 second
- **Quiz Generation**: 10-30 seconds (device-dependent)
- **Insights Generation**: 5-15 seconds
- **First Launch**: +1-2 seconds (database copy)

## Security & Privacy

- ✅ All data stored locally
- ✅ No network requests for quiz generation
- ✅ Offline AI model
- ✅ Student data stays on device
