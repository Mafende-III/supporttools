import React, { useState } from 'react';
import { Plus, X, Info } from 'lucide-react';

/**
 * SelectWithOther Component
 *
 * Reusable dropdown with "Add New" functionality
 * Displays options with tooltips showing full names and descriptions
 *
 * Props:
 * - value: Selected value ID
 * - onChange: Callback when value changes (receives id)
 * - options: Array of {id, label, fullName, description, ...}
 * - placeholder: Placeholder text
 * - onAddNew: Callback for adding new option (receives new option object)
 * - disabled: Disabled state
 * - showTooltip: Show info tooltip (default: true)
 * - addNewLabel: Custom label for "Add New" option
 * - className: Additional CSS classes
 */
const SelectWithOther = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  onAddNew,
  disabled = false,
  showTooltip = true,
  addNewLabel = 'Add New...',
  className = '',
  required = false
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOptionData, setNewOptionData] = useState({
    abbreviation: '',
    fullName: '',
    description: ''
  });
  const [errors, setErrors] = useState([]);

  // Handle select change
  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;

    if (selectedValue === '__add_new__') {
      // Show modal for adding new option
      setShowAddModal(true);
      setNewOptionData({ abbreviation: '', fullName: '', description: '' });
      setErrors([]);
    } else {
      onChange(selectedValue);
    }
  };

  // Handle adding new option
  const handleAddNew = () => {
    const validationErrors = [];

    // Validate
    if (!newOptionData.abbreviation || newOptionData.abbreviation.trim().length < 2) {
      validationErrors.push('Abbreviation must be at least 2 characters');
    }

    if (!/^[A-Za-z0-9\s-_]{2,20}$/.test(newOptionData.abbreviation)) {
      validationErrors.push('Abbreviation must be 2-20 alphanumeric characters (can include spaces, hyphens, underscores)');
    }

    if (!newOptionData.fullName || newOptionData.fullName.trim().length < 3) {
      validationErrors.push('Full name must be at least 3 characters');
    }

    // Check for duplicates
    const isDuplicate = options.some(
      opt => opt.abbreviation?.toLowerCase() === newOptionData.abbreviation.trim().toLowerCase()
    );

    if (isDuplicate) {
      validationErrors.push('This abbreviation already exists');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Call parent callback
    if (onAddNew) {
      onAddNew(newOptionData);
    }

    // Close modal
    setShowAddModal(false);
    setNewOptionData({ abbreviation: '', fullName: '', description: '' });
  };

  // Get selected option for tooltip
  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className={`relative ${className}`}>
      {/* Select Dropdown */}
      <div className="flex items-center gap-2">
        <select
          value={value || ''}
          onChange={handleSelectChange}
          disabled={disabled}
          required={required}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">{placeholder}</option>

          {options.map(option => (
            <option key={option.id} value={option.id}>
              {option.abbreviation && option.fullName
                ? `${option.abbreviation} - ${option.fullName}`
                : option.label || option.name || option.abbreviation || option.fullName}
            </option>
          ))}

          {onAddNew && (
            <option value="__add_new__" className="text-blue-600 font-semibold">
              ➕ {addNewLabel}
            </option>
          )}
        </select>

        {/* Tooltip Icon */}
        {showTooltip && selectedOption && (selectedOption.description || selectedOption.fullName) && (
          <div className="group relative">
            <Info size={18} className="text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
              {selectedOption.abbreviation && (
                <div className="font-bold mb-1">{selectedOption.abbreviation}</div>
              )}
              {selectedOption.fullName && (
                <div className="mb-1">{selectedOption.fullName}</div>
              )}
              {selectedOption.description && (
                <div className="text-gray-300 text-xs">{selectedOption.description}</div>
              )}
              <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add New Option</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setErrors([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-semibold text-red-800 mb-1">Please fix the following errors:</p>
                <ul className="text-sm text-red-600 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abbreviation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newOptionData.abbreviation}
                  onChange={(e) => setNewOptionData(prev => ({ ...prev, abbreviation: e.target.value }))}
                  placeholder="e.g., PHP, REST, API"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">2-20 characters (letters, numbers, spaces, -, _)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newOptionData.fullName}
                  onChange={(e) => setNewOptionData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g., Prospect Health Professional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newOptionData.description}
                  onChange={(e) => setNewOptionData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this represents..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setErrors([]);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <Plus size={18} />
                Add to Registry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectWithOther;
