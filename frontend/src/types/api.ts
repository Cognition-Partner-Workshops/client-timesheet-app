/**
 * @fileoverview TypeScript type definitions for the Time Tracker API.
 * Contains interfaces for all data models, request/response types used
 * throughout the frontend application.
 * @module types/api
 */

/**
 * Represents a user in the system.
 */
export interface User {
  /** User's email address (unique identifier) */
  email: string;
  /** Timestamp when the user was created */
  createdAt: string;
}

/**
 * Represents a client entity in the system.
 */
export interface Client {
  /** Unique identifier for the client */
  id: number;
  /** Client name */
  name: string;
  /** Optional description of the client */
  description: string | null;
  /** Optional department the client belongs to */
  department: string | null;
  /** Optional email address for the client */
  email: string | null;
  /** Timestamp when the client was created */
  created_at: string;
  /** Timestamp when the client was last updated */
  updated_at: string;
}

/**
 * Represents a work entry (time tracking record).
 */
export interface WorkEntry {
  /** Unique identifier for the work entry */
  id: number;
  /** ID of the associated client */
  client_id: number;
  /** Number of hours worked */
  hours: number;
  /** Optional description of work performed */
  description: string | null;
  /** Date of the work entry (YYYY-MM-DD format) */
  date: string;
  /** Timestamp when the entry was created */
  created_at: string;
  /** Timestamp when the entry was last updated */
  updated_at: string;
  /** Name of the associated client (included in some responses) */
  client_name?: string;
}

/**
 * Work entry with guaranteed client name (used in list views).
 */
export interface WorkEntryWithClient extends WorkEntry {
  /** Name of the associated client (always present) */
  client_name: string;
}

/**
 * Report data for a specific client including work entries and summary.
 */
export interface ClientReport {
  /** The client this report is for */
  client: Client;
  /** All work entries for this client */
  workEntries: WorkEntry[];
  /** Total hours worked across all entries */
  totalHours: number;
  /** Number of work entries */
  entryCount: number;
}

/**
 * Request payload for creating a new client.
 */
export interface CreateClientRequest {
  /** Client name (required) */
  name: string;
  /** Optional description */
  description?: string;
  /** Optional department */
  department?: string;
  /** Optional email address */
  email?: string;
}

/**
 * Request payload for updating an existing client.
 */
export interface UpdateClientRequest {
  /** Updated client name */
  name?: string;
  /** Updated description */
  description?: string;
  /** Updated department */
  department?: string;
  /** Updated email address */
  email?: string;
}

/**
 * Request payload for creating a new work entry.
 */
export interface CreateWorkEntryRequest {
  /** ID of the client this entry is for (required) */
  clientId: number;
  /** Number of hours worked (required) */
  hours: number;
  /** Optional description of work performed */
  description?: string;
  /** Date of work entry in YYYY-MM-DD format (required) */
  date: string;
}

/**
 * Request payload for updating an existing work entry.
 */
export interface UpdateWorkEntryRequest {
  /** Updated client ID */
  clientId?: number;
  /** Updated hours worked */
  hours?: number;
  /** Updated description */
  description?: string;
  /** Updated date in YYYY-MM-DD format */
  date?: string;
}

/**
 * Request payload for user login.
 */
export interface LoginRequest {
  /** User's email address */
  email: string;
}

/**
 * Response from successful login.
 */
export interface LoginResponse {
  /** Success message */
  message: string;
  /** Authenticated user data */
  user: User;
}

/**
 * Generic API response wrapper.
 * @template T - Type of the response data
 */
export interface ApiResponse<T> {
  /** Response data on success */
  data?: T;
  /** Error message on failure */
  error?: string;
  /** Additional message */
  message?: string;
}
