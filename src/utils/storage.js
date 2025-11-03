/**
 * LocalStorage Wrapper for Project Data Persistence
 * Handles saving, loading, and managing projects in browser storage
 */

const STORAGE_KEY = 'microservices-flow-designer';
const CURRENT_PROJECT_KEY = 'current-project-id';

/**
 * Get all projects from localStorage
 * @returns {Array} Array of project objects
 */
export const getAllProjects = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading projects from storage:', error);
    return [];
  }
};

/**
 * Get a specific project by ID
 * @param {string} projectId - Project ID
 * @returns {Object|null} Project object or null if not found
 */
export const getProject = (projectId) => {
  const projects = getAllProjects();
  return projects.find(p => p.id === projectId) || null;
};

/**
 * Save a project (create or update)
 * @param {Object} project - Project object to save
 * @returns {boolean} Success status
 */
export const saveProject = (project) => {
  try {
    const projects = getAllProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);

    project.updatedAt = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing
      projects[existingIndex] = project;
    } else {
      // Add new
      projects.push(project);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch (error) {
    console.error('Error saving project:', error);
    return false;
  }
};

/**
 * Delete a project
 * @param {string} projectId - Project ID to delete
 * @returns {boolean} Success status
 */
export const deleteProject = (projectId) => {
  try {
    const projects = getAllProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Clear current project if it was deleted
    if (getCurrentProjectId() === projectId) {
      clearCurrentProject();
    }

    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
};

/**
 * Get current project ID
 * @returns {string|null} Current project ID or null
 */
export const getCurrentProjectId = () => {
  return localStorage.getItem(CURRENT_PROJECT_KEY);
};

/**
 * Set current project ID
 * @param {string} projectId - Project ID to set as current
 */
export const setCurrentProjectId = (projectId) => {
  localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
};

/**
 * Clear current project
 */
export const clearCurrentProject = () => {
  localStorage.removeItem(CURRENT_PROJECT_KEY);
};

/**
 * Export project to JSON string
 * @param {Object} project - Project to export
 * @returns {string} JSON string
 */
export const exportProjectToJSON = (project) => {
  return JSON.stringify({
    ...project,
    exportedAt: new Date().toISOString(),
    format: 'Microservices Flow Designer v1.0'
  }, null, 2);
};

/**
 * Import project from JSON string
 * @param {string} jsonString - JSON string to import
 * @returns {Object|null} Imported project or null if invalid
 */
export const importProjectFromJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);

    // Validate basic structure
    if (!data.name || !data.serviceRegistry || !data.actorRegistry) {
      throw new Error('Invalid project format');
    }

    // Remove export metadata
    delete data.exportedAt;
    delete data.format;

    // Update timestamps
    data.updatedAt = new Date().toISOString();

    return data;
  } catch (error) {
    console.error('Error importing project:', error);
    return null;
  }
};

/**
 * Export all projects
 * @returns {string} JSON string of all projects
 */
export const exportAllProjects = () => {
  const projects = getAllProjects();
  return JSON.stringify({
    projects,
    exportedAt: new Date().toISOString(),
    format: 'Microservices Flow Designer Collection v1.0'
  }, null, 2);
};

/**
 * Import multiple projects
 * @param {string} jsonString - JSON string to import
 * @returns {number} Number of projects imported
 */
export const importMultipleProjects = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);

    if (!data.projects || !Array.isArray(data.projects)) {
      throw new Error('Invalid format');
    }

    const currentProjects = getAllProjects();
    const newProjects = [...currentProjects];

    data.projects.forEach(project => {
      // Check if project already exists
      const existingIndex = newProjects.findIndex(p => p.id === project.id);
      if (existingIndex >= 0) {
        // Update existing (ask user first in real implementation)
        newProjects[existingIndex] = {
          ...project,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Add new
        newProjects.push({
          ...project,
          updatedAt: new Date().toISOString()
        });
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
    return data.projects.length;
  } catch (error) {
    console.error('Error importing projects:', error);
    return 0;
  }
};

/**
 * Clear all data (use with caution!)
 */
export const clearAllData = () => {
  if (confirm('Are you sure you want to delete ALL projects? This cannot be undone.')) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_PROJECT_KEY);
    return true;
  }
  return false;
};

/**
 * Get storage statistics
 * @returns {Object} Storage stats
 */
export const getStorageStats = () => {
  const projects = getAllProjects();
  let totalFlows = 0;
  let totalServices = 0;
  let totalActors = 0;

  projects.forEach(project => {
    totalFlows += project.flows?.length || 0;
    project.serviceRegistry?.domains?.forEach(domain => {
      totalServices += domain.services?.length || 0;
    });
    totalActors += project.actorRegistry?.actors?.length || 0;
  });

  return {
    projectCount: projects.length,
    totalFlows,
    totalServices,
    totalActors,
    storageUsed: new Blob([localStorage.getItem(STORAGE_KEY) || '']).size
  };
};

export default {
  getAllProjects,
  getProject,
  saveProject,
  deleteProject,
  getCurrentProjectId,
  setCurrentProjectId,
  clearCurrentProject,
  exportProjectToJSON,
  importProjectFromJSON,
  exportAllProjects,
  importMultipleProjects,
  clearAllData,
  getStorageStats
};
