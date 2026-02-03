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
} from '../../types/api';

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
    it('should have correct structure', () => {
      const client: Client = {
        id: 1,
        name: 'Test Client',
        description: 'A test client',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };
      expect(client.id).toBe(1);
      expect(client.name).toBe('Test Client');
      expect(client.description).toBe('A test client');
    });

    it('should allow null description', () => {
      const client: Client = {
        id: 1,
        name: 'Test Client',
        description: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };
      expect(client.description).toBeNull();
    });
  });

  describe('WorkEntry type', () => {
    it('should have correct structure', () => {
      const entry: WorkEntry = {
        id: 1,
        client_id: 1,
        hours: 8,
        description: 'Work done',
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(entry.id).toBe(1);
      expect(entry.hours).toBe(8);
    });

    it('should allow optional client_name', () => {
      const entry: WorkEntry = {
        id: 1,
        client_id: 1,
        hours: 8,
        description: null,
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Client',
      };
      expect(entry.client_name).toBe('Test Client');
    });
  });

  describe('WorkEntryWithClient type', () => {
    it('should require client_name', () => {
      const entry: WorkEntryWithClient = {
        id: 1,
        client_id: 1,
        hours: 8,
        description: 'Work done',
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Client',
      };
      expect(entry.client_name).toBe('Test Client');
    });
  });

  describe('ClientReport type', () => {
    it('should have correct structure', () => {
      const report: ClientReport = {
        client: {
          id: 1,
          name: 'Test Client',
          description: null,
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
      };
      expect(request.name).toBe('New Client');
    });

    it('CreateClientRequest should allow optional description', () => {
      const request: CreateClientRequest = {
        name: 'New Client',
      };
      expect(request.description).toBeUndefined();
    });

    it('UpdateClientRequest should allow partial updates', () => {
      const request: UpdateClientRequest = {
        name: 'Updated Name',
      };
      expect(request.name).toBe('Updated Name');
      expect(request.description).toBeUndefined();
    });

    it('CreateWorkEntryRequest should have correct structure', () => {
      const request: CreateWorkEntryRequest = {
        clientId: 1,
        hours: 8,
        date: '2024-01-01',
        description: 'Work',
      };
      expect(request.clientId).toBe(1);
      expect(request.hours).toBe(8);
    });

    it('UpdateWorkEntryRequest should allow partial updates', () => {
      const request: UpdateWorkEntryRequest = {
        hours: 10,
      };
      expect(request.hours).toBe(10);
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

    it('ApiResponse should handle success', () => {
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
