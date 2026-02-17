-- Migration: 002_pain_desires_audiences
-- Description: Create pain_desires, audiences, and junction table

CREATE TYPE pain_desire_type AS ENUM (
  'pain',
  'desire'
);

-- Audiences table
CREATE TABLE audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  demographics JSONB DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pain/Desires table
CREATE TABLE pain_desires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type pain_desire_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  intensity INT CHECK (intensity BETWEEN 1 AND 10),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Junction table
CREATE TABLE pain_desire_audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pain_desire_id UUID NOT NULL REFERENCES pain_desires(id) ON DELETE CASCADE,
  audience_id UUID NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
  relevance_score INT CHECK (relevance_score BETWEEN 1 AND 10),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pain_desire_id, audience_id)
);

-- Indexes
CREATE INDEX idx_audiences_project ON audiences(project_id);
CREATE INDEX idx_audiences_sort ON audiences(project_id, sort_order);
CREATE INDEX idx_pain_desires_project ON pain_desires(project_id);
CREATE INDEX idx_pain_desires_sort ON pain_desires(project_id, sort_order);
CREATE INDEX idx_pda_pain_desire ON pain_desire_audiences(pain_desire_id);
CREATE INDEX idx_pda_audience ON pain_desire_audiences(audience_id);
CREATE INDEX idx_pda_sort ON pain_desire_audiences(sort_order);

-- Updated_at triggers
CREATE TRIGGER set_audiences_updated_at
  BEFORE UPDATE ON audiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_pain_desires_updated_at
  BEFORE UPDATE ON pain_desires
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE pain_desires ENABLE ROW LEVEL SECURITY;
ALTER TABLE pain_desire_audiences ENABLE ROW LEVEL SECURITY;

-- RLS: access through project ownership
CREATE POLICY "Audiences visible to project owner"
  ON audiences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = audiences.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Pain/desires visible to project owner"
  ON pain_desires FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = pain_desires.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Junction visible to project owner"
  ON pain_desire_audiences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pain_desires
      JOIN projects ON projects.id = pain_desires.project_id
      WHERE pain_desires.id = pain_desire_audiences.pain_desire_id
      AND projects.owner_id = auth.uid()
    )
  );
