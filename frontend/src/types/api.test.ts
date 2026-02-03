import { describe, it, expect } from 'vitest';
import type {
  User,
  Client,
  WorkEntry,
  WorkEntryWithClient,
  ClientReport,
  CreateClientRequest,
  UpdateClientRequest,
  CreateWorkEntryRequest,
  UpdateWorkEntryRequest,
  LoginRequest,
  LoginResponse,
  ApiResponse,
} from './api';

describe('API Types', () => {
  describe('User type', () => {
    it('should have correct structure', () => {
      const user: User = {
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
      };
      expect(user.email).toBe('test@example.com');
      expect(user.createdAt).toBe('2024-01-01T00:00:00Z');
    });
  });

  describe('Client type', () => {
    it('should have correct structure with all fields', () => {
      const client: Client = {
        id: 1,
        name: 'Test Client',
        description: 'A test client',
        department: 'Engineering',
        email: 'client@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(client.id).toBe(1);
      expect(client.name).toBe('Test Client');
      expect(client.description).toBe('A test client');
      expect(client.department).toBe('Engineering');
      expect(client.email).toBe('client@example.com');
    });

    it('should allow null for optional fields', () => {
      const client: Client = {
        id: 1,
        name: 'Test Client',
        description: null,
        department: null,
        email: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(client.description).toBeNull();
      expect(client.department).toBeNull();
      expect(client.email).toBeNull();
    });
  });

  describe('WorkEntry type', () => {
    it('should have correct structure', () => {
      const workEntry: WorkEntry = {
        id: 1,
        client_id: 1,
        hours: 8,
        description: 'Work done',
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(workEntry.id).toBe(1);
      expect(workEntry.hours).toBe(8);
    });

    it('should allow null description', () => {
      const workEntry: WorkEntry = {
        id: 1,
        client_id: 1,
        hours: 8,
        description: null,
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(workEntry.description).toBeNull();
    });

    it('should allow optional client_name', () => {
      const workEntry: WorkEntry = {
        id: 1,
        client_id: 1,
        hours: 8,
        description: null,
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Client',
      };
      expect(workEntry.client_name).toBe('Test Client');
    });
  });

  describe('WorkEntryWithClient type', () => {
    it('should require client_name', () => {
      const workEntry: WorkEntryWithClient = {
        id: 1,
        client_id: 1,
        hours: 8,
        description: null,
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Client',
      };
      expect(workEntry.client_name).toBe('Test Client');
    });
  });

  describe('ClientReport type', () => {
    it('should have correct structure', () => {
      const report: ClientReport = {
        client: {
          id: 1,
          name: 'Test Client',
          description: null,
          department: null,
          email: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        workEntries: [],
        totalHours: 40,
        entryCount: 5,
      };
      expect(report.totalHours).toBe(40);
      expect(report.entryCount).toBe(5);
    });
  });

  describe('Request types', () => {
    it('CreateClientRequest should have correct structure', () => {
      const request: CreateClientRequest = {
        name: 'New Client',
        description: 'Description',
        department: 'Sales',
        email: 'new@example.com',
      };
      expect(request.name).toBe('New Client');
    });

    it('CreateClientRequest should allow optional fields', () => {
      const request: CreateClientRequest = {
        name: 'New Client',
      };
      expect(request.name).toBe('New Client');
      expect(request.description).toBeUndefined();
    });

    it('UpdateClientRequest should allow all optional fields', () => {
      const request: UpdateClientRequest = {
        name: 'Updated',
      };
      expect(request.name).toBe('Updated');
    });

    it('CreateWorkEntryRequest should have correct structure', () => {
      const request: CreateWorkEntryRequest = {
        clientId: 1,
        hours: 8,
        description: 'Work',
        date: '2024-01-01',
      };
      expect(request.clientId).toBe(1);
      expect(request.hours).toBe(8);
    });

    it('UpdateWorkEntryRequest should allow all optional fields', () => {
      const request: UpdateWorkEntryRequest = {
        hours: 4,
      };
      expect(request.hours).toBe(4);
    });

    it('LoginRequest should have email', () => {
      const request: LoginRequest = {
        email: 'test@example.com',
      };
      expect(request.email).toBe('test@example.com');
    });
  });

  describe('Response types', () => {
    it('LoginResponse should have correct structure', () => {
      const response: LoginResponse = {
        message: 'Login successful',
        user: {
          email: 'test@example.com',
          createdAt: '2024-01-01T00:00:00Z',
        },
      };
      expect(response.message).toBe('Login successful');
      expect(response.user.email).toBe('test@example.com');
    });

    it('ApiResponse should handle data', () => {
      const response: ApiResponse<{ id: number }> = {
        data: { id: 1 },
        message: 'Success',
      };
      expect(response.data?.id).toBe(1);
    });

    it('ApiResponse should handle error', () => {
      const response: ApiResponse<{ id: number }> = {
        error: 'Something went wrong',
      };
      expect(response.error).toBe('Something went wrong');
    });
  });
});
