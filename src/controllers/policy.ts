import { Request, Response } from 'express';
import { CreatePolicyRequest, UpdatePolicyRequest, ApiResponse } from '../types';
import DatabaseService from '../services/database';
import { 
  validatePolicyName,
  validatePermission,
  sanitizeInput,
  ValidationError 
} from '../utils/validation';

export class PolicyController {
  /**
   * @swagger
   * /policies:
   *   get:
   *     summary: Get all policies
   *     tags: [Policies]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Policies retrieved successfully
   */
  async getAllPolicies(req: Request, res: Response): Promise<void> {
    try {
      const policies = await DatabaseService.getAllPolicies();
      res.json({
        success: true,
        data: policies
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
   * /policies/{id}:
   *   get:
   *     summary: Get policy by ID
   *     tags: [Policies]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Policy ID
   *     responses:
   *       200:
   *         description: Policy retrieved successfully
   *       404:
   *         description: Policy not found
   */
  async getPolicyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const policy = await DatabaseService.getPolicyById(id);

      if (!policy) {
        res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
        return;
      }

      res.json({
        success: true,
        data: policy
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
   * /policies:
   *   post:
   *     summary: Create a new policy
   *     description: Create a new policy with specified permissions
   *     tags: [Policies]
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
   *               - permissions
   *             properties:
   *               name:
   *                 type: string
   *                 description: Policy name (REQUIRED)
   *                 example: "User Management Policy"
   *                 minLength: 1
   *                 maxLength: 100
   *               permissions:
   *                 type: array
   *                 description: Permissions array (REQUIRED) - At least one permission required
   *                 minItems: 1
   *                 items:
   *                   type: object
   *                   required:
   *                     - resource
   *                     - action
   *                   properties:
   *                     resource:
   *                       type: string
   *                       description: Resource name (REQUIRED)
   *                       example: "users"
   *                     action:
   *                       type: string
   *                       description: Action name (REQUIRED)
   *                       example: "read"
   *                 example: [
   *                   {"resource": "users", "action": "read"},
   *                   {"resource": "users", "action": "create"}
   *                 ]
   *     responses:
   *       201:
   *         description: Policy created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Policy'
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
   *                   example: Policy name and permissions array are required
   *       401:
   *         description: Unauthorized - Invalid or missing JWT token
   *       403:
   *         description: Forbidden - Insufficient permissions
   */
  async createPolicy(req: Request, res: Response): Promise<void> {
    try {
      const { name, permissions }: CreatePolicyRequest = req.body;

      if (!name || !permissions || !Array.isArray(permissions)) {
        res.status(400).json({
          success: false,
          error: 'Policy name and permissions array are required'
        });
        return;
      }

      // Validate permissions structure
      const isValidPermissions = permissions.every(permission => 
        permission.resource && permission.action && 
        typeof permission.resource === 'string' && 
        typeof permission.action === 'string'
      );

      if (!isValidPermissions) {
        res.status(400).json({
          success: false,
          error: 'Each permission must have resource and action strings'
        });
        return;
      }

      // Validate policy name
      const sanitizedName = sanitizeInput(name);
      if (!validatePolicyName(sanitizedName)) {
        res.status(400).json({
          success: false,
          error: 'Policy name must be 3-100 characters long and contain only letters, numbers, spaces, hyphens, and underscores'
        });
        return;
      }

      // Check if policy name is unique
      const isPolicyNameUnique = await DatabaseService.isPolicyNameUnique(sanitizedName);
      if (!isPolicyNameUnique) {
        res.status(409).json({
          success: false,
          error: 'Policy name already exists'
        });
        return;
      }

      const newPolicy = await DatabaseService.createPolicy({
        name: sanitizedName,
        permissions
      });

      res.status(201).json({
        success: true,
        data: newPolicy
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
   * /policies/{id}:
   *   put:
   *     summary: Update policy by ID
   *     tags: [Policies]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Policy ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               permissions:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     resource:
   *                       type: string
   *                     action:
   *                       type: string
   *     responses:
   *       200:
   *         description: Policy updated successfully
   *       404:
   *         description: Policy not found
   */
  async updatePolicy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, permissions }: UpdatePolicyRequest = req.body;

      const existingPolicy = await DatabaseService.getPolicyById(id);
      if (!existingPolicy) {
        res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
        return;
      }

      // Validate permissions structure if provided
      if (permissions) {
        if (!Array.isArray(permissions)) {
          res.status(400).json({
            success: false,
            error: 'Permissions must be an array'
          });
          return;
        }

        const isValidPermissions = permissions.every(permission => 
          permission.resource && permission.action && 
          typeof permission.resource === 'string' && 
          typeof permission.action === 'string'
        );

        if (!isValidPermissions) {
          res.status(400).json({
            success: false,
            error: 'Each permission must have resource and action strings'
          });
          return;
        }
      }

      // Validate policy name
      if (name !== undefined) {
        const sanitizedName = sanitizeInput(name);
        if (!validatePolicyName(sanitizedName)) {
          res.status(400).json({
            success: false,
            error: 'Policy name must be 3-100 characters long and contain only letters, numbers, spaces, hyphens, and underscores'
          });
          return;
        }

        // Check if new name already exists (but not for the current policy)
        if (sanitizedName !== existingPolicy.name) {
          const isPolicyNameUnique = await DatabaseService.isPolicyNameUnique(sanitizedName);
          if (!isPolicyNameUnique) {
            res.status(409).json({
              success: false,
              error: 'Policy name already exists'
            });
            return;
          }
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = sanitizeInput(name);
      if (permissions !== undefined) updateData.permissions = permissions;

      const updatedPolicy = await DatabaseService.updatePolicy(id, updateData);

      res.json({
        success: true,
        data: updatedPolicy
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
   * /policies/{id}:
   *   delete:
   *     summary: Delete policy by ID
   *     tags: [Policies]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Policy ID
   *     responses:
   *       200:
   *         description: Policy deleted successfully
   *       404:
   *         description: Policy not found
   */
  async deletePolicy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await DatabaseService.deletePolicy(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
        return;
      }

      // Remove policy from all groups
      const allGroups = await DatabaseService.getAllGroups();
      for (const group of allGroups) {
        if (group.policies.includes(id)) {
          const updatedPolicies = group.policies.filter(policyId => policyId !== id);
          await DatabaseService.updateGroup(group.id, { policies: updatedPolicies });
        }
      }

      res.json({
        success: true,
        message: 'Policy deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default new PolicyController();
