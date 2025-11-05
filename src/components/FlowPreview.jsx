import React, { useState, useEffect } from 'react';
import {
  Eye, X, Download, CheckCircle, AlertTriangle, Users, Database, GitBranch,
  Clock, TrendingUp, Activity, Layers, Zap, FileText, Image
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import {
  generateDrawioPrompt,
  generateMarkdownDoc,
  generateServiceInteractionMatrix,
  generateSequenceDiagram,
  generateArchitectureDiagram
} from '../utils/exporters';

const FlowPreview = ({ flow, onClose, onSave }) => {
  const { currentProject, getAllServices } = useProject();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMermaid, setShowMermaid] = useState(true);

  if (!flow || !currentProject) return null;

  // Calculate statistics
  const stats = {
    steps: flow.steps?.length || 0,
    actors: new Set(flow.steps?.map(s => s.actorId).filter(Boolean)).size,
    services: (flow.involvedServiceIds?.length || 0) +
              new Set(flow.steps?.flatMap(s => s.serviceIds || []).filter(Boolean)).size,
    integrations: (flow.integrations?.length || 0) + (flow.serviceInteractions?.length || 0),
    decisionPoints: flow.steps?.filter(s => s.isDecisionPoint).length || 0,
    businessRules: flow.businessRules?.length || 0,
    errorScenarios: flow.errorScenarios?.length || 0
  };

  // Calculate completeness
  const calculateCompleteness = () => {
    let score = 0;
    let total = 0;

    // Required fields
    if (flow.name) score++; total++;
    if (flow.description) score++; total++;
    if (flow.steps && flow.steps.length > 0) score++; total++;
    if (flow.involvedServiceIds && flow.involvedServiceIds.length > 0) score++; total++;

    // Optional but important
    if (flow.entryPoint) score++; total++;
    if (flow.triggerEvent) score++; total++;
    if (flow.actorIds && flow.actorIds.length > 0) score++; total++;

    // Steps quality
    const stepsComplete = flow.steps?.every(s => s.action && s.actorId) || false;
    if (stepsComplete) score++; total++;

    // Integration documentation
    if ((flow.integrations?.length || 0) > 0 || (flow.serviceInteractions?.length || 0) > 0) {
      score++; total++;
    }

    // Business rules
    if (flow.businessRules && flow.businessRules.length > 0) score++; total++;

    // Error handling
    if (flow.errorScenarios && flow.errorScenarios.length > 0) score++; total++;

    // Performance requirements
    if (flow.performanceRequirements?.responseTime ||
        flow.performanceRequirements?.throughput ||
        flow.performanceRequirements?.availability) {
      score++; total++;
    }

    return Math.round((score / total) * 100);
  };

  const completeness = calculateCompleteness();

  const getCompletenessColor = () => {
    if (completeness >= 80) return 'text-green-600';
    if (completeness >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletenessIcon = () => {
    if (completeness >= 80) return CheckCircle;
    return AlertTriangle;
  };

  // Get service/actor names
  const getServiceName = (serviceId) => {
    for (const domain of currentProject.serviceRegistry.domains) {
      const service = domain.services.find(s => s.id === serviceId);
      if (service) return service.name;
    }
    return 'Unknown Service';
  };

  const getActorName = (actorId) => {
    const actor = currentProject.actorRegistry.actors.find(a => a.id === actorId);
    return actor ? `${actor.abbreviation} - ${actor.fullName}` : 'Unknown Actor';
  };

  // Generate text flow visualization
  const generateTextFlowVisualization = () => {
    if (!flow.steps || flow.steps.length === 0) return 'No steps defined';

    return flow.steps.map((step, index) => {
      const actor = currentProject.actorRegistry.actors.find(a => a.id === step.actorId);
      const arrow = index < flow.steps.length - 1 ? ' →' : '';
      return `${actor?.abbreviation || '?'}${arrow}`;
    }).join(' ');
  };

  // Download handler
  const handleDownload = (format) => {
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    switch (format) {
      case 'drawio':
        content = generateDrawioPrompt(flow, currentProject);
        filename = `${flow.name.replace(/[^a-z0-9]/gi, '_')}_drawio_prompt.txt`;
        break;
      case 'markdown':
        content = generateMarkdownDoc(flow, currentProject);
        filename = `${flow.name.replace(/[^a-z0-9]/gi, '_')}.md`;
        break;
      case 'matrix':
        content = generateServiceInteractionMatrix(flow, currentProject);
        filename = `${flow.name.replace(/[^a-z0-9]/gi, '_')}_matrix.md`;
        break;
      case 'sequence':
        content = generateSequenceDiagram(flow, currentProject);
        filename = `${flow.name.replace(/[^a-z0-9]/gi, '_')}_sequence.md`;
        break;
      case 'architecture':
        content = generateArchitectureDiagram(flow, currentProject);
        filename = `${flow.name.replace(/[^a-z0-9]/gi, '_')}_architecture.md`;
        break;
      case 'json':
        content = JSON.stringify(flow, null, 2);
        filename = `${flow.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        mimeType = 'application/json';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const CompletenessIcon = getCompletenessIcon();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">{flow.name}</h2>
              <p className="text-blue-100 text-sm">{flow.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 border-b">
          <div className="text-center">
            <Layers className="w-5 h-5 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-gray-900">{stats.steps}</div>
            <div className="text-xs text-gray-600">Steps</div>
          </div>
          <div className="text-center">
            <Users className="w-5 h-5 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold text-gray-900">{stats.actors}</div>
            <div className="text-xs text-gray-600">Actors</div>
          </div>
          <div className="text-center">
            <Database className="w-5 h-5 mx-auto text-purple-600 mb-1" />
            <div className="text-2xl font-bold text-gray-900">{stats.services}</div>
            <div className="text-xs text-gray-600">Services</div>
          </div>
          <div className="text-center">
            <GitBranch className="w-5 h-5 mx-auto text-orange-600 mb-1" />
            <div className="text-2xl font-bold text-gray-900">{stats.integrations}</div>
            <div className="text-xs text-gray-600">Integrations</div>
          </div>
          <div className="text-center">
            <Zap className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
            <div className="text-2xl font-bold text-gray-900">{stats.decisionPoints}</div>
            <div className="text-xs text-gray-600">Decisions</div>
          </div>
          <div className="text-center">
            <FileText className="w-5 h-5 mx-auto text-indigo-600 mb-1" />
            <div className="text-2xl font-bold text-gray-900">{stats.businessRules}</div>
            <div className="text-xs text-gray-600">Rules</div>
          </div>
          <div className="text-center">
            <CompletenessIcon className={`w-5 h-5 mx-auto mb-1 ${getCompletenessColor()}`} />
            <div className={`text-2xl font-bold ${getCompletenessColor()}`}>{completeness}%</div>
            <div className="text-xs text-gray-600">Complete</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Activity className="inline w-4 h-4 mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'flow'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Layers className="inline w-4 h-4 mr-2" />
            Flow Steps
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'services'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Database className="inline w-4 h-4 mr-2" />
            Services
          </button>
          <button
            onClick={() => setActiveTab('diagrams')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'diagrams'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Image className="inline w-4 h-4 mr-2" />
            Diagrams
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'export'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Download className="inline w-4 h-4 mr-2" />
            Export
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Flow Visualization */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Flow Visualization
                </h3>
                <div className="font-mono text-sm bg-white p-4 rounded border overflow-x-auto">
                  {generateTextFlowVisualization()}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-bold mb-2">Basic Information</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-600">Priority:</dt>
                      <dd className="font-medium">{flow.priority}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Status:</dt>
                      <dd className="font-medium capitalize">{flow.status}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Version:</dt>
                      <dd className="font-medium">{flow.version}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Entry Point:</dt>
                      <dd className="font-medium">{flow.entryPoint || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Trigger:</dt>
                      <dd className="font-medium">{flow.triggerEvent || 'Not specified'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-bold mb-2">Performance</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-600">Response Time:</dt>
                      <dd className="font-medium">{flow.performanceRequirements?.responseTime || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Throughput:</dt>
                      <dd className="font-medium">{flow.performanceRequirements?.throughput || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Availability:</dt>
                      <dd className="font-medium">{flow.performanceRequirements?.availability || 'Not specified'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Completeness Breakdown */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Completeness Analysis
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={flow.name ? 'text-green-600' : 'text-gray-400'}>
                      {flow.name ? '✓' : '○'} Flow Name
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={flow.description ? 'text-green-600' : 'text-gray-400'}>
                      {flow.description ? '✓' : '○'} Description
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={(flow.steps?.length || 0) > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {(flow.steps?.length || 0) > 0 ? '✓' : '○'} Process Steps Defined
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={(flow.involvedServiceIds?.length || 0) > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {(flow.involvedServiceIds?.length || 0) > 0 ? '✓' : '○'} Services Identified
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={(flow.actorIds?.length || 0) > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {(flow.actorIds?.length || 0) > 0 ? '✓' : '○'} Actors Assigned
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={stats.integrations > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {stats.integrations > 0 ? '✓' : '○'} Integrations Documented
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={(flow.businessRules?.length || 0) > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {(flow.businessRules?.length || 0) > 0 ? '✓' : '○'} Business Rules Defined
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={(flow.errorScenarios?.length || 0) > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {(flow.errorScenarios?.length || 0) > 0 ? '✓' : '○'} Error Handling Specified
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Suggestions */}
              {flow.aiSuggestions && flow.aiSuggestions.gaps && flow.aiSuggestions.gaps.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    AI-Identified Gaps
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {flow.aiSuggestions.gaps.map((gap, idx) => (
                      <li key={idx} className="text-yellow-800">• {gap}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Flow Steps Tab */}
          {activeTab === 'flow' && (
            <div className="space-y-4">
              {flow.steps && flow.steps.length > 0 ? (
                flow.steps.map((step, index) => (
                  <div key={step.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-lg">{step.action}</h4>
                          {step.isDecisionPoint && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              <Zap className="inline w-3 h-3 mr-1" />
                              Decision Point
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <Users className="inline w-4 h-4 mr-1" />
                          Actor: {getActorName(step.actorId)}
                        </p>
                        {step.serviceIds && step.serviceIds.length > 0 && (
                          <p className="text-sm text-gray-600 mb-2">
                            <Database className="inline w-4 h-4 mr-1" />
                            Services: {step.serviceIds.map(sid => getServiceName(sid)).join(', ')}
                          </p>
                        )}
                        {step.dataInput?.description && (
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Input:</span> {step.dataInput.description}
                          </p>
                        )}
                        {step.dataOutput?.description && (
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Output:</span> {step.dataOutput.description}
                          </p>
                        )}
                        {step.isDecisionPoint && step.decisionCriteria && (
                          <p className="text-sm text-yellow-700 mt-2">
                            <span className="font-medium">Decision Criteria:</span> {step.decisionCriteria}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No steps defined yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {/* Involved Services */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  Involved Services ({flow.involvedServiceIds?.length || 0})
                </h4>
                {flow.involvedServiceIds && flow.involvedServiceIds.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {flow.involvedServiceIds.map(sid => (
                      <div key={sid} className="px-3 py-2 bg-purple-50 text-purple-800 rounded text-sm">
                        {getServiceName(sid)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No services specified</p>
                )}
              </div>

              {/* Service Interactions */}
              {flow.serviceInteractions && flow.serviceInteractions.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-orange-600" />
                    Service Interactions ({flow.serviceInteractions.length})
                  </h4>
                  <div className="space-y-3">
                    {flow.serviceInteractions.map((interaction, idx) => (
                      <div key={interaction.id} className="border-l-4 border-orange-400 pl-4 py-2">
                        <p className="font-medium text-sm mb-1">
                          {getServiceName(interaction.fromServiceId)} → {getServiceName(interaction.toServiceId)}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Type:</span> {interaction.interactionType} |
                          <span className="font-medium ml-2">Method:</span> {interaction.method || 'N/A'}
                        </p>
                        {interaction.endpoint && (
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Endpoint:</span> {interaction.endpoint}
                          </p>
                        )}
                        {interaction.dataExchanged && (
                          <p className="text-xs text-gray-700 mt-1">
                            <span className="font-medium">Data:</span> {interaction.dataExchanged}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actors */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Actors ({flow.actorIds?.length || 0})
                </h4>
                {flow.actorIds && flow.actorIds.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {flow.actorIds.map(aid => (
                      <div key={aid} className="px-3 py-2 bg-green-50 text-green-800 rounded text-sm">
                        {getActorName(aid)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No actors specified</p>
                )}
              </div>
            </div>
          )}

          {/* Diagrams Tab */}
          {activeTab === 'diagrams' && (
            <div className="space-y-6">
              {/* Sequence Diagram */}
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-bold mb-3">Sequence Diagram (Mermaid)</h4>
                <div className="bg-gray-50 p-4 rounded border font-mono text-xs overflow-x-auto">
                  <pre>{generateSequenceDiagram(flow, currentProject)}</pre>
                </div>
                <button
                  onClick={() => handleDownload('sequence')}
                  className="mt-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  <Download className="inline w-4 h-4 mr-1" />
                  Download Mermaid
                </button>
              </div>

              {/* Architecture Diagram */}
              {(flow.involvedServiceIds?.length || 0) > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-bold mb-3">Architecture Diagram (Mermaid)</h4>
                  <div className="bg-gray-50 p-4 rounded border font-mono text-xs overflow-x-auto">
                    <pre>{generateArchitectureDiagram(flow, currentProject)}</pre>
                  </div>
                  <button
                    onClick={() => handleDownload('architecture')}
                    className="mt-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    <Download className="inline w-4 h-4 mr-1" />
                    Download Mermaid
                  </button>
                </div>
              )}

              {/* Service Interaction Matrix */}
              {(flow.involvedServiceIds?.length || 0) > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-bold mb-3">Service Interaction Matrix</h4>
                  <div className="bg-gray-50 p-4 rounded border text-sm overflow-x-auto">
                    <pre className="whitespace-pre-wrap">{generateServiceInteractionMatrix(flow, currentProject)}</pre>
                  </div>
                  <button
                    onClick={() => handleDownload('matrix')}
                    className="mt-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    <Download className="inline w-4 h-4 mr-1" />
                    Download Matrix
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Export your flow in different formats for documentation, visualization, or further processing.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleDownload('drawio')}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <Image className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-bold mb-1">Draw.io Prompt</h4>
                  <p className="text-sm text-gray-600">Detailed instructions for creating draw.io diagrams</p>
                </button>

                <button
                  onClick={() => handleDownload('markdown')}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <FileText className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-bold mb-1">Markdown</h4>
                  <p className="text-sm text-gray-600">Complete documentation in markdown format</p>
                </button>

                <button
                  onClick={() => handleDownload('sequence')}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <Activity className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-bold mb-1">Sequence Diagram</h4>
                  <p className="text-sm text-gray-600">Mermaid sequence diagram code</p>
                </button>

                <button
                  onClick={() => handleDownload('architecture')}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <Database className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-bold mb-1">Architecture Diagram</h4>
                  <p className="text-sm text-gray-600">Mermaid architecture graph code</p>
                </button>

                <button
                  onClick={() => handleDownload('matrix')}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <GitBranch className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-bold mb-1">Interaction Matrix</h4>
                  <p className="text-sm text-gray-600">Service-to-service interaction table</p>
                </button>

                <button
                  onClick={() => handleDownload('json')}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <FileText className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-bold mb-1">JSON</h4>
                  <p className="text-sm text-gray-600">Raw flow data in JSON format</p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <div className="text-sm text-gray-600">
            {completeness >= 80 ? (
              <span className="text-green-600 font-medium">
                <CheckCircle className="inline w-4 h-4 mr-1" />
                Flow is ready to save!
              </span>
            ) : (
              <span className="text-yellow-600 font-medium">
                <AlertTriangle className="inline w-4 h-4 mr-1" />
                Consider adding more details before saving
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Continue Editing
            </button>
            <button
              onClick={() => {
                onSave();
                onClose();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Save Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowPreview;
