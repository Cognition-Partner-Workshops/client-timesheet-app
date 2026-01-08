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

    // Request interceptor to add email header
    this.client.interceptors.request.use(
      (config) => {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          config.headers['x-user-email'] = userEmail;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear stored email on auth error
          localStorage.removeItem('userEmail');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string) {
    const response = await this.client.post('/api/auth/login', { email });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
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

  async createClient(clientData: { name: string; description?: string }) {
    const response = await this.client.post('/api/clients', clientData);
    return response.data;
  }

  async updateClient(id: number, clientData: { name?: string; description?: string }) {
    const response = await this.client.put(`/api/clients/${id}`, clientData);
    return response.data;
  }

  async deleteClient(id: number) {
    const response = await this.client.delete(`/api/clients/${id}`);
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

  // Project endpoints
  async getProjects() {
    const response = await this.client.get('/api/projects');
    return response.data;
  }

  async getProjectsByClient(clientId: number) {
    const response = await this.client.get(`/api/projects/client/${clientId}`);
    return response.data;
  }

  async getProject(id: number) {
    const response = await this.client.get(`/api/projects/${id}`);
    return response.data;
  }

  async createProject(projectData: { clientId: number; name: string; description?: string }) {
    const response = await this.client.post('/api/projects', projectData);
    return response.data;
  }

  async updateProject(id: number, projectData: { name?: string; description?: string; clientId?: number }) {
    const response = await this.client.put(`/api/projects/${id}`, projectData);
    return response.data;
  }

  async deleteProject(id: number) {
    const response = await this.client.delete(`/api/projects/${id}`);
    return response.data;
  }

  // Tag endpoints
  async getTags() {
    const response = await this.client.get('/api/tags');
    return response.data;
  }

  async getTag(id: number) {
    const response = await this.client.get(`/api/tags/${id}`);
    return response.data;
  }

  async createTag(tagData: { name: string; color?: string }) {
    const response = await this.client.post('/api/tags', tagData);
    return response.data;
  }

  async updateTag(id: number, tagData: { name?: string; color?: string }) {
    const response = await this.client.put(`/api/tags/${id}`, tagData);
    return response.data;
  }

  async deleteTag(id: number) {
    const response = await this.client.delete(`/api/tags/${id}`);
    return response.data;
  }

  async getWorkEntryTags(workEntryId: number) {
    const response = await this.client.get(`/api/tags/work-entry/${workEntryId}`);
    return response.data;
  }

  async setWorkEntryTags(workEntryId: number, tagIds: number[]) {
    const response = await this.client.post(`/api/tags/work-entry/${workEntryId}`, { tagIds });
    return response.data;
  }

  // Timer endpoints
  async getActiveTimer() {
    const response = await this.client.get('/api/timer/active');
    return response.data;
  }

  async startTimer(timerData: { clientId?: number; projectId?: number; description?: string }) {
    const response = await this.client.post('/api/timer/start', timerData);
    return response.data;
  }

  async stopTimer(stopData: { createWorkEntry?: boolean; clientId?: number; projectId?: number; description?: string; isBillable?: boolean }) {
    const response = await this.client.post('/api/timer/stop', stopData);
    return response.data;
  }

  async updateTimer(timerData: { clientId?: number; projectId?: number; description?: string }) {
    const response = await this.client.put('/api/timer/update', timerData);
    return response.data;
  }

  async discardTimer() {
    const response = await this.client.delete('/api/timer/discard');
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
