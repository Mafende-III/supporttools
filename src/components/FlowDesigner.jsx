import React, { useState } from 'react';
import { Plus, Trash2, Save, Send, Download, Upload, FileText, Eye, EyeOff, ArrowRight, Copy, Brain, Sparkles, GitBranch, AlertTriangle, Lightbulb, Database, Users, X } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import SelectWithOther from './common/SelectWithOther';
import CollapsibleSection from './common/CollapsibleSection';
import FlowPreview from './FlowPreview';
import { createFlow, createFlowStep, createFlowIntegration, createServiceInteraction } from '../utils/dataStructure';
import { generateDrawioPrompt, generateMarkdownDoc } from '../utils/exporters';
import { processNaturalLanguageFlow, validateFlow } from '../utils/ai';

const FlowDesigner = () => {
  const {
    currentProject,
    addFlow,
    updateFlow,
    duplicateFlow,
    saveProject,
    getAllServices,
    addActor,
    addIntegrationType,
    addService
  } = useProject();

  const [currentFlow, setCurrentFlow] = useState(createFlow({
    projectId: currentProject?.id
  }));

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    steps: true,
    integrations: false,
    advanced: false
  });

  const [outputType, setOutputType] = useState('drawio');
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState('');
  const [showSavedFlows, setShowSavedFlows] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFlowField = (field, value) => {
    setCurrentFlow(prev => ({ ...prev, [field]: value }));
  };

  const handleAddStep = () => {
    const newStep = createFlowStep(currentFlow.steps.length + 1);
    setCurrentFlow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const handleUpdateStep = (stepId, field, value) => {
    setCurrentFlow(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    }));
  };

  const handleRemoveStep = (stepId) => {
    if (currentFlow.steps.length > 1) {
      setCurrentFlow(prev => ({
        ...prev,
        steps: prev.steps.filter(s => s.id !== stepId)
          .map((step, index) => ({ ...step, stepNumber: index + 1 }))
      }));
    }
  };

  const handleAddIntegration = () => {
    const newIntegration = createFlowIntegration();
    setCurrentFlow(prev => ({
      ...prev,
      integrations: [...prev.integrations, newIntegration]
    }));
  };

  const handleUpdateIntegration = (integrationId, field, value) => {
    setCurrentFlow(prev => ({
      ...prev,
      integrations: prev.integrations.map(int =>
        int.id === integrationId ? { ...int, [field]: value } : int
      )
    }));
  };

  const handleRemoveIntegration = (integrationId) => {
    setCurrentFlow(prev => ({
      ...prev,
      integrations: prev.integrations.filter(i => i.id !== integrationId)
    }));
  };

  const handleSaveFlow = () => {
    if (!currentFlow.name) {
      alert('Please provide a flow name');
      return;
    }

    if (currentFlow.steps.length === 0) {
      alert('Please add at least one step to the flow');
      return;
    }

    addFlow(currentFlow);
    saveProject();
    alert('Flow saved successfully!');
    setCurrentFlow(createFlow({ projectId: currentProject?.id }));
    setShowPreview(false);
  };

  const handlePreview = () => {
    if (!currentFlow.name) {
      alert('Please provide a flow name before previewing');
      return;
    }
    setShowPreview(true);
  };

  const handleProcessWithAI = async () => {
    if (!currentFlow.naturalLanguageDescription) {
      alert('Please enter a flow description in natural language');
      return;
    }

    if (!currentProject.settings?.aiConfig?.enabled) {
      alert('AI features are not enabled. Please configure AI settings first.');
      return;
    }

    setProcessingAI(true);
    setAiSuggestions(null);

    try {
      const result = await processNaturalLanguageFlow(
        currentFlow.naturalLanguageDescription,
        currentProject,
        currentProject.settings.aiConfig
      );

      if (result.success) {
        setAiSuggestions(result.analysis);
        setShowAISuggestions(true);

        // Ask user if they want to apply suggestions
        if (confirm('AI has analyzed your flow description. Would you like to apply the suggestions?')) {
          applyAISuggestions(result.analysis);
        }
      } else {
        alert(`AI processing failed: ${result.error}`);
      }
    } catch (error) {
      console.error('AI processing error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessingAI(false);
    }
  };

  const applyAISuggestions = (analysis) => {
    // Apply suggested metadata
    if (analysis.flowMetadata) {
      setCurrentFlow(prev => ({
        ...prev,
        name: analysis.flowMetadata.name || prev.name,
        description: analysis.flowMetadata.description || prev.description,
        entryPoint: analysis.flowMetadata.entryPoint || prev.entryPoint,
        triggerEvent: analysis.flowMetadata.triggerEvent || prev.triggerEvent,
        priority: analysis.flowMetadata.priority || prev.priority,
        tags: analysis.flowMetadata.tags || prev.tags
      }));
    }

    // Store AI suggestions for later review
    setCurrentFlow(prev => ({
      ...prev,
      aiSuggestions: {
        suggestedServices: analysis.involvedServices || [],
        suggestedActors: analysis.involvedActors || [],
        suggestedIntegrations: analysis.serviceInteractions || [],
        gaps: analysis.validation?.gaps || [],
        lastAnalyzedAt: new Date().toISOString()
      }
    }));

    alert('AI suggestions have been applied! Review the AI Suggestions panel for details.');
  };

  const handleLoadFlow = (flow) => {
    setCurrentFlow(flow);
    setShowSavedFlows(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteFlow = (flowId) => {
    if (confirm('Are you sure you want to delete this flow?')) {
      const updatedFlows = currentProject.flows.filter(f => f.id !== flowId);
      const updatedProject = { ...currentProject, flows: updatedFlows };
      // Update via context (you may need to add a method for this)
      saveProject();
      alert('Flow deleted successfully!');
    }
  };

  const handleResetFlow = () => {
    if (confirm('Are you sure you want to reset the current flow? All unsaved changes will be lost.')) {
      setCurrentFlow(createFlow({ projectId: currentProject?.id }));
    }
  };

  const handleGenerateOutput = () => {
    if (!currentFlow.name || !currentFlow.serviceId) {
      alert('Please complete flow details before generating');
      return;
    }

    const generated = outputType === 'drawio'
      ? generateDrawioPrompt(currentFlow, currentProject)
      : generateMarkdownDoc(currentFlow, currentProject);

    setOutput(generated);
    setShowOutput(true);
    navigator.clipboard.writeText(generated);
    alert('Output copied to clipboard!');
  };

  // Prepare options for SelectWithOther
  const domainOptions = currentProject?.serviceRegistry.domains.map(d => ({
    id: d.id,
    abbreviation: d.name,
    fullName: d.description,
    description: `${d.services.length} services`,
    label: d.name
  })) || [];

  const serviceOptions = currentFlow.serviceDomainId
    ? currentProject?.serviceRegistry.domains
        .find(d => d.id === currentFlow.serviceDomainId)
        ?.services.map(s => ({
          id: s.id,
          abbreviation: s.abbreviation || s.name,
          fullName: s.name,
          description: s.description,
          label: s.name
        })) || []
    : [];

  const actorOptions = currentProject?.actorRegistry.actors.map(a => ({
    id: a.id,
    abbreviation: a.abbreviation,
    fullName: a.fullName,
    description: a.description,
    label: `${a.abbreviation} - ${a.fullName}`
  })) || [];

  const integrationTypeOptions = currentProject?.integrationTypes.types.map(t => ({
    id: t.id,
    abbreviation: t.abbreviation,
    fullName: t.name,
    description: t.description,
    label: t.name
  })) || [];

  const allServiceOptions = getAllServices().map(s => ({
    id: s.id,
    abbreviation: s.abbreviation || s.name,
    fullName: s.name,
    description: `${s.domainName} - ${s.description}`,
    label: s.name
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Flow Designer</h2>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowSavedFlows(!showSavedFlows)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <FileText size={18} />
            Saved Flows ({currentProject?.flows?.length || 0})
          </button>

          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 transition-all"
          >
            <Eye size={18} />
            Preview Flow
          </button>

          <button
            onClick={handleSaveFlow}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Save size={18} />
            Save Flow
          </button>

          <button
            onClick={handleResetFlow}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
          >
            <Trash2 size={18} />
            Reset
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="drawio"
                checked={outputType === 'drawio'}
                onChange={(e) => setOutputType(e.target.value)}
              />
              Draw.io Prompt
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="markdown"
                checked={outputType === 'markdown'}
                onChange={(e) => setOutputType(e.target.value)}
              />
              Markdown Doc
            </label>
          </div>

          <button
            onClick={handleGenerateOutput}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
          >
            <Send size={18} />
            Generate
          </button>
        </div>
      </div>

      {/* Saved Flows Panel */}
      {showSavedFlows && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Saved Flows</h3>
          {!currentProject?.flows || currentProject.flows.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No saved flows yet. Create and save your first flow!</p>
          ) : (
            <div className="space-y-2">
              {currentProject.flows.map(flow => (
                <div key={flow.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-semibold">{flow.name}</div>
                    <div className="text-sm text-gray-600">{flow.description}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Priority: {flow.priority} • Steps: {flow.steps?.length || 0} •
                      Integrations: {flow.integrations?.length || 0}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadFlow(flow)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteFlow(flow.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Output Display */}
      {showOutput && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Generated Output (Copied to Clipboard)</h3>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center gap-1"
              >
                <Copy size={16} />
                Copy Again
              </button>
              <button
                onClick={() => setShowOutput(false)}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
          <pre className="bg-white p-4 rounded border overflow-x-auto text-sm max-h-96">
            {output}
          </pre>
        </div>
      )}

      {/* Basic Information */}
      <CollapsibleSection
        title="Basic Information"
        isExpanded={expandedSections.basic}
        onToggle={() => toggleSection('basic')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Involved Services (Multi-select)
              <span className="text-xs text-gray-500 ml-2">Select all services this cross-cutting flow touches</span>
            </label>
            <select
              multiple
              value={currentFlow.involvedServiceIds || []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                updateFlowField('involvedServiceIds', selected);
              }}
              className="w-full px-3 py-2 border rounded-md min-h-[120px]"
              size="6"
            >
              {getAllServices().map(service => (
                <option key={service.id} value={service.id}>
                  {service.domainName} → {service.name} ({service.abbreviation})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">
              Hold Ctrl/Cmd to select multiple services. Selected: {(currentFlow.involvedServiceIds || []).length}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Service Domain (Optional)</label>
            <select
              value={currentFlow.serviceDomainId || ''}
              onChange={(e) => updateFlowField('serviceDomainId', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">None (Cross-domain flow)</option>
              {domainOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">Select if this flow primarily belongs to one domain</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Flow Name *</label>
              <input
                type="text"
                value={currentFlow.name}
                onChange={(e) => updateFlowField('name', e.target.value)}
                placeholder="e.g., PHP Enrollment Process"
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={currentFlow.priority}
                onChange={(e) => updateFlowField('priority', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={currentFlow.description}
              onChange={(e) => updateFlowField('description', e.target.value)}
              placeholder="Describe the overall flow..."
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* AI-Powered Natural Language Section */}
          {currentProject.settings?.aiConfig?.enabled && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-purple-600" />
                <h4 className="font-bold text-purple-900">AI-Assisted Flow Design</h4>
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </div>
              <label className="block text-sm font-medium mb-2 text-purple-800">
                Describe your flow in natural language:
              </label>
              <textarea
                value={currentFlow.naturalLanguageDescription || ''}
                onChange={(e) => updateFlowField('naturalLanguageDescription', e.target.value)}
                placeholder="Example: When a health professional applies for registration, they submit their credentials through the portal. The system validates the information, sends it to the council for review, and notifies the applicant once approved..."
                rows={5}
                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleProcessWithAI}
                disabled={processingAI || !currentFlow.naturalLanguageDescription}
                className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                {processingAI ? (
                  <>
                    <Brain className="w-4 h-4 animate-pulse" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Process with AI
                  </>
                )}
              </button>
              <p className="text-xs text-purple-700 mt-2">
                AI will analyze your description and suggest services, actors, steps, and integrations.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Entry Point</label>
              <input
                type="text"
                value={currentFlow.entryPoint}
                onChange={(e) => updateFlowField('entryPoint', e.target.value)}
                placeholder="e.g., Career Portal - Apply Button"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Trigger Event</label>
              <input
                type="text"
                value={currentFlow.triggerEvent}
                onChange={(e) => updateFlowField('triggerEvent', e.target.value)}
                placeholder="e.g., User clicks Apply"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Process Steps */}
      <CollapsibleSection
        title="Process Steps"
        badge={currentFlow.steps.length}
        isExpanded={expandedSections.steps}
        onToggle={() => toggleSection('steps')}
      >
        <div className="space-y-4">
          {currentFlow.steps.map(step => (
            <div key={step.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Step {step.stepNumber}</h3>
                <button
                  onClick={() => handleRemoveStep(step.id)}
                  className="text-red-500 hover:text-red-700"
                  disabled={currentFlow.steps.length === 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Actor</label>
                  <SelectWithOther
                    value={step.actorId}
                    onChange={(value) => handleUpdateStep(step.id, 'actorId', value)}
                    options={actorOptions}
                    placeholder="Select Actor"
                    onAddNew={(data) => {
                      const newActor = addActor(data);
                      handleUpdateStep(step.id, 'actorId', newActor.id);
                      saveProject();
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Communication Type</label>
                  <SelectWithOther
                    value={step.communicationTypeId}
                    onChange={(value) => handleUpdateStep(step.id, 'communicationTypeId', value)}
                    options={integrationTypeOptions}
                    placeholder="Select Type"
                    onAddNew={(data) => {
                      const newType = addIntegrationType(data);
                      handleUpdateStep(step.id, 'communicationTypeId', newType.id);
                      saveProject();
                    }}
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Action/Process</label>
                <textarea
                  value={step.action}
                  onChange={(e) => handleUpdateStep(step.id, 'action', e.target.value)}
                  placeholder="Describe the action..."
                  rows={2}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Data Input Description</label>
                  <input
                    type="text"
                    value={step.dataInput.description}
                    onChange={(e) => handleUpdateStep(step.id, 'dataInput', {
                      ...step.dataInput,
                      description: e.target.value
                    })}
                    placeholder="Input data..."
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data Output Description</label>
                  <input
                    type="text"
                    value={step.dataOutput.description}
                    onChange={(e) => handleUpdateStep(step.id, 'dataOutput', {
                      ...step.dataOutput,
                      description: e.target.value
                    })}
                    placeholder="Output data..."
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={step.isDecisionPoint}
                    onChange={(e) => handleUpdateStep(step.id, 'isDecisionPoint', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">This is a decision point</span>
                </label>

                {step.isDecisionPoint && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={step.decisionCriteria}
                      onChange={(e) => handleUpdateStep(step.id, 'decisionCriteria', e.target.value)}
                      placeholder="Decision criteria..."
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={handleAddStep}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 text-gray-600 hover:text-blue-500 flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Step
          </button>
        </div>
      </CollapsibleSection>

      {/* Integration Points Section */}
      <CollapsibleSection
        title="Integration Points"
        badge={currentFlow.integrations.length}
        isExpanded={expandedSections.integrations}
        onToggle={() => toggleSection('integrations')}
      >
        <div className="space-y-4">
          {currentFlow.integrations.map(integration => (
            <div key={integration.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Integration</h3>
                <button
                  onClick={() => handleRemoveIntegration(integration.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">From Service</label>
                  <select
                    value={integration.fromServiceId}
                    onChange={(e) => handleUpdateIntegration(integration.id, 'fromServiceId', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="">Select Service</option>
                    {allServiceOptions.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">To Service</label>
                  <select
                    value={integration.toServiceId}
                    onChange={(e) => handleUpdateIntegration(integration.id, 'toServiceId', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="">Select Service</option>
                    {allServiceOptions.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Communication Type</label>
                  <select
                    value={integration.communicationTypeId}
                    onChange={(e) => handleUpdateIntegration(integration.id, 'communicationTypeId', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="">Select Type</option>
                    {integrationTypeOptions.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Frequency</label>
                  <input
                    type="text"
                    value={integration.frequency}
                    onChange={(e) => handleUpdateIntegration(integration.id, 'frequency', e.target.value)}
                    placeholder="e.g., Real-time, Batch, On-demand"
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Data Exchanged</label>
                <textarea
                  value={integration.dataExchanged}
                  onChange={(e) => handleUpdateIntegration(integration.id, 'dataExchanged', e.target.value)}
                  placeholder="Describe the data being exchanged..."
                  rows={2}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleAddIntegration}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 text-gray-600 hover:text-blue-500 flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Integration
          </button>
        </div>
      </CollapsibleSection>

      {/* Advanced Details Section */}
      <CollapsibleSection
        title="Advanced Details"
        isExpanded={expandedSections.advanced}
        onToggle={() => toggleSection('advanced')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Business Rules & Validations</label>
            <textarea
              value={currentFlow.notes}
              onChange={(e) => updateFlowField('notes', e.target.value)}
              placeholder="List any business rules, validations, or constraints..."
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Performance Requirements</label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={currentFlow.performanceRequirements?.responseTime || ''}
                onChange={(e) => updateFlowField('performanceRequirements', {
                  ...currentFlow.performanceRequirements,
                  responseTime: e.target.value
                })}
                placeholder="Response Time (e.g., < 3s)"
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                value={currentFlow.performanceRequirements?.throughput || ''}
                onChange={(e) => updateFlowField('performanceRequirements', {
                  ...currentFlow.performanceRequirements,
                  throughput: e.target.value
                })}
                placeholder="Throughput (e.g., 1000 req/min)"
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                value={currentFlow.performanceRequirements?.availability || ''}
                onChange={(e) => updateFlowField('performanceRequirements', {
                  ...currentFlow.performanceRequirements,
                  availability: e.target.value
                })}
                placeholder="Availability (e.g., 99.9%)"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={currentFlow.tags?.join(', ') || ''}
              onChange={(e) => updateFlowField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              placeholder="e.g., enrollment, onboarding, certification"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Flow Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold mb-2">Flow Summary</h3>
        <div className="space-y-1 text-sm">
          <p><strong>Flow:</strong> {currentFlow.name || 'Not specified'}</p>
          <p><strong>Priority:</strong> {currentFlow.priority}</p>
          <p><strong>Steps:</strong> {currentFlow.steps.length}</p>
          <p><strong>Integrations:</strong> {currentFlow.integrations.length}</p>
          <p><strong>Decision Points:</strong> {currentFlow.steps.filter(s => s.isDecisionPoint).length}</p>
        </div>

        {currentFlow.steps.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Flow Visualization (Text)</h4>
            <div className="bg-gray-50 p-3 rounded text-sm font-mono">
              {currentFlow.steps.map((step, index) => {
                const actor = currentProject?.actorRegistry.actors.find(a => a.id === step.actorId);
                return (
                  <div key={step.id} className="flex items-center mb-1">
                    <span className="text-blue-600">[{actor?.abbreviation || '?'}]</span>
                    <ArrowRight size={16} className="mx-2 text-gray-400" />
                    <span>{step.action || 'No action specified'}</span>
                    {step.isDecisionPoint && <span className="ml-2 text-red-500">[Decision]</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* AI Suggestions Panel */}
      {showAISuggestions && aiSuggestions && (
        <div className="fixed bottom-4 right-4 w-96 max-h-[600px] bg-white rounded-lg shadow-2xl border-2 border-purple-300 overflow-hidden z-40">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold">AI Suggestions</h3>
            </div>
            <button
              onClick={() => setShowAISuggestions(false)}
              className="hover:bg-white hover:bg-opacity-20 rounded p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[500px]">
            {/* Suggested Services */}
            {aiSuggestions.involvedServices && aiSuggestions.involvedServices.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  Suggested Services
                </h4>
                <div className="space-y-1">
                  {aiSuggestions.involvedServices.map((svc, idx) => (
                    <div key={idx} className="text-sm p-2 bg-purple-50 rounded">
                      <p className="font-medium">{svc.name}</p>
                      {svc.reason && <p className="text-xs text-gray-600">{svc.reason}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Actors */}
            {aiSuggestions.involvedActors && aiSuggestions.involvedActors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  Suggested Actors
                </h4>
                <div className="space-y-1">
                  {aiSuggestions.involvedActors.map((actor, idx) => (
                    <div key={idx} className="text-sm p-2 bg-green-50 rounded">
                      <p className="font-medium">{actor.name} ({actor.abbreviation})</p>
                      {actor.role && <p className="text-xs text-gray-600">Role: {actor.role}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Interactions */}
            {aiSuggestions.serviceInteractions && aiSuggestions.serviceInteractions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-orange-600" />
                  Suggested Integrations
                </h4>
                <div className="space-y-1">
                  {aiSuggestions.serviceInteractions.map((int, idx) => (
                    <div key={idx} className="text-sm p-2 bg-orange-50 rounded">
                      <p className="font-medium">{int.fromService} → {int.toService}</p>
                      <p className="text-xs text-gray-600">{int.method} ({int.interactionType})</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Gaps */}
            {aiSuggestions.validation && aiSuggestions.validation.gaps && aiSuggestions.validation.gaps.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="w-4 h-4" />
                  Identified Gaps
                </h4>
                <ul className="space-y-1">
                  {aiSuggestions.validation.gaps.map((gap, idx) => (
                    <li key={idx} className="text-sm text-yellow-800 bg-yellow-50 p-2 rounded">
                      • {typeof gap === 'string' ? gap : gap.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {aiSuggestions.validation && aiSuggestions.validation.suggestions && aiSuggestions.validation.suggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-blue-700">
                  <Lightbulb className="w-4 h-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {aiSuggestions.validation.suggestions.map((sug, idx) => (
                    <li key={idx} className="text-sm text-blue-800 bg-blue-50 p-2 rounded">
                      • {typeof sug === 'string' ? sug : sug.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flow Preview Modal */}
      {showPreview && (
        <FlowPreview
          flow={currentFlow}
          onClose={() => setShowPreview(false)}
          onSave={handleSaveFlow}
        />
      )}
    </div>
  );
};

export default FlowDesigner;
