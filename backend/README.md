# Microservices Flow Designer - Backend API

Complete Node.js + Express + PostgreSQL backend for the Generic Microservices Flow Designer.

## 🎯 Features

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (analyst, admin, viewer)
- Secure password hashing with bcrypt

✅ **Project Management**
- Multi-user projects with ownership
- Public/private projects
- Project collaboration (owners, editors, viewers)
- Service and actor registries per project

✅ **Flow Management**
- Create, read, update, delete flows
- Flow versioning and status management
- Search across all flows
- Flow duplication

✅ **Security**
- Helmet.js for security headers
- CORS protection
- Rate limiting (optional)
- Input validation
- SQL injection prevention

✅ **Performance**
- Connection pooling
- JSONB indexes for fast queries
- Compression middleware
- Efficient database queries

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ database
- **Git**

### Installation

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Create PostgreSQL database
createdb flowdesigner

# 4. Run migrations
npm run migrate

# 5. Start development server
npm run dev
```

Server will start at: `http://localhost:5000`

---

## 📋 Environment Variables

Create `.env` file from `.env.example`:

```bash
# Required
DATABASE_URL=postgresql://username:password@localhost:5432/flowdesigner
JWT_SECRET=your-super-secret-key-change-this

# Optional
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 🗄️ Database Setup

### Using createdb (Recommended)

```bash
# Create database
createdb flowdesigner

# Run migrations
npm run migrate
```

### Using psql

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE flowdesigner;

-- Connect to database
\c flowdesigner

-- Run migration manually
\i migrations/001_initial_schema.sql
```

### Using Docker

```bash
# Start PostgreSQL container
docker run --name flowdesigner-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=flowdesigner \
  -p 5432:5432 \
  -d postgres:14

# Run migrations
npm run migrate
```

---

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
GET    /api/auth/me              # Get current user
PUT    /api/auth/me              # Update profile
POST   /api/auth/change-password # Change password
POST   /api/auth/logout          # Logout user
```

### Projects

```
GET    /api/projects             # List user's projects
POST   /api/projects             # Create project
GET    /api/projects/:id         # Get project details
PUT    /api/projects/:id         # Update project
DELETE /api/projects/:id         # Delete project
POST   /api/projects/:id/duplicate # Duplicate project
GET    /api/projects/:id/members # Get project members
POST   /api/projects/:id/members # Add member
DELETE /api/projects/:id/members/:userId # Remove member
```

### Flows

```
GET    /api/flows?project_id=xxx # List flows in project
GET    /api/flows/search?q=xxx   # Search flows
POST   /api/flows                # Create flow
GET    /api/flows/:id            # Get flow details
PUT    /api/flows/:id            # Update flow
DELETE /api/flows/:id            # Delete flow
POST   /api/flows/:id/duplicate  # Duplicate flow
```

---

## 🧪 Testing the API

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "analyst" },
    "token": "eyJhbGc...",
    "refreshToken": "..."
  }
}
```

### 2. Create a Project

```bash
# Use the token from registration
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "My First Project",
    "description": "Testing the API",
    "service_registry": {"domains": []},
    "actor_registry": {"actors": []},
    "integration_types": {"types": []}
  }'
```

### 3. Create a Flow

```bash
curl -X POST http://localhost:5000/api/flows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "project_id": "PROJECT_ID_FROM_STEP_2",
    "name": "User Registration Flow",
    "description": "Handles user registration",
    "steps": [
      {
        "stepNumber": 1,
        "action": "User submits form",
        "actorId": "user",
        "serviceIds": ["user-service"]
      }
    ]
  }'
```

---

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js     # Error handling
│   ├── models/
│   │   ├── User.js             # User database operations
│   │   ├── Project.js          # Project operations
│   │   └── Flow.js             # Flow operations
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── projects.js         # Project routes
│   │   └── flows.js            # Flow routes
│   ├── scripts/
│   │   └── migrate.js          # Database migration
│   └── server.js               # Express server
├── migrations/
│   └── 001_initial_schema.sql  # Database schema
├── .env.example                # Environment template
├── package.json
└── README.md
```

---

## 🔐 Security

### Password Security
- Passwords hashed with bcrypt (cost factor: 12)
- Never stored in plain text
- Minimum 8 characters required

### JWT Tokens
- Access tokens expire in 24 hours (configurable)
- Refresh tokens expire in 7 days
- Tokens signed with HS256 algorithm

### Access Control
- **Owner**: Full control (create, edit, delete, manage members)
- **Editor**: Can edit flows and registries
- **Viewer**: Read-only access

### SQL Injection Prevention
- All queries use parameterized statements
- Input validation with express-validator

---

## 📊 Database Schema

### Users Table
- Authentication credentials
- Role-based permissions
- User preferences

### Projects Table
- Project metadata
- JSONB columns for service_registry, actor_registry, integration_types
- Soft delete support

### Flows Table
- Workflow definitions
- JSONB columns for steps, integrations, business rules
- Full-text search enabled
- Status and priority tracking

### Project Members Table
- Collaboration management
- Role assignments (owner, editor, viewer)

### Audit Log Table
- Complete activity tracking
- User actions history
- Change tracking

---

## 🚀 Deployment

### Production Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Configure DATABASE_URL for production
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Set up monitoring

### Deployment Options

#### Option 1: Railway.app (Easiest)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add

# Deploy
railway up
```

#### Option 2: Heroku

```bash
# Install Heroku CLI
# Login and create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```

#### Option 3: Docker + VPS

```bash
# Build image
docker build -t flowdesigner-backend .

# Run with PostgreSQL
docker-compose up -d
```

---

## 🐛 Troubleshooting

### Connection Error: ECONNREFUSED

**Problem**: Can't connect to PostgreSQL

**Solution**:
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start

# Verify connection
psql -U postgres -c "SELECT version();"
```

### Migration Error: relation already exists

**Problem**: Tables already exist

**Solution**:
```sql
-- Drop and recreate database
DROP DATABASE flowdesigner;
CREATE DATABASE flowdesigner;
```

Then run migrations again.

### JWT Error: invalid token

**Problem**: Token expired or invalid

**Solution**: Login again to get a new token.

---

## 📚 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": [ ... ] // validation errors
}
```

---

## 🔧 Development

### Run in Development Mode

```bash
npm run dev  # Uses nodemon for auto-restart
```

### Run Tests (future)

```bash
npm test
```

### Lint Code

```bash
npm run lint
```

---

## 📈 Performance Tips

1. **Database Indexes**: Already optimized in schema
2. **Connection Pooling**: Configured (max 20 connections)
3. **JSONB Queries**: Use GIN indexes for fast searches
4. **Pagination**: Always use limit/offset
5. **Compression**: Enabled for API responses

---

## 🤝 Integration with Frontend

### API Client Setup (Frontend)

```javascript
// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Usage Example

```javascript
// Login
const { data } = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});
localStorage.setItem('token', data.data.token);

// Create project
const project = await api.post('/projects', {
  name: 'My Project',
  description: 'Project description'
});

// Create flow
const flow = await api.post('/flows', {
  project_id: project.data.data.project.id,
  name: 'My Flow',
  steps: [...]
});
```

---

## 📞 Support

- **Issues**: Create an issue in the repository
- **Documentation**: See DEPLOYMENT.md for detailed architecture
- **Database Schema**: Check migrations/001_initial_schema.sql

---

## 📝 License

MIT License - See LICENSE file

---

**Backend is ready for production! 🚀**
