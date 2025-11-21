# Database System Overview

This folder contains all database components used across the entire application ecosystem:

- **content/** → Grade Pack content + embeddings (SQLite)
- **student/** → Local student learning DB (SQLite)
- **teacher/** → Local teacher dashboard DB (SQLite)
- **supabase/** → Cloud master DB (Postgres)
- **migrations/** → Versioned schema changes
- **tools/** → Scripts to generate/initialize/sync databases
- **backups/** → Local backups (ignored in Git)

The architecture follows an **offline-first**, **sync-based** model:

Student (SQLite) → Sync → Supabase → Sync → Teacher (SQLite)
