# Content Database (Grade Pack)

This SQLite database contains all academic content required for offline learning.

## Tables Included
- classes
- subjects
- books
- chapters
- pages
- embeddings (vector table for RAG)

## Purpose
- Stores NCERT / Punjab Board content
- Stores precomputed embeddings (vector search)
- Shipped with app as part of the Grade Pack
- Read-only inside the student's device

## Notes
- The embeddings table allows offline semantic search using SQLite-Vec / sqlite-vss.
- Content is prepared offline using scripts in `db/tools/export_gradepack.py`.
