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
 *       required:
 *         - id
 *         - username
 *         - email
 *         - firstName
 *         - lastName
 *         - role
 *         - groups
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier (REQUIRED)
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         username:
 *           type: string
 *           description: Username (REQUIRED) - Must be unique
 *           example: "john_doe"
 *           minLength: 3
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *           description: Email address (REQUIRED) - Must be unique and valid
 *           example: "john.doe@example.com"
 *         firstName:
 *           type: string
 *           description: First name (REQUIRED)
 *           example: "John"
 *           minLength: 1
 *           maxLength: 100
 *         lastName:
 *           type: string
 *           description: Last name (REQUIRED)
 *           example: "Doe"
 *           minLength: 1
 *           maxLength: 100
 *         role:
 *           $ref: '#/components/schemas/UserRole'
 *         groups:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of group IDs (REQUIRED) - Can be empty array
 *           example: ["group-id-1", "group-id-2"]
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
 *     UserCreate:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - firstName
 *         - lastName
 *         - password
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           description: Username (REQUIRED) - Must be unique, 3-50 characters
 *           example: "john_doe"
 *           minLength: 3
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *         email:
 *           type: string
 *           format: email
 *           description: Email address (REQUIRED) - Must be unique and valid format
 *           example: "john.doe@example.com"
 *         firstName:
 *           type: string
 *           description: First name (REQUIRED) - 1-100 characters
 *           example: "John"
 *           minLength: 1
 *           maxLength: 100
 *         lastName:
 *           type: string
 *           description: Last name (REQUIRED) - 1-100 characters
 *           example: "Doe"
 *           minLength: 1
 *           maxLength: 100
 *         password:
 *           type: string
 *           description: Password (REQUIRED) - Must be at least 6 characters
 *           example: "mySecurePassword123"
 *           minLength: 6
 *           format: password
 *         role:
 *           $ref: '#/components/schemas/UserRole'
 *         groups:
 *           type: array
 *           description: Group IDs (OPTIONAL) - Array of valid group IDs
 *           items:
 *             type: string
 *           example: ["group-id-1", "group-id-2"]
 *     UserUpdate:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: Username (OPTIONAL) - Must be unique if provided, 3-50 characters
 *           example: "john_doe_updated"
 *           minLength: 3
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *         email:
 *           type: string
 *           format: email
 *           description: Email address (OPTIONAL) - Must be unique and valid format if provided
 *           example: "john.doe.updated@example.com"
 *         firstName:
 *           type: string
 *           description: First name (OPTIONAL) - 1-100 characters
 *           example: "John"
 *           minLength: 1
 *           maxLength: 100
 *         lastName:
 *           type: string
 *           description: Last name (OPTIONAL) - 1-100 characters
 *           example: "Doe"
 *           minLength: 1
 *           maxLength: 100
 *         password:
 *           type: string
 *           description: Password (OPTIONAL) - Will be hashed if provided, minimum 6 characters
 *           example: "newSecurePassword123"
 *           minLength: 6
 *           format: password
 *         role:
 *           $ref: '#/components/schemas/UserRole'
 *         groups:
 *           type: array
 *           description: Group IDs (OPTIONAL) - Array of valid group IDs
 *           items:
 *             type: string
 *           example: ["group-id-1", "group-id-3"]
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *           examples:
 *             basicUser:
 *               summary: Basic user creation
 *               value:
 *                 username: "john_doe"
 *                 email: "john.doe@example.com"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 password: "securePassword123"
 *                 role: "user"
 *             userWithGroups:
 *               summary: User with group assignments
 *               value:
 *                 username: "jane_smith"
 *                 email: "jane.smith@example.com"
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 password: "securePassword123"
 *                 role: "maintainer"
 *                 groups: ["group-id-1", "group-id-2"]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (UUID format)
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (UUID format)
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *           examples:
 *             partialUpdate:
 *               summary: Partial user update
 *               value:
 *                 firstName: "John Updated"
 *                 lastName: "Doe Updated"
 *             fullUpdate:
 *               summary: Full user update
 *               value:
 *                 username: "john_doe_updated"
 *                 email: "john.doe.updated@example.com"
 *                 firstName: "John Updated"
 *                 lastName: "Doe Updated"
 *                 role: "maintainer"
 *                 groups: ["group-id-1", "group-id-3"]
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (UUID format)
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
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
