/**
 * @fileoverview API client for communicating with the backend server.
 * Provides a centralized HTTP client with automatic authentication header injection
 * and error handling. All API methods return promises that resolve to response data.
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

/**
 * Base URL for API requests. Empty string makes requests relative to current origin,
 * allowing Vite proxy to forward /api requests to the backend during development.
 */
const API_BASE_URL = '';

/**
 * Centralized API client class for all backend communication.
 * Handles authentication headers, request/response interceptors, and provides
 * typed methods for all API endpoints.
 *
 * @example
 * ```typescript
 * import apiClient from './api/client';
 *
 * // Login
 * const response = await apiClient.login('user@example.com');
 *
 * // Fetch clients
 * const { clients } = await apiClient.getClients();
 * ```
 */
class ApiClient {
  /** Axios instance configured with base URL, timeout, and interceptors */
  private client: AxiosInstance;

  /**
   * Creates a new ApiClient instance with configured Axios client.
   * Sets up request interceptor for authentication and response interceptor
   * for handling 401 errors (automatic logout and redirect).
   */
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    /**
     * Request interceptor that automatically adds the x-user-email header
     * from localStorage for authenticated requests.
     */
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

    /**
     * Response interceptor that handles authentication errors.
     * On 401 status, clears stored credentials and redirects to login.
     */
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

  /**
   * Authenticates a user by email address.
   * Creates a new user account if the email doesn't exist.
   *
   * @param email - User's email address for authentication.
   * @returns Promise resolving to login response with user data.
   */
  async login(email: string) {
    const response = await this.client.post('/api/auth/login', { email });
    return response.data;
  }

  /**
   * Retrieves the currently authenticated user's information.
   *
   * @returns Promise resolving to user data including email and creation date.
   * @throws Error if not authenticated or user not found.
   */
  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  /**
   * Fetches all clients belonging to the authenticated user.
   *
   * @returns Promise resolving to object containing array of client records.
   */
  async getClients() {
    const response = await this.client.get('/api/clients');
    return response.data;
  }

  /**
   * Fetches a specific client by ID.
   *
   * @param id - The unique identifier of the client to retrieve.
   * @returns Promise resolving to the client record.
   * @throws Error if client not found or doesn't belong to user.
   */
  async getClient(id: number) {
    const response = await this.client.get(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Creates a new client for the authenticated user.
   *
   * @param clientData - Object containing client name and optional description.
   * @param clientData.name - Required client name (1-255 characters).
   * @param clientData.description - Optional client description.
   * @returns Promise resolving to the created client record.
   */
  async createClient(clientData: { name: string; description?: string }) {
    const response = await this.client.post('/api/clients', clientData);
    return response.data;
  }

  /**
   * Updates an existing client's information.
   *
   * @param id - The unique identifier of the client to update.
   * @param clientData - Object containing fields to update.
   * @returns Promise resolving to the updated client record.
   * @throws Error if client not found or doesn't belong to user.
   */
  async updateClient(id: number, clientData: { name?: string; description?: string }) {
    const response = await this.client.put(`/api/clients/${id}`, clientData);
    return response.data;
  }

  /**
   * Deletes a client and all associated work entries.
   *
   * @param id - The unique identifier of the client to delete.
   * @returns Promise resolving to success message.
   * @throws Error if client not found or doesn't belong to user.
   */
  async deleteClient(id: number) {
    const response = await this.client.delete(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Fetches all work entries for the authenticated user.
   * Optionally filters by client ID.
   *
   * @param clientId - Optional client ID to filter entries.
   * @returns Promise resolving to object containing array of work entries.
   */
  async getWorkEntries(clientId?: number) {
    const params = clientId ? { clientId } : {};
    const response = await this.client.get('/api/work-entries', { params });
    return response.data;
  }

  /**
   * Fetches a specific work entry by ID.
   *
   * @param id - The unique identifier of the work entry to retrieve.
   * @returns Promise resolving to the work entry record with client name.
   * @throws Error if entry not found or doesn't belong to user.
   */
  async getWorkEntry(id: number) {
    const response = await this.client.get(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Creates a new work entry for the authenticated user.
   *
   * @param entryData - Object containing work entry details.
   * @param entryData.clientId - ID of the client to associate with entry.
   * @param entryData.hours - Hours worked (0.01-24).
   * @param entryData.description - Optional description of work performed.
   * @param entryData.date - Date of work in ISO format (YYYY-MM-DD).
   * @returns Promise resolving to the created work entry record.
   */
  async createWorkEntry(entryData: { clientId: number; hours: number; description?: string; date: string }) {
    const response = await this.client.post('/api/work-entries', entryData);
    return response.data;
  }

  /**
   * Updates an existing work entry.
   *
   * @param id - The unique identifier of the work entry to update.
   * @param entryData - Object containing fields to update.
   * @returns Promise resolving to the updated work entry record.
   * @throws Error if entry not found or doesn't belong to user.
   */
  async updateWorkEntry(id: number, entryData: { clientId?: number; hours?: number; description?: string; date?: string }) {
    const response = await this.client.put(`/api/work-entries/${id}`, entryData);
    return response.data;
  }

  /**
   * Deletes a work entry.
   *
   * @param id - The unique identifier of the work entry to delete.
   * @returns Promise resolving to success message.
   * @throws Error if entry not found or doesn't belong to user.
   */
  async deleteWorkEntry(id: number) {
    const response = await this.client.delete(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Fetches a detailed time report for a specific client.
   * Includes all work entries and aggregated statistics.
   *
   * @param clientId - The unique identifier of the client.
   * @returns Promise resolving to report data with entries, total hours, and count.
   */
  async getClientReport(clientId: number) {
    const response = await this.client.get(`/api/reports/client/${clientId}`);
    return response.data;
  }

  /**
   * Exports a client's time report as a CSV file.
   *
   * @param clientId - The unique identifier of the client.
   * @returns Promise resolving to Blob containing CSV data for download.
   */
  async exportClientReportCsv(clientId: number) {
    const response = await this.client.get(`/api/reports/export/csv/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Exports a client's time report as a PDF document.
   *
   * @param clientId - The unique identifier of the client.
   * @returns Promise resolving to Blob containing PDF data for download.
   */
  async exportClientReportPdf(clientId: number) {
    const response = await this.client.get(`/api/reports/export/pdf/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Checks the health status of the backend server.
   *
   * @returns Promise resolving to health status with timestamp.
   */
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
