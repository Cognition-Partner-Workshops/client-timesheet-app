/**
 * @fileoverview API client for communicating with the backend server.
 * Provides methods for all API endpoints including authentication, clients,
 * work entries, and reports. Handles authentication headers and error responses.
 * @module api/client
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

/**
 * Base URL for API requests. Empty string uses relative URLs,
 * allowing Vite proxy to forward /api requests to the backend.
 */
const API_BASE_URL = '';

/**
 * API client class providing methods for all backend API endpoints.
 * Automatically handles authentication headers and 401 error responses.
 * Uses Axios for HTTP requests with interceptors for request/response handling.
 */
class ApiClient {
  /** Axios instance configured with base URL, timeout, and interceptors */
  private client: AxiosInstance;

  /**
   * Creates a new ApiClient instance with configured Axios client.
   * Sets up request interceptor for authentication headers and
   * response interceptor for handling 401 unauthorized errors.
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
     * Request interceptor that adds the x-user-email header
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
     * Response interceptor that handles 401 unauthorized errors
     * by clearing stored credentials and redirecting to login.
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
   * Authenticates a user with their email address.
   * Creates a new user account if the email doesn't exist.
   * @param email - User's email address
   * @returns Promise resolving to login response with user data
   */
  async login(email: string) {
    const response = await this.client.post('/api/auth/login', { email });
    return response.data;
  }

  /**
   * Retrieves the currently authenticated user's information.
   * @returns Promise resolving to user data (email, createdAt)
   */
  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  /**
   * Retrieves all clients for the authenticated user.
   * @returns Promise resolving to array of client objects
   */
  async getClients() {
    const response = await this.client.get('/api/clients');
    return response.data;
  }

  /**
   * Retrieves a specific client by ID.
   * @param id - Client ID to retrieve
   * @returns Promise resolving to client object
   */
  async getClient(id: number) {
    const response = await this.client.get(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Creates a new client for the authenticated user.
   * @param clientData - Client data including name and optional fields
   * @returns Promise resolving to created client object
   */
  async createClient(clientData: { name: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.post('/api/clients', clientData);
    return response.data;
  }

  /**
   * Updates an existing client's information.
   * @param id - Client ID to update
   * @param clientData - Partial client data to update
   * @returns Promise resolving to updated client object
   */
  async updateClient(id: number, clientData: { name?: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.put(`/api/clients/${id}`, clientData);
    return response.data;
  }

  /**
   * Deletes a specific client by ID.
   * Associated work entries are also deleted.
   * @param id - Client ID to delete
   * @returns Promise resolving to success message
   */
  async deleteClient(id: number) {
    const response = await this.client.delete(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Deletes all clients for the authenticated user.
   * All associated work entries are also deleted.
   * @returns Promise resolving to success message with deleted count
   */
  async deleteAllClients() {
    const response = await this.client.delete('/api/clients');
    return response.data;
  }

  /**
   * Retrieves work entries for the authenticated user.
   * @param clientId - Optional client ID to filter entries
   * @returns Promise resolving to array of work entry objects
   */
  async getWorkEntries(clientId?: number) {
    const params = clientId ? { clientId } : {};
    const response = await this.client.get('/api/work-entries', { params });
    return response.data;
  }

  /**
   * Retrieves a specific work entry by ID.
   * @param id - Work entry ID to retrieve
   * @returns Promise resolving to work entry object with client name
   */
  async getWorkEntry(id: number) {
    const response = await this.client.get(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Creates a new work entry for the authenticated user.
   * @param entryData - Work entry data including clientId, hours, date
   * @returns Promise resolving to created work entry object
   */
  async createWorkEntry(entryData: { clientId: number; hours: number; description?: string; date: string }) {
    const response = await this.client.post('/api/work-entries', entryData);
    return response.data;
  }

  /**
   * Updates an existing work entry.
   * @param id - Work entry ID to update
   * @param entryData - Partial work entry data to update
   * @returns Promise resolving to updated work entry object
   */
  async updateWorkEntry(id: number, entryData: { clientId?: number; hours?: number; description?: string; date?: string }) {
    const response = await this.client.put(`/api/work-entries/${id}`, entryData);
    return response.data;
  }

  /**
   * Deletes a specific work entry by ID.
   * @param id - Work entry ID to delete
   * @returns Promise resolving to success message
   */
  async deleteWorkEntry(id: number) {
    const response = await this.client.delete(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Retrieves a detailed time report for a specific client.
   * @param clientId - Client ID to generate report for
   * @returns Promise resolving to report with work entries and statistics
   */
  async getClientReport(clientId: number) {
    const response = await this.client.get(`/api/reports/client/${clientId}`);
    return response.data;
  }

  /**
   * Exports a client's time report as a CSV file.
   * @param clientId - Client ID to export report for
   * @returns Promise resolving to Blob containing CSV data
   */
  async exportClientReportCsv(clientId: number) {
    const response = await this.client.get(`/api/reports/export/csv/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Exports a client's time report as a PDF document.
   * @param clientId - Client ID to export report for
   * @returns Promise resolving to Blob containing PDF data
   */
  async exportClientReportPdf(clientId: number) {
    const response = await this.client.get(`/api/reports/export/pdf/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Checks the health status of the backend server.
   * @returns Promise resolving to health status object
   */
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
