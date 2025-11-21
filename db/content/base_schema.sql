-- =============================
-- CONTENT DATABASE (Grade Pack)
-- =============================

PRAGMA foreign_keys = ON;

-- Classes: 1–12
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL
);

-- Subjects: Math, Science, English, etc.
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_name TEXT NOT NULL,
    class_id INTEGER NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Books under each subject
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_title TEXT NOT NULL,
    class_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    book_code TEXT,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Chapters inside each book
CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_number INTEGER NOT NULL,
    chapter_title TEXT NOT NULL,
    book_id INTEGER NOT NULL,
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Page-level or paragraph-level chunks
CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id INTEGER NOT NULL,
    page_number INTEGER,
    content TEXT,             -- raw text
    page_url TEXT,            -- optional image/PDF page
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);

