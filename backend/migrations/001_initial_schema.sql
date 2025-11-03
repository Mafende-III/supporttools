-- Generic Microservices Flow Designer Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'analyst' CHECK (role IN ('analyst', 'admin', 'viewer')),

  -- Settings
  preferences JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) DEFAULT '1.0.0',

  -- Owner and visibility
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,

  -- Registries stored as JSONB for flexibility
  service_registry JSONB NOT NULL DEFAULT '{"domains": []}',
  actor_registry JSONB NOT NULL DEFAULT '{"actors": []}',
  integration_types JSONB NOT NULL DEFAULT '{"types": []}',

  -- Settings
  settings JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_public ON projects(is_public);
-- GIN indexes for fast JSONB queries
CREATE INDEX idx_projects_service_registry ON projects USING GIN (service_registry);
CREATE INDEX idx_projects_actor_registry ON projects USING GIN (actor_registry);

-- ============================================================================
-- FLOWS TABLE
-- ============================================================================
CREATE TABLE flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'deprecated')),
  version VARCHAR(50) DEFAULT '1.0',

  -- Flow Metadata
  service_domain_id VARCHAR(255),
  service_id VARCHAR(255),
  entry_point TEXT,
  trigger_event TEXT,
  actor_ids JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',

  -- Flow Content (stored as JSONB for flexibility)
  steps JSONB NOT NULL DEFAULT '[]',
  integrations JSONB DEFAULT '[]',
  business_rules JSONB DEFAULT '[]',
  error_scenarios JSONB DEFAULT '[]',
  performance_requirements JSONB DEFAULT '{}',

  -- Additional fields
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',

  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  reviewed_by UUID[] DEFAULT '{}',
  approved_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_flows_project ON flows(project_id);
CREATE INDEX idx_flows_status ON flows(status);
CREATE INDEX idx_flows_priority ON flows(priority);
CREATE INDEX idx_flows_name ON flows(name);
CREATE INDEX idx_flows_tags ON flows USING GIN(tags);
CREATE INDEX idx_flows_created_by ON flows(created_by);
-- Search within steps
CREATE INDEX idx_flows_steps ON flows USING GIN (steps);

-- ============================================================================
-- PROJECT MEMBERS TABLE (Collaboration)
-- ============================================================================
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),

  -- Audit
  added_at TIMESTAMP DEFAULT NOW(),
  added_by UUID REFERENCES users(id),

  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Who, What, Where
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,

  -- Action details
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB,

  -- Request details
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_project ON audit_log(project_id);
CREATE INDEX idx_audit_log_flow ON audit_log(flow_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to projects
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to flows
CREATE TRIGGER update_flows_updated_at
BEFORE UPDATE ON flows
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (Optional - for advanced security)
-- ============================================================================

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own projects
CREATE POLICY projects_owner_policy ON projects
  FOR SELECT
  USING (owner_id = current_setting('app.current_user_id')::UUID);

-- Policy: Users can see projects they're members of
CREATE POLICY projects_member_policy ON projects
  FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = current_setting('app.current_user_id')::UUID
    )
  );

-- Policy: Users can see public projects
CREATE POLICY projects_public_policy ON projects
  FOR SELECT
  USING (is_public = true);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Projects with member count
CREATE VIEW projects_with_stats AS
SELECT
  p.*,
  u.name as owner_name,
  u.email as owner_email,
  COUNT(DISTINCT pm.user_id) as member_count,
  COUNT(DISTINCT f.id) as flow_count
FROM projects p
LEFT JOIN users u ON p.owner_id = u.id
LEFT JOIN project_members pm ON p.id = pm.project_id
LEFT JOIN flows f ON p.id = f.project_id
WHERE p.deleted_at IS NULL
GROUP BY p.id, u.name, u.email;

-- View: User project access
CREATE VIEW user_project_access AS
SELECT
  u.id as user_id,
  u.email,
  p.id as project_id,
  p.name as project_name,
  CASE
    WHEN p.owner_id = u.id THEN 'owner'
    WHEN pm.role IS NOT NULL THEN pm.role
    WHEN p.is_public THEN 'viewer'
    ELSE NULL
  END as access_role
FROM users u
CROSS JOIN projects p
LEFT JOIN project_members pm ON p.id = pm.project_id AND u.id = pm.user_id
WHERE p.deleted_at IS NULL AND u.deleted_at IS NULL;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create a default admin user (password: admin123 - CHANGE THIS!)
-- Password hash for 'admin123' with bcrypt cost 12
INSERT INTO users (email, name, password_hash, role) VALUES
('admin@example.com', 'System Administrator', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYBZXY3P8Je', 'admin');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'System users with authentication credentials';
COMMENT ON TABLE projects IS 'Microservices documentation projects';
COMMENT ON TABLE flows IS 'Workflow definitions within projects';
COMMENT ON TABLE project_members IS 'Project collaboration and permissions';
COMMENT ON TABLE audit_log IS 'Complete audit trail of all actions';

COMMENT ON COLUMN projects.service_registry IS 'JSONB: Service domains and microservices definitions';
COMMENT ON COLUMN projects.actor_registry IS 'JSONB: Actors, users, and systems';
COMMENT ON COLUMN projects.integration_types IS 'JSONB: Communication patterns';
COMMENT ON COLUMN flows.steps IS 'JSONB: Sequential process steps';
COMMENT ON COLUMN flows.integrations IS 'JSONB: Service-to-service integrations';
