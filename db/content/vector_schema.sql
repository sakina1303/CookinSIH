-- =============================
-- VECTOR EMBEDDINGS (RAG)
-- =============================

-- Load extension (sqlite-vec / vss depending on build)
-- SELECT load_extension('vec0');

CREATE TABLE IF NOT EXISTS embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL,     -- "page", "chapter", "book"
    source_id INTEGER NOT NULL,    -- ID in respective table
    embedding BLOB NOT NULL,       -- vector stored in binary
    content TEXT,                  -- raw text used to embed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_embeddings_source
ON embeddings(source_type, source_id);
