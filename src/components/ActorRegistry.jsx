import React, { useState } from 'react';
import { Plus, Trash2, Users, User, Bot, Globe } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const ActorRegistry = () => {
  const { currentProject, addActor, updateActor, deleteActor, saveProject } = useProject();

  const [showAddActor, setShowAddActor] = useState(false);
  const [newActorData, setNewActorData] = useState({
    abbreviation: '',
    fullName: '',
    description: '',
    type: 'human',
    icon: '👤'
  });
  const [errors, setErrors] = useState([]);
  const [filterType, setFilterType] = useState('all');

  const typeIcons = {
    human: User,
    system: Bot,
    external: Globe
  };

  const handleAddActor = () => {
    const validationErrors = [];

    if (!newActorData.abbreviation || newActorData.abbreviation.trim().length < 2) {
      validationErrors.push('Abbreviation must be at least 2 characters');
    }

    if (!newActorData.fullName || newActorData.fullName.trim().length < 3) {
      validationErrors.push('Full name must be at least 3 characters');
    }

    // Check duplicates
    const isDuplicate = currentProject.actorRegistry.actors.some(
      a => a.abbreviation.toLowerCase() === newActorData.abbreviation.trim().toLowerCase()
    );

    if (isDuplicate) {
      validationErrors.push('This abbreviation already exists');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    addActor(newActorData);
    setNewActorData({
      abbreviation: '',
      fullName: '',
      description: '',
      type: 'human',
      icon: '👤'
    });
    setShowAddActor(false);
    setErrors([]);
    saveProject();
  };

  const handleDeleteActor = (actorId) => {
    if (confirm('Delete this actor?')) {
      deleteActor(actorId);
      saveProject();
    }
  };

  const filteredActors = filterType === 'all'
    ? currentProject?.actorRegistry.actors || []
    : currentProject?.actorRegistry.actors.filter(a => a.type === filterType) || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users size={24} />
              Actor Registry
            </h2>
            <p className="text-gray-600 mt-1">
              Manage actors, users, and systems for {currentProject?.name}
            </p>
          </div>
          <button
            onClick={() => setShowAddActor(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Actor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {currentProject?.actorRegistry.actors.length || 0}
            </div>
            <div className="text-sm text-gray-600">Total Actors</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {currentProject?.actorRegistry.actors.filter(a => a.type === 'human').length || 0}
            </div>
            <div className="text-sm text-gray-600">Human Actors</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {currentProject?.actorRegistry.actors.filter(a => a.type === 'system').length || 0}
            </div>
            <div className="text-sm text-gray-600">System Actors</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {currentProject?.actorRegistry.actors.filter(a => a.type === 'external').length || 0}
            </div>
            <div className="text-sm text-gray-600">External Systems</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded ${filterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('human')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${filterType === 'human' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <User size={16} /> Human
          </button>
          <button
            onClick={() => setFilterType('system')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${filterType === 'system' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <Bot size={16} /> System
          </button>
          <button
            onClick={() => setFilterType('external')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${filterType === 'external' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <Globe size={16} /> External
          </button>
        </div>
      </div>

      {/* Add Actor Modal */}
      {showAddActor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New Actor</h3>

            {errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <ul className="text-sm text-red-600 list-disc list-inside">
                  {errors.map((error, i) => <li key={i}>{error}</li>)}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Abbreviation *</label>
                <input
                  type="text"
                  value={newActorData.abbreviation}
                  onChange={(e) => setNewActorData(prev => ({ ...prev, abbreviation: e.target.value }))}
                  placeholder="e.g., PHP, Admin, System"
                  className="w-full px-3 py-2 border rounded-md"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newActorData.fullName}
                  onChange={(e) => setNewActorData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g., Prospect Health Professional"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newActorData.description}
                  onChange={(e) => setNewActorData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this actor..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type *</label>
                <select
                  value={newActorData.type}
                  onChange={(e) => setNewActorData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="human">Human</option>
                  <option value="system">System</option>
                  <option value="external">External</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Icon (Emoji)</label>
                <input
                  type="text"
                  value={newActorData.icon}
                  onChange={(e) => setNewActorData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="👤"
                  className="w-full px-3 py-2 border rounded-md"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddActor(false);
                  setErrors([]);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddActor}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Actor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actors List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {filteredActors.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No actors found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActors.map(actor => {
              const Icon = typeIcons[actor.type];
              return (
                <div
                  key={actor.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{actor.icon}</span>
                      <Icon size={16} className="text-gray-400" />
                    </div>
                    <button
                      onClick={() => handleDeleteActor(actor.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="font-bold text-lg mb-1">{actor.abbreviation}</div>
                  <div className="text-gray-700 mb-2">{actor.fullName}</div>
                  {actor.description && (
                    <div className="text-sm text-gray-600">{actor.description}</div>
                  )}
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      actor.type === 'human' ? 'bg-green-100 text-green-800' :
                      actor.type === 'system' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {actor.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActorRegistry;
