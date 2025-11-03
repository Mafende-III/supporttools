/**
 * User Model
 * Database operations for users table
 */

const { query } = require('../config/database');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

const User = {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create({ email, name, password, role = 'analyst' }) {
    // Hash password
    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const result = await query(
      `INSERT INTO users (email, name, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at`,
      [email, name, password_hash, role]
    );

    return result.rows[0];
  },

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    return result.rows[0] || null;
  },

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User or null
   */
  async findById(id) {
    const result = await query(
      'SELECT id, email, name, role, preferences, created_at, updated_at, last_login_at, is_active FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    return result.rows[0] || null;
  },

  /**
   * Verify user password
   * @param {string} password - Plain text password
   * @param {string} hash - Password hash
   * @returns {Promise<boolean>} True if password matches
   */
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  },

  /**
   * Update user last login
   * @param {string} id - User ID
   */
  async updateLastLogin(id) {
    await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [id]
    );
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated user
   */
  async update(id, updates) {
    const allowedFields = ['name', 'email', 'role', 'preferences', 'is_active'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING id, email, name, role, preferences, updated_at`,
      values
    );

    return result.rows[0];
  },

  /**
   * Update user password
   * @param {string} id - User ID
   * @param {string} newPassword - New plain text password
   * @returns {Promise<boolean>} Success status
   */
  async updatePassword(id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [password_hash, id]
    );

    return true;
  },

  /**
   * Soft delete user
   * @param {string} id - User ID
   */
  async delete(id) {
    await query(
      'UPDATE users SET deleted_at = NOW(), is_active = false WHERE id = $1',
      [id]
    );
  },

  /**
   * List all users (admin only)
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} List of users
   */
  async list({ role, isActive, limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT id, email, name, role, is_active, created_at, last_login_at FROM users WHERE deleted_at IS NULL';
    const params = [];
    let paramCount = 1;

    if (role) {
      sql += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (isActive !== undefined) {
      sql += ` AND is_active = $${paramCount}`;
      params.push(isActive);
      paramCount++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }
};

module.exports = User;
