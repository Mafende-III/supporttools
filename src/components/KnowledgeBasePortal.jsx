import React, { useState } from 'react';
import { Book, Plus, Trash2, Edit2, Upload, Brain, Save, X, Search, FileText, Users, Workflow, Database } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import SelectWithOther from './common/SelectWithOther';
import CollapsibleSection from './common/CollapsibleSection';
import { createKBService, createKBUser, createKBWorkflow, createKBDocument } from '../utils/dataStructure';
import { extractKnowledgeFromDocument } from '../utils/ai';

const KnowledgeBasePortal = () => {
  const { currentProject, updateProjectKB, saveProject } = useProject();
  const [activeTab, setActiveTab] = useState('services'); // services | users | workflows | documents
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [serviceForm, setServiceForm] = useState({});
  const [userForm, setUserForm] = useState({});
  const [workflowForm, setWorkflowForm] = useState({});
  const [documentForm, setDocumentForm] = useState({});
  const [processingAI, setProcessingAI] = useState(false);

  if (!currentProject) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Book className="mx-auto h-12 w-12 mb-4" />
        <p>No project selected. Please select or create a project first.</p>
      </div>
    );
  }

  const kb = currentProject.knowledgeBase || { services: [], users: [], workflows: [], documents: [] };
  const aiEnabled = currentProject.settings?.aiConfig?.enabled;

  // Filter items based on search
  const filterItems = (items) => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.abbreviation && item.abbreviation.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.keywords && item.keywords.some(k => k.toLowerCase().includes(query)))
    );
  };

  const handleAddService = () => {
    const newService = createKBService({
      ...serviceForm,
      capabilities: serviceForm.capabilities?.split(',').map(c => c.trim()).filter(Boolean) || [],
      keywords: serviceForm.keywords?.split(',').map(k => k.trim()).filter(Boolean) || [],
      userTypes: serviceForm.userTypes?.split(',').map(u => u.trim()).filter(Boolean) || [],
      healthProfessionalStages: serviceForm.healthProfessionalStages?.split(',').map(s => s.trim()).filter(Boolean) || [],
      ministryFunctions: serviceForm.ministryFunctions?.split(',').map(m => m.trim()).filter(Boolean) || [],
      apiEndpoints: serviceForm.apiEndpoints || [],
      dataEntities: serviceForm.dataEntities || []
    });

    updateProjectKB({
      ...kb,
      services: [...kb.services, newService]
    });

    setServiceForm({});
    setShowAddModal(false);
    saveProject();
  };

  const handleAddUser = () => {
    const newUser = createKBUser({
      ...userForm,
      keywords: userForm.keywords?.split(',').map(k => k.trim()).filter(Boolean) || [],
      permissions: userForm.permissions?.split(',').map(p => p.trim()).filter(Boolean) || []
    });

    updateProjectKB({
      ...kb,
      users: [...kb.users, newUser]
    });

    setUserForm({});
    setShowAddModal(false);
    saveProject();
  };

  const handleAddWorkflow = () => {
    const newWorkflow = createKBWorkflow({
      ...workflowForm,
      keywords: workflowForm.keywords?.split(',').map(k => k.trim()).filter(Boolean) || [],
      typicalSteps: workflowForm.typicalSteps?.split('\n').map(s => s.trim()).filter(Boolean) || []
    });

    updateProjectKB({
      ...kb,
      workflows: [...kb.workflows, newWorkflow]
    });

    setWorkflowForm({});
    setShowAddModal(false);
    saveProject();
  };

  const handleAddDocument = async () => {
    const newDoc = createKBDocument(documentForm);

    // If AI is enabled, process document automatically
    if (aiEnabled && currentProject.settings.aiConfig.features.knowledgeExtraction) {
      setProcessingAI(true);
      try {
        const result = await extractKnowledgeFromDocument(newDoc, currentProject, currentProject.settings.aiConfig);

        if (result.success) {
          newDoc.extractedServices = result.extracted.services || [];
          newDoc.extractedEndpoints = result.extracted.endpoints || [];
          newDoc.extractedEntities = result.extracted.entities || [];
          newDoc.extractedWorkflows = result.extracted.workflows || [];
          newDoc.processingStatus = 'completed';
          newDoc.processedAt = new Date().toISOString();

          alert(`Document processed successfully!\n\nFound:\n- ${result.extracted.services?.length || 0} services\n- ${result.extracted.users?.length || 0} users\n- ${result.extracted.workflows?.length || 0} workflows\n\nYou can review and add them to the knowledge base.`);
        } else {
          newDoc.processingStatus = 'error';
          alert(`AI processing failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Document processing error:', error);
        newDoc.processingStatus = 'error';
      } finally {
        setProcessingAI(false);
      }
    }

    updateProjectKB({
      ...kb,
      documents: [...kb.documents, newDoc]
    });

    setDocumentForm({});
    setShowAddModal(false);
    saveProject();
  };

  const handleDeleteItem = (type, id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    updateProjectKB({
      ...kb,
      [type]: kb[type].filter(item => item.id !== id)
    });

    saveProject();
  };

  // Render service form
  const renderServiceForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input
          type="text"
          value={serviceForm.name || ''}
          onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., User Authentication Service"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Abbreviation *</label>
        <input
          type="text"
          value={serviceForm.abbreviation || ''}
          onChange={(e) => setServiceForm({ ...serviceForm, abbreviation: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., UAS"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={serviceForm.type || 'service'}
          onChange={(e) => setServiceForm({ ...serviceForm, type: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="service">Service</option>
          <option value="functionality">Functionality</option>
          <option value="component">Component</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description *</label>
        <textarea
          value={serviceForm.description || ''}
          onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          rows="3"
          placeholder="Describe what this service does..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Capabilities (comma-separated)</label>
        <input
          type="text"
          value={serviceForm.capabilities || ''}
          onChange={(e) => setServiceForm({ ...serviceForm, capabilities: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., User login, Password reset, MFA"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
        <input
          type="text"
          value={serviceForm.keywords || ''}
          onChange={(e) => setServiceForm({ ...serviceForm, keywords: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., authentication, login, security, access"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Health Professional Stages (comma-separated)</label>
        <input
          type="text"
          value={serviceForm.healthProfessionalStages || ''}
          onChange={(e) => setServiceForm({ ...serviceForm, healthProfessionalStages: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., Student, Licensed, Practicing"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ministry Functions (comma-separated)</label>
        <input
          type="text"
          value={serviceForm.ministryFunctions || ''}
          onChange={(e) => setServiceForm({ ...serviceForm, ministryFunctions: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., Registration, Certification, Deployment"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={handleAddService}
          disabled={!serviceForm.name || !serviceForm.abbreviation || !serviceForm.description}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Save className="inline w-4 h-4 mr-2" />
          Save Service
        </button>
        <button
          onClick={() => { setShowAddModal(false); setServiceForm({}); }}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <X className="inline w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );

  // Render user form
  const renderUserForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input
          type="text"
          value={userForm.name || ''}
          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., Health Professional"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Abbreviation *</label>
        <input
          type="text"
          value={userForm.abbreviation || ''}
          onChange={(e) => setUserForm({ ...userForm, abbreviation: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., HP"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={userForm.type || 'human'}
          onChange={(e) => setUserForm({ ...userForm, type: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="human">Human</option>
          <option value="system">System</option>
          <option value="external">External</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <input
          type="text"
          value={userForm.role || ''}
          onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., Practitioner, Administrator"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description *</label>
        <textarea
          value={userForm.description || ''}
          onChange={(e) => setUserForm({ ...userForm, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          rows="3"
          placeholder="Describe this user type..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Health Professional Stage</label>
        <input
          type="text"
          value={userForm.healthProfessionalStage || ''}
          onChange={(e) => setUserForm({ ...userForm, healthProfessionalStage: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., Licensed, Practicing"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
        <input
          type="text"
          value={userForm.keywords || ''}
          onChange={(e) => setUserForm({ ...userForm, keywords: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., doctor, nurse, clinician"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={handleAddUser}
          disabled={!userForm.name || !userForm.abbreviation || !userForm.description}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Save className="inline w-4 h-4 mr-2" />
          Save User
        </button>
        <button
          onClick={() => { setShowAddModal(false); setUserForm({}); }}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <X className="inline w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );

  // Render workflow form
  const renderWorkflowForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input
          type="text"
          value={workflowForm.name || ''}
          onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., Professional Registration"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <input
          type="text"
          value={workflowForm.category || ''}
          onChange={(e) => setWorkflowForm({ ...workflowForm, category: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., Registration, Certification"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description *</label>
        <textarea
          value={workflowForm.description || ''}
          onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          rows="3"
          placeholder="Describe this workflow..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Typical Steps (one per line)</label>
        <textarea
          value={workflowForm.typicalSteps || ''}
          onChange={(e) => setWorkflowForm({ ...workflowForm, typicalSteps: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          rows="5"
          placeholder="e.g.,&#10;Submit application&#10;Verify credentials&#10;Review by council&#10;Approve or reject"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
        <input
          type="text"
          value={workflowForm.keywords || ''}
          onChange={(e) => setWorkflowForm({ ...workflowForm, keywords: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., registration, approval, verification"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={handleAddWorkflow}
          disabled={!workflowForm.name || !workflowForm.description}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Save className="inline w-4 h-4 mr-2" />
          Save Workflow
        </button>
        <button
          onClick={() => { setShowAddModal(false); setWorkflowForm({}); }}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <X className="inline w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );

  // Render document form
  const renderDocumentForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          type="text"
          value={documentForm.title || ''}
          onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., API Documentation"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={documentForm.type || 'documentation'}
          onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="documentation">Documentation</option>
          <option value="code">Code</option>
          <option value="specification">Specification</option>
          <option value="requirement">Requirement</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content *</label>
        <textarea
          value={documentForm.content || ''}
          onChange={(e) => setDocumentForm({ ...documentForm, content: e.target.value })}
          className="w-full px-3 py-2 border rounded-md font-mono text-sm"
          rows="10"
          placeholder="Paste your documentation, code, or specifications here..."
        />
      </div>

      {aiEnabled && currentProject.settings.aiConfig.features.knowledgeExtraction && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            <Brain className="inline w-4 h-4 mr-1" />
            AI will automatically extract services, endpoints, and workflows from this document.
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <button
          onClick={handleAddDocument}
          disabled={!documentForm.title || !documentForm.content || processingAI}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {processingAI ? (
            <>
              <Brain className="inline w-4 h-4 mr-2 animate-spin" />
              Processing with AI...
            </>
          ) : (
            <>
              <Save className="inline w-4 h-4 mr-2" />
              Save Document
            </>
          )}
        </button>
        <button
          onClick={() => { setShowAddModal(false); setDocumentForm({}); }}
          disabled={processingAI}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <X className="inline w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Book className="w-8 h-8" />
              Knowledge Base Portal
            </h1>
            <p className="text-gray-600 mt-1">
              Build and manage your system's knowledge base for AI-assisted flow design
            </p>
          </div>
          {!aiEnabled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md px-4 py-2">
              <p className="text-sm text-yellow-800">
                AI features are disabled. Configure in Project Settings to enable AI-assisted extraction.
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <Database className="w-6 h-6 text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{kb.services?.length || 0}</div>
            <div className="text-sm text-gray-600">Services</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <Users className="w-6 h-6 text-green-600 mb-2" />
            <div className="text-2xl font-bold">{kb.users?.length || 0}</div>
            <div className="text-sm text-gray-600">Users/Actors</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <Workflow className="w-6 h-6 text-purple-600 mb-2" />
            <div className="text-2xl font-bold">{kb.workflows?.length || 0}</div>
            <div className="text-sm text-gray-600">Workflows</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <FileText className="w-6 h-6 text-orange-600 mb-2" />
            <div className="text-2xl font-bold">{kb.documents?.length || 0}</div>
            <div className="text-sm text-gray-600">Documents</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'services'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="inline w-4 h-4 mr-2" />
            Services ({kb.services?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="inline w-4 h-4 mr-2" />
            Users ({kb.users?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'workflows'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Workflow className="inline w-4 h-4 mr-2" />
            Workflows ({kb.workflows?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'documents'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="inline w-4 h-4 mr-2" />
            Documents ({kb.documents?.length || 0})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {activeTab === 'services' && 'Services & Functionalities'}
            {activeTab === 'users' && 'Users & Actors'}
            {activeTab === 'workflows' && 'Common Workflows'}
            {activeTab === 'documents' && 'Knowledge Documents'}
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}
          </button>
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {filterItems(kb.services || []).map(service => (
              <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{service.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{service.abbreviation} • {service.type}</p>
                    <p className="text-gray-700 mb-2">{service.description}</p>

                    {service.capabilities.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium">Capabilities:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {service.capabilities.map((cap, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {service.keywords.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium">Keywords:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {service.keywords.map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Updated: {new Date(service.lastUpdated).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteItem('services', service.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filterItems(kb.services || []).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No services found. Click "Add Service" to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {filterItems(kb.users || []).map(user => (
              <div key={user.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{user.abbreviation} • {user.type} • {user.role}</p>
                    <p className="text-gray-700 mb-2">{user.description}</p>

                    {user.healthProfessionalStage && (
                      <p className="text-sm mb-2">
                        <span className="font-medium">Health Professional Stage:</span> {user.healthProfessionalStage}
                      </p>
                    )}

                    {user.keywords.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium">Keywords:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.keywords.map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Updated: {new Date(user.lastUpdated).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteItem('users', user.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filterItems(kb.users || []).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users found. Click "Add User" to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className="space-y-4">
            {filterItems(kb.workflows || []).map(workflow => (
              <div key={workflow.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{workflow.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{workflow.category}</p>
                    <p className="text-gray-700 mb-2">{workflow.description}</p>

                    {workflow.typicalSteps.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium">Typical Steps:</span>
                        <ol className="list-decimal list-inside mt-1 text-sm text-gray-700">
                          {workflow.typicalSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {workflow.keywords.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium">Keywords:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {workflow.keywords.map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Updated: {new Date(workflow.lastUpdated).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteItem('workflows', workflow.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filterItems(kb.workflows || []).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No workflows found. Click "Add Workflow" to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            {filterItems(kb.documents || []).map(doc => (
              <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{doc.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{doc.type}</p>

                    <div className="bg-gray-50 rounded p-2 mb-2 max-h-32 overflow-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">{doc.content.substring(0, 300)}...</pre>
                    </div>

                    <div className="flex items-center gap-4 text-sm mb-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        doc.processingStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        doc.processingStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        doc.processingStatus === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.processingStatus}
                      </span>

                      {doc.processingStatus === 'completed' && (
                        <span className="text-gray-600">
                          Extracted: {doc.extractedServices?.length || 0} services,{' '}
                          {doc.extractedEndpoints?.length || 0} endpoints,{' '}
                          {doc.extractedWorkflows?.length || 0} workflows
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                      {doc.processedAt && ` • Processed: ${new Date(doc.processedAt).toLocaleString()}`}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteItem('documents', doc.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filterItems(kb.documents || []).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No documents found. Click "Add Document" to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                Add New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1, -1)}
              </h2>

              {activeTab === 'services' && renderServiceForm()}
              {activeTab === 'users' && renderUserForm()}
              {activeTab === 'workflows' && renderWorkflowForm()}
              {activeTab === 'documents' && renderDocumentForm()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBasePortal;
