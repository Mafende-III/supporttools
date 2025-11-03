/**
 * Flow Model
 * Database operations for flows table
 */

const { query } = require('../config/database');
const Project = require('./Project');

const Flow = {
  /**
   * Create a new flow
   * @param {Object} flowData - Flow data
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created flow
   */
  async create(flowData, projectId, userId) {
    // Check project access
    const role = await Project.getUserRole(projectId, userId);
    if (!role || (role !== 'owner' && role !== 'editor')) {
      throw new Error('Insufficient permissions to create flow');
    }

    const {
      name,
      description,
      priority = 'Medium',
      status = 'draft',
      version = '1.0',
      service_domain_id,
      service_id,
      entry_point,
      trigger_event,
      actor_ids = [],
      tags = [],
      steps = [],
      integrations = [],
      business_rules = [],
      error_scenarios = [],
      performance_requirements = {},
      notes,
      custom_fields = {}
    } = flowData;

    const result = await query(
      `INSERT INTO flows (
        project_id, name, description, priority, status, version,
        service_domain_id, service_id, entry_point, trigger_event,
        actor_ids, tags, steps, integrations, business_rules,
        error_scenarios, performance_requirements, notes,
        custom_fields, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *`,
      [
        projectId, name, description, priority, status, version,
        service_domain_id, service_id, entry_point, trigger_event,
        JSON.stringify(actor_ids), tags, JSON.stringify(steps),
        JSON.stringify(integrations), JSON.stringify(business_rules),
        JSON.stringify(error_scenarios), JSON.stringify(performance_requirements),
        notes, JSON.stringify(custom_fields), userId
      ]
    );

    return result.rows[0];
  },

  /**
   * Find flow by ID
   * @param {string} id - Flow ID
   * @param {string} userId - User ID (for permission check)
   * @returns {Promise<Object|null>} Flow or null
   */
  async findById(id, userId) {
    const result = await query(
      `SELECT f.*, u.name as created_by_name, p.name as project_name
       FROM flows f
       LEFT JOIN users u ON f.created_by = u.id
       LEFT JOIN projects p ON f.project_id = p.id
       WHERE f.id = $1 AND f.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const flow = result.rows[0];

    // Check project access
    const hasAccess = await Project.checkAccess(flow.project_id, userId);
    if (!hasAccess) {
      return null;
    }

    return flow;
  },

  /**
   * List flows in a project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID (for permission check)
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} List of flows
   */
  async list(projectId, userId, { status, priority, search, tags, limit = 50, offset = 0 } = {}) {
    // Check project access
    const hasAccess = await Project.checkAccess(projectId, userId);
    if (!hasAccess) {
      return [];
    }

    let sql = `
      SELECT f.*, u.name as created_by_name
      FROM flows f
      LEFT JOIN users u ON f.created_by = u.id
      WHERE f.project_id = $1 AND f.deleted_at IS NULL
    `;

    const params = [projectId];
    let paramCount = 2;

    if (status) {
      sql += ` AND f.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (priority) {
      sql += ` AND f.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    if (search) {
      sql += ` AND (f.name ILIKE $${paramCount} OR f.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (tags && tags.length > 0) {
      sql += ` AND f.tags && $${paramCount}`;
      params.push(tags);
      paramCount++;
    }

    sql += ` ORDER BY f.updated_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Update flow
   * @param {string} id - Flow ID
   * @param {Object} updates - Fields to update
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated flow
   */
  async update(id, updates, userId) {
    const flow = await this.findById(id, userId);
    if (!flow) {
      throw new Error('Flow not found or access denied');
    }

    // Check project access
    const role = await Project.getUserRole(flow.project_id, userId);
    if (!role || (role !== 'owner' && role !== 'editor')) {
      throw new Error('Insufficient permissions to update flow');
    }

    const allowedFields = [
      'name', 'description', 'priority', 'status', 'version',
      'service_domain_id', 'service_id', 'entry_point', 'trigger_event',
      'actor_ids', 'tags', 'steps', 'integrations', 'business_rules',
      'error_scenarios', 'performance_requirements', 'notes', 'custom_fields'
    ];

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        let value = updates[key];

        // Stringify JSON fields
        if (['actor_ids', 'steps', 'integrations', 'business_rules', 'error_scenarios', 'performance_requirements', 'custom_fields'].includes(key)) {
          value = JSON.stringify(value);
        }

        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const result = await query(
      `UPDATE flows SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    return result.rows[0];
  },

  /**
   * Delete flow (soft delete)
   * @param {string} id - Flow ID
   * @param {string} userId - User ID
   */
  async delete(id, userId) {
    const flow = await this.findById(id, userId);
    if (!flow) {
      throw new Error('Flow not found or access denied');
    }

    // Check project access
    const role = await Project.getUserRole(flow.project_id, userId);
    if (!role || (role !== 'owner' && role !== 'editor')) {
      throw new Error('Insufficient permissions to delete flow');
    }

    await query(
      'UPDATE flows SET deleted_at = NOW() WHERE id = $1',
      [id]
    );
  },

  /**
   * Duplicate flow
   * @param {string} id - Flow ID to duplicate
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Duplicated flow
   */
  async duplicate(id, userId) {
    const original = await this.findById(id, userId);
    if (!original) {
      throw new Error('Flow not found or access denied');
    }

    const duplicated = await this.create(
      {
        name: `${original.name} (Copy)`,
        description: original.description,
        priority: original.priority,
        status: 'draft', // Copies start as draft
        version: original.version,
        service_domain_id: original.service_domain_id,
        service_id: original.service_id,
        entry_point: original.entry_point,
        trigger_event: original.trigger_event,
        actor_ids: original.actor_ids,
        tags: original.tags,
        steps: original.steps,
        integrations: original.integrations,
        business_rules: original.business_rules,
        error_scenarios: original.error_scenarios,
        performance_requirements: original.performance_requirements,
        notes: original.notes,
        custom_fields: original.custom_fields
      },
      original.project_id,
      userId
    );

    return duplicated;
  },

  /**
   * Search flows across all accessible projects
   * @param {string} userId - User ID
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Matching flows
   */
  async search(userId, searchTerm, filters = {}) {
    let sql = `
      SELECT f.*, p.name as project_name, u.name as created_by_name
      FROM flows f
      JOIN projects p ON f.project_id = p.id
      LEFT JOIN users u ON f.created_by = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE f.deleted_at IS NULL AND p.deleted_at IS NULL
        AND (p.owner_id = $1 OR p.is_public = true OR pm.user_id = $1)
        AND (
          f.name ILIKE $2 OR
          f.description ILIKE $2 OR
          f.notes ILIKE $2 OR
          f.steps::text ILIKE $2
        )
    `;

    const params = [userId, `%${searchTerm}%`];
    let paramCount = 3;

    if (filters.status) {
      sql += ` AND f.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.priority) {
      sql += ` AND f.priority = $${paramCount}`;
      params.push(filters.priority);
      paramCount++;
    }

    sql += ' GROUP BY f.id, p.name, u.name ORDER BY f.updated_at DESC LIMIT 100';

    const result = await query(sql, params);
    return result.rows;
  }
};

module.exports = Flow;
