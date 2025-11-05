import React, { useState } from 'react';
import { Brain, Save, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const AISettings = ({ onClose }) => {
  const { currentProject, updateSettings, saveProject } = useProject();
  const [config, setConfig] = useState(currentProject?.settings?.aiConfig || {
    claudeApiKey: '',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 4096,
    enabled: false,
    features: {
      naturalLanguageProcessing: true,
      serviceSuggestion: true,
      flowValidation: true,
      knowledgeExtraction: true,
      outputEnhancement: true
    }
  });

  const [showKey, setShowKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = () => {
    updateSettings({
      ...currentProject.settings,
      aiConfig: config
    });
    saveProject();
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => {
      setSaveMessage('');
      if (onClose) onClose();
    }, 2000);
  };

  const toggleFeature = (feature) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature]
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">AI Settings</h2>
              <p className="text-purple-100 text-sm">Configure Claude AI integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-bold text-lg">Enable AI Features</h3>
                  <p className="text-sm text-gray-600">Turn on Claude AI-powered assistance</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </div>
            </label>
          </div>

          {/* API Configuration */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              API Configuration
            </h3>

            <div>
              <label className="block text-sm font-medium mb-2">
                Claude API Key *
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline text-xs"
                >
                  Get your API key →
                </a>
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={config.claudeApiKey}
                  onChange={(e) => setConfig({ ...config, claudeApiKey: e.target.value })}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-3 py-2 border rounded-md pr-20"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-sm text-purple-600 hover:text-purple-800"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Your API key is stored locally and never sent to our servers
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Model</label>
                <select
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</option>
                  <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Faster)</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus (Most Capable)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Temperature ({config.temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Lower = more focused, Higher = more creative
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Max Tokens ({config.maxTokens})
              </label>
              <input
                type="range"
                min="1024"
                max="8192"
                step="1024"
                value={config.maxTokens}
                onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-600 mt-1">
                Maximum length of AI responses
              </p>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">AI Features</h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium">Natural Language Processing</p>
                  <p className="text-sm text-gray-600">Describe flows in plain English</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.features.naturalLanguageProcessing}
                  onChange={() => toggleFeature('naturalLanguageProcessing')}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium">Service Suggestion</p>
                  <p className="text-sm text-gray-600">AI suggests relevant services as you type</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.features.serviceSuggestion}
                  onChange={() => toggleFeature('serviceSuggestion')}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium">Flow Validation</p>
                  <p className="text-sm text-gray-600">Identify gaps and suggest improvements</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.features.flowValidation}
                  onChange={() => toggleFeature('flowValidation')}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium">Knowledge Extraction</p>
                  <p className="text-sm text-gray-600">Extract services from documentation</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.features.knowledgeExtraction}
                  onChange={() => toggleFeature('knowledgeExtraction')}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium">Output Enhancement</p>
                  <p className="text-sm text-gray-600">Generate detailed diagrams and documentation</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.features.outputEnhancement}
                  onChange={() => toggleFeature('outputEnhancement')}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">About AI Integration</p>
              <p>
                This tool uses Claude AI to intelligently analyze your workflow descriptions, suggest services and actors,
                validate flows, and generate comprehensive documentation. Your API key is stored locally in your browser.
              </p>
            </div>
          </div>

          {/* Success Message */}
          {saveMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">{saveMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={config.enabled && !config.claudeApiKey}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettings;
