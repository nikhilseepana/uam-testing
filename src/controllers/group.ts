import { Request, Response } from 'express';
import { CreateGroupRequest, UpdateGroupRequest, ApiResponse } from '../types';
import DatabaseService from '../services/database';
import { 
  validateGroupName,
  sanitizeInput,
  ValidationError 
} from '../utils/validation';

export class GroupController {
  /**
   * @swagger
   * /groups:
   *   get:
   *     summary: Get all groups
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Groups retrieved successfully
   */
  async getAllGroups(req: Request, res: Response): Promise<void> {
    try {
      const groups = await DatabaseService.getAllGroups();
      res.json({
        success: true,
        data: groups
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
   * /groups/{id}:
   *   get:
   *     summary: Get group by ID
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Group ID
   *     responses:
   *       200:
   *         description: Group retrieved successfully
   *       404:
   *         description: Group not found
   */
  async getGroupById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const group = await DatabaseService.getGroupById(id);

      if (!group) {
        res.status(404).json({
          success: false,
          error: 'Group not found'
        });
        return;
      }

      res.json({
        success: true,
        data: group
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
   * /groups:
   *   post:
   *     summary: Create a new group
   *     description: Create a new group with optional policy assignments
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 description: Group name (REQUIRED) - Must be unique
   *                 example: "Development Team"
   *                 minLength: 3
   *                 maxLength: 100
   *               policies:
   *                 type: array
   *                 description: Policy IDs (OPTIONAL) - Array of valid policy IDs to assign to group
   *                 items:
   *                   type: string
   *                   description: Valid Policy UUID
   *                 example: ["550e8400-e29b-41d4-a716-446655440000"]
   *     responses:
   *       201:
   *         description: Group created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Group'
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
   *                   example: Group name is required
   *       401:
   *         description: Unauthorized - Invalid or missing JWT token
   *       403:
   *         description: Forbidden - Insufficient permissions
   *       409:
   *         description: Conflict - Group name already exists
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
   *                   example: Group name already exists
   */
  async createGroup(req: Request, res: Response): Promise<void> {
    try {
      const { name, policies = [] }: CreateGroupRequest = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Group name is required'
        });
        return;
      }

      // Sanitize and validate group name
      const sanitizedName = sanitizeInput(name);
      if (!validateGroupName(sanitizedName)) {
        res.status(400).json({
          success: false,
          error: 'Group name must be 3-100 characters long and contain only letters, numbers, spaces, hyphens, and underscores'
        });
        return;
      }

      // Check if group name is unique
      const isNameUnique = await DatabaseService.isGroupNameUnique(sanitizedName);
      if (!isNameUnique) {
        res.status(409).json({
          success: false,
          error: 'Group name already exists'
        });
        return;
      }

      // Validate that all policy IDs exist
      if (policies.length > 0) {
        const policyValidation = await DatabaseService.validatePolicyIds(policies);
        if (!policyValidation.valid) {
          res.status(400).json({
            success: false,
            error: `Invalid policy IDs: ${policyValidation.invalidIds.join(', ')}`
          });
          return;
        }
      }

      const newGroup = await DatabaseService.createGroup({
        name: sanitizedName,
        policies
      });

      res.status(201).json({
        success: true,
        data: newGroup
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
   * /groups/{id}:
   *   put:
   *     summary: Update group by ID
   *     description: Update group information. All fields are optional.
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Group ID (REQUIRED)
   *         example: "550e8400-e29b-41d4-a716-446655440000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Group name (OPTIONAL) - Must be unique if provided
   *                 example: "Updated Development Team"
   *                 minLength: 3
   *                 maxLength: 100
   *               policies:
   *                 type: array
   *                 description: Policy IDs (OPTIONAL) - Array of valid policy IDs to assign to group
   *                 items:
   *                   type: string
   *                   description: Valid Policy UUID
   *                 example: ["550e8400-e29b-41d4-a716-446655440000"]
   *     responses:
   *       200:
   *         description: Group updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Group'
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
   *                   example: Invalid policy IDs
   *       401:
   *         description: Unauthorized - Invalid or missing JWT token
   *       403:
   *         description: Forbidden - Insufficient permissions
   *       404:
   *         description: Group not found
   *       409:
   *         description: Group name already exists
   */
  async updateGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, policies }: UpdateGroupRequest = req.body;

      const existingGroup = await DatabaseService.getGroupById(id);
      if (!existingGroup) {
        res.status(404).json({
          success: false,
          error: 'Group not found'
        });
        return;
      }

      // Validate name if provided
      if (name !== undefined) {
        const sanitizedName = sanitizeInput(name);
        if (!validateGroupName(sanitizedName)) {
          res.status(400).json({
            success: false,
            error: 'Group name must be 3-100 characters long and contain only letters, numbers, spaces, hyphens, and underscores'
          });
          return;
        }

        // Check if new name already exists (but not for the current group)
        if (sanitizedName !== existingGroup.name) {
          const isNameUnique = await DatabaseService.isGroupNameUnique(sanitizedName);
          if (!isNameUnique) {
            res.status(409).json({
              success: false,
              error: 'Group name already exists'
            });
            return;
          }
        }
      }

      // Validate policies if provided
      if (policies !== undefined && policies.length > 0) {
        const policyValidation = await DatabaseService.validatePolicyIds(policies);
        if (!policyValidation.valid) {
          res.status(400).json({
            success: false,
            error: `Invalid policy IDs: ${policyValidation.invalidIds.join(', ')}`
          });
          return;
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = sanitizeInput(name);
      if (policies !== undefined) updateData.policies = policies;

      const updatedGroup = await DatabaseService.updateGroup(id, updateData);

      res.json({
        success: true,
        data: updatedGroup
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
   * /groups/{id}:
   *   delete:
   *     summary: Delete group by ID
   *     tags: [Groups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Group ID
   *     responses:
   *       200:
   *         description: Group deleted successfully
   *       404:
   *         description: Group not found
   */
  async deleteGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await DatabaseService.deleteGroup(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Group not found'
        });
        return;
      }

      // Remove group from all users
      const allUsers = await DatabaseService.getAllUsers();
      for (const user of allUsers) {
        if (user.groups.includes(id)) {
          const updatedGroups = user.groups.filter(groupId => groupId !== id);
          await DatabaseService.updateUser(user.id, { groups: updatedGroups });
        }
      }

      res.json({
        success: true,
        message: 'Group deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default new GroupController();
