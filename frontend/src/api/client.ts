/**
 * @fileoverview API client for the Time Tracking application.
 *
 * This module provides a centralized HTTP client for communicating with the
 * backend API. It handles authentication via the x-user-email header,
 * automatic token refresh, and error handling.
 *
 * @module api/client
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

/**
 * Base URL for API requests. Empty string means requests are relative to
 * the current origin, allowing Vite's proxy to forward /api requests to the backend.
 */
const API_BASE_URL = '';

/**
 * API client class that provides methods for all backend API endpoints.
 *
 * Features:
 * - Automatic authentication header injection from localStorage
 * - Automatic redirect to login on 401 responses
 * - Typed request/response handling
 * - Configurable timeout (10 seconds default)
 *
 * @example
 * ```typescript
 * import apiClient from './api/client';
 *
 * // Login
 * await apiClient.login('user@example.com');
 *
 * // Get all clients
 * const { clients } = await apiClient.getClients();
 * ```
 */
class ApiClient {
  /** Axios instance configured with base URL and interceptors */
  private client: AxiosInstance;

  /**
   * Creates a new ApiClient instance with configured interceptors.
   *
   * The constructor sets up:
   * - Request interceptor: Adds x-user-email header from localStorage
   * - Response interceptor: Handles 401 errors by redirecting to login
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

  // =========================================================================
  // AUTHENTICATION ENDPOINTS
  // =========================================================================

  /**
   * Authenticates a user with their email address.
   * Creates a new user account if one doesn't exist.
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
   * @throws Will redirect to /login on 401 response
   */
  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  // =========================================================================
  // CLIENT ENDPOINTS
  // =========================================================================

  /**
   * Retrieves all clients for the authenticated user.
   *
   * @returns Promise resolving to object containing clients array
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
   * @throws 404 if client not found
   */
  async getClient(id: number) {
    const response = await this.client.get(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Creates a new client.
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
   * @throws 404 if client not found
   */
  async updateClient(id: number, clientData: { name?: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.put(`/api/clients/${id}`, clientData);
    return response.data;
  }

  /**
   * Deletes a specific client by ID.
   * Also deletes all associated work entries (cascade delete).
   *
   * @param id - Client ID to delete
   * @returns Promise resolving to deletion confirmation
   * @throws 404 if client not found
   */
  async deleteClient(id: number) {
    const response = await this.client.delete(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Deletes all clients for the authenticated user.
   * Also deletes all associated work entries (cascade delete).
   *
   * @returns Promise resolving to deletion confirmation with count
   */
  async deleteAllClients() {
    const response = await this.client.delete('/api/clients');
    return response.data;
  }

  // =========================================================================
  // WORK ENTRY ENDPOINTS
  // =========================================================================

  /**
   * Retrieves work entries, optionally filtered by client.
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
   * Retrieves a specific work entry by ID.
   *
   * @param id - Work entry ID
   * @returns Promise resolving to work entry object
   * @throws 404 if work entry not found
   */
  async getWorkEntry(id: number) {
    const response = await this.client.get(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Creates a new work entry.
   *
   * @param entryData - Work entry data including clientId, hours, date
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
   * @throws 404 if work entry not found
   */
  async updateWorkEntry(id: number, entryData: { clientId?: number; hours?: number; description?: string; date?: string }) {
    const response = await this.client.put(`/api/work-entries/${id}`, entryData);
    return response.data;
  }

  /**
   * Deletes a specific work entry by ID.
   *
   * @param id - Work entry ID to delete
   * @returns Promise resolving to deletion confirmation
   * @throws 404 if work entry not found
   */
  async deleteWorkEntry(id: number) {
    const response = await this.client.delete(`/api/work-entries/${id}`);
    return response.data;
  }

  // =========================================================================
  // REPORT ENDPOINTS
  // =========================================================================

  /**
   * Retrieves a report for a specific client.
   * Includes aggregated hours and list of work entries.
   *
   * @param clientId - Client ID to generate report for
   * @returns Promise resolving to report data with totalHours and entries
   */
  async getClientReport(clientId: number) {
    const response = await this.client.get(`/api/reports/client/${clientId}`);
    return response.data;
  }

  /**
   * Exports a client report as CSV file.
   *
   * @param clientId - Client ID to export report for
   * @returns Promise resolving to CSV Blob for download
   */
  async exportClientReportCsv(clientId: number) {
    const response = await this.client.get(`/api/reports/export/csv/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Exports a client report as PDF file.
   *
   * @param clientId - Client ID to export report for
   * @returns Promise resolving to PDF Blob for download
   */
  async exportClientReportPdf(clientId: number) {
    const response = await this.client.get(`/api/reports/export/pdf/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // =========================================================================
  // UTILITY ENDPOINTS
  // =========================================================================

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

export const apiClient = new ApiClient();
export default apiClient;
