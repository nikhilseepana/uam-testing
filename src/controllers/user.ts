import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { CreateUserRequest, UpdateUserRequest, ApiResponse, AuthenticatedRequest } from '../types';
import DatabaseService from '../services/database';
import { 
  validateEmail, 
  validatePassword, 
  validateUsername, 
  validateName, 
  validateRole, 
  sanitizeInput,
  ValidationError 
} from '../utils/validation';

export class UserController {
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
   *         description: Users retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/User'
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await DatabaseService.getAllUsers();        const usersWithoutPasswords = users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          groups: user.groups,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }));

      res.json({
        success: true,
        data: usersWithoutPasswords
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
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
   *         description: User ID
   *     responses:
   *       200:
   *         description: User retrieved successfully
   *       404:
   *         description: User not found
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await DatabaseService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }        res.json({
          success: true,
          data: {
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
        });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create a new user
   *     description: Create a new user with specified role and optional group assignments
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - firstName
   *               - lastName
   *               - password
   *               - role
   *             properties:
   *               username:
   *                 type: string
   *                 description: Username (REQUIRED) - Must be unique
   *                 example: john_doe
   *                 minLength: 3
   *                 maxLength: 50
   *               email:
   *                 type: string
   *                 description: Email address (REQUIRED) - Must be unique and valid email format
   *                 example: john.doe@example.com
   *                 format: email
   *               firstName:
   *                 type: string
   *                 description: First name (REQUIRED) - 2-50 characters, letters, spaces, hyphens, apostrophes
   *                 example: John
   *                 minLength: 2
   *                 maxLength: 50
   *               lastName:
   *                 type: string
   *                 description: Last name (REQUIRED) - 2-50 characters, letters, spaces, hyphens, apostrophes
   *                 example: Doe
   *                 minLength: 2
   *                 maxLength: 50
   *               password:
   *                 type: string
   *                 description: Password (REQUIRED) - Will be hashed
   *                 example: mySecurePassword123
   *                 minLength: 6
   *                 format: password
   *               role:
   *                 type: string
   *                 description: User role (REQUIRED)
   *                 enum: [admin, maintainer, user]
   *                 example: user
   *               groups:
   *                 type: array
   *                 description: Group IDs (OPTIONAL) - Array of valid group IDs to assign user to
   *                 items:
   *                   type: string
   *                   description: Valid Group UUID
   *                 example: ["550e8400-e29b-41d4-a716-446655440000"]
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
   *         description: Bad request - Invalid input
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
   *                   example: Username, password, and role are required
   *       401:
   *         description: Unauthorized - Invalid or missing JWT token
   *       403:
   *         description: Forbidden - Insufficient permissions
   *       409:
   *         description: Conflict - Username already exists
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
   *                   example: Username already exists
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, firstName, lastName, password, role, groups = [] }: CreateUserRequest = req.body;

      // Validate required fields
      if (!username || !email || !firstName || !lastName || !password || !role) {
        res.status(400).json({
          success: false,
          error: 'Username, email, firstName, lastName, password, and role are required'
        });
        return;
      }

      // Sanitize inputs
      const sanitizedUsername = sanitizeInput(username);
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedFirstName = sanitizeInput(firstName);
      const sanitizedLastName = sanitizeInput(lastName);

      // Validate username
      if (!validateUsername(sanitizedUsername)) {
        res.status(400).json({
          success: false,
          error: 'Username must be 3-50 characters long and contain only letters, numbers, and underscores'
        });
        return;
      }

      // Validate email
      if (!validateEmail(sanitizedEmail)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
        return;
      }

      // Validate names
      if (!validateName(sanitizedFirstName)) {
        res.status(400).json({
          success: false,
          error: 'First name must be 2-50 characters long and contain only letters, spaces, hyphens, and apostrophes'
        });
        return;
      }

      if (!validateName(sanitizedLastName)) {
        res.status(400).json({
          success: false,
          error: 'Last name must be 2-50 characters long and contain only letters, spaces, hyphens, and apostrophes'
        });
        return;
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: passwordValidation.message
        });
        return;
      }

      // Validate role
      if (!validateRole(role)) {
        res.status(400).json({
          success: false,
          error: 'Role must be admin, maintainer, or user'
        });
        return;
      }

      // Check if username already exists
      const isUsernameUnique = await DatabaseService.isUsernameUnique(sanitizedUsername);
      if (!isUsernameUnique) {
        res.status(409).json({
          success: false,
          error: 'Username already exists'
        });
        return;
      }

      // Check if email already exists
      const isEmailUnique = await DatabaseService.isEmailUnique(sanitizedEmail);
      if (!isEmailUnique) {
        res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
        return;
      }

      // Validate groups if provided
      if (groups.length > 0) {
        const groupValidation = await DatabaseService.validateGroupIds(groups);
        if (!groupValidation.valid) {
          res.status(400).json({
            success: false,
            error: `Invalid group IDs: ${groupValidation.invalidIds.join(', ')}`
          });
          return;
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await DatabaseService.createUser({
        username: sanitizedUsername,
        email: sanitizedEmail,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        password: hashedPassword,
        role,
        groups
      });

      res.status(201).json({
        success: true,
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          groups: newUser.groups,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: Update user by ID
   *     description: Update user information. All fields are optional.
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID (REQUIRED)
   *         example: "550e8400-e29b-41d4-a716-446655440000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *                 description: Username (OPTIONAL) - Must be unique if provided
   *                 example: john_doe_updated
   *                 minLength: 3
   *                 maxLength: 50
   *               email:
   *                 type: string
   *                 description: Email address (OPTIONAL) - Must be unique and valid email format if provided
   *                 example: john.doe.updated@example.com
   *                 format: email
   *               firstName:
   *                 type: string
   *                 description: First name (OPTIONAL) - 2-50 characters, letters, spaces, hyphens, apostrophes
   *                 example: John
   *                 minLength: 2
   *                 maxLength: 50
   *               lastName:
   *                 type: string
   *                 description: Last name (OPTIONAL) - 2-50 characters, letters, spaces, hyphens, apostrophes
   *                 example: Doe
   *                 minLength: 2
   *                 maxLength: 50
   *               password:
   *                 type: string
   *                 description: Password (OPTIONAL) - Will be hashed if provided
   *                 example: newSecurePassword123
   *                 minLength: 6
   *                 format: password
   *               role:
   *                 type: string
   *                 description: User role (OPTIONAL)
   *                 enum: [admin, maintainer, user]
   *                 example: maintainer
   *               groups:
   *                 type: array
   *                 description: Group IDs (OPTIONAL) - Array of valid group IDs to assign user to
   *                 items:
   *                   type: string
   *                   description: Valid Group UUID
   *                 example: ["550e8400-e29b-41d4-a716-446655440000"]
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
   *         description: Bad request - Invalid input
   *       401:
   *         description: Unauthorized - Invalid or missing JWT token
   *       403:
   *         description: Forbidden - Insufficient permissions
   *       404:
   *         description: User not found
   *       409:
   *         description: Username already exists
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { username, email, firstName, lastName, password, role, groups }: UpdateUserRequest = req.body;

      const existingUser = await DatabaseService.getUserById(id);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Validate and sanitize inputs if provided
      if (username !== undefined) {
        const sanitizedUsername = sanitizeInput(username);
        if (!validateUsername(sanitizedUsername)) {
          res.status(400).json({
            success: false,
            error: 'Username must be 3-50 characters long and contain only letters, numbers, and underscores'
          });
          return;
        }
        
        // Check if new username already exists (but not for the current user)
        if (sanitizedUsername !== existingUser.username) {
          const userWithSameUsername = await DatabaseService.getUserByUsername(sanitizedUsername);
          if (userWithSameUsername) {
            res.status(409).json({
              success: false,
              error: 'Username already exists'
            });
            return;
          }
        }
      }

      // Validate email if provided
      if (email !== undefined) {
        const sanitizedEmail = sanitizeInput(email);
        if (!validateEmail(sanitizedEmail)) {
          res.status(400).json({
            success: false,
            error: 'Invalid email format'
          });
          return;
        }
        
        // Check if new email already exists (but not for the current user)
        if (sanitizedEmail !== existingUser.email) {
          const userWithSameEmail = await DatabaseService.getUserByEmail(sanitizedEmail);
          if (userWithSameEmail) {
            res.status(409).json({
              success: false,
              error: 'Email already exists'
            });
            return;
          }
        }
      }

      // Validate firstName if provided
      if (firstName !== undefined) {
        const sanitizedFirstName = sanitizeInput(firstName);
        if (!validateName(sanitizedFirstName)) {
          res.status(400).json({
            success: false,
            error: 'First name must be 2-50 characters long and contain only letters, spaces, hyphens, and apostrophes'
          });
          return;
        }
      }

      // Validate lastName if provided
      if (lastName !== undefined) {
        const sanitizedLastName = sanitizeInput(lastName);
        if (!validateName(sanitizedLastName)) {
          res.status(400).json({
            success: false,
            error: 'Last name must be 2-50 characters long and contain only letters, spaces, hyphens, and apostrophes'
          });
          return;
        }
      }

      // Validate password if provided
      if (password !== undefined) {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          res.status(400).json({
            success: false,
            error: passwordValidation.message
          });
          return;
        }
      }

      // Validate role if provided
      if (role !== undefined) {
        if (!validateRole(role)) {
          res.status(400).json({
            success: false,
            error: 'Role must be admin, maintainer, or user'
          });
          return;
        }
      }

      // Validate groups if provided
      if (groups !== undefined && groups.length > 0) {
        const groupValidation = await DatabaseService.validateGroupIds(groups);
        if (!groupValidation.valid) {
          res.status(400).json({
            success: false,
            error: `Invalid group IDs: ${groupValidation.invalidIds.join(', ')}`
          });
          return;
        }
      }

      const updateData: any = {};
      if (username !== undefined) updateData.username = sanitizeInput(username);
      if (email !== undefined) updateData.email = sanitizeInput(email);
      if (firstName !== undefined) updateData.firstName = sanitizeInput(firstName);
      if (lastName !== undefined) updateData.lastName = sanitizeInput(lastName);
      if (password !== undefined) updateData.password = await bcrypt.hash(password, 10);
      if (role !== undefined) updateData.role = role;
      if (groups !== undefined) updateData.groups = groups;

      const updatedUser = await DatabaseService.updateUser(id, updateData);

      res.json({
        success: true,
        data: {
          id: updatedUser!.id,
          username: updatedUser!.username,
          email: updatedUser!.email,
          firstName: updatedUser!.firstName,
          lastName: updatedUser!.lastName,
          role: updatedUser!.role,
          groups: updatedUser!.groups,
          createdAt: updatedUser!.createdAt,
          updatedAt: updatedUser!.updatedAt
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: Delete user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = (req as AuthenticatedRequest).user;

      // Prevent user from deleting themselves
      if (currentUser?.userId === id) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete your own account'
        });
        return;
      }

      const deleted = await DatabaseService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default new UserController();
