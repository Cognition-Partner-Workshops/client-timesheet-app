/**
 * @fileoverview API client for communicating with the backend server.
 *
 * This module provides a centralized HTTP client using Axios for all API calls.
 * It handles authentication by automatically attaching the user email header
 * and manages error responses including automatic logout on 401 errors.
 *
 * @module api/client
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

/**
 * Base URL for API requests.
 * Empty string makes requests relative to current origin, allowing Vite proxy to work.
 */
const API_BASE_URL = '';

/**
 * API client class providing methods for all backend API endpoints.
 *
 * Features:
 * - Automatic email header injection for authentication
 * - Automatic redirect to login on 401 responses
 * - Configurable timeout (10 seconds)
 *
 * @class ApiClient
 */
class ApiClient {
  /** @private Axios instance for making HTTP requests */
  private client: AxiosInstance;

  /**
   * Creates a new ApiClient instance with configured interceptors.
   * Sets up request interceptor for auth headers and response interceptor for error handling.
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
   * Authenticates user with email address.
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Login response with user data
   */
  async login(email: string) {
    const response = await this.client.post('/api/auth/login', { email });
    return response.data;
  }

  /**
   * Retrieves the current authenticated user's profile.
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  /**
   * Retrieves all clients for the authenticated user.
   * @returns {Promise<Object>} Object containing array of clients
   */
  async getClients() {
    const response = await this.client.get('/api/clients');
    return response.data;
  }

  /**
   * Retrieves a specific client by ID.
   * @param {number} id - Client ID
   * @returns {Promise<Object>} Client data
   */
  async getClient(id: number) {
    const response = await this.client.get(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Creates a new client.
   * @param {Object} clientData - Client creation data
   * @param {string} clientData.name - Client name
   * @param {string} [clientData.description] - Optional description
   * @returns {Promise<Object>} Created client data
   */
  async createClient(clientData: { name: string; description?: string }) {
    const response = await this.client.post('/api/clients', clientData);
    return response.data;
  }

  /**
   * Updates an existing client.
   * @param {number} id - Client ID
   * @param {Object} clientData - Updated client data
   * @returns {Promise<Object>} Updated client data
   */
  async updateClient(id: number, clientData: { name?: string; description?: string }) {
    const response = await this.client.put(`/api/clients/${id}`, clientData);
    return response.data;
  }

  /**
   * Deletes a client and all associated work entries.
   * @param {number} id - Client ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteClient(id: number) {
    const response = await this.client.delete(`/api/clients/${id}`);
    return response.data;
  }

  /**
   * Retrieves all work entries, optionally filtered by client.
   * @param {number} [clientId] - Optional client ID to filter entries
   * @returns {Promise<Object>} Object containing array of work entries
   */
  async getWorkEntries(clientId?: number) {
    const params = clientId ? { clientId } : {};
    const response = await this.client.get('/api/work-entries', { params });
    return response.data;
  }

  /**
   * Retrieves a specific work entry by ID.
   * @param {number} id - Work entry ID
   * @returns {Promise<Object>} Work entry data with client name
   */
  async getWorkEntry(id: number) {
    const response = await this.client.get(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Creates a new work entry.
   * @param {Object} entryData - Work entry creation data
   * @param {number} entryData.clientId - Associated client ID
   * @param {number} entryData.hours - Hours worked (0.01-24)
   * @param {string} [entryData.description] - Optional description
   * @param {string} entryData.date - Work date in ISO format
   * @returns {Promise<Object>} Created work entry data
   */
  async createWorkEntry(entryData: { clientId: number; hours: number; description?: string; date: string }) {
    const response = await this.client.post('/api/work-entries', entryData);
    return response.data;
  }

  /**
   * Updates an existing work entry.
   * @param {number} id - Work entry ID
   * @param {Object} entryData - Updated work entry data
   * @returns {Promise<Object>} Updated work entry data
   */
  async updateWorkEntry(id: number, entryData: { clientId?: number; hours?: number; description?: string; date?: string }) {
    const response = await this.client.put(`/api/work-entries/${id}`, entryData);
    return response.data;
  }

  /**
   * Deletes a work entry.
   * @param {number} id - Work entry ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteWorkEntry(id: number) {
    const response = await this.client.delete(`/api/work-entries/${id}`);
    return response.data;
  }

  /**
   * Retrieves a time report for a specific client.
   * @param {number} clientId - Client ID
   * @returns {Promise<Object>} Report with total hours, entry count, and work entries
   */
  async getClientReport(clientId: number) {
    const response = await this.client.get(`/api/reports/client/${clientId}`);
    return response.data;
  }

  /**
   * Exports client report as CSV file.
   * @param {number} clientId - Client ID
   * @returns {Promise<Blob>} CSV file as blob for download
   */
  async exportClientReportCsv(clientId: number) {
    const response = await this.client.get(`/api/reports/export/csv/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Exports client report as PDF file.
   * @param {number} clientId - Client ID
   * @returns {Promise<Blob>} PDF file as blob for download
   */
  async exportClientReportPdf(clientId: number) {
    const response = await this.client.get(`/api/reports/export/pdf/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Checks server health status.
   * @returns {Promise<Object>} Health status with timestamp
   */
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

/**
 * Singleton API client instance for use throughout the application.
 * @type {ApiClient}
 */
export const apiClient = new ApiClient();
export default apiClient;
