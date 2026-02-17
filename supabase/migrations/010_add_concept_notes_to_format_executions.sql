-- Migration: 010_add_concept_notes_to_format_executions
-- Description: Add concept_notes field for AI-generated concept outlines/scripts

ALTER TABLE format_executions ADD COLUMN concept_notes TEXT;
