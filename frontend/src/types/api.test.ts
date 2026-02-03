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
  describe('User', () => {
    it('should have correct structure', () => {
      const user: User = {
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
      };
      expect(user.email).toBe('test@example.com');
      expect(user.createdAt).toBe('2024-01-01T00:00:00Z');
    });
  });

  describe('Client', () => {
    it('should have correct structure', () => {
      const client: Client = {
        id: 1,
        name: 'Test Client',
        description: 'A test client',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
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
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(client.description).toBeNull();
    });
  });

  describe('WorkEntry', () => {
    it('should have correct structure', () => {
      const entry: WorkEntry = {
        id: 1,
        client_id: 1,
        hours: 5.5,
        description: 'Work done',
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(entry.id).toBe(1);
      expect(entry.hours).toBe(5.5);
    });

    it('should allow null description', () => {
      const entry: WorkEntry = {
        id: 1,
        client_id: 1,
        hours: 5,
        description: null,
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(entry.description).toBeNull();
    });

    it('should allow optional client_name', () => {
      const entry: WorkEntry = {
        id: 1,
        client_id: 1,
        hours: 5,
        description: null,
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Client',
      };
      expect(entry.client_name).toBe('Test Client');
    });
  });

  describe('WorkEntryWithClient', () => {
    it('should require client_name', () => {
      const entry: WorkEntryWithClient = {
        id: 1,
        client_id: 1,
        hours: 5,
        description: null,
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Client',
      };
      expect(entry.client_name).toBe('Test Client');
    });
  });

  describe('ClientReport', () => {
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
        totalHours: 10.5,
        entryCount: 2,
      };
      expect(report.totalHours).toBe(10.5);
      expect(report.entryCount).toBe(2);
    });
  });

  describe('CreateClientRequest', () => {
    it('should require name', () => {
      const request: CreateClientRequest = {
        name: 'New Client',
      };
      expect(request.name).toBe('New Client');
    });

    it('should allow optional description', () => {
      const request: CreateClientRequest = {
        name: 'New Client',
        description: 'Description',
      };
      expect(request.description).toBe('Description');
    });
  });

  describe('UpdateClientRequest', () => {
    it('should allow partial updates', () => {
      const request: UpdateClientRequest = {
        name: 'Updated Name',
      };
      expect(request.name).toBe('Updated Name');
      expect(request.description).toBeUndefined();
    });
  });

  describe('CreateWorkEntryRequest', () => {
    it('should have required fields', () => {
      const request: CreateWorkEntryRequest = {
        clientId: 1,
        hours: 5,
        date: '2024-01-01',
      };
      expect(request.clientId).toBe(1);
      expect(request.hours).toBe(5);
      expect(request.date).toBe('2024-01-01');
    });

    it('should allow optional description', () => {
      const request: CreateWorkEntryRequest = {
        clientId: 1,
        hours: 5,
        date: '2024-01-01',
        description: 'Work done',
      };
      expect(request.description).toBe('Work done');
    });
  });

  describe('UpdateWorkEntryRequest', () => {
    it('should allow partial updates', () => {
      const request: UpdateWorkEntryRequest = {
        hours: 8,
      };
      expect(request.hours).toBe(8);
    });
  });

  describe('LoginRequest', () => {
    it('should have email', () => {
      const request: LoginRequest = {
        email: 'test@example.com',
      };
      expect(request.email).toBe('test@example.com');
    });
  });

  describe('LoginResponse', () => {
    it('should have message and user', () => {
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
  });

  describe('ApiResponse', () => {
    it('should allow data', () => {
      const response: ApiResponse<string> = {
        data: 'test',
      };
      expect(response.data).toBe('test');
    });

    it('should allow error', () => {
      const response: ApiResponse<string> = {
        error: 'Something went wrong',
      };
      expect(response.error).toBe('Something went wrong');
    });

    it('should allow message', () => {
      const response: ApiResponse<string> = {
        message: 'Success',
      };
      expect(response.message).toBe('Success');
    });
  });
});
