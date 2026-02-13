/**
 * API Client — Centralized HTTP Layer
 *
 * Singleton Axios wrapper that every frontend page and context uses to
 * communicate with the backend. Exported as both a named and default export
 * so consumers can `import apiClient from './api/client'`.
 *
 * Key responsibilities:
 *  1. Base URL resolution — uses an empty string so requests are relative
 *     to the current origin. In development the Vite dev server proxies
 *     `/api/*` to `http://localhost:3001` (see vite.config.ts). In
 *     production the same Express process serves both the API and the
 *     static frontend bundle.
 *
 *  2. Request interceptor — reads `userEmail` from localStorage and
 *     attaches it as the `x-user-email` header on every outgoing request.
 *     This is the mechanism that ties the frontend session to the backend's
 *     authenticateUser middleware (backend/src/middleware/auth.js).
 *
 *  3. Response interceptor — watches for 401 responses. On auth failure it
 *     clears localStorage and hard-navigates to `/login`, ensuring the user
 *     cannot silently remain on a protected page with an expired session.
 *
 * Method groups mirror the backend route modules:
 *  - Auth:        login, getCurrentUser
 *  - Clients:     getClients, getClient, createClient, updateClient,
 *                 deleteClient, deleteAllClients
 *  - Work Entries: getWorkEntries, getWorkEntry, createWorkEntry,
 *                  updateWorkEntry, deleteWorkEntry
 *  - Reports:     getClientReport, exportClientReportCsv, exportClientReportPdf
 *  - Health:      healthCheck
 *
 * Related files:
 *  - contexts/AuthContext.tsx  — calls login() and getCurrentUser()
 *  - pages/ClientsPage.tsx     — uses client methods via React Query
 *  - pages/WorkEntriesPage.tsx — uses work entry methods via React Query
 *  - pages/ReportsPage.tsx     — uses report methods via React Query
 *  - backend/src/middleware/auth.js — consumes the x-user-email header
 */
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

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

    // Request interceptor — injects the authenticated user's email into
    // every request so the backend can scope data to this user.
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

    // Response interceptor — global 401 handler. Clears the session and
    // redirects so the user can re-authenticate.
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('userEmail');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // --- Auth endpoints (backend: routes/auth.js) ---
  async login(email: string) {
    const response = await this.client.post('/api/auth/login', { email });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  // --- Client endpoints (backend: routes/clients.js) ---
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

  // --- Work entry endpoints (backend: routes/workEntries.js) ---
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

  // --- Report endpoints (backend: routes/reports.js) ---
  // CSV and PDF exports request responseType: 'blob' so the browser
  // receives binary data that can be turned into a downloadable file.
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

  // --- Health check (unauthenticated) ---
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
