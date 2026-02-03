/**
 * @fileoverview API client for the Client Timesheet Application frontend.
 * Provides a centralized HTTP client with authentication handling, error interceptors,
 * and typed methods for all backend API endpoints.
 * 
 * @module api/client
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

/**
 * Base URL for API requests.
 * Empty string makes requests relative to the current origin,
 * allowing Vite proxy to forward /api requests to the backend.
 */
const API_BASE_URL = '';

/**
 * Centralized API client class for making HTTP requests to the backend.
 * Handles authentication via x-user-email header and provides automatic
 * redirect to login on 401 responses.
 * 
 * @example
 * import apiClient from './api/client';
 * 
 * // Fetch all clients
 * const { clients } = await apiClient.getClients();
 * 
 * // Create a new work entry
 * await apiClient.createWorkEntry({ clientId: 1, hours: 8, date: '2024-01-01' });
 */
class ApiClient {
  /** Axios instance configured with base URL and interceptors */
  private client: AxiosInstance;

  /**
   * Creates a new ApiClient instance with configured interceptors.
   * Sets up request interceptor for authentication and response interceptor for error handling.
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
     * Request interceptor that adds the x-user-email header for authentication.
     * Retrieves the user email from localStorage on each request.
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
     * Clears stored credentials and redirects to login on 401 responses.
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
   * @param email - User's email address
   * @returns Promise resolving to login response with user data
   */
  async login(email: string) {
    const response = await this.client.post('/api/auth/login', { email });
    return response.data;
  }

  /**
   * Retrieves the currently authenticated user's information.
   * 
   * @returns Promise resolving to current user data
   */
  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  /**
   * Fetches all clients belonging to the authenticated user.
   * 
   * @returns Promise resolving to object containing clients array
   */
  async getClients() {
    const response = await this.client.get('/api/clients');
    return response.data;
  }

  /**
   * Fetches a specific client by ID.
   * 
   * @param id - Client ID to retrieve
   * @returns Promise resolving to client object
   */
  async getClient(id: number) {
    const response = await this.client.get(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Creates a new client for the authenticated user.
   * 
   * @param clientData - Client data including name and optional fields
   * @returns Promise resolving to created client object
   */
  async createClient(clientData: { name: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.post('/api/clients', clientData);
    return response.data;
  }

  /**
   * Updates an existing client.
   * 
   * @param id - Client ID to update
   * @param clientData - Partial client data to update
   * @returns Promise resolving to updated client object
   */
  async updateClient(id: number, clientData: { name?: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.put(`/api/clients/${id}`, clientData);
    return response.data;
  }

  /**
   * Deletes a client and all associated work entries.
   * 
   * @param id - Client ID to delete
   * @returns Promise resolving to success message
   */
  async deleteClient(id: number) {
    const response = await this.client.delete(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Deletes all clients for the authenticated user.
   * Also deletes all associated work entries due to cascade delete.
   * 
   * @returns Promise resolving to success message with deleted count
   */
  async deleteAllClients() {
    const response = await this.client.delete('/api/clients');
    return response.data;
  }

  /**
   * Fetches all work entries for the authenticated user.
   * Optionally filters by client ID.
   * 
   * @param clientId - Optional client ID to filter entries
   * @returns Promise resolving to object containing workEntries array
   */
  async getWorkEntries(clientId?: number) {
    const params = clientId ? { clientId } : {};
    const response = await this.client.get('/api/work-entries', { params });
    return response.data;
  }

  /**
   * Fetches a specific work entry by ID.
   * 
   * @param id - Work entry ID to retrieve
   * @returns Promise resolving to work entry object
   */
  async getWorkEntry(id: number) {
    const response = await this.client.get(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Creates a new work entry for the authenticated user.
   * 
   * @param entryData - Work entry data including clientId, hours, and date
   * @returns Promise resolving to created work entry object
   */
  async createWorkEntry(entryData: { clientId: number; hours: number; description?: string; date: string }) {
    const response = await this.client.post('/api/work-entries', entryData);
    return response.data;
  }

  /**
   * Updates an existing work entry.
   * 
   * @param id - Work entry ID to update
   * @param entryData - Partial work entry data to update
   * @returns Promise resolving to updated work entry object
   */
  async updateWorkEntry(id: number, entryData: { clientId?: number; hours?: number; description?: string; date?: string }) {
    const response = await this.client.put(`/api/work-entries/${id}`, entryData);
    return response.data;
  }

  /**
   * Deletes a work entry.
   * 
   * @param id - Work entry ID to delete
   * @returns Promise resolving to success message
   */
  async deleteWorkEntry(id: number) {
    const response = await this.client.delete(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Fetches a detailed time report for a specific client.
   * Includes aggregated statistics and all work entries.
   * 
   * @param clientId - Client ID to generate report for
   * @returns Promise resolving to client report object
   */
  async getClientReport(clientId: number) {
    const response = await this.client.get(`/api/reports/client/${clientId}`);
    return response.data;
  }

  /**
   * Exports a client's time report as a CSV file.
   * 
   * @param clientId - Client ID to export report for
   * @returns Promise resolving to CSV file as Blob
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
   * @param clientId - Client ID to export report for
   * @returns Promise resolving to PDF file as Blob
   */
  async exportClientReportPdf(clientId: number) {
    const response = await this.client.get(`/api/reports/export/pdf/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Performs a health check on the backend API.
   * 
   * @returns Promise resolving to health status object
   */
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

/**
 * Singleton instance of the API client.
 * Use this exported instance throughout the application.
 */
export const apiClient = new ApiClient();
export default apiClient;
