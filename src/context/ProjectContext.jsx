import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createProject,
  createHWMSProject,
  createActor,
  createService,
  createIntegrationType,
  createServiceDomain,
  generateId
} from '../utils/dataStructure';
import {
  getAllProjects,
  saveProject as saveProjectToStorage,
  getProject,
  getCurrentProjectId,
  setCurrentProjectId
} from '../utils/storage';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [currentProject, setCurrentProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load all projects and current project
  const loadProjects = () => {
    const projects = getAllProjects();
    setAllProjects(projects);

    if (projects.length === 0) {
      // Create default HWMS project if none exist
      const hwmsProject = createHWMSProject();
      saveProjectToStorage(hwmsProject);
      setCurrentProject(hwmsProject);
      setCurrentProjectId(hwmsProject.id);
      setAllProjects([hwmsProject]);
    } else {
      // Load current or first project
      const currentId = getCurrentProjectId();
      const project = currentId ? getProject(currentId) : projects[0];
      setCurrentProject(project || projects[0]);
      if (!currentId) {
        setCurrentProjectId(project?.id || projects[0].id);
      }
    }

    setLoading(false);
  };

  // Save current project
  const saveProject = () => {
    if (currentProject) {
      saveProjectToStorage(currentProject);
      // Update in allProjects
      setAllProjects(prev =>
        prev.map(p => p.id === currentProject.id ? currentProject : p)
      );
      return true;
    }
    return false;
  };

  // Update project field
  const updateProject = (field, value) => {
    setCurrentProject(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  // ========== SERVICE REGISTRY METHODS ==========

  // Add service domain
  const addServiceDomain = (domainData) => {
    const newDomain = createServiceDomain(domainData);
    setCurrentProject(prev => ({
      ...prev,
      serviceRegistry: {
        ...prev.serviceRegistry,
        domains: [...prev.serviceRegistry.domains, newDomain]
      },
      updatedAt: new Date().toISOString()
    }));
    return newDomain;
  };

  // Update service domain
  const updateServiceDomain = (domainId, updates) => {
    setCurrentProject(prev => ({
      ...prev,
      serviceRegistry: {
        ...prev.serviceRegistry,
        domains: prev.serviceRegistry.domains.map(domain =>
          domain.id === domainId ? { ...domain, ...updates } : domain
        )
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete service domain
  const deleteServiceDomain = (domainId) => {
    setCurrentProject(prev => ({
      ...prev,
      serviceRegistry: {
        ...prev.serviceRegistry,
        domains: prev.serviceRegistry.domains.filter(d => d.id !== domainId)
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // Add service to domain
  const addService = (domainId, serviceData) => {
    const newService = createService(serviceData);

    setCurrentProject(prev => ({
      ...prev,
      serviceRegistry: {
        ...prev.serviceRegistry,
        domains: prev.serviceRegistry.domains.map(domain =>
          domain.id === domainId
            ? { ...domain, services: [...domain.services, newService] }
            : domain
        )
      },
      updatedAt: new Date().toISOString()
    }));

    return newService;
  };

  // Update service
  const updateService = (domainId, serviceId, updates) => {
    setCurrentProject(prev => ({
      ...prev,
      serviceRegistry: {
        ...prev.serviceRegistry,
        domains: prev.serviceRegistry.domains.map(domain =>
          domain.id === domainId
            ? {
                ...domain,
                services: domain.services.map(service =>
                  service.id === serviceId ? { ...service, ...updates } : service
                )
              }
            : domain
        )
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete service
  const deleteService = (domainId, serviceId) => {
    setCurrentProject(prev => ({
      ...prev,
      serviceRegistry: {
        ...prev.serviceRegistry,
        domains: prev.serviceRegistry.domains.map(domain =>
          domain.id === domainId
            ? {
                ...domain,
                services: domain.services.filter(s => s.id !== serviceId)
              }
            : domain
        )
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // ========== ACTOR REGISTRY METHODS ==========

  // Add actor
  const addActor = (actorData) => {
    const newActor = createActor(actorData);

    setCurrentProject(prev => ({
      ...prev,
      actorRegistry: {
        ...prev.actorRegistry,
        actors: [...prev.actorRegistry.actors, newActor]
      },
      updatedAt: new Date().toISOString()
    }));

    return newActor;
  };

  // Update actor
  const updateActor = (actorId, updates) => {
    setCurrentProject(prev => ({
      ...prev,
      actorRegistry: {
        ...prev.actorRegistry,
        actors: prev.actorRegistry.actors.map(actor =>
          actor.id === actorId ? { ...actor, ...updates } : actor
        )
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete actor
  const deleteActor = (actorId) => {
    setCurrentProject(prev => ({
      ...prev,
      actorRegistry: {
        ...prev.actorRegistry,
        actors: prev.actorRegistry.actors.filter(a => a.id !== actorId)
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // ========== INTEGRATION TYPES METHODS ==========

  // Add integration type
  const addIntegrationType = (typeData) => {
    const newType = createIntegrationType(typeData);

    setCurrentProject(prev => ({
      ...prev,
      integrationTypes: {
        ...prev.integrationTypes,
        types: [...prev.integrationTypes.types, newType]
      },
      updatedAt: new Date().toISOString()
    }));

    return newType;
  };

  // Update integration type
  const updateIntegrationType = (typeId, updates) => {
    setCurrentProject(prev => ({
      ...prev,
      integrationTypes: {
        ...prev.integrationTypes,
        types: prev.integrationTypes.types.map(type =>
          type.id === typeId ? { ...type, ...updates } : type
        )
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete integration type
  const deleteIntegrationType = (typeId) => {
    setCurrentProject(prev => ({
      ...prev,
      integrationTypes: {
        ...prev.integrationTypes,
        types: prev.integrationTypes.types.filter(t => t.id !== typeId)
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // ========== FLOW METHODS ==========

  // Add flow
  const addFlow = (flowData) => {
    const newFlow = {
      ...flowData,
      id: flowData.id || generateId('flow'),
      projectId: currentProject.id,
      createdAt: flowData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentProject(prev => ({
      ...prev,
      flows: [...prev.flows, newFlow],
      updatedAt: new Date().toISOString()
    }));

    return newFlow;
  };

  // Update flow
  const updateFlow = (flowId, updates) => {
    setCurrentProject(prev => ({
      ...prev,
      flows: prev.flows.map(flow =>
        flow.id === flowId
          ? { ...flow, ...updates, updatedAt: new Date().toISOString() }
          : flow
      ),
      updatedAt: new Date().toISOString()
    }));
  };

  // Delete flow
  const deleteFlow = (flowId) => {
    setCurrentProject(prev => ({
      ...prev,
      flows: prev.flows.filter(f => f.id !== flowId),
      updatedAt: new Date().toISOString()
    }));
  };

  // Duplicate flow
  const duplicateFlow = (flowId) => {
    const originalFlow = currentProject.flows.find(f => f.id === flowId);
    if (!originalFlow) return null;

    const duplicatedFlow = {
      ...originalFlow,
      id: generateId('flow'),
      name: `${originalFlow.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentProject(prev => ({
      ...prev,
      flows: [...prev.flows, duplicatedFlow],
      updatedAt: new Date().toISOString()
    }));

    return duplicatedFlow;
  };

  // ========== HELPER METHODS ==========

  // Get all services as flat list
  const getAllServices = () => {
    const services = [];
    currentProject?.serviceRegistry.domains.forEach(domain => {
      domain.services.forEach(service => {
        services.push({
          ...service,
          domainId: domain.id,
          domainName: domain.name,
          domainColor: domain.color
        });
      });
    });
    return services;
  };

  // Get service by ID
  const getServiceById = (serviceId) => {
    for (const domain of currentProject?.serviceRegistry.domains || []) {
      const service = domain.services.find(s => s.id === serviceId);
      if (service) {
        return {
          ...service,
          domainId: domain.id,
          domainName: domain.name,
          domainColor: domain.color
        };
      }
    }
    return null;
  };

  // Get actor by ID
  const getActorById = (actorId) => {
    return currentProject?.actorRegistry.actors.find(a => a.id === actorId) || null;
  };

  // Get integration type by ID
  const getIntegrationTypeById = (typeId) => {
    return currentProject?.integrationTypes.types.find(t => t.id === typeId) || null;
  };

  const value = {
    // State
    currentProject,
    allProjects,
    loading,

    // Project methods
    saveProject,
    updateProject,
    loadProjects,

    // Service registry methods
    addServiceDomain,
    updateServiceDomain,
    deleteServiceDomain,
    addService,
    updateService,
    deleteService,

    // Actor registry methods
    addActor,
    updateActor,
    deleteActor,

    // Integration types methods
    addIntegrationType,
    updateIntegrationType,
    deleteIntegrationType,

    // Flow methods
    addFlow,
    updateFlow,
    deleteFlow,
    duplicateFlow,

    // Helper methods
    getAllServices,
    getServiceById,
    getActorById,
    getIntegrationTypeById
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
