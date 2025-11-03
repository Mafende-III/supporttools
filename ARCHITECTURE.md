# Generic Microservices Flow Designer - Architecture Documentation

## 🎯 Vision
A professional, technology-agnostic business analysis tool for mapping and documenting microservice-based system workflows with built-in support for cross-system integrations.

## 🏗️ System Architecture

### Core Principles
1. **Project-Centric**: All artifacts belong to a project context
2. **Registry-Based**: Services, actors, and types are defined once, reused everywhere
3. **Extensible**: Easy to add custom values via "Other" options
4. **Export-Friendly**: Multiple output formats for different use cases
5. **Portable**: JSON-based storage for easy sharing and version control

---

## 📊 Data Structure

### Project Schema
```javascript
{
  id: "unique-id",
  name: "HWMS - Health Workforce Management System",
  description: "Comprehensive health workforce tracking and deployment",
  version: "1.0.0",
  createdAt: "2025-11-03T00:00:00Z",
  updatedAt: "2025-11-03T00:00:00Z",

  // Registries
  serviceRegistry: ServiceRegistry,
  actorRegistry: ActorRegistry,
  integrationTypes: IntegrationTypes,
  customFields: CustomFields,

  // Workflows
  flows: [Flow],

  // Settings
  settings: ProjectSettings
}
```

### Service Registry Schema
```javascript
{
  domains: [
    {
      id: "domain-id",
      name: "Education & Certification",
      description: "Services related to educational programs",
      color: "#4CAF50",
      services: [
        {
          id: "service-id",
          name: "Education Management Service",
          abbreviation: "EMS",
          description: "Manages educational programs and certifications",
          database: "Education DB",
          endpoints: ["POST /api/education/enroll", "GET /api/education/status"],
          dependencies: ["auth-service", "notification-service"],
          customFields: {}
        }
      ]
    }
  ]
}
```

### Actor Registry Schema
```javascript
{
  actors: [
    {
      id: "actor-id",
      abbreviation: "PHP",
      fullName: "Prospect Health Professional",
      description: "Health workers seeking employment or training opportunities",
      type: "human", // "human" | "system" | "external"
      icon: "👤",
      customFields: {}
    }
  ]
}
```

### Integration Types Schema
```javascript
{
  types: [
    {
      id: "integration-type-id",
      name: "Synchronous (REST)",
      abbreviation: "REST",
      description: "REpresentational State Transfer - Request-Response pattern",
      style: {
        lineStyle: "solid",
        color: "#2196F3",
        arrowType: "single"
      }
    }
  ]
}
```

### Flow Schema
```javascript
{
  id: "flow-id",
  projectId: "project-id",

  // Basic Information
  name: "PHP Enrollment Process",
  description: "End-to-end enrollment workflow for prospect health professionals",
  serviceDomainId: "domain-id",
  serviceId: "service-id",
  priority: "High", // Low | Medium | High | Critical
  status: "draft", // draft | review | approved | deprecated
  version: "1.0",

  // Flow Metadata
  entryPoint: "Career Portal - Apply Button",
  triggerEvent: "User clicks 'Apply for Program'",
  actorIds: ["actor-id-1", "actor-id-2"],
  tags: ["enrollment", "certification", "onboarding"],

  // Process Steps
  steps: [
    {
      id: "step-id",
      stepNumber: 1,
      actorId: "actor-id",
      action: "Submits application with credentials",
      serviceIds: ["service-id-1"],

      // Data Flow
      dataInput: {
        description: "Personal info, qualifications, documents",
        schema: "ApplicationDTO"
      },
      dataOutput: {
        description: "Application ID, status",
        schema: "ApplicationResponseDTO"
      },

      // Communication
      communicationTypeId: "integration-type-id",

      // Decision Logic
      isDecisionPoint: false,
      decisionCriteria: "",
      conditionalPaths: [
        {
          condition: "Application Approved",
          nextStepId: "step-id-2"
        },
        {
          condition: "Application Rejected",
          nextStepId: "step-id-5"
        }
      ],

      // Events
      notifications: [
        {
          type: "email",
          recipient: "applicant",
          template: "application_received"
        }
      ],
      eventsPublished: ["ApplicationSubmitted"],
      eventsConsumed: [],

      // Technical Details
      estimatedDuration: "2-5 seconds",
      sla: "< 3 seconds",
      errorHandling: "Retry 3 times, then queue for manual review",

      // Visual
      swimlane: "PHP",
      position: { x: 100, y: 100 }
    }
  ],

  // Integration Points
  integrations: [
    {
      id: "integration-id",
      fromServiceId: "service-id-1",
      toServiceId: "service-id-2",
      communicationTypeId: "integration-type-id",
      dataExchanged: "User credentials for verification",
      frequency: "Real-time",
      protocol: "HTTPS/REST",
      authentication: "OAuth 2.0"
    }
  ],

  // Business Rules
  businessRules: [
    {
      id: "rule-id",
      name: "Age Requirement",
      description: "Applicant must be 18 years or older",
      type: "validation"
    }
  ],

  // Error Handling
  errorScenarios: [
    {
      scenario: "Database connection failure",
      handling: "Retry with exponential backoff, fallback to queue",
      notification: "Alert system admin"
    }
  ],

  // Performance
  performanceRequirements: {
    responseTime: "< 3 seconds",
    throughput: "1000 requests/minute",
    availability: "99.9%"
  },

  // Audit
  notes: "Additional considerations and context",
  createdBy: "analyst-id",
  createdAt: "2025-11-03T00:00:00Z",
  updatedAt: "2025-11-03T00:00:00Z",
  reviewedBy: [],
  approvedBy: null
}
```

---

## 🔧 Component Architecture

### 1. ProjectManager (Root Component)
**Purpose**: Main container with project context
**Responsibilities**:
- Project CRUD operations
- Context provider for entire app
- Route management
- Data persistence layer

**Key Features**:
- Multi-project support (data structure ready, UI simple initially)
- LocalStorage persistence with export/import
- Project switching capability

### 2. ServiceRegistry Component
**Purpose**: Manage microservices and domains
**Responsibilities**:
- Add/Edit/Delete service domains
- Add/Edit/Delete services within domains
- Track service dependencies
- "Other" option for quick service addition

**Key Features**:
- Domain grouping with color coding
- Service details (DB, endpoints, dependencies)
- Search and filter
- Bulk import from JSON

### 3. ActorRegistry Component
**Purpose**: Manage actors/users/systems
**Responsibilities**:
- Add/Edit/Delete actors
- Define abbreviations and full names
- Categorize by type (human/system/external)
- "Other" option for quick actor addition

**Key Features**:
- Abbreviation + Full Name + Description pattern
- Type categorization
- Icon assignment
- Tooltip previews

### 4. FlowDesigner Component
**Purpose**: Visual workflow builder
**Responsibilities**:
- Build step-by-step flows
- Select from registered services/actors
- Define integrations
- Business rules and error handling

**Key Features**:
- Drag-and-drop step ordering (future)
- Decision point branching
- Integration visualization
- Real-time validation
- Flow templates

### 5. ExportCenter Component
**Purpose**: Multi-format export hub
**Responsibilities**:
- Generate Draw.io XML
- Generate AI prompts
- Export to Markdown
- Export to JSON

**Key Features**:
- Preview before export
- Batch export multiple flows
- Custom templates
- Copy to clipboard

### 6. SelectWithOther Component (Reusable)
**Purpose**: Dropdown with "Add New" capability
**Responsibilities**:
- Display registered options
- "➕ Add New..." option
- Inline/modal input for new values
- Auto-save to registry

**Key Features**:
- Tooltip with full name/description
- Abbreviation display
- Validation
- Duplicate prevention

---

## 🎨 UI/UX Patterns

### "Other" Option Pattern
```
┌─────────────────────────────┐
│ Select Actor               ▼│
├─────────────────────────────┤
│ PHP - Prospect Health Prof  │ ← Tooltip shows full description
│ HPT - Health Professional T │
│ HP - Health Professional    │
├─────────────────────────────┤
│ ➕ Add New Actor...         │ ← Triggers input modal
└─────────────────────────────┘

Modal:
┌────────────────────────────────┐
│ Add New Actor                  │
├────────────────────────────────┤
│ Abbreviation: [____]           │
│ Full Name:    [______________] │
│ Description:  [______________] │
│                                │
│ [Cancel]  [Add to Registry]    │
└────────────────────────────────┘
```

### Abbreviation Display Pattern
Options:
1. **Inline**: `PHP (Prospect Health Professional)`
2. **Tooltip**: `PHP` with hover tooltip showing full info
3. **Icon**: `PHP ℹ️` with click to show details
4. **Hybrid**: `PHP - Prospect Health Professional` (recommended)

### Form Section Pattern
All forms use collapsible sections:
- ▼ Basic Information (expanded by default)
- ▶ Process Steps
- ▶ Integration Points
- ▶ Advanced Details

---

## 📁 File Structure

```
supporttools/
├── docs/
│   ├── ARCHITECTURE.md          (this file)
│   ├── USER_GUIDE.md            (end-user documentation)
│   └── API_REFERENCE.md         (data structure reference)
│
├── src/
│   ├── components/
│   │   ├── ProjectManager.jsx   (main container)
│   │   ├── ServiceRegistry.jsx  (service management)
│   │   ├── ActorRegistry.jsx    (actor management)
│   │   ├── FlowDesigner.jsx     (workflow builder)
│   │   ├── ExportCenter.jsx     (export hub)
│   │   └── common/
│   │       ├── SelectWithOther.jsx
│   │       ├── AbbreviationTooltip.jsx
│   │       ├── CollapsibleSection.jsx
│   │       └── Modal.jsx
│   │
│   ├── context/
│   │   └── ProjectContext.jsx   (global state)
│   │
│   ├── utils/
│   │   ├── dataStructure.js     (schemas and defaults)
│   │   ├── exporters.js         (export logic)
│   │   ├── validators.js        (validation rules)
│   │   └── storage.js           (localStorage wrapper)
│   │
│   ├── templates/
│   │   ├── defaultProject.js    (HWMS example)
│   │   └── flowTemplates.js     (common patterns)
│   │
│   └── App.jsx                  (entry point)
│
├── public/
│   └── examples/
│       ├── hwms-project.json    (sample project)
│       └── ecommerce-project.json
│
├── package.json
├── README.md                    (setup and overview)
└── ARCHITECTURE.md              (this file)
```

---

## 🔄 Data Flow

### 1. Project Initialization
```
User Opens App → Check localStorage → Load/Create Project → Initialize Registries
```

### 2. Adding Custom Values via "Other"
```
User Selects "Add New" → Modal Opens → Fill Form → Validate →
Save to Registry → Update Dropdown → Auto-select New Value
```

### 3. Creating a Flow
```
User Opens FlowDesigner → Loads Registries → Select Services/Actors →
Build Steps → Define Integrations → Save → Add to Project Flows
```

### 4. Exporting
```
User Selects Flow(s) → Choose Format → Generate Output →
Preview → Copy/Download → Share
```

---

## 🚀 Future Enhancements (Post-MVP)

### Phase 2
- [ ] Multi-project UI (project switcher in header)
- [ ] Flow templates library
- [ ] Visual drag-and-drop flow builder
- [ ] Collaboration features (comments, reviews)
- [ ] Version control for flows

### Phase 3
- [ ] Backend API integration
- [ ] Real-time collaboration
- [ ] AI-powered flow suggestions
- [ ] Automatic diagram generation (not just prompts)
- [ ] Integration with JIRA/Confluence

### Phase 4
- [ ] Code generation from flows
- [ ] API contract generation (OpenAPI/Swagger)
- [ ] Test case generation
- [ ] Metrics and analytics dashboard

---

## 🎯 Success Criteria

### MVP Must-Haves
✅ Single project management
✅ Service and actor registries
✅ "Other" option on all dropdowns
✅ Flow designer with steps and integrations
✅ Export to Draw.io prompt and JSON
✅ LocalStorage persistence
✅ Abbreviation tooltips/full names
✅ Import/Export projects

### Nice-to-Haves
⭐ Flow duplication
⭐ Search and filter
⭐ Flow templates
⭐ Markdown export
⭐ Visual flow preview

---

## 📝 Development Notes

### Design Decisions

**Why Option C (Hybrid)?**
- Data structure supports multi-project from day one
- UI complexity kept simple initially
- Easy to add project switcher later without refactoring
- Professional foundation for scalability

**Why Registry-Based?**
- Single source of truth
- Consistent naming across flows
- Easy to maintain and update
- Supports abbreviation pattern naturally

**Why "Other" Option?**
- Removes barriers during flow design
- Captures real-world variations
- Allows iterative refinement
- Maintains data quality over time

**Why Multiple Export Formats?**
- Different stakeholders need different views
- Draw.io for visual documentation
- JSON for API/code generation
- Markdown for wiki/documentation
- Flexibility = higher adoption

---

## 🔒 Data Validation Rules

### Service Registry
- Service name: Required, unique within domain
- Abbreviation: Optional, 2-10 chars, alphanumeric
- Database: Required
- Domain: Required reference

### Actor Registry
- Abbreviation: Required, 2-10 chars, uppercase recommended
- Full Name: Required, min 3 chars
- Type: Required enum (human/system/external)

### Flow
- Name: Required, min 3 chars
- Service: Required reference to registry
- At least 1 step required
- Step numbers must be sequential
- Actor references must exist in registry
- Service references must exist in registry

---

## 🎨 Visual Design Guidelines

### Color Coding
- **Education & Certification**: Green (#4CAF50)
- **Workforce Development**: Blue (#2196F3)
- **Service Delivery**: Orange (#FF9800)
- **Human Resources**: Purple (#9C27B0)
- **Shared Services**: Gray (#607D8B)
- **Custom Domains**: User-defined

### Communication Type Styling
- **Synchronous (REST)**: Solid blue line, single arrow
- **Asynchronous (Events)**: Dashed orange line, double arrow
- **Message Queue**: Dotted purple line, filled arrow
- **Direct DB**: Red dashed line, database icon

### Priority Indicators
- **Critical**: Red badge
- **High**: Orange badge
- **Medium**: Yellow badge
- **Low**: Green badge

---

## 🧪 Testing Strategy

### Unit Tests
- Data validation functions
- Export generators
- Registry operations

### Integration Tests
- Flow creation end-to-end
- Import/Export cycle
- Registry updates cascade

### User Acceptance Tests
- Can create project from scratch
- Can add custom services via "Other"
- Can duplicate and modify flows
- Can export in all formats
- Can import shared project

---

*Last Updated: 2025-11-03*
*Version: 1.0.0*
