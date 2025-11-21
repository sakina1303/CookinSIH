# Migrations

This folder stores versioned schema updates.

Example files:
- 001_init.sql
- 002_add_mastery.sql
- 003_add_sync_tables.sql

Each migration should:
1. Be run on Supabase if cloud schema changes
2. Optionally update student/teacher schema if applicable
