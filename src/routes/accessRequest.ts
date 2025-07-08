import { Router } from 'express';
import AccessRequestController from '../controllers/accessRequest';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permission';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Access Requests
 *   description: Access request management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AccessRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *         userId:
 *           type: string
 *           description: User ID who made the request
 *         groupId:
 *           type: string
 *           description: Group ID being requested
 *         status:
 *           type: string
 *           enum: [pending, approved, denied]
 *           description: Request status
 *         reason:
 *           type: string
 *           description: Reason for the request
 *         requestedAt:
 *           type: string
 *           format: date-time
 *           description: Request timestamp
 *         processedAt:
 *           type: string
 *           format: date-time
 *           description: Processing timestamp
 *         processedBy:
 *           type: string
 *           description: User ID who processed the request
 */

// Get all access requests - requires access-requests:read permission
router.get('/', 
  authMiddleware, 
  checkPermission({ resource: 'access-requests', action: 'read' }),
  AccessRequestController.getAllAccessRequests
);

// Get access request by ID - requires access-requests:read permission
router.get('/:id', 
  authMiddleware, 
  checkPermission({ resource: 'access-requests', action: 'read' }),
  AccessRequestController.getAccessRequestById
);

// Create access request - requires access-requests:create permission
router.post('/', 
  authMiddleware, 
  checkPermission({ resource: 'access-requests', action: 'create' }),
  AccessRequestController.createAccessRequest
);

// Process access request - requires access-requests:update permission
router.put('/:id/process', 
  authMiddleware, 
  checkPermission({ resource: 'access-requests', action: 'update' }),
  AccessRequestController.processAccessRequest
);

// Delete access request - requires access-requests:delete permission
router.delete('/:id', 
  authMiddleware, 
  checkPermission({ resource: 'access-requests', action: 'delete' }),
  AccessRequestController.deleteAccessRequest
);

export default router;
