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
 *       required:
 *         - id
 *         - userId
 *         - groupId
 *         - status
 *         - requestedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier (REQUIRED)
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         userId:
 *           type: string
 *           description: User ID who made the request (REQUIRED)
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         groupId:
 *           type: string
 *           description: Group ID being requested (REQUIRED)
 *           example: "550e8400-e29b-41d4-a716-446655440002"
 *         status:
 *           $ref: '#/components/schemas/AccessRequestStatus'
 *         reason:
 *           type: string
 *           description: Reason for the request (OPTIONAL)
 *           example: "Need access to manage user accounts"
 *         requestedAt:
 *           type: string
 *           format: date-time
 *           description: Request timestamp (REQUIRED)
 *           example: "2025-07-08T10:30:00.000Z"
 *         processedAt:
 *           type: string
 *           format: date-time
 *           description: Processing timestamp (OPTIONAL) - Set when request is processed
 *           example: "2025-07-08T11:30:00.000Z"
 *         processedBy:
 *           type: string
 *           description: User ID who processed the request (OPTIONAL) - Set when request is processed
 *           example: "550e8400-e29b-41d4-a716-446655440003"
 *     AccessRequestCreate:
 *       type: object
 *       required:
 *         - groupId
 *       properties:
 *         groupId:
 *           type: string
 *           description: Group ID being requested (REQUIRED) - Must be a valid group ID
 *           example: "550e8400-e29b-41d4-a716-446655440002"
 *         reason:
 *           type: string
 *           description: Reason for the request (OPTIONAL) - Explanation for why access is needed
 *           example: "Need access to manage user accounts"
 *           maxLength: 500
 *     AccessRequestProcess:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/AccessRequestProcessStatus'
 *         reason:
 *           type: string
 *           description: Reason for the decision (OPTIONAL) - Explanation for approval/denial
 *           example: "User has demonstrated need for this access level"
 *           maxLength: 500
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
