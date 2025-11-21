# Student Local Database

This database runs on every student’s device and stores:

## Student Data
- student_profile

## Learning Activity
- questions
- answers
- quizzes
- quiz_questions
- mastery (chapter-level understanding)

## Sync System
- sync_outbox: temporarily stores unsynced rows

## Workflow
1. Student uses SLM, OCR, vector search offline.
2. All activity stored locally.
3. When internet is available → sync_outbox rows are uploaded to Supabase.
4. Only *learning activity* is synced — content is NOT synced.
