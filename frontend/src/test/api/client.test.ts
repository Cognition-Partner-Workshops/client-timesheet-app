import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

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

vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

describe('ApiClient', () => {
  let apiClient: typeof import('../../api/client').apiClient;
  let requestInterceptor: (config: { headers: Record<string, string> }) => { headers: Record<string, string> };
  let responseErrorInterceptor: (error: { response?: { status: number } }) => Promise<never>;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    
    mockAxiosInstance.interceptors.request.use.mockImplementation((onFulfilled) => {
      requestInterceptor = onFulfilled;
    });
    
    mockAxiosInstance.interceptors.response.use.mockImplementation((_, onRejected) => {
      responseErrorInterceptor = onRejected;
    });

    vi.resetModules();
    const module = await import('../../api/client');
    apiClient = module.apiClient;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should set up request interceptor', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });

    it('should set up response interceptor', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('request interceptor', () => {
    it('should add user email header when stored in localStorage', () => {
      localStorage.setItem('userEmail', 'test@example.com');
      const config = { headers: {} as Record<string, string> };
      const result = requestInterceptor(config);
      expect(result.headers['x-user-email']).toBe('test@example.com');
    });

    it('should not add header when no email in localStorage', () => {
      const config = { headers: {} as Record<string, string> };
      const result = requestInterceptor(config);
      expect(result.headers['x-user-email']).toBeUndefined();
    });
  });

  describe('response interceptor', () => {
    it('should clear localStorage and redirect on 401 error', async () => {
      localStorage.setItem('userEmail', 'test@example.com');
      const originalLocation = window.location;
      
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });

      const error = { response: { status: 401 } };
      
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(localStorage.getItem('userEmail')).toBeNull();
      expect(window.location.href).toBe('/login');

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });

    it('should reject non-401 errors without redirect', async () => {
      localStorage.setItem('userEmail', 'test@example.com');
      const error = { response: { status: 500 } };
      
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(localStorage.getItem('userEmail')).toBe('test@example.com');
    });
  });

  describe('login', () => {
    it('should call POST /api/auth/login with email', async () => {
      const mockResponse = { data: { user: { email: 'test@example.com' } } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.login('test@example.com');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@example.com' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getCurrentUser', () => {
    it('should call GET /api/auth/me', async () => {
      const mockResponse = { data: { user: { email: 'test@example.com' } } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getCurrentUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClients', () => {
    it('should call GET /api/clients', async () => {
      const mockResponse = { data: [{ id: 1, name: 'Client 1' }] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getClients();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClient', () => {
    it('should call GET /api/clients/:id', async () => {
      const mockResponse = { data: { id: 1, name: 'Client 1' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getClient(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createClient', () => {
    it('should call POST /api/clients with client data', async () => {
      const clientData = { name: 'New Client', description: 'Description' };
      const mockResponse = { data: { id: 1, ...clientData } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.createClient(clientData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/clients', clientData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateClient', () => {
    it('should call PUT /api/clients/:id with update data', async () => {
      const updateData = { name: 'Updated Client' };
      const mockResponse = { data: { id: 1, ...updateData } };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiClient.updateClient(1, updateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/clients/1', updateData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteClient', () => {
    it('should call DELETE /api/clients/:id', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.deleteClient(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getWorkEntries', () => {
    it('should call GET /api/work-entries without params', async () => {
      const mockResponse = { data: [{ id: 1, hours: 5 }] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntries();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call GET /api/work-entries with clientId param', async () => {
      const mockResponse = { data: [{ id: 1, hours: 5 }] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntries(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: { clientId: 1 } });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getWorkEntry', () => {
    it('should call GET /api/work-entries/:id', async () => {
      const mockResponse = { data: { id: 1, hours: 5 } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntry(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createWorkEntry', () => {
    it('should call POST /api/work-entries with entry data', async () => {
      const entryData = { clientId: 1, hours: 5, description: 'Work', date: '2024-01-01' };
      const mockResponse = { data: { id: 1, ...entryData } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.createWorkEntry(entryData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/work-entries', entryData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateWorkEntry', () => {
    it('should call PUT /api/work-entries/:id with update data', async () => {
      const updateData = { hours: 8 };
      const mockResponse = { data: { id: 1, ...updateData } };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiClient.updateWorkEntry(1, updateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/work-entries/1', updateData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteWorkEntry', () => {
    it('should call DELETE /api/work-entries/:id', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.deleteWorkEntry(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/work-entries/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClientReport', () => {
    it('should call GET /api/reports/client/:clientId', async () => {
      const mockResponse = { data: { client: { id: 1 }, totalHours: 10 } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getClientReport(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/client/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('exportClientReportCsv', () => {
    it('should call GET /api/reports/export/csv/:clientId with blob response type', async () => {
      const mockBlob = new Blob(['csv data']);
      const mockResponse = { data: mockBlob };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.exportClientReportCsv(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/csv/1', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('exportClientReportPdf', () => {
    it('should call GET /api/reports/export/pdf/:clientId with blob response type', async () => {
      const mockBlob = new Blob(['pdf data']);
      const mockResponse = { data: mockBlob };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.exportClientReportPdf(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/pdf/1', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('healthCheck', () => {
    it('should call GET /health', async () => {
      const mockResponse = { data: { status: 'ok' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.healthCheck();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
