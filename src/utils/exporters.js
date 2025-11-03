/**
 * Export Generators for Different Output Formats
 * Generates draw.io prompts, markdown documentation, and other formats
 */

/**
 * Generate Draw.io Prompt from Flow
 * Creates a detailed prompt for AI to generate draw.io XML
 */
export const generateDrawioPrompt = (flow, project) => {
  const getServiceName = (serviceId) => {
    for (const domain of project.serviceRegistry.domains) {
      const service = domain.services.find(s => s.id === serviceId);
      if (service) return service.name;
    }
    return 'Unknown Service';
  };

  const getActorName = (actorId) => {
    const actor = project.actorRegistry.actors.find(a => a.id === actorId);
    return actor ? `${actor.abbreviation} - ${actor.fullName}` : 'Unknown Actor';
  };

  const getIntegrationTypeName = (typeId) => {
    const type = project.integrationTypes.types.find(t => t.id === typeId);
    return type ? type.name : 'Unknown Type';
  };

  const getServiceDomainName = (domainId) => {
    const domain = project.serviceRegistry.domains.find(d => d.id === domainId);
    return domain ? domain.name : 'Unknown Domain';
  };

  let output = `🔄 GENERATE DRAW.IO DIAGRAM REQUEST\n\n`;
  output += `Please process this microservices flow and generate a draw.io XML file:\n\n`;
  output += `═══════════════════════════════════════\n`;
  output += `PROJECT: ${project.name}\n`;
  output += `FLOW DETAILS\n`;
  output += `═══════════════════════════════════════\n\n`;

  // Basic Information
  output += `📋 Basic Information:\n`;
  output += `• Flow Name: ${flow.name}\n`;
  output += `• Description: ${flow.description}\n`;
  output += `• Service Domain: ${getServiceDomainName(flow.serviceDomainId)}\n`;
  output += `• Primary Service: ${getServiceName(flow.serviceId)}\n`;
  output += `• Priority: ${flow.priority}\n`;
  output += `• Status: ${flow.status}\n`;
  output += `• Version: ${flow.version}\n`;
  output += `• Entry Point: ${flow.entryPoint}\n`;
  output += `• Trigger Event: ${flow.triggerEvent}\n`;

  if (flow.actorIds.length > 0) {
    output += `• Actors Involved:\n`;
    flow.actorIds.forEach(actorId => {
      output += `  - ${getActorName(actorId)}\n`;
    });
  }

  if (flow.tags.length > 0) {
    output += `• Tags: ${flow.tags.join(', ')}\n`;
  }

  output += `\n`;

  // Process Steps
  output += `📊 Process Steps (${flow.steps.length}):\n`;
  output += `───────────────────────────────────────\n`;

  flow.steps.forEach((step, index) => {
    output += `\nStep ${step.stepNumber}:\n`;
    output += `• Actor: ${getActorName(step.actorId)}\n`;
    output += `• Action: ${step.action}\n`;

    if (step.serviceIds.length > 0) {
      output += `• Services Involved:\n`;
      step.serviceIds.forEach(serviceId => {
        output += `  - ${getServiceName(serviceId)}\n`;
      });
    }

    output += `• Communication: ${getIntegrationTypeName(step.communicationTypeId)}\n`;

    if (step.dataInput.description) {
      output += `• Input: ${step.dataInput.description}\n`;
      if (step.dataInput.schema) {
        output += `  Schema: ${step.dataInput.schema}\n`;
      }
    }

    if (step.dataOutput.description) {
      output += `• Output: ${step.dataOutput.description}\n`;
      if (step.dataOutput.schema) {
        output += `  Schema: ${step.dataOutput.schema}\n`;
      }
    }

    if (step.isDecisionPoint) {
      output += `• ⚡ DECISION POINT: ${step.decisionCriteria}\n`;
      if (step.conditionalPaths.length > 0) {
        output += `  Paths:\n`;
        step.conditionalPaths.forEach(path => {
          output += `  - ${path.condition}\n`;
        });
      }
    }

    if (step.notifications.length > 0) {
      output += `• Notifications:\n`;
      step.notifications.forEach(notif => {
        output += `  - ${notif.type}: ${notif.recipient}\n`;
      });
    }

    if (step.estimatedDuration) {
      output += `• Duration: ${step.estimatedDuration}\n`;
    }

    if (step.errorHandling) {
      output += `• Error Handling: ${step.errorHandling}\n`;
    }
  });

  // Integration Points
  if (flow.integrations.length > 0) {
    output += `\n🔗 Integration Points:\n`;
    output += `───────────────────────────────────────\n`;
    flow.integrations.forEach((integration) => {
      output += `\n• ${getServiceName(integration.fromServiceId)} → ${getServiceName(integration.toServiceId)}\n`;
      output += `  Type: ${getIntegrationTypeName(integration.communicationTypeId)}\n`;
      output += `  Data: ${integration.dataExchanged}\n`;
      output += `  Frequency: ${integration.frequency}\n`;
      if (integration.protocol) {
        output += `  Protocol: ${integration.protocol}\n`;
      }
      if (integration.authentication) {
        output += `  Auth: ${integration.authentication}\n`;
      }
    });
  }

  // Business Rules
  if (flow.businessRules.length > 0) {
    output += `\n📐 Business Rules:\n`;
    output += `───────────────────────────────────────\n`;
    flow.businessRules.forEach(rule => {
      output += `• ${rule.name}: ${rule.description}\n`;
    });
  }

  // Error Scenarios
  if (flow.errorScenarios.length > 0) {
    output += `\n⚠️ Error Handling:\n`;
    output += `───────────────────────────────────────\n`;
    flow.errorScenarios.forEach(scenario => {
      output += `• Scenario: ${scenario.scenario}\n`;
      output += `  Handling: ${scenario.handling}\n`;
      if (scenario.notification) {
        output += `  Notification: ${scenario.notification}\n`;
      }
    });
  }

  // Performance Requirements
  if (flow.performanceRequirements.responseTime || flow.performanceRequirements.throughput) {
    output += `\n⚡ Performance Requirements:\n`;
    output += `───────────────────────────────────────\n`;
    if (flow.performanceRequirements.responseTime) {
      output += `• Response Time: ${flow.performanceRequirements.responseTime}\n`;
    }
    if (flow.performanceRequirements.throughput) {
      output += `• Throughput: ${flow.performanceRequirements.throughput}\n`;
    }
    if (flow.performanceRequirements.availability) {
      output += `• Availability: ${flow.performanceRequirements.availability}\n`;
    }
  }

  // Notes
  if (flow.notes) {
    output += `\n📝 Additional Notes:\n`;
    output += `───────────────────────────────────────\n`;
    output += `${flow.notes}\n`;
  }

  // Draw.io Specifications
  output += `\n═══════════════════════════════════════\n`;
  output += `🎯 DRAW.IO DIAGRAM REQUIREMENTS:\n`;
  output += `═══════════════════════════════════════\n\n`;

  output += `Please create a draw.io XML file with the following specifications:\n\n`;

  output += `1. SWIMLANES:\n`;
  output += `   • Create a horizontal swimlane for each actor\n`;
  output += `   • Label each swimlane with actor abbreviation and full name\n`;
  const uniqueActors = [...new Set(flow.steps.map(s => s.actorId))];
  uniqueActors.forEach(actorId => {
    output += `   • Swimlane: ${getActorName(actorId)}\n`;
  });

  output += `\n2. PROCESS BOXES:\n`;
  output += `   • Rectangle shape for each step\n`;
  output += `   • Include step number and action description\n`;
  output += `   • Place in appropriate swimlane based on actor\n`;
  output += `   • Add service name as label below action\n`;

  output += `\n3. DECISION POINTS:\n`;
  output += `   • Use diamond shape for decision points\n`;
  const decisionSteps = flow.steps.filter(s => s.isDecisionPoint);
  if (decisionSteps.length > 0) {
    decisionSteps.forEach(step => {
      output += `   • Step ${step.stepNumber}: ${step.decisionCriteria}\n`;
    });
  } else {
    output += `   • No decision points in this flow\n`;
  }

  output += `\n4. CONNECTORS:\n`;
  output += `   • Draw arrows between sequential steps\n`;
  output += `   • Use different line styles based on communication type:\n`;
  const uniqueCommTypes = [...new Set(flow.steps.map(s => s.communicationTypeId))];
  uniqueCommTypes.forEach(typeId => {
    const type = project.integrationTypes.types.find(t => t.id === typeId);
    if (type) {
      output += `     - ${type.name}: ${type.style.lineStyle} line, ${type.style.color}\n`;
    }
  });

  output += `\n5. COLOR CODING:\n`;
  const domain = project.serviceRegistry.domains.find(d => d.id === flow.serviceDomainId);
  if (domain) {
    output += `   • Use ${domain.color} for ${domain.name} domain elements\n`;
  }
  output += `   • Use consistent colors for each service\n`;
  output += `   • Highlight decision points in yellow\n`;
  output += `   • Use red borders for error handling steps\n`;

  output += `\n6. ANNOTATIONS:\n`;
  output += `   • Add data labels for input/output on arrows\n`;
  output += `   • Include timing information where available\n`;
  output += `   • Add notification icons for steps that send notifications\n`;

  output += `\n7. LAYOUT:\n`;
  output += `   • Left-to-right flow direction\n`;
  output += `   • Maintain consistent spacing between elements\n`;
  output += `   • Align elements in same swimlane\n`;
  output += `   • Use container groups for related steps\n`;

  output += `\n═══════════════════════════════════════\n`;
  output += `Generated: ${new Date().toISOString()}\n`;
  output += `═══════════════════════════════════════\n`;

  return output;
};

/**
 * Generate Markdown Documentation from Flow
 */
export const generateMarkdownDoc = (flow, project) => {
  const getServiceName = (serviceId) => {
    for (const domain of project.serviceRegistry.domains) {
      const service = domain.services.find(s => s.id === serviceId);
      if (service) return service.name;
    }
    return 'Unknown Service';
  };

  const getActorName = (actorId) => {
    const actor = project.actorRegistry.actors.find(a => a.id === actorId);
    return actor ? `${actor.abbreviation} - ${actor.fullName}` : 'Unknown Actor';
  };

  const getIntegrationTypeName = (typeId) => {
    const type = project.integrationTypes.types.find(t => t.id === typeId);
    return type ? type.name : 'Unknown Type';
  };

  let md = `# ${flow.name}\n\n`;
  md += `> ${flow.description}\n\n`;

  md += `## Overview\n\n`;
  md += `| Property | Value |\n`;
  md += `|----------|-------|\n`;
  md += `| Priority | ${flow.priority} |\n`;
  md += `| Status | ${flow.status} |\n`;
  md += `| Version | ${flow.version} |\n`;
  md += `| Entry Point | ${flow.entryPoint} |\n`;
  md += `| Trigger Event | ${flow.triggerEvent} |\n\n`;

  if (flow.actorIds.length > 0) {
    md += `## Actors Involved\n\n`;
    flow.actorIds.forEach(actorId => {
      md += `- ${getActorName(actorId)}\n`;
    });
    md += `\n`;
  }

  md += `## Process Flow\n\n`;
  flow.steps.forEach(step => {
    md += `### Step ${step.stepNumber}: ${step.action}\n\n`;
    md += `**Actor:** ${getActorName(step.actorId)}\n\n`;

    if (step.serviceIds.length > 0) {
      md += `**Services:**\n`;
      step.serviceIds.forEach(serviceId => {
        md += `- ${getServiceName(serviceId)}\n`;
      });
      md += `\n`;
    }

    md += `**Communication:** ${getIntegrationTypeName(step.communicationTypeId)}\n\n`;

    if (step.dataInput.description) {
      md += `**Input:** ${step.dataInput.description}\n\n`;
    }

    if (step.dataOutput.description) {
      md += `**Output:** ${step.dataOutput.description}\n\n`;
    }

    if (step.isDecisionPoint) {
      md += `**⚡ Decision Point:** ${step.decisionCriteria}\n\n`;
    }

    md += `---\n\n`;
  });

  if (flow.integrations.length > 0) {
    md += `## Integration Points\n\n`;
    flow.integrations.forEach(integration => {
      md += `- **${getServiceName(integration.fromServiceId)}** → **${getServiceName(integration.toServiceId)}**\n`;
      md += `  - Type: ${getIntegrationTypeName(integration.communicationTypeId)}\n`;
      md += `  - Data: ${integration.dataExchanged}\n`;
      md += `  - Frequency: ${integration.frequency}\n\n`;
    });
  }

  if (flow.businessRules.length > 0) {
    md += `## Business Rules\n\n`;
    flow.businessRules.forEach(rule => {
      md += `- **${rule.name}:** ${rule.description}\n`;
    });
    md += `\n`;
  }

  if (flow.notes) {
    md += `## Additional Notes\n\n`;
    md += `${flow.notes}\n\n`;
  }

  md += `---\n`;
  md += `*Generated: ${new Date().toLocaleString()}*\n`;

  return md;
};

/**
 * Generate JSON export
 */
export const generateJSONExport = (flow, project) => {
  return JSON.stringify({
    flow,
    project: {
      id: project.id,
      name: project.name,
      version: project.version
    },
    exportedAt: new Date().toISOString(),
    format: 'Microservices Flow v1.0'
  }, null, 2);
};

/**
 * Generate simple text prompt for diagram creation
 */
export const generateSimplePrompt = (flow, project) => {
  let output = `Create a workflow diagram for: ${flow.name}\n\n`;
  output += `${flow.description}\n\n`;
  output += `Steps:\n`;

  flow.steps.forEach(step => {
    const actor = project.actorRegistry.actors.find(a => a.id === step.actorId);
    output += `${step.stepNumber}. [${actor?.abbreviation || 'Unknown'}] ${step.action}\n`;
  });

  return output;
};

export default {
  generateDrawioPrompt,
  generateMarkdownDoc,
  generateJSONExport,
  generateSimplePrompt
};
