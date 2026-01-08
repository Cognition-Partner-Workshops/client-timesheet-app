import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('ApiClient', () => {
  let apiClient: typeof import('./client').apiClient;
  let mockAxiosInstance: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    interceptors: {
      request: { use: ReturnType<typeof vi.fn> };
      response: { use: ReturnType<typeof vi.fn> };
    };
  };
  let requestInterceptor: (config: { headers: Record<string, string> }) => { headers: Record<string, string> };
  let requestErrorInterceptor: (error: Error) => Promise<never>;
  let responseInterceptor: (response: { data: unknown }) => { data: unknown };
  let responseErrorInterceptor: (error: { response?: { status: number } }) => Promise<never>;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn((successFn, errorFn) => {
          requestInterceptor = successFn;
          requestErrorInterceptor = errorFn;
        }) },
        response: { use: vi.fn((successFn, errorFn) => {
          responseInterceptor = successFn;
          responseErrorInterceptor = errorFn;
        }) },
      },
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);

    vi.resetModules();
    const module = await import('./client');
    apiClient = module.apiClient;
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('interceptors', () => {
    it('should add user email header when email is in localStorage', () => {
      localStorage.setItem('userEmail', 'test@example.com');
      const config = { headers: {} as Record<string, string> };
      
      const result = requestInterceptor(config);
      
      expect(result.headers['x-user-email']).toBe('test@example.com');
    });

    it('should not add user email header when email is not in localStorage', () => {
      const config = { headers: {} as Record<string, string> };
      
      const result = requestInterceptor(config);
      
      expect(result.headers['x-user-email']).toBeUndefined();
    });

    it('should reject request errors', async () => {
      const error = new Error('Request error');
      
      await expect(requestErrorInterceptor(error)).rejects.toThrow('Request error');
    });

    it('should pass through successful responses', () => {
      const response = { data: { test: 'data' } };
      
      const result = responseInterceptor(response);
      
      expect(result).toEqual(response);
    });

    it('should handle 401 errors by clearing localStorage and redirecting', async () => {
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

    it('should reject non-401 errors without clearing localStorage', async () => {
      localStorage.setItem('userEmail', 'test@example.com');
      const error = { response: { status: 500 } };
      
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(localStorage.getItem('userEmail')).toBe('test@example.com');
    });
  });

  describe('login', () => {
    it('should call login endpoint with email', async () => {
      const mockResponse = { data: { user: { email: 'test@example.com' } } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.login('test@example.com');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@example.com' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getCurrentUser', () => {
    it('should call getCurrentUser endpoint', async () => {
      const mockResponse = { data: { user: { email: 'test@example.com' } } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getCurrentUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClients', () => {
    it('should call getClients endpoint', async () => {
      const mockResponse = { data: { clients: [] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getClients();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClient', () => {
    it('should call getClient endpoint with id', async () => {
      const mockResponse = { data: { client: { id: 1, name: 'Test' } } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getClient(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createClient', () => {
    it('should call createClient endpoint with data', async () => {
      const mockResponse = { data: { client: { id: 1, name: 'New Client' } } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.createClient({ name: 'New Client', description: 'Test' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/clients', { name: 'New Client', description: 'Test' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateClient', () => {
    it('should call updateClient endpoint with id and data', async () => {
      const mockResponse = { data: { client: { id: 1, name: 'Updated' } } };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiClient.updateClient(1, { name: 'Updated' });

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/clients/1', { name: 'Updated' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteClient', () => {
    it('should call deleteClient endpoint with id', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.deleteClient(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getWorkEntries', () => {
    it('should call getWorkEntries endpoint without clientId', async () => {
      const mockResponse = { data: { workEntries: [] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntries();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call getWorkEntries endpoint with clientId', async () => {
      const mockResponse = { data: { workEntries: [] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntries(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: { clientId: 1 } });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getWorkEntry', () => {
    it('should call getWorkEntry endpoint with id', async () => {
      const mockResponse = { data: { workEntry: { id: 1 } } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntry(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createWorkEntry', () => {
    it('should call createWorkEntry endpoint with data', async () => {
      const mockResponse = { data: { workEntry: { id: 1 } } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const entryData = { clientId: 1, hours: 5, description: 'Work', date: '2024-01-01' };
      const result = await apiClient.createWorkEntry(entryData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/work-entries', entryData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateWorkEntry', () => {
    it('should call updateWorkEntry endpoint with id and data', async () => {
      const mockResponse = { data: { workEntry: { id: 1 } } };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiClient.updateWorkEntry(1, { hours: 8 });

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/work-entries/1', { hours: 8 });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteWorkEntry', () => {
    it('should call deleteWorkEntry endpoint with id', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.deleteWorkEntry(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/work-entries/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClientReport', () => {
    it('should call getClientReport endpoint with clientId', async () => {
      const mockResponse = { data: { report: {} } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getClientReport(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/client/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('exportClientReportCsv', () => {
    it('should call exportClientReportCsv endpoint with clientId', async () => {
      const mockBlob = new Blob(['csv data']);
      const mockResponse = { data: mockBlob };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.exportClientReportCsv(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/csv/1', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('exportClientReportPdf', () => {
    it('should call exportClientReportPdf endpoint with clientId', async () => {
      const mockBlob = new Blob(['pdf data']);
      const mockResponse = { data: mockBlob };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.exportClientReportPdf(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/pdf/1', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('healthCheck', () => {
    it('should call healthCheck endpoint', async () => {
      const mockResponse = { data: { status: 'ok' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.healthCheck();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
