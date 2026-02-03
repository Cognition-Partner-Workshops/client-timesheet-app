import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('ApiClient', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);
    localStorage.clear();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', async () => {
      const { apiClient } = await import('../api/client');
      
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(apiClient).toBeDefined();
    });

    it('should set up request and response interceptors', async () => {
      await import('../api/client');
      
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should call login endpoint with email', async () => {
      const { apiClient } = await import('../api/client');
      const mockResponse = { data: { user: { email: 'test@example.com' } } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.login('test@example.com');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@example.com' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getCurrentUser', () => {
    it('should call get current user endpoint', async () => {
      const { apiClient } = await import('../api/client');
      const mockResponse = { data: { user: { email: 'test@example.com' } } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getCurrentUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClients', () => {
    it('should call get clients endpoint', async () => {
      const { apiClient } = await import('../api/client');
      const mockResponse = { data: [{ id: 1, name: 'Client 1' }] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getClients();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClient', () => {
    it('should call get client endpoint with id', async () => {
      const { apiClient } = await import('../api/client');
      const mockResponse = { data: { id: 1, name: 'Client 1' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getClient(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createClient', () => {
    it('should call create client endpoint with data', async () => {
      const { apiClient } = await import('../api/client');
      const clientData = { name: 'New Client', description: 'Description' };
      const mockResponse = { data: { id: 1, ...clientData } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.createClient(clientData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/clients', clientData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateClient', () => {
    it('should call update client endpoint with id and data', async () => {
      const { apiClient } = await import('../api/client');
      const clientData = { name: 'Updated Client' };
      const mockResponse = { data: { id: 1, ...clientData } };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiClient.updateClient(1, clientData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/clients/1', clientData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteClient', () => {
    it('should call delete client endpoint with id', async () => {
      const { apiClient } = await import('../api/client');
      const mockResponse = { data: { message: 'Deleted' } };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.deleteClient(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getWorkEntries', () => {
    it('should call get work entries endpoint without clientId', async () => {
      const { apiClient } = await import('../api/client');
      const mockResponse = { data: [{ id: 1, hours: 5 }] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntries();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call get work entries endpoint with clientId', async () => {
      const { apiClient } = await import('../api/client');
      const mockResponse = { data: [{ id: 1, hours: 5 }] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntries(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: { clientId: 1 } });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createWorkEntry', () => {
    it('should call create work entry endpoint with data', async () => {
      const { apiClient } = await import('../api/client');
      const entryData = { clientId: 1, hours: 5, description: 'Work', date: '2024-01-01' };
      const mockResponse = { data: { id: 1, ...entryData } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.createWorkEntry(entryData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/work-entries', entryData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClientReport', () => {
    it('should call get client report endpoint', async () => {
      const { apiClient } = await import('../api/client');
      const mockResponse = { data: { client: { id: 1 }, totalHours: 10 } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getClientReport(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/client/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('exportClientReportCsv', () => {
    it('should call export CSV endpoint with blob response type', async () => {
      const { apiClient } = await import('../api/client');
      const mockBlob = new Blob(['csv content']);
      const mockResponse = { data: mockBlob };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.exportClientReportCsv(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/csv/1', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('exportClientReportPdf', () => {
    it('should call export PDF endpoint with blob response type', async () => {
      const { apiClient } = await import('../api/client');
      const mockBlob = new Blob(['pdf content']);
      const mockResponse = { data: mockBlob };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.exportClientReportPdf(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/pdf/1', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('healthCheck', () => {
    it('should call health check endpoint', async () => {
      const { apiClient } = await import('../api/client');
      const mockResponse = { data: { status: 'ok' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.healthCheck();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
