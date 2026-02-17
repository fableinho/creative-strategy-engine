-- Migration: 004_rls_policies
-- Description: Consolidate and fix RLS policies across all tables
-- CRITICAL: all access scoped to auth.uid() via FK chain to project.owner_id

-- ============================================
-- Drop existing policies to replace cleanly
-- ============================================

-- Users
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Clients
DROP POLICY IF EXISTS "Clients visible to owner" ON clients;
DROP POLICY IF EXISTS "Clients editable by owner" ON clients;

-- Projects
DROP POLICY IF EXISTS "Projects visible to owner" ON projects;
DROP POLICY IF EXISTS "Projects editable by owner" ON projects;

-- Audiences
DROP POLICY IF EXISTS "Audiences visible to project owner" ON audiences;

-- Pain/Desires
DROP POLICY IF EXISTS "Pain/desires visible to project owner" ON pain_desires;

-- Junction
DROP POLICY IF EXISTS "Junction visible to project owner" ON pain_desire_audiences;

-- Messaging Angles
DROP POLICY IF EXISTS "Angles visible to project owner" ON messaging_angles;

-- Hooks
DROP POLICY IF EXISTS "Hooks visible to project owner" ON hooks;

-- Format Executions
DROP POLICY IF EXISTS "Format executions visible to project owner" ON format_executions;

-- ============================================
-- USERS: auth.uid() = id
-- ============================================
CREATE POLICY "users_select" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "users_delete" ON users
  FOR DELETE USING (auth.uid() = id);

-- ============================================
-- CLIENTS: auth.uid() = owner_id
-- ============================================
CREATE POLICY "clients_select" ON clients
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "clients_update" ON clients
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "clients_delete" ON clients
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- PROJECTS: auth.uid() = owner_id
-- ============================================
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- AUDIENCES: FK chain → projects.owner_id = auth.uid()
-- ============================================
CREATE POLICY "audiences_select" ON audiences
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = audiences.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "audiences_insert" ON audiences
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = audiences.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "audiences_update" ON audiences
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = audiences.project_id AND projects.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = audiences.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "audiences_delete" ON audiences
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = audiences.project_id AND projects.owner_id = auth.uid())
  );

-- ============================================
-- PAIN_DESIRES: FK chain → projects.owner_id = auth.uid()
-- ============================================
CREATE POLICY "pain_desires_select" ON pain_desires
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = pain_desires.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "pain_desires_insert" ON pain_desires
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = pain_desires.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "pain_desires_update" ON pain_desires
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = pain_desires.project_id AND projects.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = pain_desires.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "pain_desires_delete" ON pain_desires
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = pain_desires.project_id AND projects.owner_id = auth.uid())
  );

-- ============================================
-- PAIN_DESIRE_AUDIENCES: FK chain → pain_desires → projects.owner_id = auth.uid()
-- ============================================
CREATE POLICY "pda_select" ON pain_desire_audiences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pain_desires
      JOIN projects ON projects.id = pain_desires.project_id
      WHERE pain_desires.id = pain_desire_audiences.pain_desire_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "pda_insert" ON pain_desire_audiences
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pain_desires
      JOIN projects ON projects.id = pain_desires.project_id
      WHERE pain_desires.id = pain_desire_audiences.pain_desire_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "pda_update" ON pain_desire_audiences
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pain_desires
      JOIN projects ON projects.id = pain_desires.project_id
      WHERE pain_desires.id = pain_desire_audiences.pain_desire_id
      AND projects.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM pain_desires
      JOIN projects ON projects.id = pain_desires.project_id
      WHERE pain_desires.id = pain_desire_audiences.pain_desire_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "pda_delete" ON pain_desire_audiences
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pain_desires
      JOIN projects ON projects.id = pain_desires.project_id
      WHERE pain_desires.id = pain_desire_audiences.pain_desire_id
      AND projects.owner_id = auth.uid()
    )
  );

-- ============================================
-- MESSAGING_ANGLES: FK chain → projects.owner_id = auth.uid()
-- ============================================
CREATE POLICY "angles_select" ON messaging_angles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = messaging_angles.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "angles_insert" ON messaging_angles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = messaging_angles.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "angles_update" ON messaging_angles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = messaging_angles.project_id AND projects.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = messaging_angles.project_id AND projects.owner_id = auth.uid())
  );

CREATE POLICY "angles_delete" ON messaging_angles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = messaging_angles.project_id AND projects.owner_id = auth.uid())
  );

-- ============================================
-- HOOKS: FK chain → messaging_angles → projects.owner_id = auth.uid()
-- ============================================
CREATE POLICY "hooks_select" ON hooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messaging_angles
      JOIN projects ON projects.id = messaging_angles.project_id
      WHERE messaging_angles.id = hooks.messaging_angle_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "hooks_insert" ON hooks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM messaging_angles
      JOIN projects ON projects.id = messaging_angles.project_id
      WHERE messaging_angles.id = hooks.messaging_angle_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "hooks_update" ON hooks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM messaging_angles
      JOIN projects ON projects.id = messaging_angles.project_id
      WHERE messaging_angles.id = hooks.messaging_angle_id
      AND projects.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM messaging_angles
      JOIN projects ON projects.id = messaging_angles.project_id
      WHERE messaging_angles.id = hooks.messaging_angle_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "hooks_delete" ON hooks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM messaging_angles
      JOIN projects ON projects.id = messaging_angles.project_id
      WHERE messaging_angles.id = hooks.messaging_angle_id
      AND projects.owner_id = auth.uid()
    )
  );

-- ============================================
-- FORMAT_EXECUTIONS: FK chain → hooks → messaging_angles → projects.owner_id = auth.uid()
-- ============================================
CREATE POLICY "formats_select" ON format_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM hooks
      JOIN messaging_angles ON messaging_angles.id = hooks.messaging_angle_id
      JOIN projects ON projects.id = messaging_angles.project_id
      WHERE hooks.id = format_executions.hook_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "formats_insert" ON format_executions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM hooks
      JOIN messaging_angles ON messaging_angles.id = hooks.messaging_angle_id
      JOIN projects ON projects.id = messaging_angles.project_id
      WHERE hooks.id = format_executions.hook_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "formats_update" ON format_executions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM hooks
      JOIN messaging_angles ON messaging_angles.id = hooks.messaging_angle_id
      JOIN projects ON projects.id = messaging_angles.project_id
      WHERE hooks.id = format_executions.hook_id
      AND projects.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM hooks
      JOIN messaging_angles ON messaging_angles.id = hooks.messaging_angle_id
      JOIN projects ON projects.id = messaging_angles.project_id
      WHERE hooks.id = format_executions.hook_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "formats_delete" ON format_executions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM hooks
      JOIN messaging_angles ON messaging_angles.id = hooks.messaging_angle_id
      JOIN projects ON projects.id = messaging_angles.project_id
      WHERE hooks.id = format_executions.hook_id
      AND projects.owner_id = auth.uid()
    )
  );
