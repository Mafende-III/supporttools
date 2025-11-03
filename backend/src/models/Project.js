/**
 * Project Model
 * Database operations for projects table
 */

const { query, transaction } = require('../config/database');

const Project = {
  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {string} ownerId - User ID who owns the project
   * @returns {Promise<Object>} Created project
   */
  async create(projectData, ownerId) {
    const {
      name,
      description,
      version = '1.0.0',
      is_public = false,
      service_registry = { domains: [] },
      actor_registry = { actors: [] },
      integration_types = { types: [] },
      settings = {},
      custom_fields = {}
    } = projectData;

    const result = await query(
      `INSERT INTO projects (
        name, description, version, owner_id, is_public,
        service_registry, actor_registry, integration_types,
        settings, custom_fields
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        name,
        description,
        version,
        ownerId,
        is_public,
        JSON.stringify(service_registry),
        JSON.stringify(actor_registry),
        JSON.stringify(integration_types),
        JSON.stringify(settings),
        JSON.stringify(custom_fields)
      ]
    );

    return result.rows[0];
  },

  /**
   * Find project by ID
   * @param {string} id - Project ID
   * @param {string} userId - User ID (for permission check)
   * @returns {Promise<Object|null>} Project or null
   */
  async findById(id, userId = null) {
    let sql = `
      SELECT p.*, u.name as owner_name, u.email as owner_email
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const project = result.rows[0];

    // Check if user has access
    if (userId) {
      const hasAccess = await this.checkAccess(id, userId);
      if (!hasAccess) {
        return null;
      }
    }

    return project;
  },

  /**
   * Check if user has access to project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if user has access
   */
  async checkAccess(projectId, userId) {
    const result = await query(
      `SELECT 1 FROM projects WHERE id = $1 AND (
        owner_id = $2 OR
        is_public = true OR
        id IN (SELECT project_id FROM project_members WHERE user_id = $2)
      ) AND deleted_at IS NULL`,
      [projectId, userId]
    );

    return result.rows.length > 0;
  },

  /**
   * Get user's access role for project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @returns {Promise<string|null>} Role (owner, editor, viewer) or null
   */
  async getUserRole(projectId, userId) {
    const result = await query(
      `SELECT
        CASE
          WHEN p.owner_id = $2 THEN 'owner'
          WHEN pm.role IS NOT NULL THEN pm.role
          WHEN p.is_public THEN 'viewer'
          ELSE NULL
        END as role
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $2
      WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [projectId, userId]
    );

    return result.rows[0]?.role || null;
  },

  /**
   * List projects accessible by user
   * @param {string} userId - User ID
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} List of projects
   */
  async list(userId, { search, isPublic, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT DISTINCT p.*, u.name as owner_name, u.email as owner_email,
        CASE
          WHEN p.owner_id = $1 THEN 'owner'
          WHEN pm.role IS NOT NULL THEN pm.role
          WHEN p.is_public THEN 'viewer'
        END as user_role,
        (SELECT COUNT(*) FROM flows WHERE project_id = p.id AND deleted_at IS NULL) as flow_count
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
      WHERE p.deleted_at IS NULL
        AND (p.owner_id = $1 OR p.is_public = true OR pm.user_id = $1)
    `;

    const params = [userId];
    let paramCount = 2;

    if (search) {
      sql += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (isPublic !== undefined) {
      sql += ` AND p.is_public = $${paramCount}`;
      params.push(isPublic);
      paramCount++;
    }

    sql += ` ORDER BY p.updated_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Update project
   * @param {string} id - Project ID
   * @param {Object} updates - Fields to update
   * @param {string} userId - User ID (for permission check)
   * @returns {Promise<Object>} Updated project
   */
  async update(id, updates, userId) {
    // Check if user is owner or editor
    const role = await this.getUserRole(id, userId);
    if (!role || (role !== 'owner' && role !== 'editor')) {
      throw new Error('Insufficient permissions to update project');
    }

    const allowedFields = [
      'name', 'description', 'version', 'is_public',
      'service_registry', 'actor_registry', 'integration_types',
      'settings', 'custom_fields'
    ];

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        let value = updates[key];

        // Stringify JSON fields
        if (['service_registry', 'actor_registry', 'integration_types', 'settings', 'custom_fields'].includes(key)) {
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
      `UPDATE projects SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    return result.rows[0];
  },

  /**
   * Delete project (soft delete)
   * @param {string} id - Project ID
   * @param {string} userId - User ID (must be owner)
   */
  async delete(id, userId) {
    // Check if user is owner
    const role = await this.getUserRole(id, userId);
    if (role !== 'owner') {
      throw new Error('Only project owner can delete the project');
    }

    await query(
      'UPDATE projects SET deleted_at = NOW() WHERE id = $1',
      [id]
    );
  },

  /**
   * Duplicate project
   * @param {string} id - Project ID to duplicate
   * @param {string} userId - User ID (new owner)
   * @returns {Promise<Object>} Duplicated project
   */
  async duplicate(id, userId) {
    const original = await this.findById(id, userId);
    if (!original) {
      throw new Error('Project not found or access denied');
    }

    const duplicated = await this.create(
      {
        name: `${original.name} (Copy)`,
        description: original.description,
        version: original.version,
        is_public: false, // Copies are private by default
        service_registry: original.service_registry,
        actor_registry: original.actor_registry,
        integration_types: original.integration_types,
        settings: original.settings,
        custom_fields: original.custom_fields
      },
      userId
    );

    return duplicated;
  },

  /**
   * Add member to project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID to add
   * @param {string} role - Role (editor, viewer)
   * @param {string} addedBy - User ID who is adding
   * @returns {Promise<Object>} Member record
   */
  async addMember(projectId, userId, role, addedBy) {
    // Check if adder is owner
    const adderRole = await this.getUserRole(projectId, addedBy);
    if (adderRole !== 'owner') {
      throw new Error('Only project owner can add members');
    }

    const result = await query(
      `INSERT INTO project_members (project_id, user_id, role, added_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (project_id, user_id) DO UPDATE
       SET role = $3
       RETURNING *`,
      [projectId, userId, role, addedBy]
    );

    return result.rows[0];
  },

  /**
   * Remove member from project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID to remove
   * @param {string} removedBy - User ID who is removing
   */
  async removeMember(projectId, userId, removedBy) {
    // Check if remover is owner
    const removerRole = await this.getUserRole(projectId, removedBy);
    if (removerRole !== 'owner') {
      throw new Error('Only project owner can remove members');
    }

    await query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );
  },

  /**
   * Get project members
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} List of members
   */
  async getMembers(projectId) {
    const result = await query(
      `SELECT pm.*, u.name, u.email
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
       ORDER BY pm.added_at DESC`,
      [projectId]
    );

    return result.rows;
  }
};

module.exports = Project;
