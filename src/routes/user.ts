import { Router } from 'express';
import UserController from '../controllers/user';
import { authMiddleware } from '../middleware/auth';
import { checkPermission, checkRole, checkOwnership } from '../middleware/permission';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         username:
 *           type: string
 *           description: Username
 *           example: "john_doe"
 *         role:
 *           type: string
 *           enum: [admin, maintainer, user]
 *           description: User role
 *           example: "user"
 *         groups:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of group IDs
 *           example: ["group-id-1", "group-id-2"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2025-07-08T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2025-07-08T10:30:00.000Z"
 *     UserCreate:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           description: Username (REQUIRED) - Must be unique
 *           example: "john_doe"
 *           minLength: 3
 *           maxLength: 50
 *         password:
 *           type: string
 *           description: Password (REQUIRED) - Will be hashed
 *           example: "mySecurePassword123"
 *           minLength: 6
 *           format: password
 *         role:
 *           type: string
 *           description: User role (REQUIRED)
 *           enum: [admin, maintainer, user]
 *           example: "user"
 *         groups:
 *           type: array
 *           description: Group IDs (OPTIONAL) - Array of group IDs
 *           items:
 *             type: string
 *           example: ["group-id-1", "group-id-2"]
 *     UserUpdate:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: Username (OPTIONAL) - Must be unique if provided
 *           example: "john_doe_updated"
 *           minLength: 3
 *           maxLength: 50
 *         password:
 *           type: string
 *           description: Password (OPTIONAL) - Will be hashed if provided
 *           example: "newSecurePassword123"
 *           minLength: 6
 *           format: password
 *         role:
 *           type: string
 *           description: User role (OPTIONAL)
 *           enum: [admin, maintainer, user]
 *           example: "maintainer"
 *         groups:
 *           type: array
 *           description: Group IDs (OPTIONAL) - Array of group IDs
 *           items:
 *             type: string
 *           example: ["group-id-1", "group-id-3"]
 */

// Get all users - requires users:read permission
router.get('/', 
  authMiddleware, 
  checkPermission({ resource: 'users', action: 'read' }),
  UserController.getAllUsers
);

// Get user by ID - requires users:read permission or ownership
router.get('/:id', 
  authMiddleware, 
  checkPermission({ resource: 'users', action: 'read' }),
  UserController.getUserById
);

// Create user - requires users:create permission
router.post('/', 
  authMiddleware, 
  checkPermission({ resource: 'users', action: 'create' }),
  UserController.createUser
);

// Update user - requires users:update permission
router.put('/:id', 
  authMiddleware, 
  checkPermission({ resource: 'users', action: 'update' }),
  UserController.updateUser
);

// Delete user - requires users:delete permission
router.delete('/:id', 
  authMiddleware, 
  checkPermission({ resource: 'users', action: 'delete' }),
  UserController.deleteUser
);

export default router;
