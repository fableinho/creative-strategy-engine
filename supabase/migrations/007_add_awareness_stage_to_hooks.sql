-- Migration: 007_add_awareness_stage_to_hooks
-- Description: Add awareness_stage column to hooks table

CREATE TYPE awareness_stage AS ENUM (
  'unaware',
  'problem_aware',
  'solution_aware',
  'product_aware',
  'most_aware'
);

ALTER TABLE hooks ADD COLUMN awareness_stage awareness_stage NOT NULL DEFAULT 'unaware';

CREATE INDEX idx_hooks_awareness_stage ON hooks(awareness_stage);
