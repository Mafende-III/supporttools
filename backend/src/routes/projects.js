/**
 * Projects API Routes
 * CRUD operations for projects, service registry, actor registry
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const Project = require('../models/Project');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler, handleValidationErrors } = require('../middleware/errorHandler');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/projects
 * @desc    List user's accessible projects
 */
router.get('/', asyncHandler(async (req, res) => {
  const { search, is_public, limit, offset } = req.query;
  
  const projects = await Project.list(req.userId, {
    search,
    isPublic: is_public === 'true',
    limit: parseInt(limit) || 50,
    offset: parseInt(offset) || 0
  });

  res.json({
    success: true,
    data: { projects, count: projects.length }
  });
}));

/**
 * @route   POST /api/projects
 * @desc    Create new project
 */
router.post('/',
  [
    body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('description').optional().trim()
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const project = await Project.create(req.body, req.userId);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  })
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 */
router.get('/:id',
  [param('id').isUUID()],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id, req.userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    res.json({
      success: true,
      data: { project }
    });
  })
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 */
router.put('/:id',
  [param('id').isUUID()],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const project = await Project.update(req.params.id, req.body, req.userId);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project }
    });
  })
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 */
router.delete('/:id',
  [param('id').isUUID()],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    await Project.delete(req.params.id, req.userId);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  })
);

/**
 * @route   POST /api/projects/:id/duplicate
 * @desc    Duplicate project
 */
router.post('/:id/duplicate',
  [param('id').isUUID()],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const project = await Project.duplicate(req.params.id, req.userId);

    res.status(201).json({
      success: true,
      message: 'Project duplicated successfully',
      data: { project }
    });
  })
);

/**
 * @route   GET /api/projects/:id/members
 * @desc    Get project members
 */
router.get('/:id/members',
  [param('id').isUUID()],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const members = await Project.getMembers(req.params.id);

    res.json({
      success: true,
      data: { members }
    });
  })
);

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add member to project
 */
router.post('/:id/members',
  [
    param('id').isUUID(),
    body('user_id').isUUID(),
    body('role').isIn(['editor', 'viewer'])
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const member = await Project.addMember(
      req.params.id,
      req.body.user_id,
      req.body.role,
      req.userId
    );

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: { member }
    });
  })
);

/**
 * @route   DELETE /api/projects/:id/members/:userId
 * @desc    Remove member from project
 */
router.delete('/:id/members/:userId',
  [
    param('id').isUUID(),
    param('userId').isUUID()
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    await Project.removeMember(req.params.id, req.params.userId, req.userId);

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  })
);

module.exports = router;
