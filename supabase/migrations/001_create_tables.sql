-- Migration: 001_create_tables
-- Description: Create users, clients, projects tables with enums

-- Enums
CREATE TYPE organizing_principle AS ENUM (
  'brand',
  'campaign',
  'audience',
  'channel',
  'product',
  'theme'
);

CREATE TYPE project_status AS ENUM (
  'draft',
  'active',
  'in_review',
  'approved',
  'archived'
);

CREATE TYPE client_status AS ENUM (
  'active',
  'inactive',
  'archived'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  status client_status NOT NULL DEFAULT 'active',
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organizing_principle organizing_principle NOT NULL DEFAULT 'campaign',
  status project_status NOT NULL DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_clients_owner ON clients(owner_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can read/update their own row
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies: clients visible to owner
CREATE POLICY "Clients visible to owner"
  ON clients FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Clients editable by owner"
  ON clients FOR ALL
  USING (auth.uid() = owner_id);

-- RLS Policies: projects visible to owner
CREATE POLICY "Projects visible to owner"
  ON projects FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Projects editable by owner"
  ON projects FOR ALL
  USING (auth.uid() = owner_id);
