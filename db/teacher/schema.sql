-- =============================
-- TEACHER LOCAL DATABASE
-- =============================

PRAGMA foreign_keys = ON;

-- All students assigned to teacher
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT,
    grade INTEGER
);

-- Class mapping for teacher
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    class_name TEXT,
    grade INTEGER,
    section TEXT
);

CREATE TABLE IF NOT EXISTS student_class_map (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id TEXT NOT NULL,
    student_id TEXT NOT NULL
);

-- Mastery summary per student
CREATE TABLE IF NOT EXISTS mastery_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    chapter_id INTEGER NOT NULL,
    score REAL,
    last_synced DATETIME
);

-- Quiz results synced from cloud
CREATE TABLE IF NOT EXISTS quiz_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT,
    chapter_id INTEGER,
    score INTEGER,
    taken_at DATETIME
);

-- Teacher feedback to student
CREATE TABLE IF NOT EXISTS teacher_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id TEXT,
    student_id TEXT,
    chapter_id INTEGER,
    feedback TEXT,
    given_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
