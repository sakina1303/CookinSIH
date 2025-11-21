-- =============================
-- STUDENT LOCAL DATABASE
-- =============================

PRAGMA foreign_keys = ON;

-- Student identity for this device
CREATE TABLE IF NOT EXISTS student_profile (
    id TEXT PRIMARY KEY,     -- UUID synced with Supabase
    name TEXT,
    grade INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- All questions asked by student (OCR or typed)
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    asked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    source_type TEXT,            -- "photo", "text"
    raw_question TEXT NOT NULL,
    lang TEXT DEFAULT 'en',
    FOREIGN KEY (student_id) REFERENCES student_profile(id)
);

-- Model answers
CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    answer_text TEXT NOT NULL,
    was_helpful INTEGER DEFAULT 0,    -- like/dislike
    time_taken_ms INTEGER,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Chapter-level performance (mastery)
CREATE TABLE IF NOT EXISTS mastery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    chapter_id INTEGER NOT NULL,
    score REAL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes taken by student
CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    chapter_id INTEGER,
    score INTEGER,
    taken_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Each quiz question
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    student_answer TEXT,
    correct_answer TEXT,
    is_correct INTEGER,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
