/**
 * Export Generators for Different Output Formats
 * Generates draw.io prompts, markdown documentation, and other formats
 */

/**
 * Generate Draw.io Prompt from Flow
 * Creates a detailed prompt for AI to generate draw.io XML
 * Enhanced to show each step separately, service interactions, and data flow
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
  if (flow.serviceDomainId) {
    output += `• Service Domain: ${getServiceDomainName(flow.serviceDomainId)}\n`;
  }
  if (flow.involvedServiceIds && flow.involvedServiceIds.length > 0) {
    output += `• Involved Services:\n`;
    flow.involvedServiceIds.forEach(serviceId => {
      output += `  - ${getServiceName(serviceId)}\n`;
    });
  }
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

  // Service Interactions (detailed service-to-service communication)
  if (flow.serviceInteractions && flow.serviceInteractions.length > 0) {
    output += `\n🔗 Service Interactions (Detailed):\n`;
    output += `───────────────────────────────────────\n`;
    flow.serviceInteractions.forEach((interaction) => {
      output += `\n• ${getServiceName(interaction.fromServiceId)} → ${getServiceName(interaction.toServiceId)}\n`;
      output += `  Type: ${interaction.interactionType} (${getIntegrationTypeName(interaction.communicationTypeId)})\n`;
      output += `  Method: ${interaction.method}\n`;
      if (interaction.endpoint) {
        output += `  Endpoint: ${interaction.endpoint}\n`;
      }
      output += `  Data Format: ${interaction.dataFormat}\n`;
      output += `  Data Exchanged: ${interaction.dataExchanged}\n`;
      if (interaction.frequency) {
        output += `  Frequency: ${interaction.frequency}\n`;
      }
      if (interaction.averageLatency) {
        output += `  Latency: ${interaction.averageLatency}\n`;
      }
      if (interaction.authentication) {
        output += `  Auth: ${interaction.authentication}\n`;
      }
      if (interaction.errorHandling) {
        output += `  Error Handling: ${interaction.errorHandling}\n`;
      }
      if (interaction.description) {
        output += `  Description: ${interaction.description}\n`;
      }
    });
  }

  // Integration Points (simple)
  if (flow.integrations && flow.integrations.length > 0) {
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

  output += `\n2. PROCESS BOXES (CRITICAL - EACH STEP SEPARATE):\n`;
  output += `   ⚠️ IMPORTANT: Create a SEPARATE rectangle shape for EACH step - DO NOT group steps together\n`;
  output += `   • Rectangle shape for EVERY SINGLE step (${flow.steps.length} total rectangles needed)\n`;
  output += `   • Each rectangle must include:\n`;
  output += `     - Step number (e.g., "Step 1")\n`;
  output += `     - Action description\n`;
  output += `     - Service names involved (as subtitle or badge)\n`;
  output += `   • Place each rectangle in the appropriate swimlane based on the actor\n`;
  output += `   • Use different rectangle colors/shades based on service involved\n`;
  output += `   • Add small service icon or badge on each rectangle\n\n`;
  output += `   Steps to create separately:\n`;
  flow.steps.forEach(step => {
    output += `   ${step.stepNumber}. "${step.action}" [${getActorName(step.actorId)}]`;
    if (step.serviceIds.length > 0) {
      output += ` - Services: ${step.serviceIds.map(sid => getServiceName(sid)).join(', ')}`;
    }
    output += `\n`;
  });

  output += `\n3. SERVICE INTERACTIONS:\n`;
  output += `   • Show service-to-service communication with dedicated connector arrows\n`;
  output += `   • Use different arrow styles for different interaction types:\n`;
  output += `     - Synchronous: Solid arrow with filled head\n`;
  output += `     - Asynchronous: Dashed arrow\n`;
  output += `     - Event-driven: Wavy or zigzag arrow\n`;
  output += `   • Label each service interaction arrow with:\n`;
  output += `     - Method/operation (e.g., "POST /api/users")\n`;
  output += `     - Data being exchanged\n`;
  output += `     - Frequency (if applicable)\n`;
  if (flow.serviceInteractions && flow.serviceInteractions.length > 0) {
    output += `\n   Service interactions to visualize:\n`;
    flow.serviceInteractions.forEach(interaction => {
      output += `   • ${getServiceName(interaction.fromServiceId)} → ${getServiceName(interaction.toServiceId)}: ${interaction.method || 'N/A'} (${interaction.interactionType})\n`;
    });
  }

  output += `\n4. DATA FLOW LABELS:\n`;
  output += `   • Add text labels on EVERY connector arrow showing:\n`;
  output += `     - What data is being passed (input/output)\n`;
  output += `     - Data format (JSON, XML, etc.)\n`;
  output += `     - Any transformations or processing\n`;
  output += `   • Use small font but ensure readability\n`;
  output += `   • Position labels along the arrow path\n`;

  output += `\n5. DECISION POINTS:\n`;
  output += `   • Use diamond shape for decision points\n`;
  output += `   • Show ALL conditional paths coming out of the diamond\n`;
  output += `   • Label each path with its condition\n`;
  const decisionSteps = flow.steps.filter(s => s.isDecisionPoint);
  if (decisionSteps.length > 0) {
    decisionSteps.forEach(step => {
      output += `   • Step ${step.stepNumber}: ${step.decisionCriteria}\n`;
      if (step.conditionalPaths && step.conditionalPaths.length > 0) {
        step.conditionalPaths.forEach(path => {
          output += `     → Path: ${path.condition}\n`;
        });
      }
    });
  } else {
    output += `   • No decision points in this flow\n`;
  }

  output += `\n6. AUTOMATIONS & INTEGRATIONS:\n`;
  output += `   • Add special icons/badges for:\n`;
  output += `     - Automated steps (robot icon or "AUTO" badge)\n`;
  output += `     - Notifications (bell icon)\n`;
  output += `     - External integrations (cloud icon or "EXT" badge)\n`;
  output += `     - Database operations (database icon)\n`;
  output += `     - API calls (API icon)\n`;

  output += `\n7. COLOR CODING:\n`;
  const domain = project.serviceRegistry.domains.find(d => d.id === flow.serviceDomainId);
  if (domain) {
    output += `   • Use ${domain.color} for ${domain.name} domain elements\n`;
  }
  output += `   • Assign consistent colors to each service:\n`;
  if (flow.involvedServiceIds && flow.involvedServiceIds.length > 0) {
    const serviceColors = ['#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF3E0', '#FCE4EC'];
    flow.involvedServiceIds.forEach((serviceId, index) => {
      output += `     - ${getServiceName(serviceId)}: ${serviceColors[index % serviceColors.length]}\n`;
    });
  }
  output += `   • Highlight decision points in yellow (#FFEB3B)\n`;
  output += `   • Use red borders for error handling steps (#F44336)\n`;
  output += `   • Use green for successful completion (#4CAF50)\n`;

  output += `\n8. LAYOUT & SPACING:\n`;
  output += `   • Left-to-right flow direction\n`;
  output += `   • Maintain 50-100px spacing between consecutive step rectangles\n`;
  output += `   • Align elements horizontally within same swimlane\n`;
  output += `   • Use container groups for related sub-processes\n`;
  output += `   • Ensure no overlapping elements\n`;
  output += `   • Add padding within swimlanes (20px top/bottom)\n`;

  output += `\n9. LEGEND:\n`;
  output += `   • Add a legend box showing:\n`;
  output += `     - Color meanings (which color = which service)\n`;
  output += `     - Line style meanings (solid = sync, dashed = async, etc.)\n`;
  output += `     - Icon meanings (automation, notification, etc.)\n`;
  output += `     - Shape meanings (rectangle = step, diamond = decision)\n`;

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

/**
 * Generate Service Interaction Matrix
 * Creates a table showing which services interact with each other
 */
export const generateServiceInteractionMatrix = (flow, project) => {
  const getServiceName = (serviceId) => {
    for (const domain of project.serviceRegistry.domains) {
      const service = domain.services.find(s => s.id === serviceId);
      if (service) return service.name;
    }
    return 'Unknown Service';
  };

  let output = `# Service Interaction Matrix\n`;
  output += `**Flow:** ${flow.name}\n\n`;

  // Get all involved services
  const serviceIds = flow.involvedServiceIds || [];
  if (serviceIds.length === 0) {
    return output + `No services involved in this flow.\n`;
  }

  // Create matrix header
  output += `| From \\ To | ${serviceIds.map(sid => getServiceName(sid)).join(' | ')} |\n`;
  output += `|${'-'.repeat(15)}|${serviceIds.map(() => '-'.repeat(20)).join('|')}|\n`;

  // Create matrix rows
  serviceIds.forEach(fromId => {
    output += `| **${getServiceName(fromId)}** |`;

    serviceIds.forEach(toId => {
      if (fromId === toId) {
        output += ' - |';
      } else {
        // Find interactions between these services
        const interactions = (flow.serviceInteractions || []).filter(
          int => int.fromServiceId === fromId && int.toServiceId === toId
        );

        if (interactions.length > 0) {
          const methods = interactions.map(int => int.method || int.interactionType).join(', ');
          output += ` ${methods} |`;
        } else {
          output += ' |';
        }
      }
    });
    output += `\n`;
  });

  output += `\n## Detailed Interactions\n\n`;

  if (flow.serviceInteractions && flow.serviceInteractions.length > 0) {
    flow.serviceInteractions.forEach((interaction, index) => {
      output += `### ${index + 1}. ${getServiceName(interaction.fromServiceId)} → ${getServiceName(interaction.toServiceId)}\n\n`;
      output += `| Property | Value |\n`;
      output += `|----------|-------|\n`;
      output += `| Interaction Type | ${interaction.interactionType} |\n`;
      output += `| Method | ${interaction.method || 'N/A'} |\n`;
      output += `| Endpoint | ${interaction.endpoint || 'N/A'} |\n`;
      output += `| Data Format | ${interaction.dataFormat} |\n`;
      output += `| Data Exchanged | ${interaction.dataExchanged} |\n`;
      output += `| Frequency | ${interaction.frequency || 'N/A'} |\n`;
      output += `| Latency | ${interaction.averageLatency || 'N/A'} |\n`;
      output += `| Authentication | ${interaction.authentication || 'N/A'} |\n\n`;
    });
  } else {
    output += `No detailed service interactions documented.\n`;
  }

  return output;
};

/**
 * Generate Mermaid Sequence Diagram
 */
export const generateSequenceDiagram = (flow, project) => {
  const getServiceName = (serviceId) => {
    for (const domain of project.serviceRegistry.domains) {
      const service = domain.services.find(s => s.id === serviceId);
      if (service) return service.abbreviation || service.name;
    }
    return 'Unknown';
  };

  const getActorName = (actorId) => {
    const actor = project.actorRegistry.actors.find(a => a.id === actorId);
    return actor ? actor.abbreviation : 'Unknown';
  };

  let output = `\`\`\`mermaid\nsequenceDiagram\n`;
  output += `    title ${flow.name}\n\n`;

  // Declare participants
  const participants = new Set();
  flow.steps.forEach(step => {
    participants.add(getActorName(step.actorId));
    step.serviceIds.forEach(sid => participants.add(getServiceName(sid)));
  });

  participants.forEach(p => {
    output += `    participant ${p}\n`;
  });

  output += `\n`;

  // Add interactions
  flow.steps.forEach((step, index) => {
    const actor = getActorName(step.actorId);

    if (step.serviceIds.length > 0) {
      step.serviceIds.forEach(serviceId => {
        const service = getServiceName(serviceId);
        const commType = step.communicationTypeId ? '->>+' : '->>';
        output += `    ${actor}${commType}${service}: ${step.action}\n`;

        if (step.dataOutput.description) {
          output += `    ${service}-->>-${actor}: ${step.dataOutput.description}\n`;
        }
      });
    }

    if (step.isDecisionPoint) {
      output += `    alt ${step.decisionCriteria}\n`;
      if (step.conditionalPaths && step.conditionalPaths.length > 0) {
        step.conditionalPaths.forEach((path, idx) => {
          if (idx === 0) {
            output += `        Note right of ${actor}: ${path.condition}\n`;
          } else {
            output += `    else ${path.condition}\n`;
          }
        });
      }
      output += `    end\n`;
    }

    if (step.errorHandling) {
      output += `    Note over ${actor}: Error Handling: ${step.errorHandling}\n`;
    }
  });

  output += `\`\`\`\n`;
  return output;
};

/**
 * Generate Mermaid Architecture Diagram
 */
export const generateArchitectureDiagram = (flow, project) => {
  const getServiceName = (serviceId) => {
    for (const domain of project.serviceRegistry.domains) {
      const service = domain.services.find(s => s.id === serviceId);
      if (service) return { name: service.name, abbr: service.abbreviation };
    }
    return { name: 'Unknown', abbr: 'UNK' };
  };

  let output = `\`\`\`mermaid\ngraph LR\n`;
  output += `    %% ${flow.name} Architecture\n\n`;

  // Add services as nodes
  const serviceIds = flow.involvedServiceIds || [];
  serviceIds.forEach(serviceId => {
    const service = getServiceName(serviceId);
    output += `    ${service.abbr}["${service.name}"]\n`;
  });

  output += `\n`;

  // Add interactions as edges
  if (flow.serviceInteractions && flow.serviceInteractions.length > 0) {
    flow.serviceInteractions.forEach(interaction => {
      const fromService = getServiceName(interaction.fromServiceId);
      const toService = getServiceName(interaction.toServiceId);
      const method = interaction.method || interaction.interactionType;

      if (interaction.interactionType === 'synchronous') {
        output += `    ${fromService.abbr} -->|${method}| ${toService.abbr}\n`;
      } else if (interaction.interactionType === 'asynchronous') {
        output += `    ${fromService.abbr} -.->|${method}| ${toService.abbr}\n`;
      } else {
        output += `    ${fromService.abbr} ==>|${method}| ${toService.abbr}\n`;
      }
    });
  }

  output += `\`\`\`\n`;
  return output;
};

export default {
  generateDrawioPrompt,
  generateMarkdownDoc,
  generateJSONExport,
  generateSimplePrompt,
  generateServiceInteractionMatrix,
  generateSequenceDiagram,
  generateArchitectureDiagram
};
