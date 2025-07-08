export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
  }
  return { isValid: true };
};

export const validateUsername = (username: string): boolean => {
  // Username must be 3-50 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
};

export const validateName = (name: string): boolean => {
  // Name must be 2-50 characters, letters, spaces, hyphens, and apostrophes only
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name.trim());
};

export const validateRole = (role: string): boolean => {
  return ['admin', 'maintainer', 'user'].includes(role);
};

export const validateGroupName = (name: string): boolean => {
  // Group name must be 3-100 characters, letters, numbers, spaces, hyphens, and underscores
  const groupNameRegex = /^[a-zA-Z0-9\s\-_]{3,100}$/;
  return groupNameRegex.test(name.trim());
};

export const validatePolicyName = (name: string): boolean => {
  // Policy name must be 3-100 characters, letters, numbers, spaces, hyphens, and underscores
  const policyNameRegex = /^[a-zA-Z0-9\s\-_]{3,100}$/;
  return policyNameRegex.test(name.trim());
};

export const validatePermission = (permission: { resource: string; action: string }): boolean => {
  const validResources = ['users', 'groups', 'policies', 'access-requests'];
  const validActions = ['create', 'read', 'update', 'delete'];
  
  return validResources.includes(permission.resource) && validActions.includes(permission.action);
};

export const sanitizeInput = (input: string): string => {
  return input.trim();
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
