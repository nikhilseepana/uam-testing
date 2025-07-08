import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { User, Group, Policy, AccessRequest } from '../types';
import { ValidationError, validateUUID } from '../utils/validation';

interface DatabaseSchema {
  users: User[];
  groups: Group[];
  policies: Policy[];
  accessRequests: AccessRequest[];
}

class DatabaseService {
  private dbPath = path.join(process.cwd(), 'data', 'db.json');
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    this.initializeDatabase();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        return JSON.parse(fileContent);
      }
    } catch (error) {
      console.error('Error loading database:', error);
    }
    
    return this.getDefaultData();
  }

  private saveData(): void {
    try {
      const dirPath = path.dirname(this.dbPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  private getDefaultData(): DatabaseSchema {
    return {
      users: [],
      groups: [],
      policies: [],
      accessRequests: []
    };
  }

  private async initializeDatabase() {
    // Migrate existing users to add missing fields
    this.migrateUsers();
    
    // Create default admin user if no users exist
    if (this.data.users.length === 0) {
      await this.createDefaultAdmin();
    }

    // Create default policies if none exist
    if (this.data.policies.length === 0) {
      await this.createDefaultPolicies();
    }

    // Create default groups if none exist
    if (this.data.groups.length === 0) {
      await this.createDefaultGroups();
    }

    this.saveData();
  }

  private migrateUsers() {
    let migrationNeeded = false;
    
    this.data.users = this.data.users.map((user: any) => {
      if (!user.email) {
        user.email = user.username.includes('@') ? user.username : `${user.username}@example.com`;
        migrationNeeded = true;
      }
      if (!user.firstName) {
        user.firstName = user.username === 'admin' ? 'System' : 'First';
        migrationNeeded = true;
      }
      if (!user.lastName) {
        user.lastName = user.username === 'admin' ? 'Administrator' : 'Last';
        migrationNeeded = true;
      }
      return user;
    });
    
    if (migrationNeeded) {
      console.log('Migrated existing users to include email, firstName, and lastName fields');
    }
  }

  private async createDefaultAdmin() {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('pa$$w0rd', 10);
    
    const adminUser: User = {
      id: uuidv4(),
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'System',
      lastName: 'Administrator',
      password: hashedPassword,
      role: 'admin',
      groups: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.data.users.push(adminUser);
  }

  private async createDefaultPolicies() {
    const policies: Policy[] = [
      {
        id: uuidv4(),
        name: 'Admin Policy',
        permissions: [
          { resource: 'users', action: 'create' },
          { resource: 'users', action: 'read' },
          { resource: 'users', action: 'update' },
          { resource: 'users', action: 'delete' },
          { resource: 'groups', action: 'create' },
          { resource: 'groups', action: 'read' },
          { resource: 'groups', action: 'update' },
          { resource: 'groups', action: 'delete' },
          { resource: 'policies', action: 'create' },
          { resource: 'policies', action: 'read' },
          { resource: 'policies', action: 'update' },
          { resource: 'policies', action: 'delete' },
          { resource: 'access-requests', action: 'create' },
          { resource: 'access-requests', action: 'read' },
          { resource: 'access-requests', action: 'update' },
          { resource: 'access-requests', action: 'delete' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'User Policy',
        permissions: [
          { resource: 'users', action: 'read' },
          { resource: 'groups', action: 'read' },
          { resource: 'access-requests', action: 'create' },
          { resource: 'access-requests', action: 'read' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.data.policies.push(...policies);
  }

  private async createDefaultGroups() {
    const adminPolicy = this.data.policies.find((p: Policy) => p.name === 'Admin Policy');
    const userPolicy = this.data.policies.find((p: Policy) => p.name === 'User Policy');

    const groups: Group[] = [
      {
        id: uuidv4(),
        name: 'Administrators',
        policies: adminPolicy ? [adminPolicy.id] : [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Users',
        policies: userPolicy ? [userPolicy.id] : [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.data.groups.push(...groups);

    // Assign admin user to admin group
    const adminUser = this.data.users.find((u: User) => u.username === 'admin');
    const adminGroup = groups.find(g => g.name === 'Administrators');
    
    if (adminUser && adminGroup) {
      adminUser.groups.push(adminGroup.id);
    }
  }

  // User operations
  async getAllUsers(): Promise<User[]> {
    return this.data.users;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.data.users.find((user: User) => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.data.users.find((user: User) => user.username === username);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const userIndex = this.data.users.findIndex((user: User) => user.id === id);
    if (userIndex === -1) return null;

    this.data.users[userIndex] = {
      ...this.data.users[userIndex],
      ...userData,
      updatedAt: new Date()
    };
    this.saveData();
    return this.data.users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.data.users.findIndex((user: User) => user.id === id);
    if (userIndex === -1) return false;

    this.data.users.splice(userIndex, 1);
    this.saveData();
    return true;
  }

  // Group operations
  async getAllGroups(): Promise<Group[]> {
    return this.data.groups;
  }

  async getGroupById(id: string): Promise<Group | undefined> {
    return this.data.groups.find((group: Group) => group.id === id);
  }

  async createGroup(groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group> {
    const newGroup: Group = {
      id: uuidv4(),
      ...groupData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.groups.push(newGroup);
    this.saveData();
    return newGroup;
  }

  async updateGroup(id: string, groupData: Partial<Omit<Group, 'id' | 'createdAt'>>): Promise<Group | null> {
    const groupIndex = this.data.groups.findIndex((group: Group) => group.id === id);
    if (groupIndex === -1) return null;

    this.data.groups[groupIndex] = {
      ...this.data.groups[groupIndex],
      ...groupData,
      updatedAt: new Date()
    };
    this.saveData();
    return this.data.groups[groupIndex];
  }

  async deleteGroup(id: string): Promise<boolean> {
    const groupIndex = this.data.groups.findIndex((group: Group) => group.id === id);
    if (groupIndex === -1) return false;

    this.data.groups.splice(groupIndex, 1);
    this.saveData();
    return true;
  }

  // Policy operations
  async getAllPolicies(): Promise<Policy[]> {
    return this.data.policies;
  }

  async getPolicyById(id: string): Promise<Policy | undefined> {
    return this.data.policies.find((policy: Policy) => policy.id === id);
  }

  async createPolicy(policyData: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Policy> {
    const newPolicy: Policy = {
      id: uuidv4(),
      ...policyData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.policies.push(newPolicy);
    this.saveData();
    return newPolicy;
  }

  async updatePolicy(id: string, policyData: Partial<Omit<Policy, 'id' | 'createdAt'>>): Promise<Policy | null> {
    const policyIndex = this.data.policies.findIndex((policy: Policy) => policy.id === id);
    if (policyIndex === -1) return null;

    this.data.policies[policyIndex] = {
      ...this.data.policies[policyIndex],
      ...policyData,
      updatedAt: new Date()
    };
    this.saveData();
    return this.data.policies[policyIndex];
  }

  async deletePolicy(id: string): Promise<boolean> {
    const policyIndex = this.data.policies.findIndex((policy: Policy) => policy.id === id);
    if (policyIndex === -1) return false;

    this.data.policies.splice(policyIndex, 1);
    this.saveData();
    return true;
  }

  // Access Request operations
  async getAllAccessRequests(): Promise<AccessRequest[]> {
    return this.data.accessRequests;
  }

  async getAccessRequestById(id: string): Promise<AccessRequest | undefined> {
    return this.data.accessRequests.find((request: AccessRequest) => request.id === id);
  }

  async getAccessRequestsByUserId(userId: string): Promise<AccessRequest[]> {
    return this.data.accessRequests.filter((request: AccessRequest) => request.userId === userId);
  }

  async createAccessRequest(requestData: Omit<AccessRequest, 'id' | 'requestedAt'>): Promise<AccessRequest> {
    const newRequest: AccessRequest = {
      id: uuidv4(),
      ...requestData,
      requestedAt: new Date()
    };
    this.data.accessRequests.push(newRequest);
    this.saveData();
    return newRequest;
  }

  async updateAccessRequest(id: string, requestData: Partial<Omit<AccessRequest, 'id' | 'requestedAt'>>): Promise<AccessRequest | null> {
    const requestIndex = this.data.accessRequests.findIndex((request: AccessRequest) => request.id === id);
    if (requestIndex === -1) return null;

    this.data.accessRequests[requestIndex] = {
      ...this.data.accessRequests[requestIndex],
      ...requestData,
      processedAt: new Date()
    };
    this.saveData();
    return this.data.accessRequests[requestIndex];
  }

  async deleteAccessRequest(id: string): Promise<boolean> {
    const requestIndex = this.data.accessRequests.findIndex((request: AccessRequest) => request.id === id);
    if (requestIndex === -1) return false;

    this.data.accessRequests.splice(requestIndex, 1);
    this.saveData();
    return true;
  }

  // Validation methods
  async validateGroupIds(groupIds: string[]): Promise<{ valid: boolean; invalidIds: string[] }> {
    const invalidIds: string[] = [];
    
    for (const groupId of groupIds) {
      if (!validateUUID(groupId)) {
        invalidIds.push(groupId);
        continue;
      }
      
      const group = await this.getGroupById(groupId);
      if (!group) {
        invalidIds.push(groupId);
      }
    }
    
    return { valid: invalidIds.length === 0, invalidIds };
  }

  async validatePolicyIds(policyIds: string[]): Promise<{ valid: boolean; invalidIds: string[] }> {
    const invalidIds: string[] = [];
    
    for (const policyId of policyIds) {
      if (!validateUUID(policyId)) {
        invalidIds.push(policyId);
        continue;
      }
      
      const policy = await this.getPolicyById(policyId);
      if (!policy) {
        invalidIds.push(policyId);
      }
    }
    
    return { valid: invalidIds.length === 0, invalidIds };
  }

  async isUsernameUnique(username: string, excludeUserId?: string): Promise<boolean> {
    const existingUser = await this.getUserByUsername(username);
    if (!existingUser) return true;
    if (excludeUserId && existingUser.id === excludeUserId) return true;
    return false;
  }

  async isEmailUnique(email: string, excludeUserId?: string): Promise<boolean> {
    const existingUser = this.data.users.find((user: User) => user.email.toLowerCase() === email.toLowerCase());
    if (!existingUser) return true;
    if (excludeUserId && existingUser.id === excludeUserId) return true;
    return false;
  }

  async isGroupNameUnique(name: string, excludeGroupId?: string): Promise<boolean> {
    const existingGroup = this.data.groups.find((group: Group) => group.name.toLowerCase() === name.toLowerCase());
    if (!existingGroup) return true;
    if (excludeGroupId && existingGroup.id === excludeGroupId) return true;
    return false;
  }

  async isPolicyNameUnique(name: string, excludePolicyId?: string): Promise<boolean> {
    const existingPolicy = this.data.policies.find((policy: Policy) => policy.name.toLowerCase() === name.toLowerCase());
    if (!existingPolicy) return true;
    if (excludePolicyId && existingPolicy.id === excludePolicyId) return true;
    return false;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.data.users.find((user: User) => user.email.toLowerCase() === email.toLowerCase());
  }
}

export default new DatabaseService();
