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
    it('should have correct structure with all fields', () => {
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
        id: 2,
        name: 'Another Client',
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
        description: 'Development work',
        date: '2024-01-15',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };
      expect(entry.hours).toBe(8);
      expect(entry.client_id).toBe(1);
    });

    it('should allow optional client_name', () => {
      const entry: WorkEntry = {
        id: 1,
        client_id: 1,
        hours: 4,
        description: null,
        date: '2024-01-15',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
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
        hours: 6,
        description: 'Meeting',
        date: '2024-01-15',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        client_name: 'Required Client Name',
      };
      expect(entry.client_name).toBe('Required Client Name');
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
      expect(report.workEntries).toHaveLength(0);
    });
  });

  describe('Request types', () => {
    it('CreateClientRequest should have required name', () => {
      const request: CreateClientRequest = {
        name: 'New Client',
      };
      expect(request.name).toBe('New Client');
      expect(request.description).toBeUndefined();
    });

    it('CreateClientRequest should allow optional description', () => {
      const request: CreateClientRequest = {
        name: 'New Client',
        description: 'Optional description',
      };
      expect(request.description).toBe('Optional description');
    });

    it('UpdateClientRequest should have all optional fields', () => {
      const request: UpdateClientRequest = {};
      expect(request.name).toBeUndefined();
      expect(request.description).toBeUndefined();
    });

    it('CreateWorkEntryRequest should have required fields', () => {
      const request: CreateWorkEntryRequest = {
        clientId: 1,
        hours: 8,
        date: '2024-01-15',
      };
      expect(request.clientId).toBe(1);
      expect(request.hours).toBe(8);
      expect(request.date).toBe('2024-01-15');
    });

    it('UpdateWorkEntryRequest should have all optional fields', () => {
      const request: UpdateWorkEntryRequest = {
        hours: 4,
      };
      expect(request.hours).toBe(4);
      expect(request.clientId).toBeUndefined();
    });

    it('LoginRequest should have email', () => {
      const request: LoginRequest = {
        email: 'user@example.com',
      };
      expect(request.email).toBe('user@example.com');
    });
  });

  describe('Response types', () => {
    it('LoginResponse should have message and user', () => {
      const response: LoginResponse = {
        message: 'Login successful',
        user: {
          email: 'user@example.com',
          createdAt: '2024-01-01T00:00:00Z',
        },
      };
      expect(response.message).toBe('Login successful');
      expect(response.user.email).toBe('user@example.com');
    });

    it('ApiResponse should be generic', () => {
      const successResponse: ApiResponse<string> = {
        data: 'Success data',
      };
      expect(successResponse.data).toBe('Success data');

      const errorResponse: ApiResponse<string> = {
        error: 'Something went wrong',
      };
      expect(errorResponse.error).toBe('Something went wrong');
    });
  });
});
