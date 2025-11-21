# Supabase Master Database

This is the cloud PostgreSQL database that acts as the central hub
for syncing data between students and teachers.

## Stores:
- students
- teachers
- classes
- student_class_map
- question_events
- answer_events
- mastery_snapshots
- quiz_events
- teacher_feedback

## Sync Flow
Student SQLite → Supabase → Teacher SQLite → Supabase → Student (optional)

## Security
All RLS policies are stored in `policies.sql`.
Triggers or helper functions go in `functions.sql`.
