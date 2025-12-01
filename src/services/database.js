// Dynamic requires to prevent crash on load
let SQLite, FileSystem, Asset;

try {
    SQLite = require('expo-sqlite');
} catch (e) {
    console.warn('expo-sqlite not available:', e);
}

try {
    FileSystem = require('expo-file-system');
} catch (e) {
    console.warn('expo-file-system not available:', e);
}

try {
    Asset = require('expo-asset').Asset;
} catch (e) {
    console.warn('expo-asset not available:', e);
}

console.log('Database Service Init - Dynamic Loading');
console.log('SQLite:', !!SQLite);
console.log('FileSystem:', !!FileSystem);
console.log('Asset:', !!Asset);

let dbInstance = null;

/**
 * Get or create the database instance
 */
export async function getDatabase() {
    if (!SQLite) {
        throw new Error('SQLite module is not available');
    }

    if (!dbInstance) {
        try {
            const dbName = 'books2.db';

            // Only attempt file operations if FileSystem and Asset are available
            if (FileSystem && Asset) {
                try {
                    const dbAsset = Asset.fromModule(require('../../books2.db'));
                    await dbAsset.downloadAsync();

                    const dbUri = dbAsset.localUri || dbAsset.uri;
                    const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

                    const sqliteDir = `${FileSystem.documentDirectory}SQLite`;
                    const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
                    if (!dirInfo.exists) {
                        await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
                    }

                    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
                    if (!fileInfo.exists && dbUri) {
                        await FileSystem.copyAsync({
                            from: dbUri,
                            to: dbFilePath,
                        });
                        console.log('Database copied to:', dbFilePath);
                    }
                } catch (copyError) {
                    console.warn('Database copy failed, attempting to open directly:', copyError);
                }
            } else {
                console.warn('FileSystem or Asset missing, skipping database copy.');
            }

            dbInstance = await SQLite.openDatabaseAsync(dbName);
            console.log('Database opened successfully');
        } catch (error) {
            console.error('Failed to open database:', error);
            throw error;
        }
    }
    return dbInstance;
}

/**
 * Get a random chunk of content from the database
 */
export async function getRandomChunk() {
    try {
        const db = await getDatabase();
        if (!db) return null;
        const result = await db.getAllAsync(
            'SELECT content, book_id, chunk_index FROM books_fts ORDER BY RANDOM() LIMIT 1'
        );
        return result[0] || null;
    } catch (error) {
        console.error('Error getting random chunk:', error);
        return null;
    }
}

/**
 * Get multiple random chunks for quiz generation
 * @param {number} count - Number of chunks to retrieve
 */
export async function getRandomChunks(count = 3) {
    try {
        const db = await getDatabase();
        if (!db) return [];
        const result = await db.getAllAsync(
            `SELECT content, book_id, chunk_index FROM books_fts ORDER BY RANDOM() LIMIT ?`,
            [count]
        );
        return result || [];
    } catch (error) {
        console.error('Error getting random chunks:', error);
        return [];
    }
}

/**
 * Search for content matching a query
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 */
export async function searchContent(query, limit = 5) {
    try {
        const db = await getDatabase();
        if (!db) return [];
        const result = await db.getAllAsync(
            `SELECT content, book_id, chunk_index FROM books_fts WHERE books_fts MATCH ? ORDER BY rank LIMIT ?`,
            [query, limit]
        );
        return result || [];
    } catch (error) {
        console.error('Error searching content:', error);
        return [];
    }
}

/**
 * Get a specific chunk by book_id and chunk_index
 */
export async function getChunk(bookId, chunkIndex) {
    try {
        const db = await getDatabase();
        if (!db) return null;
        const result = await db.getAllAsync(
            'SELECT content, book_id, chunk_index FROM books_fts WHERE book_id = ? AND chunk_index = ? LIMIT 1',
            [bookId, chunkIndex]
        );
        return result[0] || null;
    } catch (error) {
        console.error('Error getting chunk:', error);
        return null;
    }
}

/**
 * Get total count of chunks in the database
 */
export async function getTotalChunks() {
    try {
        const db = await getDatabase();
        if (!db) return 0;
        const result = await db.getAllAsync('SELECT COUNT(*) as count FROM books_fts');
        return result[0]?.count || 0;
    } catch (error) {
        console.error('Error getting total chunks:', error);
        return 0;
    }
}

/**
 * Get statistics about the database
 */
export async function getDatabaseStats() {
    try {
        const db = await getDatabase();
        if (!db) return { totalChunks: 0, totalBooks: 0, books: [] };

        const totalChunks = await getTotalChunks();
        const books = await db.getAllAsync('SELECT * FROM books');

        return {
            totalChunks,
            totalBooks: books.length,
            books,
        };
    } catch (error) {
        console.error('Error getting database stats:', error);
        return {
            totalChunks: 0,
            totalBooks: 0,
            books: [],
        };
    }
}
