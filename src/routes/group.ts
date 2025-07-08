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
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *         name:
 *           type: string
 *           description: Group name
 *         policies:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of policy IDs
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
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
