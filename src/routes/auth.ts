import { Router } from 'express';
import AuthController from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Username or email address (REQUIRED)
 *           example: "admin@example.com"
 *           minLength: 3
 *           maxLength: 100
 *         password:
 *           type: string
 *           description: User password (REQUIRED)
 *           example: "pa$$w0rd"
 *           minLength: 6
 *           format: password
 *     LoginResponse:
 *       type: object
 *       required:
 *         - success
 *         - data
 *       properties:
 *         success:
 *           type: boolean
 *           description: Request success status (REQUIRED)
 *           example: true
 *         data:
 *           type: object
 *           required:
 *             - token
 *             - user
 *           properties:
 *             token:
 *               type: string
 *               description: JWT authentication token (REQUIRED)
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             user:
 *               type: object
 *               description: User information without password (REQUIRED)
 *               allOf:
 *                 - $ref: '#/components/schemas/User'
 *               example:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 username: "admin"
 *                 email: "admin@example.com"
 *                 firstName: "System"
 *                 lastName: "Administrator"
 *                 role: "admin"
 *                 groups: ["admin-group-id"]
 *                 createdAt: "2025-07-08T10:30:00.000Z"
 *                 updatedAt: "2025-07-08T10:30:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication management
 */

router.post('/login', AuthController.login);
router.get('/me', authMiddleware, AuthController.me);

export default router;
