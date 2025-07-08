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
