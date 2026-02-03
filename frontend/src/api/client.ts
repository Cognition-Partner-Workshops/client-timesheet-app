/**
 * @fileoverview API client for the Client Timesheet application.
 * Provides a centralized HTTP client for all backend API interactions.
 * 
 * @module api/client
 * @description This module exports a singleton ApiClient instance that handles
 * all HTTP requests to the backend API. It automatically manages authentication
 * headers and handles common error scenarios like 401 unauthorized responses.
 * 
 * @example
 * ```typescript
 * import apiClient from './api/client';
 * 
 * // Login
 * const { user } = await apiClient.login('user@example.com');
 * 
 * // Get all clients
 * const { clients } = await apiClient.getClients();
 * 
 * // Create a work entry
 * await apiClient.createWorkEntry({
 *   clientId: 1,
 *   hours: 8,
 *   date: '2024-01-15',
 *   description: 'Development work'
 * });
 * ```
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

/**
 * Base URL for API requests. Empty string means requests are relative to current origin.
 * Vite proxy configuration forwards /api requests to the backend server.
 * @constant {string}
 */
const API_BASE_URL = '';

/**
 * API client class providing methods for all backend API interactions.
 * Implements request/response interceptors for authentication and error handling.
 * 
 * @class ApiClient
 * @description Singleton class that wraps Axios for HTTP requests. Features include:
 * - Automatic injection of user email header for authentication
 * - Automatic redirect to login on 401 responses
 * - Consistent error handling across all endpoints
 * 
 * @example
 * ```typescript
 * const client = new ApiClient();
 * const data = await client.getClients();
 * ```
 */
class ApiClient {
  /** @private Axios instance configured with base URL and interceptors */
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

  /**
   * Authenticates a user by email address.
   * Creates a new user account if one doesn't exist.
   * 
   * @param email - User's email address
   * @returns Promise resolving to user data and success message
   * @throws Error if email is invalid or server error occurs
   * 
   * @example
   * ```typescript
   * const { user, message } = await apiClient.login('user@example.com');
   * console.log(user.email); // 'user@example.com'
   * ```
   */
  async login(email: string) {
    const response = await this.client.post('/api/auth/login', { email });
    return response.data;
  }

  /**
   * Retrieves the currently authenticated user's information.
   * 
   * @returns Promise resolving to current user data
   * @throws Error if not authenticated or user not found
   */
  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  /**
   * Retrieves all clients for the authenticated user.
   * 
   * @returns Promise resolving to array of client objects
   * @example
   * ```typescript
   * const { clients } = await apiClient.getClients();
   * clients.forEach(client => console.log(client.name));
   * ```
   */
  async getClients() {
    const response = await this.client.get('/api/clients');
    return response.data;
  }

  /**
   * Retrieves a specific client by ID.
   * 
   * @param id - Client ID
   * @returns Promise resolving to client object
   * @throws Error if client not found or not owned by user
   */
  async getClient(id: number) {
    const response = await this.client.get(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Creates a new client.
   * 
   * @param clientData - Client creation data
   * @param clientData.name - Client name (required)
   * @param clientData.description - Optional client description
   * @param clientData.department - Optional client department
   * @param clientData.email - Optional client email
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
   * @param clientData - Fields to update (partial update supported)
   * @param clientData.name - Optional updated client name
   * @param clientData.description - Optional updated description
   * @param clientData.department - Optional updated department
   * @param clientData.email - Optional updated email
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
   * @warning This action cannot be undone
   */
  async deleteClient(id: number) {
    const response = await this.client.delete(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Retrieves all work entries, optionally filtered by client.
   * 
   * @param clientId - Optional client ID to filter by
   * @returns Promise resolving to array of work entry objects
   * 
   * @example
   * ```typescript
   * // Get all entries
   * const { workEntries } = await apiClient.getWorkEntries();
   * 
   * // Get entries for specific client
   * const { workEntries } = await apiClient.getWorkEntries(1);
   * ```
   */
  async getWorkEntries(clientId?: number) {
    const params = clientId ? { clientId } : {};
    const response = await this.client.get('/api/work-entries', { params });
    return response.data;
  }

  /**
   * Retrieves a specific work entry by ID.
   * 
   * @param id - Work entry ID
   * @returns Promise resolving to work entry object
   */
  async getWorkEntry(id: number) {
    const response = await this.client.get(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Creates a new work entry (logs time for a client).
   * 
   * @param entryData - Work entry data
   * @param entryData.clientId - ID of the client to log time for
   * @param entryData.hours - Hours worked (0.01 to 24.00)
   * @param entryData.date - Date of work (YYYY-MM-DD format)
   * @param entryData.description - Optional description of work performed
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
   * @param entryData - Fields to update (partial update supported)
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
   * Retrieves an aggregated report for a specific client.
   * Includes total hours, entry count, and all work entries.
   * 
   * @param clientId - Client ID to generate report for
   * @returns Promise resolving to report object with client, workEntries, totalHours, entryCount
   */
  async getClientReport(clientId: number) {
    const response = await this.client.get(`/api/reports/client/${clientId}`);
    return response.data;
  }

  /**
   * Exports a client report as a CSV file.
   * 
   * @param clientId - Client ID to export report for
   * @returns Promise resolving to Blob containing CSV data
   * 
   * @example
   * ```typescript
   * const blob = await apiClient.exportClientReportCsv(1);
   * const url = URL.createObjectURL(blob);
   * // Create download link with url
   * ```
   */
  async exportClientReportCsv(clientId: number) {
    const response = await this.client.get(`/api/reports/export/csv/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Exports a client report as a PDF file.
   * 
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
   * Checks if the backend server is healthy and responsive.
   * 
   * @returns Promise resolving to health status object with status and timestamp
   */
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
