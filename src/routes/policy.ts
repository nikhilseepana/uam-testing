import { Router } from 'express';
import PolicyController from '../controllers/policy';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permission';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Policies
 *   description: Policy management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Policy:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *         name:
 *           type: string
 *           description: Policy name
 *         permissions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               resource:
 *                 type: string
 *                 description: Resource name
 *               action:
 *                 type: string
 *                 description: Action name
 *           description: Array of permissions
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

// Get all policies - requires policies:read permission
router.get('/', 
  authMiddleware, 
  checkPermission({ resource: 'policies', action: 'read' }),
  PolicyController.getAllPolicies
);

// Get policy by ID - requires policies:read permission
router.get('/:id', 
  authMiddleware, 
  checkPermission({ resource: 'policies', action: 'read' }),
  PolicyController.getPolicyById
);

// Create policy - requires policies:create permission
router.post('/', 
  authMiddleware, 
  checkPermission({ resource: 'policies', action: 'create' }),
  PolicyController.createPolicy
);

// Update policy - requires policies:update permission
router.put('/:id', 
  authMiddleware, 
  checkPermission({ resource: 'policies', action: 'update' }),
  PolicyController.updatePolicy
);

// Delete policy - requires policies:delete permission
router.delete('/:id', 
  authMiddleware, 
  checkPermission({ resource: 'policies', action: 'delete' }),
  PolicyController.deletePolicy
);

export default router;
