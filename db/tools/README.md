# Database Tools

Python scripts that generate and manage the SQLite database files.

## Scripts
- init_content_db.py → builds Grade Pack DB
- init_student_db.py → creates local student db
- init_teacher_db.py → creates local teacher db
- export_gradepack.py → creates gradepack.db with embeddings
- sync_to_supabase.py → pushes student data → Supabase
- sync_from_supabase.py → pulls teacher/student data ← Supabase

All tools are run during:
- content generation stage,
- student onboarding,
- teacher dashboard initialization,
- cloud sync events.
