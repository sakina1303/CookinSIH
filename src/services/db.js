import * as SQLite from 'expo-sqlite';

// Open the DB (Make sure grade_pack.db is loaded on app start)
const db = SQLite.openDatabaseSync('MyAIApp/books.db');

// ==========================================
// FUNCTION B: SEARCH SQLITE
// ==========================================
export const searchSQLite = async (keywords) => {
  try {
    if (!keywords) return "";

    // Run FTS5 Query
    const result = await db.getAllAsync(
      `SELECT content FROM textbook_search WHERE content MATCH ? ORDER BY rank LIMIT 3`,
      [keywords]
    );

    if (result && result.length > 0) {
      // Merge top 3 paragraphs
      return result.map(row => row.content).join("\n\n");
    }

    return "No relevant textbook content found.";
  } catch (e) {
    console.error("Database Error:", e);
    return "";
  }
};