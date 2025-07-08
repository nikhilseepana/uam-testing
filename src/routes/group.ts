import { Router } from 'express';
import GroupController from '../controllers/group';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permission';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Group management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - policies
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier (REQUIRED)
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         name:
 *           type: string
 *           description: Group name (REQUIRED) - Must be unique
 *           example: "Administrators"
 *           minLength: 3
 *           maxLength: 100
 *         policies:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of policy IDs (REQUIRED) - Can be empty array
 *           example: ["policy-id-1", "policy-id-2"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp (REQUIRED)
 *           example: "2025-07-08T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp (REQUIRED)
 *           example: "2025-07-08T10:30:00.000Z"
 *     GroupCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Group name (REQUIRED) - Must be unique, 3-100 characters
 *           example: "Administrators"
 *           minLength: 3
 *           maxLength: 100
 *           pattern: '^[a-zA-Z0-9\\s\\-_]+$'
 *         policies:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of policy IDs (OPTIONAL) - Must be valid policy IDs
 *           example: ["policy-id-1", "policy-id-2"]
 *     GroupUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Group name (OPTIONAL) - Must be unique if provided, 3-100 characters
 *           example: "Updated Administrators"
 *           minLength: 3
 *           maxLength: 100
 *           pattern: '^[a-zA-Z0-9\\s\\-_]+$'
 *         policies:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of policy IDs (OPTIONAL) - Must be valid policy IDs if provided
 *           example: ["policy-id-1", "policy-id-3"]
 */

// Get all groups - requires groups:read permission
router.get('/', 
  authMiddleware, 
  checkPermission({ resource: 'groups', action: 'read' }),
  GroupController.getAllGroups
);

// Get group by ID - requires groups:read permission
router.get('/:id', 
  authMiddleware, 
  checkPermission({ resource: 'groups', action: 'read' }),
  GroupController.getGroupById
);

// Create group - requires groups:create permission
router.post('/', 
  authMiddleware, 
  checkPermission({ resource: 'groups', action: 'create' }),
  GroupController.createGroup
);

// Update group - requires groups:update permission
router.put('/:id', 
  authMiddleware, 
  checkPermission({ resource: 'groups', action: 'update' }),
  GroupController.updateGroup
);

// Delete group - requires groups:delete permission
router.delete('/:id', 
  authMiddleware, 
  checkPermission({ resource: 'groups', action: 'delete' }),
  GroupController.deleteGroup
);

export default router;
