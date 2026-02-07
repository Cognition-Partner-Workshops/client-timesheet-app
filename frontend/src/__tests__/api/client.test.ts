import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

describe('ApiClient', () => {

  beforeEach(async () => {
    vi.clearAllMocks();
    
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
    // Assign to variable to ensure module is loaded (used for side effects)
    void module.apiClient;
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: '',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should set up request and response interceptors', () => {
      const mockInstance = mockedAxios.create.mock.results[0]?.value;
      expect(mockInstance?.interceptors.request.use).toHaveBeenCalled();
      expect(mockInstance?.interceptors.response.use).toHaveBeenCalled();
    });
  });
});
