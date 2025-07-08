import { Request, Response } from 'express';
import { CreateAccessRequestRequest, ProcessAccessRequestRequest, AuthenticatedRequest } from '../types';
import DatabaseService from '../services/database';

export class AccessRequestController {
  /**
   * @swagger
   * /access-requests:
   *   get:
   *     summary: Get all access requests
   *     tags: [Access Requests]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Access requests retrieved successfully
   */
  async getAllAccessRequests(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      let accessRequests;

      // Admin can see all requests, others only see their own
      if (user?.role === 'admin') {
        accessRequests = await DatabaseService.getAllAccessRequests();
      } else {
        accessRequests = await DatabaseService.getAccessRequestsByUserId(user!.userId);
      }

      res.json({
        success: true,
        data: accessRequests
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
   * /access-requests/{id}:
   *   get:
   *     summary: Get access request by ID
   *     tags: [Access Requests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Access request ID
   *     responses:
   *       200:
   *         description: Access request retrieved successfully
   *       404:
   *         description: Access request not found
   */
  async getAccessRequestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as AuthenticatedRequest).user;
      const accessRequest = await DatabaseService.getAccessRequestById(id);

      if (!accessRequest) {
        res.status(404).json({
          success: false,
          error: 'Access request not found'
        });
        return;
      }

      // Check if user can view this request
      if (user?.role !== 'admin' && accessRequest.userId !== user?.userId) {
        res.status(403).json({
          success: false,
          error: 'You can only view your own access requests'
        });
        return;
      }

      res.json({
        success: true,
        data: accessRequest
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
   * /access-requests:
   *   post:
   *     summary: Create a new access request
   *     description: Request access to a specific group with optional reason
   *     tags: [Access Requests]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - groupId
   *             properties:
   *               groupId:
   *                 type: string
   *                 description: Group ID to request access to (REQUIRED)
   *                 example: "550e8400-e29b-41d4-a716-446655440000"
   *               reason:
   *                 type: string
   *                 description: Reason for access request (OPTIONAL)
   *                 example: "I need access to manage user accounts for the project"
   *                 maxLength: 500
   *     responses:
   *       201:
   *         description: Access request created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/AccessRequest'
   *       400:
   *         description: Bad request - Invalid input or duplicate request
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
   *                   example: Group ID is required
   *       401:
   *         description: Unauthorized - Invalid or missing JWT token
   *       404:
   *         description: Group not found
   */
  async createAccessRequest(req: Request, res: Response): Promise<void> {
    try {
      const { groupId, reason }: CreateAccessRequestRequest = req.body;
      const user = (req as AuthenticatedRequest).user;

      if (!groupId) {
        res.status(400).json({
          success: false,
          error: 'Group ID is required'
        });
        return;
      }

      // Check if group exists
      const group = await DatabaseService.getGroupById(groupId);
      if (!group) {
        res.status(404).json({
          success: false,
          error: 'Group not found'
        });
        return;
      }

      // Check if user is already in the group
      const currentUser = await DatabaseService.getUserById(user!.userId);
      if (currentUser?.groups.includes(groupId)) {
        res.status(400).json({
          success: false,
          error: 'You are already a member of this group'
        });
        return;
      }

      // Check if there's already a pending request for this group
      const existingRequests = await DatabaseService.getAccessRequestsByUserId(user!.userId);
      const pendingRequest = existingRequests.find(req => 
        req.groupId === groupId && req.status === 'pending'
      );

      if (pendingRequest) {
        res.status(400).json({
          success: false,
          error: 'You already have a pending request for this group'
        });
        return;
      }

      const newRequest = await DatabaseService.createAccessRequest({
        userId: user!.userId,
        groupId,
        status: 'pending',
        reason
      });

      res.status(201).json({
        success: true,
        data: newRequest
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
   * /access-requests/{id}/process:
   *   put:
   *     summary: Process an access request (approve/deny)
   *     description: Approve or deny a pending access request
   *     tags: [Access Requests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Access request ID (REQUIRED)
   *         example: "550e8400-e29b-41d4-a716-446655440000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 description: Decision status (REQUIRED)
   *                 enum: [approved, denied]
   *                 example: approved
   *               reason:
   *                 type: string
   *                 description: Reason for the decision (OPTIONAL)
   *                 example: "Access granted based on project requirements"
   *                 maxLength: 500
   *     responses:
   *       200:
   *         description: Access request processed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/AccessRequest'
   *       400:
   *         description: Bad request - Invalid status or already processed
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
   *                   example: Status must be approved or denied
   *       401:
   *         description: Unauthorized - Invalid or missing JWT token
   *       403:
   *         description: Forbidden - Insufficient permissions
   *       404:
   *         description: Access request not found
   */
  async processAccessRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, reason }: ProcessAccessRequestRequest = req.body;
      const user = (req as AuthenticatedRequest).user;

      if (!status || !['approved', 'denied'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Status must be approved or denied'
        });
        return;
      }

      const accessRequest = await DatabaseService.getAccessRequestById(id);
      if (!accessRequest) {
        res.status(404).json({
          success: false,
          error: 'Access request not found'
        });
        return;
      }

      if (accessRequest.status !== 'pending') {
        res.status(400).json({
          success: false,
          error: 'Access request has already been processed'
        });
        return;
      }

      // Update access request
      const updatedRequest = await DatabaseService.updateAccessRequest(id, {
        status,
        reason,
        processedBy: user!.userId
      });

      // If approved, add user to group
      if (status === 'approved') {
        const requestUser = await DatabaseService.getUserById(accessRequest.userId);
        if (requestUser) {
          const updatedGroups = [...requestUser.groups, accessRequest.groupId];
          await DatabaseService.updateUser(requestUser.id, { groups: updatedGroups });
        }
      }

      res.json({
        success: true,
        data: updatedRequest
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
   * /access-requests/{id}:
   *   delete:
   *     summary: Delete access request by ID
   *     tags: [Access Requests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Access request ID
   *     responses:
   *       200:
   *         description: Access request deleted successfully
   *       404:
   *         description: Access request not found
   */
  async deleteAccessRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = (req as AuthenticatedRequest).user;

      const accessRequest = await DatabaseService.getAccessRequestById(id);
      if (!accessRequest) {
        res.status(404).json({
          success: false,
          error: 'Access request not found'
        });
        return;
      }

      // Check if user can delete this request
      if (user?.role !== 'admin' && accessRequest.userId !== user?.userId) {
        res.status(403).json({
          success: false,
          error: 'You can only delete your own access requests'
        });
        return;
      }

      const deleted = await DatabaseService.deleteAccessRequest(id);

      res.json({
        success: true,
        message: 'Access request deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default new AccessRequestController();
