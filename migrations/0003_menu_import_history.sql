-- Migration: 0003_menu_import_history.sql
-- Menu Import history audit logging table

CREATE TABLE IF NOT EXISTS menu_import_history (
  id TEXT PRIMARY KEY,
  imported_at TEXT NOT NULL,
  file_name TEXT,
  file_format TEXT NOT NULL,
  total_items INTEGER NOT NULL DEFAULT 0,
  created_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  categories_created_count INTEGER NOT NULL DEFAULT 0,
  errors_json TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS menu_import_history_imported_at_idx ON menu_import_history(imported_at DESC);
