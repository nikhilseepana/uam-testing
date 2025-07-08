import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { LoginRequest, LoginResponse, ApiResponse } from '../types';
import DatabaseService from '../services/database';
import { generateToken } from '../middleware/auth';

export class AuthController {
  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: User login
   *     description: Authenticate user with username/email and password to receive JWT token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 description: Username or email address (REQUIRED)
   *                 example: admin@example.com
   *                 minLength: 3
   *                 maxLength: 50
   *               password:
   *                 type: string
   *                 description: Password (REQUIRED)
   *                 example: pa$$w0rd
   *                 minLength: 6
   *                 format: password
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                       description: JWT access token
   *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *       400:
   *         description: Bad request - Missing username or password
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
   *                   example: Username and password are required
   *       401:
   *         description: Invalid credentials
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
   *                   example: Invalid credentials
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password }: LoginRequest = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: 'Username or email and password are required'
        });
        return;
      }

      // Try to find user by username first, then by email
      let user = await DatabaseService.getUserByUsername(username);
      if (!user) {
        user = await DatabaseService.getUserByEmail(username);
      }

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role
      });

      const response: ApiResponse<LoginResponse> = {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            groups: user.groups,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Get current user info
   *     description: Retrieve information about the currently authenticated user
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User info retrieved successfully
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
   *       401:
   *         description: Unauthorized - Invalid or missing JWT token
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
   *                   example: No authorization header provided
   *       404:
   *         description: User not found
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const fullUser = await DatabaseService.getUserById(user.userId);
      
      if (!fullUser) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: fullUser.id,
          username: fullUser.username,
          email: fullUser.email,
          firstName: fullUser.firstName,
          lastName: fullUser.lastName,
          role: fullUser.role,
          groups: fullUser.groups,
          createdAt: fullUser.createdAt,
          updatedAt: fullUser.updatedAt
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default new AuthController();
