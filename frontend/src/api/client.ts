/**
 * @fileoverview API client for communicating with the backend server.
 * This module provides a centralized HTTP client with automatic authentication
 * header injection and error handling.
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

/**
 * Base URL for API requests. Empty string makes requests relative to current origin,
 * allowing Vite proxy to forward /api requests to the backend during development.
 */
const API_BASE_URL = '';

/**
 * Centralized API client class for making HTTP requests to the backend.
 * Handles authentication via x-user-email header and provides methods for all API endpoints.
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
   * Creates a new ApiClient instance with configured interceptors.
   * Request interceptor adds x-user-email header from localStorage.
   * Response interceptor handles 401 errors by redirecting to login.
   */
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
   * Authenticates a user by email. Creates a new account if the email doesn't exist.
   * @param email - User's email address
   * @returns Login response with user data
   */
  async login(email: string) {
    const response = await this.client.post('/api/auth/login', { email });
    return response.data;
  }

  /**
   * Retrieves the currently authenticated user's information.
   * @returns User data including email and creation date
   */
  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  /**
   * Fetches all clients belonging to the authenticated user.
   * @returns Object containing array of client objects
   */
  async getClients() {
    const response = await this.client.get('/api/clients');
    return response.data;
  }

  /**
   * Fetches a specific client by ID.
   * @param id - Client ID
   * @returns Object containing the client data
   */
  async getClient(id: number) {
    const response = await this.client.get(`/api/clients/${id}`);
    return response.data;
  }

/**
   * Creates a new client for the authenticated user.
   * @param clientData - Client creation data
   * @returns Created client object with success message
   */
  async createClient(clientData: { name: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.post('/api/clients', clientData);
    return response.data;
  }

/**
   * Updates an existing client.
   * @param id - Client ID to update
   * @param clientData - Fields to update
   * @returns Updated client object with success message
   */
  async updateClient(id: number, clientData: { name?: string; description?: string; department?: string; email?: string }) {
    const response = await this.client.put(`/api/clients/${id}`, clientData);
    return response.data;
  }

  /**
   * Deletes a client and all associated work entries.
   * @param id - Client ID to delete
   * @returns Success message
   */
  async deleteClient(id: number) {
    const response = await this.client.delete(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Fetches work entries for the authenticated user.
   * @param clientId - Optional client ID to filter entries
   * @returns Object containing array of work entry objects
   */
  async getWorkEntries(clientId?: number) {
    const params = clientId ? { clientId } : {};
    const response = await this.client.get('/api/work-entries', { params });
    return response.data;
  }

  /**
   * Fetches a specific work entry by ID.
   * @param id - Work entry ID
   * @returns Object containing the work entry data
   */
  async getWorkEntry(id: number) {
    const response = await this.client.get(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Creates a new work entry for the authenticated user.
   * @param entryData - Work entry creation data
   * @returns Created work entry object with success message
   */
  async createWorkEntry(entryData: { clientId: number; hours: number; description?: string; date: string }) {
    const response = await this.client.post('/api/work-entries', entryData);
    return response.data;
  }

  /**
   * Updates an existing work entry.
   * @param id - Work entry ID to update
   * @param entryData - Fields to update
   * @returns Updated work entry object with success message
   */
  async updateWorkEntry(id: number, entryData: { clientId?: number; hours?: number; description?: string; date?: string }) {
    const response = await this.client.put(`/api/work-entries/${id}`, entryData);
    return response.data;
  }

  /**
   * Deletes a work entry.
   * @param id - Work entry ID to delete
   * @returns Success message
   */
  async deleteWorkEntry(id: number) {
    const response = await this.client.delete(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Fetches a detailed report for a specific client.
   * @param clientId - Client ID to generate report for
   * @returns Report object with client info, work entries, and statistics
   */
  async getClientReport(clientId: number) {
    const response = await this.client.get(`/api/reports/client/${clientId}`);
    return response.data;
  }

  /**
   * Exports a client's work entries as a CSV file.
   * @param clientId - Client ID to export
   * @returns Blob containing CSV data
   */
  async exportClientReportCsv(clientId: number) {
    const response = await this.client.get(`/api/reports/export/csv/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Exports a client's work entries as a PDF report.
   * @param clientId - Client ID to export
   * @returns Blob containing PDF data
   */
  async exportClientReportPdf(clientId: number) {
    const response = await this.client.get(`/api/reports/export/pdf/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Checks if the backend server is healthy and responding.
   * @returns Health status object with timestamp
   */
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
