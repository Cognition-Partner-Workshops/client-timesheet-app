/**
 * @fileoverview API client for the Time Tracker frontend application.
 * Provides methods for all backend API interactions including authentication,
 * client management, work entries, and report generation.
 * @module api/client
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

/**
 * Base URL for API requests. Empty string makes requests relative to current origin.
 * Vite proxy forwards /api requests to the backend server.
 */
const API_BASE_URL = '';

/**
 * API client class that handles all HTTP requests to the backend.
 * Uses axios with interceptors for authentication and error handling.
 * Implements singleton pattern via exported instance.
 */
class ApiClient {
  /** Axios instance configured with base URL and interceptors */
  private client: AxiosInstance;

  /**
   * Creates a new ApiClient instance with configured axios client.
   * Sets up request interceptor for authentication headers and
   * response interceptor for error handling.
   */
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

  /**
   * Authenticates a user by email address.
   * Creates a new user if one doesn't exist.
   * @param email - User's email address
   * @returns Promise resolving to login response with user data
   */
  async login(email: string) {
    const response = await this.client.post('/api/auth/login', { email });
    return response.data;
  }

  /**
   * Retrieves the currently authenticated user's information.
   * @returns Promise resolving to current user data
   */
  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  /**
   * Retrieves all clients for the authenticated user.
   * @returns Promise resolving to array of clients
   */
  async getClients() {
    const response = await this.client.get('/api/clients');
    return response.data;
  }

  /**
   * Retrieves a specific client by ID.
   * @param id - Client ID
   * @returns Promise resolving to client data
   */
  async getClient(id: number) {
    const response = await this.client.get(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Creates a new client for the authenticated user.
   * @param clientData - Client data including name and optional fields
   * @returns Promise resolving to created client data
   */
  async createClient(clientData: { name: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.post('/api/clients', clientData);
    return response.data;
  }

  /**
   * Updates an existing client.
   * @param id - Client ID to update
   * @param clientData - Fields to update
   * @returns Promise resolving to updated client data
   */
  async updateClient(id: number, clientData: { name?: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.put(`/api/clients/${id}`, clientData);
    return response.data;
  }

  /**
   * Deletes a specific client by ID.
   * @param id - Client ID to delete
   * @returns Promise resolving to deletion confirmation
   */
  async deleteClient(id: number) {
    const response = await this.client.delete(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Deletes all clients for the authenticated user.
   * @returns Promise resolving to deletion confirmation
   */
  async deleteAllClients() {
    const response = await this.client.delete('/api/clients');
    return response.data;
  }

  /**
   * Retrieves all work entries for the authenticated user.
   * @param clientId - Optional client ID to filter entries
   * @returns Promise resolving to array of work entries
   */
  async getWorkEntries(clientId?: number) {
    const params = clientId ? { clientId } : {};
    const response = await this.client.get('/api/work-entries', { params });
    return response.data;
  }

  /**
   * Retrieves a specific work entry by ID.
   * @param id - Work entry ID
   * @returns Promise resolving to work entry data
   */
  async getWorkEntry(id: number) {
    const response = await this.client.get(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Creates a new work entry.
   * @param entryData - Work entry data including clientId, hours, and date
   * @returns Promise resolving to created work entry data
   */
  async createWorkEntry(entryData: { clientId: number; hours: number; description?: string; date: string }) {
    const response = await this.client.post('/api/work-entries', entryData);
    return response.data;
  }

  /**
   * Updates an existing work entry.
   * @param id - Work entry ID to update
   * @param entryData - Fields to update
   * @returns Promise resolving to updated work entry data
   */
  async updateWorkEntry(id: number, entryData: { clientId?: number; hours?: number; description?: string; date?: string }) {
    const response = await this.client.put(`/api/work-entries/${id}`, entryData);
    return response.data;
  }

  /**
   * Deletes a specific work entry by ID.
   * @param id - Work entry ID to delete
   * @returns Promise resolving to deletion confirmation
   */
  async deleteWorkEntry(id: number) {
    const response = await this.client.delete(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Retrieves a detailed report for a specific client.
   * @param clientId - Client ID to generate report for
   * @returns Promise resolving to client report with work entries and totals
   */
  async getClientReport(clientId: number) {
    const response = await this.client.get(`/api/reports/client/${clientId}`);
    return response.data;
  }

  /**
   * Exports a client report as CSV file.
   * @param clientId - Client ID to export report for
   * @returns Promise resolving to CSV blob data
   */
  async exportClientReportCsv(clientId: number) {
    const response = await this.client.get(`/api/reports/export/csv/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Exports a client report as PDF file.
   * @param clientId - Client ID to export report for
   * @returns Promise resolving to PDF blob data
   */
  async exportClientReportPdf(clientId: number) {
    const response = await this.client.get(`/api/reports/export/pdf/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Performs a health check on the backend server.
   * @returns Promise resolving to health status
   */
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

/** Singleton instance of the API client for use throughout the application */
export const apiClient = new ApiClient();
export default apiClient;
