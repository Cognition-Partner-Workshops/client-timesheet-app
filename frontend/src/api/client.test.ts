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
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('should call login endpoint with email', async () => {
      const mockResponse = { data: { user: { email: 'test@example.com' } } };
      (mockAxiosInstance.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.login('test@example.com');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@example.com' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getCurrentUser', () => {
    it('should call me endpoint', async () => {
      const mockResponse = { data: { user: { email: 'test@example.com' } } };
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.getCurrentUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClients', () => {
    it('should call clients endpoint', async () => {
      const mockResponse = { data: [{ id: 1, name: 'Client 1' }] };
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.getClients();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClient', () => {
    it('should call client endpoint with id', async () => {
      const mockResponse = { data: { id: 1, name: 'Client 1' } };
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.getClient(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createClient', () => {
    it('should call create client endpoint', async () => {
      const mockResponse = { data: { id: 1, name: 'New Client' } };
      (mockAxiosInstance.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.createClient({ name: 'New Client' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/clients', { name: 'New Client' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateClient', () => {
    it('should call update client endpoint', async () => {
      const mockResponse = { data: { id: 1, name: 'Updated Client' } };
      (mockAxiosInstance.put as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.updateClient(1, { name: 'Updated Client' });

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/clients/1', { name: 'Updated Client' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteClient', () => {
    it('should call delete client endpoint', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      (mockAxiosInstance.delete as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.deleteClient(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/clients/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteAllClients', () => {
    it('should call delete all clients endpoint', async () => {
      const mockResponse = { data: { message: 'All deleted' } };
      (mockAxiosInstance.delete as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.deleteAllClients();

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/clients');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getWorkEntries', () => {
    it('should call work entries endpoint without clientId', async () => {
      const mockResponse = { data: [{ id: 1, hours: 5 }] };
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntries();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call work entries endpoint with clientId', async () => {
      const mockResponse = { data: [{ id: 1, hours: 5 }] };
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntries(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: { clientId: 1 } });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getWorkEntry', () => {
    it('should call work entry endpoint with id', async () => {
      const mockResponse = { data: { id: 1, hours: 5 } };
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.getWorkEntry(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createWorkEntry', () => {
    it('should call create work entry endpoint', async () => {
      const mockResponse = { data: { id: 1, hours: 5 } };
      const entryData = { clientId: 1, hours: 5, date: '2024-01-01' };
      (mockAxiosInstance.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.createWorkEntry(entryData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/work-entries', entryData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateWorkEntry', () => {
    it('should call update work entry endpoint', async () => {
      const mockResponse = { data: { id: 1, hours: 8 } };
      (mockAxiosInstance.put as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.updateWorkEntry(1, { hours: 8 });

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/work-entries/1', { hours: 8 });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteWorkEntry', () => {
    it('should call delete work entry endpoint', async () => {
      const mockResponse = { data: { message: 'Deleted' } };
      (mockAxiosInstance.delete as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.deleteWorkEntry(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/work-entries/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getClientReport', () => {
    it('should call client report endpoint', async () => {
      const mockResponse = { data: { totalHours: 10 } };
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.getClientReport(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/client/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('exportClientReportCsv', () => {
    it('should call CSV export endpoint', async () => {
      const mockBlob = new Blob(['csv data']);
      const mockResponse = { data: mockBlob };
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.exportClientReportCsv(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/csv/1', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('exportClientReportPdf', () => {
    it('should call PDF export endpoint', async () => {
      const mockBlob = new Blob(['pdf data']);
      const mockResponse = { data: mockBlob };
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.exportClientReportPdf(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/pdf/1', { responseType: 'blob' });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('healthCheck', () => {
    it('should call health endpoint', async () => {
      const mockResponse = { data: { status: 'ok' } };
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const result = await apiClient.healthCheck();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
