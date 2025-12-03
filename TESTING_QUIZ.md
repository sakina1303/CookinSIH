# Testing the Dynamic Quiz Feature

## Prerequisites
1. Ensure `expo-file-system` is installed: `npm install`
2. Ensure the app is built for iOS (the AI model only works on iOS currently)
3. The books2.db file must be in the root directory

## Testing Steps

### 1. Database Access Test
First, verify the database can be accessed:

```javascript
// Add this temporarily to TutorScreen.js or create a test screen
import { getDatabase, getTotalChunks, getRandomChunks } from '../services/database';

// In a useEffect:
useEffect(() => {
  const testDatabase = async () => {
    try {
      const db = await getDatabase();
      console.log('Database connected:', db);
      
      const total = await getTotalChunks();
      console.log('Total chunks:', total);
      
      const chunks = await getRandomChunks(3);
      console.log('Random chunks:', chunks.map(c => c.content.substring(0, 100)));
    } catch (error) {
      console.error('Database test failed:', error);
    }
  };
  
  testDatabase();
}, []);
```

### 2. Quiz Generation Test
1. Open the app on iOS simulator/device
2. Navigate to the Quiz section
3. Select any subject (e.g., Science, Mathematics)
4. Observe the loading screen: "Generating quiz from textbook content..."
5. Wait for the quiz to load (may take 10-30 seconds)
6. Verify that questions are displayed
7. Answer the questions
8. Verify that AI insights are generated at the end

### 3. Expected Behavior

#### During Quiz Generation:
- Loading spinner appears
- Message: "Generating quiz from textbook content..."
- All subject cards should be disabled

#### During Quiz:
- 10 multiple-choice questions
- Questions should be related to Chemistry/Science content
- Progress bar updates
- Can select answers and proceed

#### After Quiz:
- Results screen shows score
- AI insights section shows personalized feedback
- Insights should reference the content and performance
- "Retake" and "Home" buttons work

### 4. Debugging

#### If database fails to open:
```bash
# Check if database file exists
ls -lh books2.db

# Test database structure
sqlite3 books2.db "SELECT COUNT(*) FROM books_fts;"
```

#### If quiz generation fails:
- Check console logs for errors
- Verify AI model is loaded (iOS only)
- Check if fallback questions are used
- Look for: "Error generating quiz questions" in logs

#### If insights don't generate:
- Check console for: "Error generating quiz insights"
- Verify fallback insights are shown
- Check AI model initialization

### 5. Console Logs to Monitor

Success indicators:
- ✅ "Database opened successfully"
- ✅ "Database copied to: ..." (first run only)
- ✅ AI generation messages

Error indicators:
- ❌ "Failed to open database"
- ❌ "Error generating quiz questions"
- ❌ "AI returned empty response"
- ❌ "Failed to parse AI quiz response"

### 6. Fallback Behavior

The implementation includes robust fallbacks:
- **Database unavailable**: Error logged, quiz may not start
- **AI generation fails**: Fallback chemistry questions are used (10 questions)
- **Insights generation fails**: Fallback insights based on score percentage

### 7. Performance Expectations

- Database initialization: < 1 second
- Quiz generation: 10-30 seconds (depends on device)
- Insights generation: 5-15 seconds
- Question display: Instant

## Common Issues & Solutions

### Issue: "Cannot find module '../../books2.db'"
**Solution**: Ensure books2.db is in the project root directory

### Issue: Quiz takes too long to generate
**Solution**: This is normal for on-device AI. The model needs to:
1. Generate questions from content
2. Format them properly
3. Validate the output

### Issue: Same questions appear every time
**Solution**: Questions use random content chunks, but with fallback questions, some repetition is expected. The AI-generated questions should vary.

### Issue: Insights are generic
**Solution**: 
- Ensure contentChunks are being passed
- Check if AI model is generating or using fallback
- Verify the generateQuizInsights function is being called

## Next Steps After Testing

If everything works:
1. Remove any test console.logs
2. Consider adding more subjects/textbooks
3. Implement difficulty levels
4. Add question caching for better performance
5. Track student progress over time

## Troubleshooting Commands

```bash
# Clean and rebuild
npm start -- --reset-cache

# Reinstall pods (iOS)
cd ios && pod install && cd ..

# Check metro bundler
npm start

# Run on iOS
npm run ios
```
