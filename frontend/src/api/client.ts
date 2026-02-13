import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

// Use empty string to make requests relative to the current origin
// Vite proxy will forward /api requests to the backend
const API_BASE_URL = '';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/api/auth/login') &&
          !originalRequest.url?.includes('/api/auth/register') &&
          !originalRequest.url?.includes('/api/auth/refresh')
        ) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
              localStorage.setItem('accessToken', newAccessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/api/auth/login', { email, password });
    return response.data;
  }

  async register(email: string, password: string) {
    const response = await this.client.post('/api/auth/register', { email, password });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    const response = await this.client.post('/api/auth/refresh', { refreshToken });
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  }

  // Client endpoints
  async getClients() {
    const response = await this.client.get('/api/clients');
    return response.data;
  }

  async getClient(id: number) {
    const response = await this.client.get(`/api/clients/${id}`);
    return response.data;
  }

  async createClient(clientData: { name: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.post('/api/clients', clientData);
    return response.data;
  }

  async updateClient(id: number, clientData: { name?: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.put(`/api/clients/${id}`, clientData);
    return response.data;
  }

  async deleteClient(id: number) {
    const response = await this.client.delete(`/api/clients/${id}`);
    return response.data;
  }

  async deleteAllClients() {
    const response = await this.client.delete('/api/clients');
    return response.data;
  }

  // Work entry endpoints
  async getWorkEntries(clientId?: number) {
    const params = clientId ? { clientId } : {};
    const response = await this.client.get('/api/work-entries', { params });
    return response.data;
  }

  async getWorkEntry(id: number) {
    const response = await this.client.get(`/api/work-entries/${id}`);
    return response.data;
  }

  async createWorkEntry(entryData: { clientId: number; hours: number; description?: string; date: string }) {
    const response = await this.client.post('/api/work-entries', entryData);
    return response.data;
  }

  async updateWorkEntry(id: number, entryData: { clientId?: number; hours?: number; description?: string; date?: string }) {
    const response = await this.client.put(`/api/work-entries/${id}`, entryData);
    return response.data;
  }

  async deleteWorkEntry(id: number) {
    const response = await this.client.delete(`/api/work-entries/${id}`);
    return response.data;
  }

  // Report endpoints
  async getClientReport(clientId: number) {
    const response = await this.client.get(`/api/reports/client/${clientId}`);
    return response.data;
  }

  async exportClientReportCsv(clientId: number) {
    const response = await this.client.get(`/api/reports/export/csv/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async exportClientReportPdf(clientId: number) {
    const response = await this.client.get(`/api/reports/export/pdf/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
