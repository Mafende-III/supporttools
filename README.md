# Generic Microservices Flow Designer

> **Professional business analysis tool for mapping and documenting microservice-based system workflows**

A technology-agnostic, project-centric flow designer that enables business analysts and architects to document complex microservice interactions, generate visual diagrams, and maintain comprehensive workflow documentation.

---

## 🎯 Overview

The Generic Microservices Flow Designer is built with **Option C (Hybrid Approach)** - providing professional multi-project data structures with an intuitive single-project UI that's ready to scale.

### Key Features

✅ **Project-Based Organization** - Isolate each system with its own registries and flows
✅ **Registry-Driven Design** - Define services, actors, and integration types once, reuse everywhere
✅ **"Other" Option Pattern** - Add custom values on-the-fly without leaving your workflow
✅ **Abbreviation Support** - Full tooltips showing complete names and descriptions
✅ **Multi-Format Export** - Generate draw.io prompts, Markdown docs, and JSON
✅ **Duplicate & Modify** - Clone flows for similar processes
✅ **LocalStorage Persistence** - Auto-save with import/export capabilities

---

## 🚀 Quick Start

### Installation

```bash
# Clone or navigate to the project directory
cd supporttools

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application will open at `http://localhost:3000`

### First Steps

1. **Explore Pre-Loaded HWMS Project**
   The app comes with a complete Health Workforce Management System (HWMS) example project with:
   - 17+ pre-configured microservices
   - 9 actor types (PHP, HPT, HP, Admin, etc.)
   - 6 integration patterns
   - Sample flows ready to customize

2. **Navigate Tabs**
   - **Flow Designer** - Create and manage workflows
   - **Service Registry** - Define microservices and domains
   - **Actor Registry** - Manage users and systems

3. **Create Your First Flow**
   - Go to Flow Designer
   - Select a service domain and service
   - Add process steps
   - Generate draw.io prompt or Markdown

---

## 📊 Architecture

### Data Hierarchy

```
📁 Project (e.g., "HWMS", "E-Commerce")
  ├── 🏗️ Service Registry
  │   └── Domains
  │       └── Services (with abbreviations, databases)
  │
  ├── 👥 Actor Registry
  │   └── Actors (abbreviation, full name, description, type)
  │
  ├── 🔌 Integration Types
  │   └── Communication patterns (REST, Events, MQ, etc.)
  │
  └── 📊 Flows
      └── Workflow definitions (steps, integrations, rules)
```

### Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **ProjectContext** | Global state management | `src/context/ProjectContext.jsx` |
| **ServiceRegistry** | Manage microservices | `src/components/ServiceRegistry.jsx` |
| **ActorRegistry** | Manage actors/users | `src/components/ActorRegistry.jsx` |
| **FlowDesigner** | Build workflows | `src/components/FlowDesigner.jsx` |
| **SelectWithOther** | Dropdown with "Add New" | `src/components/common/SelectWithOther.jsx` |

---

## 🔧 User Guide

### 1. Managing Services

**Add Service Domain:**
1. Go to **Service Registry** tab
2. Click **Add Domain**
3. Enter name, description, and color
4. Click **Add Domain**

**Add Service:**
1. Expand a domain
2. Click **+** button
3. Fill in:
   - Service Name (required)
   - Abbreviation (e.g., "EMS" for Education Management Service)
   - Database Name (required)
   - Description
4. Click **Add Service**

**Using "Other" Option:**
- When selecting services in Flow Designer, choose "➕ Add New..."
- Fill in the modal form
- Service is automatically added to registry and selected

### 2. Managing Actors

**Add Actor:**
1. Go to **Actor Registry** tab
2. Click **Add Actor**
3. Fill in:
   - **Abbreviation*** (e.g., "PHP", "Admin")
   - **Full Name*** (e.g., "Prospect Health Professional")
   - **Description** (explains the role)
   - **Type** (Human, System, or External)
   - **Icon** (emoji)
4. Click **Add Actor**

**Abbreviation Display:**
- All dropdowns show: `PHP - Prospect Health Professional`
- Hover over ℹ️ icon for full description tooltip
- Maintains professional readability

### 3. Creating Flows

**Basic Workflow:**
1. Go to **Flow Designer** tab
2. Fill in **Basic Information**:
   - Select Service Domain
   - Select Service (or add new via "Other")
   - Enter Flow Name
   - Set Priority
   - Add description, entry point, trigger event

3. Add **Process Steps**:
   - Click **Add Step**
   - Select Actor (with "Other" option)
   - Select Communication Type (with "Other" option)
   - Describe the action
   - Specify data input/output
   - Mark decision points if applicable

4. Add **Integrations** (optional):
   - Define service-to-service communications
   - Specify communication type, data exchanged, frequency

5. **Save Flow**:
   - Click **Save Flow** button
   - Flow is added to project

### 4. Generating Outputs

**Generate Draw.io Prompt:**
1. Complete flow details
2. Select **Draw.io Prompt** radio button
3. Click **Generate**
4. Output is automatically copied to clipboard
5. Paste into AI chat to generate diagram XML

**Generate Markdown Documentation:**
1. Complete flow details
2. Select **Markdown Doc** radio button
3. Click **Generate**
4. Use for wikis, documentation, or README files

### 5. Import/Export

**Export Current Project:**
1. Click **Export** in header
2. JSON file downloads with all registries and flows
3. Share with team or backup

**Import Project:**
1. Click **Import** in header
2. Select JSON file
3. Project data is loaded

**Save Project:**
- Click **Save Project** to persist to localStorage
- Auto-saves when adding/editing registry items

---

## 📝 "Other" Option Pattern

### How It Works

Every dropdown with registry-based options includes a special "➕ Add New..." option at the bottom.

**Example: Adding a New Actor**

```
┌─────────────────────────────────┐
│ Select Actor                   ▼│
├─────────────────────────────────┤
│ PHP - Prospect Health Prof      │ ← Existing actors
│ HPT - Health Professional T     │
│ HP - Health Professional        │
├─────────────────────────────────┤
│ ➕ Add New Actor...             │ ← Click here
└─────────────────────────────────┘
```

**When you click "Add New...":**
1. Modal opens with form fields
2. Enter abbreviation, full name, description
3. Validation checks for duplicates and format
4. Click "Add to Registry"
5. **Automatically saved to project**
6. **Auto-selected in the dropdown**
7. **Available in all future uses**

### Fields with "Other" Option

✅ Actors (users/systems)
✅ Communication Types
✅ Services (when adding via Flow Designer)
✅ Integration Types

---

## 🎨 Abbreviations & Tooltips

### Display Pattern

All abbreviations follow the pattern:
```
[ABBR] - [Full Name]
```

**Examples:**
- `PHP - Prospect Health Professional`
- `REST - Synchronous (REST)`
- `EMS - Education Management Service`

### Tooltip Information

Hover over the ℹ️ icon to see:
- Abbreviation (bold)
- Full Name
- Description (detailed explanation)

**Example Tooltip:**
```
┌────────────────────────────────┐
│ PHP                            │
│ Prospect Health Professional   │
│ Health workers seeking         │
│ employment or training         │
│ opportunities                  │
└────────────────────────────────┘
```

---

## 📂 Project Structure

```
supporttools/
├── docs/
│   └── ARCHITECTURE.md          # Detailed architecture documentation
│
├── src/
│   ├── components/
│   │   ├── ServiceRegistry.jsx  # Service/domain management
│   │   ├── ActorRegistry.jsx    # Actor/user management
│   │   ├── FlowDesigner.jsx     # Workflow builder
│   │   └── common/
│   │       ├── SelectWithOther.jsx      # Reusable dropdown
│   │       └── CollapsibleSection.jsx   # Reusable collapsible
│   │
│   ├── context/
│   │   └── ProjectContext.jsx   # Global state (React Context)
│   │
│   ├── utils/
│   │   ├── dataStructure.js     # Schemas, templates, validators
│   │   ├── storage.js           # localStorage wrapper
│   │   └── exporters.js         # Export generators
│   │
│   ├── App.jsx                  # Main application
│   └── main.jsx                 # React entry point
│
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── vite.config.js              # Build configuration
└── README.md                    # This file
```

---

## 🔍 Data Structure Reference

### Project Schema

```javascript
{
  id: "project-123",
  name: "HWMS - Health Workforce Management System",
  description: "...",
  version: "1.0.0",
  createdAt: "2025-11-03T...",
  updatedAt: "2025-11-03T...",

  serviceRegistry: {
    domains: [
      {
        id: "domain-123",
        name: "Education & Certification",
        description: "...",
        color: "#4CAF50",
        services: [
          {
            id: "service-123",
            name: "Education Management Service",
            abbreviation: "EMS",
            description: "...",
            database: "Education DB",
            endpoints: [],
            dependencies: []
          }
        ]
      }
    ]
  },

  actorRegistry: {
    actors: [
      {
        id: "actor-123",
        abbreviation: "PHP",
        fullName: "Prospect Health Professional",
        description: "Health workers seeking employment...",
        type: "human", // human | system | external
        icon: "👨‍⚕️"
      }
    ]
  },

  integrationTypes: {
    types: [
      {
        id: "type-123",
        name: "Synchronous (REST)",
        abbreviation: "REST",
        description: "Request-Response pattern...",
        style: {
          lineStyle: "solid",
          color: "#2196F3",
          arrowType: "single"
        }
      }
    ]
  },

  flows: [ /* workflow definitions */ ]
}
```

### Flow Schema

```javascript
{
  id: "flow-123",
  name: "PHP Enrollment Process",
  description: "...",
  serviceDomainId: "domain-123",
  serviceId: "service-123",
  priority: "High", // Low | Medium | High | Critical
  status: "draft", // draft | review | approved | deprecated

  entryPoint: "Career Portal - Apply Button",
  triggerEvent: "User clicks Apply",
  actorIds: ["actor-123", "actor-456"],

  steps: [
    {
      id: "step-123",
      stepNumber: 1,
      actorId: "actor-123",
      action: "Submits application with credentials",
      serviceIds: ["service-123"],
      communicationTypeId: "type-123",

      dataInput: {
        description: "Personal info, qualifications",
        schema: "ApplicationDTO"
      },
      dataOutput: {
        description: "Application ID, status",
        schema: "ApplicationResponseDTO"
      },

      isDecisionPoint: false,
      decisionCriteria: "",
      conditionalPaths: [],
      notifications: [],

      estimatedDuration: "2-5 seconds",
      errorHandling: "Retry 3 times..."
    }
  ],

  integrations: [ /* service integrations */ ],
  businessRules: [ /* validation rules */ ],
  performanceRequirements: { /* SLAs */ }
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Document Existing Microservices

**Scenario:** You have an existing system and need to document its flows

**Steps:**
1. Add all service domains and services to Service Registry
2. Add all user types and systems to Actor Registry
3. For each critical workflow:
   - Create a flow
   - Map out steps
   - Define integrations
   - Generate documentation

**Output:** Complete system documentation in Markdown format

---

### Use Case 2: Design New System

**Scenario:** Planning a new microservices architecture

**Steps:**
1. Create new project (or clear HWMS template)
2. Define service domains based on business capabilities
3. Add services with database and endpoint details
4. Define actors (users, systems)
5. Design flows for key scenarios
6. Generate draw.io diagrams for stakeholder review

**Output:** Visual architecture diagrams and flow specifications

---

### Use Case 3: Team Collaboration

**Scenario:** Multiple analysts working on different modules

**Steps:**
1. One person sets up Service & Actor Registries
2. Export project JSON
3. Share with team
4. Each person imports, adds their flows
5. Re-export and consolidate
6. Generate unified documentation

**Output:** Comprehensive multi-module documentation

---

## 🔄 Workflow Examples

### Example 1: User Registration Flow

```
Flow Name: User Registration Process
Service: User Service (Shared Services)

Steps:
1. [Customer] Submits registration form
   → User Service validates data
   → Output: User ID or validation errors

2. [System] Sends verification email
   → Notification Service
   → Output: Email sent confirmation

3. [Customer] Clicks verification link
   → User Service activates account
   → Output: Activated user profile

Decision Point at Step 1:
  ✓ Valid data → Continue to Step 2
  ✗ Invalid data → Return errors, stay at Step 1
```

### Example 2: Order Processing Flow

```
Flow Name: E-Commerce Order Processing
Service: Order Service

Steps:
1. [Customer] Places order
   → Order Service creates order
   → Cart Service validates inventory

2. [System] Processes payment
   → Payment Service charges card
   → Decision: Success/Failure

3. [System] Fulfills order
   → Inventory Service updates stock
   → Notification Service emails customer

4. [Warehouse Staff] Ships order
   → Order Service updates tracking
```

---

## 🛠️ Advanced Features

### Custom Fields

All entities support `customFields` for organization-specific data:

```javascript
{
  name: "My Service",
  customFields: {
    owner: "Team A",
    costCenter: "CC-1234",
    slaResponse: "< 2s"
  }
}
```

### Flow Duplication

```javascript
// In ProjectContext
const duplicatedFlow = duplicateFlow(originalFlowId);
// Creates copy with "(Copy)" suffix
// Modify and save as new variant
```

### Validation

Built-in validation for:
- Service names (min 3 chars)
- Abbreviations (2-20 alphanumeric)
- Actor uniqueness
- Sequential step numbering

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed technical architecture
- **README.md** - This file (user guide)
- **Inline JSDoc** - Component and function documentation

---

## 🤝 Contributing

### Adding New Templates

Edit `src/utils/dataStructure.js`:

```javascript
export const createMyProjectTemplate = () => {
  const project = createProject({
    name: 'My Custom Project',
    description: '...'
  });

  // Add domains, services, actors...

  return project;
};
```

### Extending Data Schema

Add custom fields to any entity:

```javascript
const myService = createService({
  name: 'My Service',
  database: 'MyDB',
  customFields: {
    myCustomField: 'value'
  }
});
```

---

## 🐛 Troubleshooting

### "No projects found"
- Clear browser localStorage: `localStorage.clear()`
- Refresh page - HWMS template will auto-create

### "Import failed"
- Ensure JSON file is from this tool (check `format` field)
- Validate JSON syntax

### Changes not saving
- Click **Save Project** button in header
- Check browser console for errors

### Dropdowns not showing options
- Ensure you've added items to registries first
- Check Service Registry and Actor Registry tabs

---

## 📊 Example Projects

### Included Templates

**1. HWMS (Health Workforce Management System)**
- 5 service domains
- 17 microservices
- 9 actor types
- 6 integration patterns

**2. E-Commerce Platform** (in `dataStructure.js`)
- Customer Management
- Product Catalog
- Order Management
- Payment Processing

### Creating Your Own

```javascript
import { createProject } from './src/utils/dataStructure';

const myProject = createProject({
  name: 'Banking System',
  description: 'Core banking microservices'
});

// Add your domains and services...
```

---

## 🚀 Roadmap

### Phase 2 (Future)
- [ ] Multi-project switcher in UI
- [ ] Flow templates library
- [ ] Visual drag-and-drop designer
- [ ] Collaboration features (comments, reviews)

### Phase 3 (Future)
- [ ] Backend API integration
- [ ] Real-time collaboration
- [ ] AI-powered flow suggestions
- [ ] Automatic diagram generation

### Phase 4 (Future)
- [ ] Code generation from flows
- [ ] OpenAPI/Swagger contract generation
- [ ] Test case generation
- [ ] Metrics dashboard

---

## 📜 License

MIT License - Feel free to use in your organization

---

## 💡 Tips & Best Practices

### 1. Start with Registries
Set up all services and actors **before** creating flows. This ensures consistency.

### 2. Use Descriptive Abbreviations
- Good: `PHP`, `REST`, `EMS`
- Bad: `P`, `R`, `E`

### 3. Document Decision Points
Always fill in `decisionCriteria` for decision points - this is crucial for diagram generation.

### 4. Export Regularly
Export your project JSON as backup. Store in version control.

### 5. Leverage "Other" Option
Don't overthink registry setup. Add items as needed via "Other" option during flow design.

### 6. Color Code Domains
Use consistent colors for service domains to improve visual clarity in diagrams.

### 7. Include Context in Descriptions
Write descriptions assuming someone unfamiliar with your system will read them.

---

## 📞 Support

For questions or issues:
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
2. Review this README for usage guidance
3. Inspect browser console for error messages
4. Check `localStorage` data structure

---

## 🎓 Learning Resources

### Understanding Microservices
- [Martin Fowler - Microservices](https://martinfowler.com/articles/microservices.html)
- [Microservices Patterns](https://microservices.io/patterns/microservices.html)

### Business Process Mapping
- [BPMN 2.0 Specification](https://www.bpmn.org/)
- [Workflow Patterns](http://workflowpatterns.com/)

### Draw.io
- [Draw.io Documentation](https://www.drawio.com/doc/)
- [Create Flowcharts](https://www.drawio.com/blog/flowcharts)

---

**Built with ❤️ for Business Analysts and System Architects**

*Last Updated: 2025-11-03*
*Version: 1.0.0*
