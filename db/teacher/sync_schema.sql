-- =============================
-- TEACHER SYNC (INBOX + OUTBOX)
-- =============================

-- Inbox: data downloaded from Supabase
CREATE TABLE IF NOT EXISTS sync_inbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_table TEXT NOT NULL,  -- "mastery", "quizzes", etc.
    external_id TEXT NOT NULL,   -- UUID from Supabase
    processed INTEGER DEFAULT 0
);

-- Outbox: teacher feedback to upload
CREATE TABLE IF NOT EXISTS sync_outbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,   -- "teacher_feedback"
    row_id INTEGER NOT NULL,
    operation TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced INTEGER DEFAULT 0
);
