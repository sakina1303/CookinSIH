# Tools

This folder contains the supported automation script for this trimmed repository.

Supported tool

- `sync_pdfs_to_sqlite.py` — Download PDFs from a Supabase storage bucket, extract
  text, and insert rows into a local SQLite `books` table.

Quick usage

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Create your local `.env` from the template and add secrets locally (do not commit):

```bash
cp .env.example .env
# edit .env to add your SUPABASE_URL and SUPABASE_KEY
```

3. Run the sync script:

```bash
python db/tools/sync_pdfs_to_sqlite.py
```

Notes

- `.env.example` is safe to share; do not commit `.env` with real keys. The repo `.gitignore` excludes `.env` and local SQLite DB files by default.
- The sync script creates `db/content/books.sqlite` by default and inserts one row per PDF with extracted text.

If you want additional tools restored or a different workflow (CSV export, force re-extract, etc.), tell me and I will implement it.

# DB Tools (Automation Scripts)

This folder contains scripts that automate building, exporting, and syncing all databases.

---

## 📄 Scripts

### `init_content_db.py`

Builds the Content DB (Grade Pack).

### `init_student_db.py`

Creates a fresh Student DB on device.

# Tools

This folder contains a single supported tool for this trimmed repo:

- `sync_pdfs_to_sqlite.py`: Download PDFs from a Supabase storage bucket, extract
  text, and insert rows into a local SQLite `books` table.

Usage

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the sync script (set `SUPABASE_URL` and `SUPABASE_KEY` in environment):

```bash
export SUPABASE_URL=https://xyz.supabase.co
export SUPABASE_KEY='your_supabase_key_here'
export SUPABASE_BUCKET=books
python db/tools/sync_pdfs_to_sqlite.py
```

If you want other tools restored, tell me which ones and I will restore them.

- Speed up development
