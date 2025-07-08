import { Request } from 'express';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'admin' | 'maintainer' | 'user';
  groups: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  policies: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Policy {
  id: string;
  name: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  resource: string;
  action: string;
}

export interface AccessRequest {
  id: string;
  userId: string;
  groupId: string;
  status: 'pending' | 'approved' | 'denied';
  reason?: string;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'admin' | 'maintainer' | 'user';
  groups?: string[];
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: 'admin' | 'maintainer' | 'user';
  groups?: string[];
}

export interface CreateGroupRequest {
  name: string;
  policies?: string[];
}

export interface UpdateGroupRequest {
  name?: string;
  policies?: string[];
}

export interface CreatePolicyRequest {
  name: string;
  permissions: Permission[];
}

export interface UpdatePolicyRequest {
  name?: string;
  permissions?: Permission[];
}

export interface CreateAccessRequestRequest {
  groupId: string;
  reason?: string;
}

export interface ProcessAccessRequestRequest {
  status: 'approved' | 'denied';
  reason?: string;
}
