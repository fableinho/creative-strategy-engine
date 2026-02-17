-- Migration: 006_add_lenses_to_angles
-- Description: Add lenses JSONB column to messaging_angles for 10 strategic lenses

ALTER TABLE messaging_angles ADD COLUMN lenses JSONB DEFAULT '{}';

COMMENT ON COLUMN messaging_angles.lenses IS 'Strategic lenses: desired_outcome, objections, features_benefits, use_case, consequences, misconceptions, education, acceptance, failed_solutions, identity';
