import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

describe('ApiClient', () => {
  let apiClient: typeof import('../../api/client').default;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

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

    mockedAxios.create.mockReturnValue(mockAxiosInstance as never);

    vi.resetModules();
    const module = await import('../../api/client');
    apiClient = module.default;
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('initialization', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: '',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('login', () => {
    it('should call POST /api/auth/login with email', async () => {
      const mockResponse = { data: { user: { id: 1, email: 'test@example.com' } } };
      const mockInstance = mockedAxios.create.mock.results[0]?.value;
      if (mockInstance) {
        mockInstance.post.mockResolvedValue(mockResponse);
      }

      const result = await apiClient.login('test@example.com');

      expect(mockInstance?.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@example.com' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getCurrentUser', () => {
    it('should call GET /api/auth/me', async () => {
      const mockResponse = { data: { user: { id: 1, email: 'test@example.com' } } };
      const mockInstance = mockedAxios.create.mock.results[0]?.value;
      if (mockInstance) {
        mockInstance.get.mockResolvedValue(mockResponse);
      }

      const result = await apiClient.getCurrentUser();

      expect(mockInstance?.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('clients', () => {
    it('should call GET /api/clients', async () => {
      const mockResponse = { data: { clients: [] } };
      const mockInstance = mockedAxios.create.mock.results[0]?.value;
      if (mockInstance) {
        mockInstance.get.mockResolvedValue(mockResponse);
      }

      const result = await apiClient.getClients();

      expect(mockInstance?.get).toHaveBeenCalledWith('/api/clients');
      expect(result).toEqual(mockResponse.data);
    });

    it('should call POST /api/clients with client data', async () => {
      const clientData = { name: 'Test Client', description: 'Test Description' };
      const mockResponse = { data: { client: { id: 1, ...clientData } } };
      const mockInstance = mockedAxios.create.mock.results[0]?.value;
      if (mockInstance) {
        mockInstance.post.mockResolvedValue(mockResponse);
      }

      const result = await apiClient.createClient(clientData);

      expect(mockInstance?.post).toHaveBeenCalledWith('/api/clients', clientData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should call DELETE /api/clients/:id', async () => {
      const mockResponse = { data: { success: true } };
      const mockInstance = mockedAxios.create.mock.results[0]?.value;
      if (mockInstance) {
        mockInstance.delete.mockResolvedValue(mockResponse);
      }

      const result = await apiClient.deleteClient(1);

      expect(mockInstance?.delete).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('work entries', () => {
    it('should call GET /api/work-entries', async () => {
      const mockResponse = { data: { workEntries: [] } };
      const mockInstance = mockedAxios.create.mock.results[0]?.value;
      if (mockInstance) {
        mockInstance.get.mockResolvedValue(mockResponse);
      }

      const result = await apiClient.getWorkEntries();

      expect(mockInstance?.get).toHaveBeenCalledWith('/api/work-entries', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call GET /api/work-entries with clientId filter', async () => {
      const mockResponse = { data: { workEntries: [] } };
      const mockInstance = mockedAxios.create.mock.results[0]?.value;
      if (mockInstance) {
        mockInstance.get.mockResolvedValue(mockResponse);
      }

      const result = await apiClient.getWorkEntries(1);

      expect(mockInstance?.get).toHaveBeenCalledWith('/api/work-entries', { params: { clientId: 1 } });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('healthCheck', () => {
    it('should call GET /health', async () => {
      const mockResponse = { data: { status: 'ok' } };
      const mockInstance = mockedAxios.create.mock.results[0]?.value;
      if (mockInstance) {
        mockInstance.get.mockResolvedValue(mockResponse);
      }

      const result = await apiClient.healthCheck();

      expect(mockInstance?.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
