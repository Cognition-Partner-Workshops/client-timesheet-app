import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('ApiClient', () => {
  let apiClient: typeof import('../api/client').default;
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

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    mockAxiosInstance = {
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

    const module = await import('../api/client');
    apiClient = module.default;
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('Auth endpoints', () => {
    it('should call login endpoint', async () => {
      const mockResponse = { data: { user: { email: 'test@example.com' } } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.login('test@example.com');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@example.com' });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call getCurrentUser endpoint', async () => {
      const mockResponse = { data: { user: { email: 'test@example.com' } } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getCurrentUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Client endpoints', () => {
    it('should call getClients endpoint', async () => {
      const mockResponse = { data: { clients: [] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getClients();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients');
      expect(result).toEqual(mockResponse.data);
    });

    it('should call getClient endpoint', async () => {
      const mockResponse = { data: { client: { id: 1, name: 'Test' } } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getClient(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should call createClient endpoint', async () => {
      const mockResponse = { data: { client: { id: 1, name: 'New Client' } } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.createClient({ name: 'New Client', description: 'Test' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/clients', { name: 'New Client', description: 'Test' });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call updateClient endpoint', async () => {
      const mockResponse = { data: { client: { id: 1, name: 'Updated' } } };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiClient.updateClient(1, { name: 'Updated' });

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/clients/1', { name: 'Updated' });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call deleteClient endpoint', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.deleteClient(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Work entry endpoints', () => {
    it('should call getWorkEntries endpoint without filter', async () => {
      const mockResponse = { data: { workEntries: [] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntries();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call getWorkEntries endpoint with clientId filter', async () => {
      const mockResponse = { data: { workEntries: [] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntries(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: { clientId: 1 } });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call getWorkEntry endpoint', async () => {
      const mockResponse = { data: { workEntry: { id: 1 } } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntry(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should call createWorkEntry endpoint', async () => {
      const mockResponse = { data: { workEntry: { id: 1 } } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const entryData = { clientId: 1, hours: 8, description: 'Work', date: '2024-01-01' };
      const result = await apiClient.createWorkEntry(entryData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/work-entries', entryData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should call updateWorkEntry endpoint', async () => {
      const mockResponse = { data: { workEntry: { id: 1 } } };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiClient.updateWorkEntry(1, { hours: 4 });

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/work-entries/1', { hours: 4 });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call deleteWorkEntry endpoint', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.deleteWorkEntry(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/work-entries/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Report endpoints', () => {
    it('should call getClientReport endpoint', async () => {
      const mockResponse = { data: { totalHours: 10 } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getClientReport(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/client/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should call exportClientReportCsv endpoint', async () => {
      const mockBlob = new Blob(['csv data']);
      mockAxiosInstance.get.mockResolvedValue({ data: mockBlob });

      const result = await apiClient.exportClientReportCsv(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/csv/1', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });

    it('should call exportClientReportPdf endpoint', async () => {
      const mockBlob = new Blob(['pdf data']);
      mockAxiosInstance.get.mockResolvedValue({ data: mockBlob });

      const result = await apiClient.exportClientReportPdf(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/pdf/1', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('Health check', () => {
    it('should call healthCheck endpoint', async () => {
      const mockResponse = { data: { status: 'ok' } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.healthCheck();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
