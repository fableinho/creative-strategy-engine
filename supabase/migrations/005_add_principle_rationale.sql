-- Migration: 005_add_principle_rationale
-- Description: Add principle_rationale column to projects table

ALTER TABLE projects ADD COLUMN principle_rationale TEXT;
