import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { apiClient } from './client';

vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('ApiClient', () => {
  let mockAxiosInstance: ReturnType<typeof axios.create>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = axios.create();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should call POST /api/auth/login with email', async () => {
      const mockResponse = { data: { user: { email: 'test@example.com' } } };
      vi.mocked(mockAxiosInstance.post).mockResolvedValue(mockResponse);

      const result = await apiClient.login('test@example.com');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@example.com' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getCurrentUser', () => {
    it('should call GET /api/auth/me', async () => {
      const mockResponse = { data: { user: { email: 'test@example.com' } } };
      vi.mocked(mockAxiosInstance.get).mockResolvedValue(mockResponse);

      const result = await apiClient.getCurrentUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClients', () => {
    it('should call GET /api/clients', async () => {
      const mockResponse = { data: [{ id: 1, name: 'Client 1' }] };
      vi.mocked(mockAxiosInstance.get).mockResolvedValue(mockResponse);

      const result = await apiClient.getClients();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClient', () => {
    it('should call GET /api/clients/:id', async () => {
      const mockResponse = { data: { id: 1, name: 'Client 1' } };
      vi.mocked(mockAxiosInstance.get).mockResolvedValue(mockResponse);

      const result = await apiClient.getClient(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createClient', () => {
    it('should call POST /api/clients with client data', async () => {
      const mockResponse = { data: { id: 1, name: 'New Client' } };
      vi.mocked(mockAxiosInstance.post).mockResolvedValue(mockResponse);

      const result = await apiClient.createClient({ name: 'New Client', description: 'Test' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/clients', { name: 'New Client', description: 'Test' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateClient', () => {
    it('should call PUT /api/clients/:id with client data', async () => {
      const mockResponse = { data: { id: 1, name: 'Updated Client' } };
      vi.mocked(mockAxiosInstance.put).mockResolvedValue(mockResponse);

      const result = await apiClient.updateClient(1, { name: 'Updated Client' });

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/clients/1', { name: 'Updated Client' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteClient', () => {
    it('should call DELETE /api/clients/:id', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      vi.mocked(mockAxiosInstance.delete).mockResolvedValue(mockResponse);

      const result = await apiClient.deleteClient(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getWorkEntries', () => {
    it('should call GET /api/work-entries without params', async () => {
      const mockResponse = { data: [{ id: 1, hours: 5 }] };
      vi.mocked(mockAxiosInstance.get).mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntries();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call GET /api/work-entries with clientId param', async () => {
      const mockResponse = { data: [{ id: 1, hours: 5 }] };
      vi.mocked(mockAxiosInstance.get).mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntries(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: { clientId: 1 } });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getWorkEntry', () => {
    it('should call GET /api/work-entries/:id', async () => {
      const mockResponse = { data: { id: 1, hours: 5 } };
      vi.mocked(mockAxiosInstance.get).mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntry(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createWorkEntry', () => {
    it('should call POST /api/work-entries with entry data', async () => {
      const mockResponse = { data: { id: 1, hours: 5 } };
      vi.mocked(mockAxiosInstance.post).mockResolvedValue(mockResponse);

      const entryData = { clientId: 1, hours: 5, description: 'Work', date: '2024-01-01' };
      const result = await apiClient.createWorkEntry(entryData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/work-entries', entryData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateWorkEntry', () => {
    it('should call PUT /api/work-entries/:id with entry data', async () => {
      const mockResponse = { data: { id: 1, hours: 8 } };
      vi.mocked(mockAxiosInstance.put).mockResolvedValue(mockResponse);

      const result = await apiClient.updateWorkEntry(1, { hours: 8 });

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/work-entries/1', { hours: 8 });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteWorkEntry', () => {
    it('should call DELETE /api/work-entries/:id', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      vi.mocked(mockAxiosInstance.delete).mockResolvedValue(mockResponse);

      const result = await apiClient.deleteWorkEntry(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/work-entries/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClientReport', () => {
    it('should call GET /api/reports/client/:clientId', async () => {
      const mockResponse = { data: { client: { id: 1 }, totalHours: 10 } };
      vi.mocked(mockAxiosInstance.get).mockResolvedValue(mockResponse);

      const result = await apiClient.getClientReport(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/client/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('exportClientReportCsv', () => {
    it('should call GET /api/reports/export/csv/:clientId with blob response type', async () => {
      const mockBlob = new Blob(['csv data']);
      const mockResponse = { data: mockBlob };
      vi.mocked(mockAxiosInstance.get).mockResolvedValue(mockResponse);

      const result = await apiClient.exportClientReportCsv(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/csv/1', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('exportClientReportPdf', () => {
    it('should call GET /api/reports/export/pdf/:clientId with blob response type', async () => {
      const mockBlob = new Blob(['pdf data']);
      const mockResponse = { data: mockBlob };
      vi.mocked(mockAxiosInstance.get).mockResolvedValue(mockResponse);

      const result = await apiClient.exportClientReportPdf(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/pdf/1', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('healthCheck', () => {
    it('should call GET /health', async () => {
      const mockResponse = { data: { status: 'ok' } };
      vi.mocked(mockAxiosInstance.get).mockResolvedValue(mockResponse);

      const result = await apiClient.healthCheck();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
