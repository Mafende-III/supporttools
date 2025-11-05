/**
 * Claude AI Integration Module
 * Handles AI-powered features: natural language processing, service suggestion,
 * flow validation, knowledge extraction, and output enhancement
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Initialize Claude API client
 */
const initializeClient = (apiKey) => {
  if (!apiKey) {
    throw new Error('Claude API key is required');
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
};

/**
 * Build system context from project knowledge base
 */
const buildKnowledgeBaseContext = (project) => {
  const kb = project.knowledgeBase;

  let context = `# System Knowledge Base\n\n`;
  context += `Project: ${project.name}\n`;
  context += `Description: ${project.description}\n\n`;

  // Services
  if (kb.services.length > 0) {
    context += `## Services/Functionalities\n\n`;
    kb.services.forEach(service => {
      context += `### ${service.name} (${service.abbreviation})\n`;
      context += `Type: ${service.type}\n`;
      context += `Description: ${service.description}\n`;

      if (service.capabilities.length > 0) {
        context += `Capabilities:\n`;
        service.capabilities.forEach(cap => context += `- ${cap}\n`);
      }

      if (service.apiEndpoints.length > 0) {
        context += `API Endpoints:\n`;
        service.apiEndpoints.forEach(ep => context += `- ${ep.method} ${ep.path}: ${ep.description}\n`);
      }

      if (service.keywords.length > 0) {
        context += `Keywords: ${service.keywords.join(', ')}\n`;
      }

      context += `\n`;
    });
  }

  // Users/Actors
  if (kb.users.length > 0) {
    context += `## Users/Actors\n\n`;
    kb.users.forEach(user => {
      context += `### ${user.name} (${user.abbreviation})\n`;
      context += `Type: ${user.type} | Role: ${user.role}\n`;
      context += `Description: ${user.description}\n`;
      if (user.healthProfessionalStage) {
        context += `Health Professional Stage: ${user.healthProfessionalStage}\n`;
      }
      if (user.keywords.length > 0) {
        context += `Keywords: ${user.keywords.join(', ')}\n`;
      }
      context += `\n`;
    });
  }

  // Workflows
  if (kb.workflows.length > 0) {
    context += `## Common Workflows\n\n`;
    kb.workflows.forEach(workflow => {
      context += `### ${workflow.name}\n`;
      context += `Category: ${workflow.category}\n`;
      context += `Description: ${workflow.description}\n`;
      context += `Pattern: ${workflow.pattern}\n`;
      if (workflow.keywords.length > 0) {
        context += `Keywords: ${workflow.keywords.join(', ')}\n`;
      }
      context += `\n`;
    });
  }

  // Service Registry (from existing registries)
  if (project.serviceRegistry.domains.length > 0) {
    context += `## Service Domains\n\n`;
    project.serviceRegistry.domains.forEach(domain => {
      context += `### ${domain.name}\n`;
      context += `${domain.description}\n`;
      if (domain.services.length > 0) {
        context += `Services:\n`;
        domain.services.forEach(svc => {
          context += `- ${svc.name} (${svc.abbreviation}): ${svc.description}\n`;
        });
      }
      context += `\n`;
    });
  }

  // Actor Registry
  if (project.actorRegistry.actors.length > 0) {
    context += `## Registered Actors\n\n`;
    project.actorRegistry.actors.forEach(actor => {
      context += `- ${actor.abbreviation} (${actor.fullName}): ${actor.description}\n`;
    });
    context += `\n`;
  }

  return context;
};

/**
 * Process natural language flow description
 * Returns suggested services, actors, steps, and integrations
 */
export const processNaturalLanguageFlow = async (description, project, aiConfig) => {
  try {
    const client = initializeClient(aiConfig.claudeApiKey);
    const knowledgeContext = buildKnowledgeBaseContext(project);

    const prompt = `${knowledgeContext}

# Task: Analyze Natural Language Flow Description

The user has described a workflow in natural language. Your task is to analyze this description and map it to the system's services, actors, and integration points.

**User's Flow Description:**
${description}

Please analyze this flow and provide a structured JSON response with the following:

1. **Flow Metadata:**
   - Suggested flow name
   - Clear description
   - Suggested entry point
   - Trigger event
   - Priority (Low/Medium/High/Critical)
   - Tags (array of relevant tags)

2. **Involved Services:**
   - List of service IDs or names from the knowledge base that this flow touches
   - If a service is mentioned but not in the KB, note it as "new service needed"

3. **Involved Actors:**
   - List of actor IDs or names from the actor registry
   - If an actor is mentioned but not in the registry, note it as "new actor needed"

4. **Process Steps:**
   - Break down the flow into sequential steps
   - For each step: actor, action description, services involved, communication type
   - Identify decision points
   - Identify data inputs/outputs

5. **Service Interactions:**
   - Identify which services need to communicate with each other
   - Suggest interaction type (synchronous/asynchronous/event-driven)
   - Suggest communication method (REST API, Message Queue, Event Bus, etc.)
   - Describe data exchanged

6. **Integration Points:**
   - External system integrations
   - Third-party APIs
   - Data exchange requirements

7. **Validation & Gaps:**
   - Are there any missing steps?
   - Are there any unclear requirements?
   - Are there any potential issues or considerations?
   - Suggestions for improvement

**Return only valid JSON in this exact structure:**
\`\`\`json
{
  "flowMetadata": {
    "name": "string",
    "description": "string",
    "entryPoint": "string",
    "triggerEvent": "string",
    "priority": "string",
    "tags": ["string"]
  },
  "involvedServices": [
    {
      "id": "string or null if new",
      "name": "string",
      "isNew": boolean,
      "reason": "why this service is involved"
    }
  ],
  "involvedActors": [
    {
      "id": "string or null if new",
      "name": "string",
      "abbreviation": "string",
      "isNew": boolean,
      "role": "role in this flow"
    }
  ],
  "processSteps": [
    {
      "stepNumber": number,
      "actor": "string",
      "action": "string",
      "services": ["string"],
      "communicationType": "string",
      "dataInput": "string",
      "dataOutput": "string",
      "isDecisionPoint": boolean,
      "decisionCriteria": "string or null"
    }
  ],
  "serviceInteractions": [
    {
      "fromService": "string",
      "toService": "string",
      "interactionType": "synchronous|asynchronous|event-driven",
      "method": "string",
      "dataExchanged": "string",
      "description": "string"
    }
  ],
  "integrationPoints": [
    {
      "systemName": "string",
      "integrationType": "string",
      "purpose": "string"
    }
  ],
  "validation": {
    "gaps": ["string"],
    "issues": ["string"],
    "suggestions": ["string"],
    "completeness": "string (0-100%)"
  }
}
\`\`\``;

    const message = await client.messages.create({
      model: aiConfig.model,
      max_tokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const analysis = JSON.parse(jsonText);
    return {
      success: true,
      analysis,
      rawResponse: responseText
    };

  } catch (error) {
    console.error('AI Processing Error:', error);
    return {
      success: false,
      error: error.message,
      analysis: null
    };
  }
};

/**
 * Extract knowledge from documents (documentation, code, specs)
 */
export const extractKnowledgeFromDocument = async (document, project, aiConfig) => {
  try {
    const client = initializeClient(aiConfig.claudeApiKey);

    const prompt = `You are analyzing documentation for the ${project.name} system to extract structured knowledge.

**Document Title:** ${document.title}
**Document Type:** ${document.type}
**Document Content:**
${document.content}

Please analyze this document and extract:

1. **Services/Functionalities:**
   - Name, abbreviation, description
   - Capabilities and responsibilities
   - API endpoints (method, path, description)
   - Data entities (name, description, fields)
   - Keywords

2. **Users/Actors:**
   - Name, abbreviation, role
   - Health professional stage (if applicable)
   - Permissions and access levels

3. **Workflows:**
   - Name, category, description
   - Typical steps
   - Involved services and users

4. **API Endpoints:**
   - Method, path, description
   - Request/response format
   - Authentication requirements

5. **Data Entities:**
   - Entity name
   - Description
   - Fields and data types

**Return only valid JSON in this structure:**
\`\`\`json
{
  "services": [
    {
      "name": "string",
      "abbreviation": "string",
      "description": "string",
      "type": "service|functionality|component",
      "capabilities": ["string"],
      "apiEndpoints": [{"method": "string", "path": "string", "description": "string"}],
      "dataEntities": [{"name": "string", "description": "string", "fields": "string"}],
      "keywords": ["string"]
    }
  ],
  "users": [
    {
      "name": "string",
      "abbreviation": "string",
      "type": "human|system|external",
      "role": "string",
      "description": "string",
      "healthProfessionalStage": "string or null",
      "keywords": ["string"]
    }
  ],
  "workflows": [
    {
      "name": "string",
      "category": "string",
      "description": "string",
      "pattern": "string",
      "typicalSteps": ["string"],
      "keywords": ["string"]
    }
  ],
  "endpoints": [
    {
      "service": "string",
      "method": "string",
      "path": "string",
      "description": "string",
      "authentication": "string"
    }
  ],
  "entities": [
    {
      "name": "string",
      "description": "string",
      "fields": "string"
    }
  ]
}
\`\`\``;

    const message = await client.messages.create({
      model: aiConfig.model,
      max_tokens: aiConfig.maxTokens,
      temperature: 0.3, // Lower temperature for extraction tasks
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    let jsonText = responseText;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const extracted = JSON.parse(jsonText);
    return {
      success: true,
      extracted,
      rawResponse: responseText
    };

  } catch (error) {
    console.error('Knowledge Extraction Error:', error);
    return {
      success: false,
      error: error.message,
      extracted: null
    };
  }
};

/**
 * Validate flow completeness and suggest improvements
 */
export const validateFlow = async (flow, project, aiConfig) => {
  try {
    const client = initializeClient(aiConfig.claudeApiKey);
    const knowledgeContext = buildKnowledgeBaseContext(project);

    const flowJSON = JSON.stringify(flow, null, 2);

    const prompt = `${knowledgeContext}

# Task: Validate Flow Completeness

Analyze the following workflow and identify any gaps, issues, or areas for improvement.

**Flow Data:**
\`\`\`json
${flowJSON}
\`\`\`

Please provide:

1. **Completeness Check:**
   - Are all necessary steps included?
   - Are actors properly assigned?
   - Are services correctly identified?
   - Are integration points documented?

2. **Logical Flow:**
   - Does the sequence make sense?
   - Are there any circular dependencies?
   - Are decision points properly handled?

3. **Data Flow:**
   - Is data input/output properly documented?
   - Are there any data transformation gaps?

4. **Error Handling:**
   - Are error scenarios considered?
   - Are fallback procedures defined?

5. **Performance:**
   - Are there any potential bottlenecks?
   - Are SLAs realistic?

6. **Security:**
   - Are authentication/authorization properly handled?
   - Are sensitive data properly protected?

7. **Suggestions:**
   - Missing steps
   - Missing integrations
   - Missing actors or services
   - Business rules to add
   - Performance optimizations

**Return only valid JSON:**
\`\`\`json
{
  "isComplete": boolean,
  "completenessScore": "0-100%",
  "gaps": [
    {
      "type": "string",
      "severity": "low|medium|high|critical",
      "description": "string",
      "suggestion": "string"
    }
  ],
  "issues": [
    {
      "type": "string",
      "severity": "low|medium|high|critical",
      "description": "string",
      "recommendation": "string"
    }
  ],
  "suggestions": [
    {
      "category": "string",
      "description": "string",
      "benefit": "string"
    }
  ],
  "missingElements": {
    "steps": ["string"],
    "actors": ["string"],
    "services": ["string"],
    "integrations": ["string"],
    "businessRules": ["string"]
  }
}
\`\`\``;

    const message = await client.messages.create({
      model: aiConfig.model,
      max_tokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    let jsonText = responseText;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const validation = JSON.parse(jsonText);
    return {
      success: true,
      validation,
      rawResponse: responseText
    };

  } catch (error) {
    console.error('Flow Validation Error:', error);
    return {
      success: false,
      error: error.message,
      validation: null
    };
  }
};

/**
 * Enhance output format (draw.io, markdown) with AI
 */
export const enhanceOutputPrompt = async (flow, project, outputType, aiConfig) => {
  try {
    const client = initializeClient(aiConfig.claudeApiKey);
    const knowledgeContext = buildKnowledgeBaseContext(project);

    const flowJSON = JSON.stringify(flow, null, 2);

    const prompt = `${knowledgeContext}

# Task: Generate Enhanced ${outputType.toUpperCase()} Output

Generate a detailed, well-structured ${outputType} output for this workflow that clearly shows:
- Each step as a separate element (not grouped)
- Service interactions with clear arrows and labels
- Data exchange on connectors
- Automations and integrations
- Actor swimlanes
- Service swimlanes (where applicable)
- Decision points with all paths
- Error handling flows

**Flow Data:**
\`\`\`json
${flowJSON}
\`\`\`

${outputType === 'drawio' ? `
Generate a comprehensive draw.io XML prompt that includes:
1. Horizontal swimlanes for each actor
2. Vertical lanes for service boundaries (where applicable)
3. Separate shape for EACH step (no grouping)
4. Arrows showing data flow between steps
5. Labels on arrows showing what data is exchanged
6. Different line styles for different communication types
7. Diamond shapes for decision points with all conditional paths
8. Color coding by service domain
9. Icons or badges for automations, notifications, error handling
10. Legend explaining colors, line styles, and symbols
11. Proper spacing and alignment for readability

Provide detailed instructions for creating this diagram.
` : ''}

${outputType === 'markdown' ? `
Generate comprehensive markdown documentation that includes:
1. Executive summary
2. Flow overview with metadata
3. Visual text-based flow diagram (using ASCII or mermaid syntax)
4. Detailed step-by-step breakdown
5. Service interaction matrix table
6. Data flow table
7. Integration points list
8. Business rules and validations
9. Error scenarios and handling
10. Performance requirements
11. Sequence diagram (mermaid syntax)
12. Architecture diagram showing all involved services
` : ''}

${outputType === 'sequence' ? `
Generate a mermaid sequence diagram that shows:
1. All actors and services as participants
2. Sequential message passing between participants
3. Synchronous vs asynchronous calls (different arrow styles)
4. Return values
5. Loops and conditional logic
6. Parallel processing where applicable
7. Error flows
8. Notes explaining complex interactions
` : ''}

Provide the output:`;

    const message = await client.messages.create({
      model: aiConfig.model,
      max_tokens: 8000, // Higher token limit for detailed outputs
      temperature: 0.5,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const enhancedOutput = message.content[0].text;
    return {
      success: true,
      output: enhancedOutput,
      type: outputType
    };

  } catch (error) {
    console.error('Output Enhancement Error:', error);
    return {
      success: false,
      error: error.message,
      output: null
    };
  }
};

/**
 * Suggest services based on step description
 * Real-time suggestions as user types
 */
export const suggestServicesForStep = async (stepDescription, project, aiConfig) => {
  try {
    const client = initializeClient(aiConfig.claudeApiKey);
    const knowledgeContext = buildKnowledgeBaseContext(project);

    const prompt = `${knowledgeContext}

Based on the step description: "${stepDescription}"

Suggest which services/functionalities from the knowledge base should be involved in this step.
Return only a JSON array of service IDs or names, ordered by relevance.

**Return format:**
\`\`\`json
{
  "services": [
    {
      "id": "string or null",
      "name": "string",
      "confidence": "0.0-1.0",
      "reason": "brief reason"
    }
  ],
  "actors": [
    {
      "id": "string or null",
      "name": "string",
      "confidence": "0.0-1.0",
      "reason": "brief reason"
    }
  ]
}
\`\`\``;

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022', // Use faster model for real-time suggestions
      max_tokens: 1000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    let jsonText = responseText;
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const suggestions = JSON.parse(jsonText);
    return {
      success: true,
      suggestions
    };

  } catch (error) {
    console.error('Service Suggestion Error:', error);
    return {
      success: false,
      error: error.message,
      suggestions: null
    };
  }
};

export default {
  processNaturalLanguageFlow,
  extractKnowledgeFromDocument,
  validateFlow,
  enhanceOutputPrompt,
  suggestServicesForStep
};
