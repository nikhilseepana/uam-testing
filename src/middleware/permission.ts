import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Permission } from '../types';
import DatabaseService from '../services/database';

export const checkPermission = (requiredPermission: Permission) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Get user from database
      const user = await DatabaseService.getUserById(req.user.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Admin role has all permissions
      if (user.role === 'admin') {
        return next();
      }

      // Check if user has permission through groups
      const hasPermission = await checkUserPermission(user.id, requiredPermission);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error checking permissions'
      });
    }
  };
};

export const checkRole = (requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient role permissions'
      });
    }

    next();
  };
};

export const checkUserPermission = async (userId: string, requiredPermission: Permission): Promise<boolean> => {
  try {
    const user = await DatabaseService.getUserById(userId);
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'admin') return true;

    // Get all groups for the user
    const allGroups = await DatabaseService.getAllGroups();
    const userGroups = allGroups.filter(group => user.groups.includes(group.id));

    // Get all policies from user's groups
    const allPolicies = await DatabaseService.getAllPolicies();
    const userPolicies = allPolicies.filter(policy => 
      userGroups.some(group => group.policies.includes(policy.id))
    );

    // Check if any policy has the required permission
    for (const policy of userPolicies) {
      const hasPermission = policy.permissions.some(permission => 
        permission.resource === requiredPermission.resource &&
        permission.action === requiredPermission.action
      );
      
      if (hasPermission) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
};

export const checkOwnership = (resourceIdParam: string = 'id') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const resourceId = req.params[resourceIdParam];
      
      // Admin can access all resources
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user is accessing their own resource
      if (req.user.userId === resourceId) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Can only access your own resources'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error checking ownership'
      });
    }
  };
};
