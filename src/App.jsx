import React, { useState } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import ServiceRegistry from './components/ServiceRegistry';
import ActorRegistry from './components/ActorRegistry';
import FlowDesigner from './components/FlowDesigner';
import {
  Layers, Users, Workflow, Settings, FileText, Download, Upload, Save
} from 'lucide-react';
import { exportProjectToJSON, importProjectFromJSON } from './utils/storage';

const AppContent = () => {
  const { currentProject, saveProject } = useProject();
  const [activeTab, setActiveTab] = useState('flows');

  const handleExportProject = () => {
    const json = exportProjectToJSON(currentProject);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `${currentProject.name.replace(/\s+/g, '-')}-${Date.now()}.json`);
    link.click();
  };

  const handleImportProject = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imported = importProjectFromJSON(e.target.result);
        if (imported) {
          alert('Project imported! (Note: In full version, this would create a new project)');
        } else {
          alert('Error importing project. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'flows', label: 'Flow Designer', icon: Workflow },
    { id: 'services', label: 'Service Registry', icon: Layers },
    { id: 'actors', label: 'Actor Registry', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Microservices Flow Designer</h1>
              <p className="text-blue-100 text-sm mt-1">
                Project: {currentProject?.name} v{currentProject?.version}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => saveProject()}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2 font-semibold"
              >
                <Save size={18} />
                Save Project
              </button>

              <button
                onClick={handleExportProject}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 flex items-center gap-2"
              >
                <Download size={18} />
                Export
              </button>

              <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 flex items-center gap-2 cursor-pointer">
                <Upload size={18} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportProject}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'flows' && <FlowDesigner />}
        {activeTab === 'services' && <ServiceRegistry />}
        {activeTab === 'actors' && <ActorRegistry />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <p>Generic Microservices Flow Designer v1.0</p>
              <p className="text-xs mt-1">
                Professional business analysis tool for mapping microservice workflows
              </p>
            </div>
            <div className="text-right">
              <p>Last updated: {new Date(currentProject?.updatedAt).toLocaleString()}</p>
              <p className="text-xs mt-1">
                {currentProject?.serviceRegistry.domains.reduce((acc, d) => acc + d.services.length, 0)} services •{' '}
                {currentProject?.actorRegistry.actors.length} actors •{' '}
                {currentProject?.flows.length} flows
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
};

export default App;
