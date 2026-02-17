-- Migration: 008_add_is_starred_to_hooks
-- Description: Add is_starred boolean to hooks table for export selection

ALTER TABLE hooks ADD COLUMN is_starred BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_hooks_is_starred ON hooks(is_starred) WHERE is_starred = true;
