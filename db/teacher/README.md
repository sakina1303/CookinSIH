# Teacher Local Database

This database lives on the teacher's device or dashboard.

## Tables Included
- students
- classes
- student_class_map
- mastery_summary
- quiz_summary
- teacher_feedback

## Sync System
- sync_inbox: stores new data downloaded from Supabase
- sync_outbox: stores teacher feedback waiting to sync

## Workflow
1. Download class-wide data from Supabase.
2. Teacher can work offline (full class analytics).
3. When online → teacher_feedback is synced back to Supabase.
