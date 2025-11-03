# Production Deployment Architecture

## Current vs Production Comparison

### Current (Development/Demo)
```
┌─────────────┐
│   Browser   │
│             │
│ React App   │
│     ↓       │
│ localStorage│  ← Data here (5MB limit, per-user)
└─────────────┘
```

### Production (Multi-User)
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Browser 1  │         │              │         │             │
│  (User A)   │────────→│   Backend    │────────→│ PostgreSQL  │
└─────────────┘         │   REST API   │         │  Database   │
                        │              │         │             │
┌─────────────┐         │   Node.js    │         │  Projects   │
│  Browser 2  │────────→│   Express    │         │  Users      │
│  (User B)   │         │   Auth       │         │  Flows      │
└─────────────┘         │              │         │  Audit Log  │
                        └──────────────┘         └─────────────┘
```

---

## Database Schema Design (PostgreSQL)

### Tables Structure

#### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'analyst', -- analyst, admin, viewer
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### 2. Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) DEFAULT '1.0.0',

  -- Owner and permissions
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,

  -- Registries stored as JSONB (flexible structure)
  service_registry JSONB NOT NULL DEFAULT '{"domains": []}',
  actor_registry JSONB NOT NULL DEFAULT '{"actors": []}',
  integration_types JSONB NOT NULL DEFAULT '{"types": []}',

  -- Settings
  settings JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP -- Soft delete
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_name ON projects(name);
-- GIN index for fast JSONB queries
CREATE INDEX idx_projects_service_registry ON projects USING GIN (service_registry);
```

#### 3. Flows Table
```sql
CREATE TABLE flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'Medium',
  status VARCHAR(50) DEFAULT 'draft',
  version VARCHAR(50) DEFAULT '1.0',

  -- Flow metadata
  service_domain_id VARCHAR(255),
  service_id VARCHAR(255),
  entry_point TEXT,
  trigger_event TEXT,
  actor_ids JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',

  -- Flow content (stored as JSONB for flexibility)
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
  approved_by UUID,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_flows_project ON flows(project_id);
CREATE INDEX idx_flows_status ON flows(status);
CREATE INDEX idx_flows_name ON flows(name);
CREATE INDEX idx_flows_tags ON flows USING GIN(tags);
-- Search within steps
CREATE INDEX idx_flows_steps ON flows USING GIN (steps);
```

#### 4. Project Members (Collaboration)
```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- owner, editor, viewer
  added_at TIMESTAMP DEFAULT NOW(),
  added_by UUID REFERENCES users(id),

  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
```

#### 5. Audit Log (Optional but recommended)
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  flow_id UUID REFERENCES flows(id),
  action VARCHAR(100) NOT NULL, -- created, updated, deleted, exported
  entity_type VARCHAR(50) NOT NULL, -- project, flow, service, actor
  entity_id UUID,
  changes JSONB, -- What changed
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_project ON audit_log(project_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
```

---

## Backend API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Projects
```
GET    /api/projects              # List user's projects
POST   /api/projects              # Create new project
GET    /api/projects/:id          # Get project details
PUT    /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project
POST   /api/projects/:id/duplicate # Duplicate project
GET    /api/projects/:id/export   # Export project JSON
POST   /api/projects/import       # Import project JSON
```

### Project Members
```
GET    /api/projects/:id/members
POST   /api/projects/:id/members  # Add member
DELETE /api/projects/:id/members/:userId
```

### Service Registry
```
POST   /api/projects/:id/services/domains
PUT    /api/projects/:id/services/domains/:domainId
DELETE /api/projects/:id/services/domains/:domainId
POST   /api/projects/:id/services/domains/:domainId/services
PUT    /api/projects/:id/services/:serviceId
DELETE /api/projects/:id/services/:serviceId
```

### Actor Registry
```
GET    /api/projects/:id/actors
POST   /api/projects/:id/actors
PUT    /api/projects/:id/actors/:actorId
DELETE /api/projects/:id/actors/:actorId
```

### Flows
```
GET    /api/projects/:id/flows
POST   /api/projects/:id/flows
GET    /api/projects/:id/flows/:flowId
PUT    /api/projects/:id/flows/:flowId
DELETE /api/projects/:id/flows/:flowId
POST   /api/projects/:id/flows/:flowId/duplicate
```

### Search & Analytics
```
GET    /api/projects/:id/search?q=keyword
GET    /api/projects/:id/analytics
GET    /api/projects/:id/flows/:flowId/generate-drawio
GET    /api/projects/:id/flows/:flowId/generate-markdown
```

---

## Technology Stack Recommendations

### Backend Options

#### Option 1: Node.js + Express (Recommended for your case)
**Pros:**
- Same language as frontend (JavaScript)
- Fast development
- Huge ecosystem
- Easy to deploy

**Stack:**
```
- Node.js (Runtime)
- Express.js (Web framework)
- PostgreSQL (Database)
- node-postgres (pg) (Database driver)
- Passport.js or JWT (Authentication)
- bcrypt (Password hashing)
- express-validator (Input validation)
```

#### Option 2: Python + FastAPI (Good alternative)
**Pros:**
- Excellent for data processing
- Great typing support
- Auto-generated API docs

**Stack:**
```
- Python 3.11+
- FastAPI (Web framework)
- PostgreSQL
- SQLAlchemy (ORM)
- Pydantic (Validation)
- Python-jose (JWT)
```

#### Option 3: Java + Spring Boot (Enterprise)
**Pros:**
- Most robust
- Best for large organizations
- Excellent security

**Stack:**
```
- Java 17+
- Spring Boot
- PostgreSQL
- Spring Data JPA
- Spring Security
```

### Deployment Options

#### Cloud Platforms
1. **Vercel + Supabase** (Easiest)
   - Frontend: Vercel (free tier)
   - Backend: Supabase (Postgres + Auth + API, free tier)
   - Cost: Free for small teams

2. **AWS** (Most flexible)
   - Frontend: S3 + CloudFront
   - Backend: EC2 or Lambda
   - Database: RDS PostgreSQL
   - Cost: ~$50-100/month

3. **Heroku** (Simplest)
   - All-in-one platform
   - PostgreSQL add-on included
   - Cost: ~$16-50/month

4. **Railway.app** (Modern, easy)
   - Deploy from GitHub
   - PostgreSQL included
   - Cost: ~$10-20/month

---

## Migration Strategy

### Phase 1: Add Backend (Keep localStorage as fallback)
```javascript
// Dual mode: localStorage + API
const saveProject = async (project) => {
  // Save to localStorage (immediate)
  localStorage.setItem('project', JSON.stringify(project));

  // Save to backend (async)
  try {
    await api.post('/projects', project);
  } catch (error) {
    console.error('Backend save failed, using localStorage');
  }
};
```

### Phase 2: Full Backend Migration
```javascript
// API-first, localStorage as cache
const saveProject = async (project) => {
  try {
    const response = await api.post('/projects', project);
    // Cache in localStorage
    localStorage.setItem('project', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    throw new Error('Failed to save project');
  }
};
```

---

## Security Considerations

### Authentication
```javascript
// JWT-based authentication
- Secure password hashing (bcrypt, cost 12+)
- JWT tokens (access token + refresh token)
- HTTP-only cookies for tokens
- CSRF protection
```

### Authorization
```javascript
// Role-based access control
- Owner: Full access
- Editor: Can edit flows and registries
- Viewer: Read-only access
```

### Data Protection
```sql
-- Row-level security in PostgreSQL
CREATE POLICY project_access_policy ON projects
  USING (
    owner_id = current_user_id() OR
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = current_user_id()
    )
  );
```

---

## Cost Estimation (Monthly)

### Small Team (5-10 users)
```
Option 1: Supabase + Vercel
- Free tier: $0
- Paid: ~$25/month

Option 2: Railway.app
- ~$10-20/month

Option 3: Heroku
- ~$16/month (Hobby tier)
```

### Medium Organization (50-100 users)
```
AWS Setup:
- RDS PostgreSQL (db.t3.small): ~$30
- EC2 (t3.small): ~$15
- S3 + CloudFront: ~$5
Total: ~$50-100/month
```

### Large Organization (500+ users)
```
AWS Setup:
- RDS PostgreSQL (db.m5.large): ~$200
- ECS/EKS (2 instances): ~$100
- Load Balancer: ~$25
- S3 + CloudFront: ~$20
Total: ~$350-500/month
```

---

## Example: Quick Backend Setup (Node.js + Express)

### File Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Flow.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── flows.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── services/
│   │   ├── projectService.js
│   │   └── flowService.js
│   └── server.js
├── migrations/
│   └── 001_initial_schema.sql
├── package.json
└── .env
```

---

## My Professional Recommendation

### For HWMS Project with Multiple Users:

**Architecture:**
```
Frontend: React (current app, minimal changes)
Backend: Node.js + Express.js
Database: PostgreSQL (Supabase or AWS RDS)
Auth: JWT tokens
Deployment: Vercel (frontend) + Railway (backend + DB)
```

**Why this stack:**
1. ✅ **Same language** (JavaScript/TypeScript) - easier for your team
2. ✅ **PostgreSQL JSONB** - perfect for your nested data structure
3. ✅ **Fast to implement** - 1-2 weeks with existing code
4. ✅ **Scalable** - can handle 1000+ users
5. ✅ **Cost-effective** - start free, scale as needed
6. ✅ **Easy maintenance** - popular stack, lots of resources

**Timeline:**
- Week 1: Backend API + Database setup
- Week 2: Authentication + Frontend integration
- Week 3: Testing + Deployment
- Week 4: User training

---

## Next Steps

Would you like me to:

1. **Create the backend API structure?**
   - Node.js + Express setup
   - PostgreSQL schema migrations
   - Authentication system
   - API endpoints

2. **Modify frontend to use API?**
   - Add API client
   - Update ProjectContext to use backend
   - Add authentication UI
   - Migration strategy

3. **Provide deployment guide?**
   - Docker setup
   - Railway/Heroku deployment
   - Environment configuration
   - CI/CD pipeline

Let me know what you need! 🚀
