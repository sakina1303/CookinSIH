# Database Architecture Overview

This `/db` directory contains all database-related files for the offline-first learning system.

The data flow in this project is strictly:

**Student → Supabase (Cloud) → Teacher → Email (feedback)**

There is **no data flow back to the student app**.

---

## 📁 Databases Included

### 1. `content/` – Grade Pack Content DB (SQLite)

Stores all textbook content and vector embeddings required for offline semantic search (RAG).  
This DB ships with the app and is read-only.

### 2. `student/` – Student Local DB (SQLite)

Stores the student's questions, answers, quizzes, mastery, and login token.  
This DB syncs **only upward** to Supabase when internet is available.

### 3. `teacher/` – Teacher Local DB (SQLite)

Stores class-wide data downloaded from Supabase for offline analysis.  
Teacher never uploads anything to Supabase except through email (not DB).

### 4. `supabase/` – Master Cloud DB (PostgreSQL)

Central database and source of truth.  
Students upload → teachers download.

### 5. `migrations/`

SQL files to evolve schemas over time.

### 6. `tools/`

Automation scripts for initializing DBs, exporting Grade Packs, and syncing.

### 7. `backups/`

# Database (trimmed)

This `db/` folder contains the minimal files needed for the PDF → SQLite workflow.

Purpose

- Download PDFs from a Supabase storage bucket, extract text, and save the results
  into a local SQLite `books` table used by the app or other offline tools.

Kept files

- `content/sqlite_books_schema.sql` — SQLite `books` table schema
- `tools/sync_pdfs_to_sqlite.py` — sync script that downloads PDFs, extracts text, and inserts rows into SQLite

Removed items

- Vector search, migrations, and student/teacher schemas were removed to keep the repository focused on the PDF import workflow. If you need them restored, tell me which folders to bring back.

Quick usage

1. Install Python deps:

```bash
pip install -r requirements.txt
```

2. Use `.env.example` as a template. Copy to `.env` and fill in your real values locally:

```bash
cp .env.example .env
# edit .env to add your SUPABASE_URL and SUPABASE_KEY
```

3. Run the sync script:

```bash
python db/tools/sync_pdfs_to_sqlite.py
```

Schema

- The local SQLite `books` schema is in `db/content/sqlite_books_schema.sql` and the script writes to `db/content/books.sqlite` by default.

Environment (.env)

- A safe `.env.example` file is included. Do NOT commit your `.env` with real secrets — it is listed in `.gitignore`.

Full-text search (FTS5)
You can enable SQLite full-text search to search the extracted text. Run the following SQL in `sqlite3 db/content/books.sqlite` to create an FTS index and maintain it with triggers:

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS books_fts
USING fts5(title, extracted_text, content='books', content_rowid='id');

INSERT INTO books_fts(rowid, title, extracted_text)
SELECT id, title, extracted_text FROM books;

CREATE TRIGGER IF NOT EXISTS books_ai AFTER INSERT ON books BEGIN
   INSERT INTO books_fts(rowid, title, extracted_text)
   VALUES (new.id, new.title, new.extracted_text);
END;

CREATE TRIGGER IF NOT EXISTS books_ad AFTER DELETE ON books BEGIN
   DELETE FROM books_fts WHERE rowid = old.id;
END;

CREATE TRIGGER IF NOT EXISTS books_au AFTER UPDATE ON books BEGIN
   UPDATE books_fts SET title = new.title, extracted_text = new.extracted_text
   WHERE rowid = new.id;
END;
```

If you want me to add the FTS creation step to the sync script (so it's created automatically), say so and I'll add it.
