-- =============================
-- STUDENT SYNC (OUTBOX)
-- =============================

CREATE TABLE IF NOT EXISTS sync_outbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,   -- "questions", "answers", "mastery", "quizzes"
    row_id INTEGER NOT NULL,    -- PK in corresponding table
    operation TEXT NOT NULL,    -- insert/update
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced INTEGER DEFAULT 0    -- 0 = pending, 1 = synced
);

CREATE INDEX IF NOT EXISTS idx_sync_outbox_pending
ON sync_outbox(synced, table_name);
