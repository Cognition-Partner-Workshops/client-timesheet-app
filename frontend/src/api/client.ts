/**
 * @fileoverview API Client for the Time Tracker application.
 * 
 * This module provides a centralized HTTP client for all backend API communications.
 * It handles authentication via email headers, automatic token management, and
 * provides typed methods for all available API endpoints.
 * 
 * @module api/client
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

/**
 * Base URL for API requests.
 * Empty string makes requests relative to the current origin.
 * Vite proxy configuration forwards /api requests to the backend server.
 */
const API_BASE_URL = '';

/**
 * API Client class that encapsulates all HTTP communication with the backend.
 * 
 * Features:
 * - Automatic email header injection for authenticated requests
 * - Centralized error handling with automatic logout on 401 responses
 * - Typed methods for all API endpoints (auth, clients, work entries, reports)
 * 
 * @example
 * ```typescript
 * import apiClient from './api/client';
 * 
 * // Login
 * const { user } = await apiClient.login('user@example.com');
 * 
 * // Fetch clients
 * const { clients } = await apiClient.getClients();
 * ```
 */
class ApiClient {
  /** Axios instance configured with base URL, timeout, and interceptors */
  private client: AxiosInstance;

  /**
   * Creates a new ApiClient instance with configured interceptors.
   * 
   * The constructor sets up:
   * 1. Base axios configuration (URL, timeout, headers)
   * 2. Request interceptor for adding user email to headers
   * 3. Response interceptor for handling 401 unauthorized errors
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
     * Request interceptor: Adds the authenticated user's email to request headers.
     * The backend uses this header (x-user-email) to identify the current user.
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
     * Response interceptor: Handles authentication errors globally.
     * On 401 Unauthorized, clears stored credentials and redirects to login.
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

  // ==================== Authentication Endpoints ====================

  /**
   * Authenticates a user by email address.
   * Creates a new user account if the email doesn't exist.
   * 
   * @param email - The user's email address
   * @returns Promise resolving to login response with user data
   * @throws Error if login fails or network error occurs
   */
  async login(email: string) {
    const response = await this.client.post('/api/auth/login', { email });
    return response.data;
  }

  /**
   * Retrieves the currently authenticated user's information.
   * Requires valid authentication (email in localStorage).
   * 
   * @returns Promise resolving to current user data
   * @throws Error if not authenticated or user not found
   */
  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  // ==================== Client Management Endpoints ====================

  /**
   * Fetches all clients belonging to the authenticated user.
   * 
   * @returns Promise resolving to array of client objects
   */
  async getClients() {
    const response = await this.client.get('/api/clients');
    return response.data;
  }

  /**
   * Fetches a specific client by ID.
   * 
   * @param id - The client's unique identifier
   * @returns Promise resolving to client object
   * @throws Error if client not found or doesn't belong to user
   */
  async getClient(id: number) {
    const response = await this.client.get(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Creates a new client for the authenticated user.
   * 
   * @param clientData - Client creation data
   * @param clientData.name - Required client name
   * @param clientData.description - Optional client description
   * @param clientData.department - Optional department name
   * @param clientData.email - Optional client contact email
   * @returns Promise resolving to created client object
   */
  async createClient(clientData: { name: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.post('/api/clients', clientData);
    return response.data;
  }

  /**
   * Updates an existing client's information.
   * 
   * @param id - The client's unique identifier
   * @param clientData - Partial client data to update
   * @returns Promise resolving to updated client object
   * @throws Error if client not found or doesn't belong to user
   */
  async updateClient(id: number, clientData: { name?: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.put(`/api/clients/${id}`, clientData);
    return response.data;
  }

  /**
   * Deletes a client and all associated work entries (cascade delete).
   * 
   * @param id - The client's unique identifier
   * @returns Promise resolving to deletion confirmation
   * @throws Error if client not found or doesn't belong to user
   */
  async deleteClient(id: number) {
    const response = await this.client.delete(`/api/clients/${id}`);
    return response.data;
  }

  // ==================== Work Entry Endpoints ====================

  /**
   * Fetches work entries, optionally filtered by client.
   * 
   * @param clientId - Optional client ID to filter entries
   * @returns Promise resolving to array of work entry objects
   */
  async getWorkEntries(clientId?: number) {
    const params = clientId ? { clientId } : {};
    const response = await this.client.get('/api/work-entries', { params });
    return response.data;
  }

  /**
   * Fetches a specific work entry by ID.
   * 
   * @param id - The work entry's unique identifier
   * @returns Promise resolving to work entry object
   * @throws Error if entry not found or doesn't belong to user
   */
  async getWorkEntry(id: number) {
    const response = await this.client.get(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Creates a new work entry for time tracking.
   * 
   * @param entryData - Work entry creation data
   * @param entryData.clientId - ID of the client this entry is for
   * @param entryData.hours - Number of hours worked (0.01 to 24)
   * @param entryData.description - Optional description of work performed
   * @param entryData.date - Date of the work entry (ISO format: YYYY-MM-DD)
   * @returns Promise resolving to created work entry object
   */
  async createWorkEntry(entryData: { clientId: number; hours: number; description?: string; date: string }) {
    const response = await this.client.post('/api/work-entries', entryData);
    return response.data;
  }

  /**
   * Updates an existing work entry.
   * 
   * @param id - The work entry's unique identifier
   * @param entryData - Partial work entry data to update
   * @returns Promise resolving to updated work entry object
   * @throws Error if entry not found or doesn't belong to user
   */
  async updateWorkEntry(id: number, entryData: { clientId?: number; hours?: number; description?: string; date?: string }) {
    const response = await this.client.put(`/api/work-entries/${id}`, entryData);
    return response.data;
  }

  /**
   * Deletes a work entry.
   * 
   * @param id - The work entry's unique identifier
   * @returns Promise resolving to deletion confirmation
   * @throws Error if entry not found or doesn't belong to user
   */
  async deleteWorkEntry(id: number) {
    const response = await this.client.delete(`/api/work-entries/${id}`);
    return response.data;
  }

  // ==================== Report Endpoints ====================

  /**
   * Generates a report for a specific client showing all work entries
   * and total hours worked.
   * 
   * @param clientId - The client's unique identifier
   * @returns Promise resolving to report data with entries and totals
   * @throws Error if client not found or doesn't belong to user
   */
  async getClientReport(clientId: number) {
    const response = await this.client.get(`/api/reports/client/${clientId}`);
    return response.data;
  }

  /**
   * Exports a client report as a CSV file.
   * 
   * @param clientId - The client's unique identifier
   * @returns Promise resolving to CSV file as Blob
   * @throws Error if client not found or export fails
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
   * @param clientId - The client's unique identifier
   * @returns Promise resolving to PDF file as Blob
   * @throws Error if client not found or export fails
   */
  async exportClientReportPdf(clientId: number) {
    const response = await this.client.get(`/api/reports/export/pdf/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // ==================== Utility Endpoints ====================

  /**
   * Checks the health status of the backend API.
   * Useful for monitoring and connectivity verification.
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
