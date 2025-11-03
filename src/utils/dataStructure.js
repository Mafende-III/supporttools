/**
 * Data Structure Schemas and Default Templates
 * Generic Microservices Flow Designer
 *
 * This file defines all data structures, default values, and factory functions
 * for creating projects, registries, flows, and related entities.
 */

// ============================================================================
// UNIQUE ID GENERATOR
// ============================================================================

export const generateId = (prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

// ============================================================================
// SERVICE REGISTRY STRUCTURES
// ============================================================================

export const createService = (data = {}) => ({
  id: generateId('service'),
  name: data.name || '',
  abbreviation: data.abbreviation || '',
  description: data.description || '',
  database: data.database || '',
  endpoints: data.endpoints || [],
  dependencies: data.dependencies || [],
  customFields: data.customFields || {},
  createdAt: new Date().toISOString(),
  ...data
});

export const createServiceDomain = (data = {}) => ({
  id: generateId('domain'),
  name: data.name || '',
  description: data.description || '',
  color: data.color || '#607D8B',
  services: data.services || [],
  createdAt: new Date().toISOString(),
  ...data
});

export const createServiceRegistry = () => ({
  domains: []
});

// ============================================================================
// ACTOR REGISTRY STRUCTURES
// ============================================================================

export const createActor = (data = {}) => ({
  id: generateId('actor'),
  abbreviation: data.abbreviation || '',
  fullName: data.fullName || '',
  description: data.description || '',
  type: data.type || 'human', // human | system | external
  icon: data.icon || '👤',
  customFields: data.customFields || {},
  createdAt: new Date().toISOString(),
  ...data
});

export const createActorRegistry = () => ({
  actors: []
});

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

export const createIntegrationType = (data = {}) => ({
  id: generateId('integration-type'),
  name: data.name || '',
  abbreviation: data.abbreviation || '',
  description: data.description || '',
  style: {
    lineStyle: data.style?.lineStyle || 'solid',
    color: data.style?.color || '#2196F3',
    arrowType: data.style?.arrowType || 'single'
  },
  createdAt: new Date().toISOString(),
  ...data
});

export const createIntegrationTypeRegistry = () => ({
  types: []
});

// ============================================================================
// FLOW STRUCTURES
// ============================================================================

export const createFlowStep = (stepNumber = 1, data = {}) => ({
  id: generateId('step'),
  stepNumber,
  actorId: data.actorId || '',
  action: data.action || '',
  serviceIds: data.serviceIds || [],

  // Data Flow
  dataInput: {
    description: data.dataInput?.description || '',
    schema: data.dataInput?.schema || ''
  },
  dataOutput: {
    description: data.dataOutput?.description || '',
    schema: data.dataOutput?.schema || ''
  },

  // Communication
  communicationTypeId: data.communicationTypeId || '',

  // Decision Logic
  isDecisionPoint: data.isDecisionPoint || false,
  decisionCriteria: data.decisionCriteria || '',
  conditionalPaths: data.conditionalPaths || [],

  // Events
  notifications: data.notifications || [],
  eventsPublished: data.eventsPublished || [],
  eventsConsumed: data.eventsConsumed || [],

  // Technical Details
  estimatedDuration: data.estimatedDuration || '',
  sla: data.sla || '',
  errorHandling: data.errorHandling || '',

  // Visual
  swimlane: data.swimlane || '',
  position: data.position || { x: 0, y: 0 },

  customFields: data.customFields || {},
  ...data
});

export const createFlowIntegration = (data = {}) => ({
  id: generateId('integration'),
  fromServiceId: data.fromServiceId || '',
  toServiceId: data.toServiceId || '',
  communicationTypeId: data.communicationTypeId || '',
  dataExchanged: data.dataExchanged || '',
  frequency: data.frequency || '',
  protocol: data.protocol || '',
  authentication: data.authentication || '',
  customFields: data.customFields || {},
  ...data
});

export const createBusinessRule = (data = {}) => ({
  id: generateId('rule'),
  name: data.name || '',
  description: data.description || '',
  type: data.type || 'validation', // validation | authorization | business-logic
  ...data
});

export const createErrorScenario = (data = {}) => ({
  id: generateId('error'),
  scenario: data.scenario || '',
  handling: data.handling || '',
  notification: data.notification || '',
  ...data
});

export const createFlow = (data = {}) => ({
  id: generateId('flow'),
  projectId: data.projectId || '',

  // Basic Information
  name: data.name || '',
  description: data.description || '',
  serviceDomainId: data.serviceDomainId || '',
  serviceId: data.serviceId || '',
  priority: data.priority || 'Medium', // Low | Medium | High | Critical
  status: data.status || 'draft', // draft | review | approved | deprecated
  version: data.version || '1.0',

  // Flow Metadata
  entryPoint: data.entryPoint || '',
  triggerEvent: data.triggerEvent || '',
  actorIds: data.actorIds || [],
  tags: data.tags || [],

  // Process Steps
  steps: data.steps || [createFlowStep(1)],

  // Integration Points
  integrations: data.integrations || [],

  // Business Rules
  businessRules: data.businessRules || [],

  // Error Handling
  errorScenarios: data.errorScenarios || [],

  // Performance
  performanceRequirements: {
    responseTime: data.performanceRequirements?.responseTime || '',
    throughput: data.performanceRequirements?.throughput || '',
    availability: data.performanceRequirements?.availability || ''
  },

  // Audit
  notes: data.notes || '',
  createdBy: data.createdBy || 'system',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  reviewedBy: data.reviewedBy || [],
  approvedBy: data.approvedBy || null,

  customFields: data.customFields || {},
  ...data
});

// ============================================================================
// PROJECT STRUCTURE
// ============================================================================

export const createProjectSettings = (data = {}) => ({
  theme: data.theme || 'light',
  defaultPriority: data.defaultPriority || 'Medium',
  exportFormat: data.exportFormat || 'drawio',
  autoSave: data.autoSave !== undefined ? data.autoSave : true,
  customFields: data.customFields || {},
  ...data
});

export const createProject = (data = {}) => ({
  id: generateId('project'),
  name: data.name || 'New Project',
  description: data.description || '',
  version: data.version || '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  // Registries
  serviceRegistry: data.serviceRegistry || createServiceRegistry(),
  actorRegistry: data.actorRegistry || createActorRegistry(),
  integrationTypes: data.integrationTypes || createIntegrationTypeRegistry(),

  // Workflows
  flows: data.flows || [],

  // Settings
  settings: data.settings || createProjectSettings(),

  // Metadata
  customFields: data.customFields || {},
  ...data
});

// ============================================================================
// DEFAULT TEMPLATES
// ============================================================================

/**
 * HWMS Project Template
 * Pre-populated with Health Workforce Management System services and actors
 */
export const createHWMSProject = () => {
  const project = createProject({
    name: 'HWMS - Health Workforce Management System',
    description: 'Comprehensive health workforce tracking, training, and deployment system',
    version: '1.0.0'
  });

  // Service Domains and Services
  const domains = [
    {
      name: 'Education & Certification',
      description: 'Services related to educational programs and professional certifications',
      color: '#4CAF50',
      services: [
        {
          name: 'Education Management Service',
          abbreviation: 'EMS',
          description: 'Manages educational programs, courses, and certifications',
          database: 'Education DB'
        },
        {
          name: 'Council Connect Service',
          abbreviation: 'CCS',
          description: 'Integration with professional councils for certification verification',
          database: 'Council DB'
        }
      ]
    },
    {
      name: 'Workforce Development',
      description: 'Services for training, internships, and career development',
      color: '#2196F3',
      services: [
        {
          name: 'Internship Service',
          abbreviation: 'IS',
          description: 'Manages internship programs and placements',
          database: 'Internship DB'
        },
        {
          name: 'Deployment Service',
          abbreviation: 'DS',
          description: 'Handles workforce deployment and assignments',
          database: 'Placement DB'
        },
        {
          name: 'Fellowship Service',
          abbreviation: 'FS',
          description: 'Manages fellowship programs',
          database: 'Fellowship DB'
        },
        {
          name: 'Residency Service',
          abbreviation: 'RS',
          description: 'Manages medical residency programs',
          database: 'Residency DB'
        },
        {
          name: 'Authorization Service',
          abbreviation: 'AS',
          description: 'Handles authentication and authorization',
          database: 'Auth DB'
        }
      ]
    },
    {
      name: 'Service Delivery',
      description: 'Services for healthcare delivery and facility management',
      color: '#FF9800',
      services: [
        {
          name: 'Deployment Management Service',
          abbreviation: 'DMS',
          description: 'Manages ongoing deployments and assignments',
          database: 'Deployment DB'
        },
        {
          name: 'Facility & Equipment Management Service',
          abbreviation: 'FEMS',
          description: 'Manages healthcare facilities and equipment',
          database: 'Facility DB'
        }
      ]
    },
    {
      name: 'Human Resources',
      description: 'HR management services',
      color: '#9C27B0',
      services: [
        {
          name: 'Vacancy Management Service',
          abbreviation: 'VMS',
          description: 'Manages job vacancies and postings',
          database: 'Vacancy DB'
        },
        {
          name: 'Staff Management Service',
          abbreviation: 'SMS',
          description: 'Manages staff records and profiles',
          database: 'Staff DB'
        }
      ]
    },
    {
      name: 'Shared Services',
      description: 'Common services used across the platform',
      color: '#607D8B',
      services: [
        {
          name: 'User Service',
          abbreviation: 'US',
          description: 'User account management',
          database: 'User DB'
        },
        {
          name: 'File Service',
          abbreviation: 'FileS',
          description: 'File storage and management',
          database: 'File Storage'
        },
        {
          name: 'Notification Service',
          abbreviation: 'NS',
          description: 'Email, SMS, and push notifications',
          database: 'Notification DB'
        },
        {
          name: 'Message/Chat Service',
          abbreviation: 'MCS',
          description: 'In-app messaging and chat',
          database: 'Message DB'
        },
        {
          name: 'Q/A & Support Service',
          abbreviation: 'QAS',
          description: 'Help desk and support ticketing',
          database: 'Support DB'
        },
        {
          name: 'Payment/Counter Service',
          abbreviation: 'PCS',
          description: 'Payment processing and financial transactions',
          database: 'Payment DB'
        }
      ]
    }
  ];

  // Add domains and services to project
  domains.forEach(domainData => {
    const domain = createServiceDomain({
      name: domainData.name,
      description: domainData.description,
      color: domainData.color
    });

    domainData.services.forEach(serviceData => {
      domain.services.push(createService(serviceData));
    });

    project.serviceRegistry.domains.push(domain);
  });

  // Actors
  const actors = [
    {
      abbreviation: 'PHP',
      fullName: 'Prospect Health Professional',
      description: 'Health workers seeking employment or training opportunities in the healthcare system',
      type: 'human',
      icon: '👨‍⚕️'
    },
    {
      abbreviation: 'HPT',
      fullName: 'Health Professional Trainee',
      description: 'Healthcare professionals currently enrolled in training, internship, or residency programs',
      type: 'human',
      icon: '🎓'
    },
    {
      abbreviation: 'HP',
      fullName: 'Health Professional',
      description: 'Certified and employed healthcare professionals actively working in the system',
      type: 'human',
      icon: '⚕️'
    },
    {
      abbreviation: 'IAU',
      fullName: 'Institution Admin User',
      description: 'Administrative staff at healthcare institutions managing programs and personnel',
      type: 'human',
      icon: '👔'
    },
    {
      abbreviation: 'Admin',
      fullName: 'System Administrator',
      description: 'Platform administrators with full system access and management capabilities',
      type: 'human',
      icon: '🔧'
    },
    {
      abbreviation: 'Council',
      fullName: 'Council Member',
      description: 'Members of professional health councils responsible for certification and regulation',
      type: 'human',
      icon: '📋'
    },
    {
      abbreviation: 'HR',
      fullName: 'HR Personnel',
      description: 'Human resources staff managing recruitment, deployment, and workforce planning',
      type: 'human',
      icon: '💼'
    },
    {
      abbreviation: 'Student',
      fullName: 'Student',
      description: 'Students enrolled in health professional education programs',
      type: 'human',
      icon: '📚'
    },
    {
      abbreviation: 'System',
      fullName: 'System/Automated Process',
      description: 'Automated system processes, scheduled jobs, and background tasks',
      type: 'system',
      icon: '🤖'
    }
  ];

  actors.forEach(actorData => {
    project.actorRegistry.actors.push(createActor(actorData));
  });

  // Integration Types
  const integrationTypes = [
    {
      name: 'Synchronous (REST)',
      abbreviation: 'REST',
      description: 'REpresentational State Transfer - Request-Response pattern over HTTP/HTTPS',
      style: {
        lineStyle: 'solid',
        color: '#2196F3',
        arrowType: 'single'
      }
    },
    {
      name: 'Asynchronous (Events)',
      abbreviation: 'Event',
      description: 'Event-driven architecture using publish-subscribe pattern',
      style: {
        lineStyle: 'dashed',
        color: '#FF9800',
        arrowType: 'double'
      }
    },
    {
      name: 'Message Queue',
      abbreviation: 'MQ',
      description: 'Message queue-based communication (RabbitMQ, Kafka, etc.)',
      style: {
        lineStyle: 'dotted',
        color: '#9C27B0',
        arrowType: 'filled'
      }
    },
    {
      name: 'Direct DB',
      abbreviation: 'DB',
      description: 'Direct database access (should be avoided in microservices)',
      style: {
        lineStyle: 'dashed',
        color: '#F44336',
        arrowType: 'database'
      }
    },
    {
      name: 'GraphQL',
      abbreviation: 'GQL',
      description: 'GraphQL API communication',
      style: {
        lineStyle: 'solid',
        color: '#E10098',
        arrowType: 'single'
      }
    },
    {
      name: 'gRPC',
      abbreviation: 'gRPC',
      description: 'High-performance RPC framework',
      style: {
        lineStyle: 'solid',
        color: '#00ADD8',
        arrowType: 'double'
      }
    }
  ];

  integrationTypes.forEach(typeData => {
    project.integrationTypes.types.push(createIntegrationType(typeData));
  });

  return project;
};

/**
 * Generic E-Commerce Project Template
 */
export const createECommerceProject = () => {
  const project = createProject({
    name: 'E-Commerce Platform',
    description: 'Microservices-based e-commerce system',
    version: '1.0.0'
  });

  // Service Domains
  const domains = [
    {
      name: 'Customer Management',
      description: 'Customer accounts, profiles, and authentication',
      color: '#4CAF50',
      services: [
        {
          name: 'User Service',
          abbreviation: 'US',
          description: 'User authentication and profile management',
          database: 'User DB'
        },
        {
          name: 'Customer Service',
          abbreviation: 'CS',
          description: 'Customer data and preferences',
          database: 'Customer DB'
        }
      ]
    },
    {
      name: 'Product Catalog',
      description: 'Product information and inventory',
      color: '#2196F3',
      services: [
        {
          name: 'Product Service',
          abbreviation: 'PS',
          description: 'Product catalog and details',
          database: 'Product DB'
        },
        {
          name: 'Inventory Service',
          abbreviation: 'IS',
          description: 'Stock management',
          database: 'Inventory DB'
        }
      ]
    },
    {
      name: 'Order Management',
      description: 'Order processing and fulfillment',
      color: '#FF9800',
      services: [
        {
          name: 'Cart Service',
          abbreviation: 'CartS',
          description: 'Shopping cart management',
          database: 'Cart DB'
        },
        {
          name: 'Order Service',
          abbreviation: 'OS',
          description: 'Order processing',
          database: 'Order DB'
        },
        {
          name: 'Payment Service',
          abbreviation: 'PayS',
          description: 'Payment processing',
          database: 'Payment DB'
        }
      ]
    }
  ];

  domains.forEach(domainData => {
    const domain = createServiceDomain({
      name: domainData.name,
      description: domainData.description,
      color: domainData.color
    });

    domainData.services.forEach(serviceData => {
      domain.services.push(createService(serviceData));
    });

    project.serviceRegistry.domains.push(domain);
  });

  // Actors
  const actors = [
    {
      abbreviation: 'Customer',
      fullName: 'Customer',
      description: 'End user shopping on the platform',
      type: 'human',
      icon: '🛒'
    },
    {
      abbreviation: 'Admin',
      fullName: 'Administrator',
      description: 'Platform administrator',
      type: 'human',
      icon: '👨‍💼'
    },
    {
      abbreviation: 'System',
      fullName: 'System',
      description: 'Automated processes',
      type: 'system',
      icon: '🤖'
    }
  ];

  actors.forEach(actorData => {
    project.actorRegistry.actors.push(createActor(actorData));
  });

  // Integration Types (same as HWMS)
  const integrationTypes = [
    {
      name: 'Synchronous (REST)',
      abbreviation: 'REST',
      description: 'REpresentational State Transfer',
      style: { lineStyle: 'solid', color: '#2196F3', arrowType: 'single' }
    },
    {
      name: 'Asynchronous (Events)',
      abbreviation: 'Event',
      description: 'Event-driven architecture',
      style: { lineStyle: 'dashed', color: '#FF9800', arrowType: 'double' }
    },
    {
      name: 'Message Queue',
      abbreviation: 'MQ',
      description: 'Message queue-based communication',
      style: { lineStyle: 'dotted', color: '#9C27B0', arrowType: 'filled' }
    }
  ];

  integrationTypes.forEach(typeData => {
    project.integrationTypes.types.push(createIntegrationType(typeData));
  });

  return project;
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export const validateService = (service) => {
  const errors = [];

  if (!service.name || service.name.trim().length < 3) {
    errors.push('Service name must be at least 3 characters');
  }

  if (!service.database || service.database.trim().length < 2) {
    errors.push('Database name is required');
  }

  if (service.abbreviation && !/^[A-Za-z0-9]{2,10}$/.test(service.abbreviation)) {
    errors.push('Abbreviation must be 2-10 alphanumeric characters');
  }

  return errors;
};

export const validateActor = (actor) => {
  const errors = [];

  if (!actor.abbreviation || !/^[A-Za-z0-9]{2,10}$/.test(actor.abbreviation)) {
    errors.push('Abbreviation is required (2-10 alphanumeric characters)');
  }

  if (!actor.fullName || actor.fullName.trim().length < 3) {
    errors.push('Full name must be at least 3 characters');
  }

  if (!['human', 'system', 'external'].includes(actor.type)) {
    errors.push('Type must be human, system, or external');
  }

  return errors;
};

export const validateFlow = (flow) => {
  const errors = [];

  if (!flow.name || flow.name.trim().length < 3) {
    errors.push('Flow name must be at least 3 characters');
  }

  if (!flow.serviceId) {
    errors.push('Service selection is required');
  }

  if (!flow.steps || flow.steps.length === 0) {
    errors.push('At least one step is required');
  }

  // Validate sequential step numbers
  if (flow.steps) {
    const stepNumbers = flow.steps.map(s => s.stepNumber).sort((a, b) => a - b);
    for (let i = 0; i < stepNumbers.length; i++) {
      if (stepNumbers[i] !== i + 1) {
        errors.push('Step numbers must be sequential starting from 1');
        break;
      }
    }
  }

  return errors;
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  // Generators
  generateId,
  createService,
  createServiceDomain,
  createServiceRegistry,
  createActor,
  createActorRegistry,
  createIntegrationType,
  createIntegrationTypeRegistry,
  createFlowStep,
  createFlowIntegration,
  createBusinessRule,
  createErrorScenario,
  createFlow,
  createProjectSettings,
  createProject,

  // Templates
  createHWMSProject,
  createECommerceProject,

  // Validators
  validateService,
  validateActor,
  validateFlow
};
