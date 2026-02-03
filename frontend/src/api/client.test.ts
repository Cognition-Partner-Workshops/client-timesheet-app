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
      response: { use: vi.fn() },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);
    localStorage.clear();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('should create axios instance with correct config', async () => {
    const { default: apiClient } = await import('./client');
    
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: '',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(apiClient).toBeDefined();
  });

  it('should call login endpoint', async () => {
    mockAxiosInstance.post.mockResolvedValue({ data: { user: { email: 'test@example.com' } } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.login('test@example.com');
    
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@example.com' });
    expect(result).toEqual({ user: { email: 'test@example.com' } });
  });

  it('should call getCurrentUser endpoint', async () => {
    mockAxiosInstance.get.mockResolvedValue({ data: { user: { email: 'test@example.com' } } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.getCurrentUser();
    
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me');
    expect(result).toEqual({ user: { email: 'test@example.com' } });
  });

  it('should call getClients endpoint', async () => {
    mockAxiosInstance.get.mockResolvedValue({ data: { clients: [] } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.getClients();
    
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients');
    expect(result).toEqual({ clients: [] });
  });

  it('should call getClient endpoint with id', async () => {
    mockAxiosInstance.get.mockResolvedValue({ data: { client: { id: 1, name: 'Test' } } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.getClient(1);
    
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients/1');
    expect(result).toEqual({ client: { id: 1, name: 'Test' } });
  });

  it('should call createClient endpoint', async () => {
    const clientData = { name: 'New Client', description: 'Test' };
    mockAxiosInstance.post.mockResolvedValue({ data: { client: { id: 1, ...clientData } } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.createClient(clientData);
    
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/clients', clientData);
    expect(result).toEqual({ client: { id: 1, ...clientData } });
  });

  it('should call updateClient endpoint', async () => {
    const clientData = { name: 'Updated Client' };
    mockAxiosInstance.put.mockResolvedValue({ data: { client: { id: 1, ...clientData } } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.updateClient(1, clientData);
    
    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/clients/1', clientData);
    expect(result).toEqual({ client: { id: 1, ...clientData } });
  });

  it('should call deleteClient endpoint', async () => {
    mockAxiosInstance.delete.mockResolvedValue({ data: { message: 'Deleted' } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.deleteClient(1);
    
    expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/clients/1');
    expect(result).toEqual({ message: 'Deleted' });
  });

  it('should call deleteAllClients endpoint', async () => {
    mockAxiosInstance.delete.mockResolvedValue({ data: { message: 'All deleted', deletedCount: 5 } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.deleteAllClients();
    
    expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/clients');
    expect(result).toEqual({ message: 'All deleted', deletedCount: 5 });
  });

  it('should call getWorkEntries endpoint without clientId', async () => {
    mockAxiosInstance.get.mockResolvedValue({ data: { workEntries: [] } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.getWorkEntries();
    
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: {} });
    expect(result).toEqual({ workEntries: [] });
  });

  it('should call getWorkEntries endpoint with clientId', async () => {
    mockAxiosInstance.get.mockResolvedValue({ data: { workEntries: [] } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.getWorkEntries(1);
    
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: { clientId: 1 } });
    expect(result).toEqual({ workEntries: [] });
  });

  it('should call getWorkEntry endpoint', async () => {
    mockAxiosInstance.get.mockResolvedValue({ data: { workEntry: { id: 1 } } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.getWorkEntry(1);
    
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries/1');
    expect(result).toEqual({ workEntry: { id: 1 } });
  });

  it('should call createWorkEntry endpoint', async () => {
    const entryData = { clientId: 1, hours: 8, date: '2024-01-01' };
    mockAxiosInstance.post.mockResolvedValue({ data: { workEntry: { id: 1, ...entryData } } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.createWorkEntry(entryData);
    
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/work-entries', entryData);
    expect(result).toEqual({ workEntry: { id: 1, ...entryData } });
  });

  it('should call updateWorkEntry endpoint', async () => {
    const entryData = { hours: 4 };
    mockAxiosInstance.put.mockResolvedValue({ data: { workEntry: { id: 1, ...entryData } } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.updateWorkEntry(1, entryData);
    
    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/work-entries/1', entryData);
    expect(result).toEqual({ workEntry: { id: 1, ...entryData } });
  });

  it('should call deleteWorkEntry endpoint', async () => {
    mockAxiosInstance.delete.mockResolvedValue({ data: { message: 'Deleted' } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.deleteWorkEntry(1);
    
    expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/work-entries/1');
    expect(result).toEqual({ message: 'Deleted' });
  });

  it('should call getClientReport endpoint', async () => {
    mockAxiosInstance.get.mockResolvedValue({ data: { client: {}, totalHours: 10 } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.getClientReport(1);
    
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/client/1');
    expect(result).toEqual({ client: {}, totalHours: 10 });
  });

  it('should call exportClientReportCsv endpoint', async () => {
    const mockBlob = new Blob(['csv data']);
    mockAxiosInstance.get.mockResolvedValue({ data: mockBlob });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.exportClientReportCsv(1);
    
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/csv/1', { responseType: 'blob' });
    expect(result).toEqual(mockBlob);
  });

  it('should call exportClientReportPdf endpoint', async () => {
    const mockBlob = new Blob(['pdf data']);
    mockAxiosInstance.get.mockResolvedValue({ data: mockBlob });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.exportClientReportPdf(1);
    
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/pdf/1', { responseType: 'blob' });
    expect(result).toEqual(mockBlob);
  });

  it('should call healthCheck endpoint', async () => {
    mockAxiosInstance.get.mockResolvedValue({ data: { status: 'ok' } });
    
    const { default: apiClient } = await import('./client');
    const result = await apiClient.healthCheck();
    
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
    expect(result).toEqual({ status: 'ok' });
  });
});
