import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * CollapsibleSection Component
 *
 * Reusable collapsible section with header and content
 *
 * Props:
 * - title: Section title
 * - isExpanded: Expanded state
 * - onToggle: Toggle callback
 * - children: Section content
 * - badge: Optional badge content (e.g., count)
 * - icon: Optional icon component
 * - className: Additional CSS classes
 */
const CollapsibleSection = ({
  title,
  isExpanded,
  onToggle,
  children,
  badge,
  icon: Icon,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div
        className="p-4 border-b flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          {Icon && <Icon size={20} className="text-gray-600" />}
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {badge !== undefined && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
