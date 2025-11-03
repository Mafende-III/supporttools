/**
 * Flows API Routes
 * CRUD operations for workflow definitions
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const Flow = require('../models/Flow');
const { authenticate } = require('../middleware/auth');
const { asyncHandler, handleValidationErrors } = require('../middleware/errorHandler');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/flows/search
 * @desc    Search flows across all projects
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { q, status, priority } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Search query must be at least 2 characters'
    });
  }

  const flows = await Flow.search(req.userId, q, { status, priority });

  res.json({
    success: true,
    data: { flows, count: flows.length }
  });
}));

/**
 * @route   GET /api/flows?project_id=xxx
 * @desc    List flows in a project
 */
router.get('/', asyncHandler(async (req, res) => {
  const { project_id, status, priority, search, tags, limit, offset } = req.query;

  if (!project_id) {
    return res.status(400).json({
      success: false,
      error: 'project_id is required'
    });
  }

  const flows = await Flow.list(project_id, req.userId, {
    status,
    priority,
    search,
    tags: tags ? tags.split(',') : undefined,
    limit: parseInt(limit) || 50,
    offset: parseInt(offset) || 0
  });

  res.json({
    success: true,
    data: { flows, count: flows.length }
  });
}));

/**
 * @route   POST /api/flows
 * @desc    Create new flow
 */
router.post('/',
  [
    body('project_id').isUUID().withMessage('Valid project_id is required'),
    body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('steps').isArray().withMessage('Steps must be an array')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { project_id, ...flowData } = req.body;

    const flow = await Flow.create(flowData, project_id, req.userId);

    res.status(201).json({
      success: true,
      message: 'Flow created successfully',
      data: { flow }
    });
  })
);

/**
 * @route   GET /api/flows/:id
 * @desc    Get flow by ID
 */
router.get('/:id',
  [param('id').isUUID()],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const flow = await Flow.findById(req.params.id, req.userId);

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found or access denied'
      });
    }

    res.json({
      success: true,
      data: { flow }
    });
  })
);

/**
 * @route   PUT /api/flows/:id
 * @desc    Update flow
 */
router.put('/:id',
  [param('id').isUUID()],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const flow = await Flow.update(req.params.id, req.body, req.userId);

    res.json({
      success: true,
      message: 'Flow updated successfully',
      data: { flow }
    });
  })
);

/**
 * @route   DELETE /api/flows/:id
 * @desc    Delete flow
 */
router.delete('/:id',
  [param('id').isUUID()],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    await Flow.delete(req.params.id, req.userId);

    res.json({
      success: true,
      message: 'Flow deleted successfully'
    });
  })
);

/**
 * @route   POST /api/flows/:id/duplicate
 * @desc    Duplicate flow
 */
router.post('/:id/duplicate',
  [param('id').isUUID()],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const flow = await Flow.duplicate(req.params.id, req.userId);

    res.status(201).json({
      success: true,
      message: 'Flow duplicated successfully',
      data: { flow }
    });
  })
);

module.exports = router;
