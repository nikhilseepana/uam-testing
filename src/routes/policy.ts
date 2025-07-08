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
 *     Permission:
 *       type: object
 *       required:
 *         - resource
 *         - action
 *       properties:
 *         resource:
 *           $ref: '#/components/schemas/PermissionResource'
 *         action:
 *           $ref: '#/components/schemas/PermissionAction'
 *     Policy:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - permissions
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier (REQUIRED)
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         name:
 *           type: string
 *           description: Policy name (REQUIRED) - Must be unique
 *           example: "Admin Policy"
 *           minLength: 3
 *           maxLength: 100
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Permission'
 *           description: Array of permissions (REQUIRED) - Cannot be empty
 *           minItems: 1
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
 *     PolicyCreate:
 *       type: object
 *       required:
 *         - name
 *         - permissions
 *       properties:
 *         name:
 *           type: string
 *           description: Policy name (REQUIRED) - Must be unique, 3-100 characters
 *           example: "Admin Policy"
 *           minLength: 3
 *           maxLength: 100
 *           pattern: '^[a-zA-Z0-9\\s\\-_]+$'
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Permission'
 *           description: Array of permissions (REQUIRED) - Must contain at least one permission
 *           minItems: 1
 *           example:
 *             - resource: "users"
 *               action: "read"
 *             - resource: "users"
 *               action: "create"
 *     PolicyUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Policy name (OPTIONAL) - Must be unique if provided, 3-100 characters
 *           example: "Updated Admin Policy"
 *           minLength: 3
 *           maxLength: 100
 *           pattern: '^[a-zA-Z0-9\\s\\-_]+$'
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Permission'
 *           description: Array of permissions (OPTIONAL) - Must contain at least one permission if provided
 *           minItems: 1
 *           example:
 *             - resource: "users"
 *               action: "read"
 *             - resource: "groups"
 *               action: "create"
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
