-- Migration: 009_add_template_id_to_format_executions
-- Description: Add template_id to format_executions for creative format templates
-- Also make content optional (empty until AI generates it)

ALTER TABLE format_executions ADD COLUMN template_id TEXT;
ALTER TABLE format_executions ALTER COLUMN content SET DEFAULT '';

CREATE INDEX idx_format_executions_template ON format_executions(template_id);
CREATE INDEX idx_format_executions_hook_template ON format_executions(hook_id, template_id);
