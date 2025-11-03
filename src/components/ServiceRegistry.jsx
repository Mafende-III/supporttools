import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Database, Layers } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import CollapsibleSection from './common/CollapsibleSection';

const ServiceRegistry = () => {
  const {
    currentProject,
    addServiceDomain,
    updateServiceDomain,
    deleteServiceDomain,
    addService,
    updateService,
    deleteService,
    saveProject
  } = useProject();

  const [expandedDomains, setExpandedDomains] = useState({});
  const [editingDomain, setEditingDomain] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [showAddService, setShowAddService] = useState(null);

  const [newDomainData, setNewDomainData] = useState({
    name: '',
    description: '',
    color: '#2196F3'
  });

  const [newServiceData, setNewServiceData] = useState({
    name: '',
    abbreviation: '',
    description: '',
    database: ''
  });

  const toggleDomain = (domainId) => {
    setExpandedDomains(prev => ({ ...prev, [domainId]: !prev[domainId] }));
  };

  const handleAddDomain = () => {
    if (newDomainData.name.trim()) {
      addServiceDomain(newDomainData);
      setNewDomainData({ name: '', description: '', color: '#2196F3' });
      setShowAddDomain(false);
      saveProject();
    }
  };

  const handleAddService = (domainId) => {
    if (newServiceData.name.trim()) {
      addService(domainId, newServiceData);
      setNewServiceData({ name: '', abbreviation: '', description: '', database: '' });
      setShowAddService(null);
      saveProject();
    }
  };

  const handleDeleteDomain = (domainId) => {
    if (confirm('Delete this domain and all its services?')) {
      deleteServiceDomain(domainId);
      saveProject();
    }
  };

  const handleDeleteService = (domainId, serviceId) => {
    if (confirm('Delete this service?')) {
      deleteService(domainId, serviceId);
      saveProject();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Layers size={24} />
              Service Registry
            </h2>
            <p className="text-gray-600 mt-1">
              Manage microservices and domains for {currentProject?.name}
            </p>
          </div>
          <button
            onClick={() => setShowAddDomain(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Domain
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {currentProject?.serviceRegistry.domains.length || 0}
            </div>
            <div className="text-sm text-gray-600">Service Domains</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {currentProject?.serviceRegistry.domains.reduce((acc, d) => acc + d.services.length, 0) || 0}
            </div>
            <div className="text-sm text-gray-600">Total Services</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {currentProject?.flows.length || 0}
            </div>
            <div className="text-sm text-gray-600">Active Flows</div>
          </div>
        </div>
      </div>

      {/* Add Domain Modal */}
      {showAddDomain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Service Domain</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Domain Name *</label>
                <input
                  type="text"
                  value={newDomainData.name}
                  onChange={(e) => setNewDomainData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Education & Certification"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newDomainData.description}
                  onChange={(e) => setNewDomainData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="color"
                  value={newDomainData.color}
                  onChange={(e) => setNewDomainData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddDomain(false)}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDomain}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Domain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Domains List */}
      <div className="space-y-4">
        {currentProject?.serviceRegistry.domains.map(domain => (
          <div key={domain.id} className="bg-white rounded-lg shadow-md">
            <div
              className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => toggleDomain(domain.id)}
              style={{ borderLeftColor: domain.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: domain.color }}
                ></div>
                <div>
                  <h3 className="text-lg font-bold">{domain.name}</h3>
                  <p className="text-sm text-gray-600">{domain.description}</p>
                </div>
                <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {domain.services.length} services
                </span>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowAddService(domain.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => handleDeleteDomain(domain.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {expandedDomains[domain.id] && (
              <div className="p-4">
                {domain.services.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No services in this domain</p>
                ) : (
                  <div className="space-y-2">
                    {domain.services.map(service => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Database size={16} className="text-gray-500" />
                            <span className="font-semibold">{service.name}</span>
                            {service.abbreviation && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                {service.abbreviation}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {service.description}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Database: {service.database}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteService(domain.id, service.id)}
                          className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Service Form */}
                {showAddService === domain.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed">
                    <h4 className="font-semibold mb-3">Add New Service</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newServiceData.name}
                        onChange={(e) => setNewServiceData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Service Name *"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      <input
                        type="text"
                        value={newServiceData.abbreviation}
                        onChange={(e) => setNewServiceData(prev => ({ ...prev, abbreviation: e.target.value }))}
                        placeholder="Abbreviation (e.g., EMS)"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      <input
                        type="text"
                        value={newServiceData.database}
                        onChange={(e) => setNewServiceData(prev => ({ ...prev, database: e.target.value }))}
                        placeholder="Database Name *"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      <textarea
                        value={newServiceData.description}
                        onChange={(e) => setNewServiceData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description"
                        rows={2}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddService(null)}
                          className="flex-1 px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddService(domain.id)}
                          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          Add Service
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceRegistry;
