-- Migration: 003_messaging_angles_hooks_formats
-- Description: Create messaging_angles, hooks, format_executions tables

CREATE TYPE hook_type AS ENUM (
  'question',
  'statistic',
  'story',
  'contradiction',
  'challenge',
  'metaphor'
);

CREATE TYPE format_type AS ENUM (
  'social_post',
  'email',
  'ad_copy',
  'landing_page',
  'video_script',
  'blog_post',
  'headline'
);

-- Messaging angles table
CREATE TABLE messaging_angles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  pain_desire_id UUID REFERENCES pain_desires(id) ON DELETE SET NULL,
  audience_id UUID REFERENCES audiences(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  tone TEXT,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hooks table
CREATE TABLE hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  messaging_angle_id UUID NOT NULL REFERENCES messaging_angles(id) ON DELETE CASCADE,
  type hook_type NOT NULL DEFAULT 'question',
  content TEXT NOT NULL,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Format executions table
CREATE TABLE format_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_id UUID NOT NULL REFERENCES hooks(id) ON DELETE CASCADE,
  format format_type NOT NULL,
  content TEXT NOT NULL,
  platform_notes TEXT,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_angles_project ON messaging_angles(project_id);
CREATE INDEX idx_angles_pain_desire ON messaging_angles(pain_desire_id);
CREATE INDEX idx_angles_audience ON messaging_angles(audience_id);
CREATE INDEX idx_angles_sort ON messaging_angles(project_id, sort_order);
CREATE INDEX idx_hooks_angle ON hooks(messaging_angle_id);
CREATE INDEX idx_hooks_sort ON hooks(messaging_angle_id, sort_order);
CREATE INDEX idx_formats_hook ON format_executions(hook_id);
CREATE INDEX idx_formats_sort ON format_executions(hook_id, sort_order);

-- Updated_at triggers
CREATE TRIGGER set_messaging_angles_updated_at
  BEFORE UPDATE ON messaging_angles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_hooks_updated_at
  BEFORE UPDATE ON hooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_format_executions_updated_at
  BEFORE UPDATE ON format_executions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE messaging_angles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE format_executions ENABLE ROW LEVEL SECURITY;

-- RLS: access through project ownership
CREATE POLICY "Angles visible to project owner"
  ON messaging_angles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messaging_angles.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Hooks visible to project owner"
  ON hooks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM messaging_angles
      JOIN projects ON projects.id = messaging_angles.project_id
      WHERE messaging_angles.id = hooks.messaging_angle_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Format executions visible to project owner"
  ON format_executions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM hooks
      JOIN messaging_angles ON messaging_angles.id = hooks.messaging_angle_id
      JOIN projects ON projects.id = messaging_angles.project_id
      WHERE hooks.id = format_executions.hook_id
      AND projects.owner_id = auth.uid()
    )
  );
