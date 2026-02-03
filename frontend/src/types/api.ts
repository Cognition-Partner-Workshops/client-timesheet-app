/**
 * @fileoverview TypeScript type definitions for API requests and responses.
 * These interfaces define the shape of data exchanged between the frontend and backend.
 */

/**
 * Represents an authenticated user in the system.
 */
export interface User {
  /** User's email address (serves as unique identifier) */
  email: string;
  /** ISO 8601 timestamp of when the user account was created */
  createdAt: string;
}

/**
 * Represents a client entity that work entries can be logged against.
 */
export interface Client {
  /** Unique identifier for the client */
  id: number;
  /** Display name of the client */
  name: string;
  /** Optional description of the client */
  description: string | null;
  /** ISO 8601 timestamp of when the client was created */
  created_at: string;
  /** ISO 8601 timestamp of when the client was last updated */
  updated_at: string;
}

/**
 * Represents a time tracking entry for work performed.
 */
export interface WorkEntry {
  /** Unique identifier for the work entry */
  id: number;
  /** ID of the associated client */
  client_id: number;
  /** Number of hours worked (0.01-24) */
  hours: number;
  /** Optional description of the work performed */
  description: string | null;
  /** Date when the work was performed (YYYY-MM-DD format) */
  date: string;
  /** ISO 8601 timestamp of when the entry was created */
  created_at: string;
  /** ISO 8601 timestamp of when the entry was last updated */
  updated_at: string;
  /** Name of the associated client (included in some API responses) */
  client_name?: string;
}

/**
 * Work entry with guaranteed client name (used when client info is always included).
 */
export interface WorkEntryWithClient extends WorkEntry {
  /** Name of the associated client */
  client_name: string;
}

/**
 * Report data for a specific client including aggregated statistics.
 */
export interface ClientReport {
  /** The client this report is for */
  client: Client;
  /** Array of all work entries for this client */
  workEntries: WorkEntry[];
  /** Sum of all hours worked for this client */
  totalHours: number;
  /** Total number of work entries */
  entryCount: number;
}

/**
 * Request payload for creating a new client.
 */
export interface CreateClientRequest {
  /** Client name (required, 1-255 characters) */
  name: string;
  /** Optional client description (max 1000 characters) */
  description?: string;
}

/**
 * Request payload for updating an existing client.
 */
export interface UpdateClientRequest {
  /** Updated client name (1-255 characters) */
  name?: string;
  /** Updated description (max 1000 characters) */
  description?: string;
}

/**
 * Request payload for creating a new work entry.
 */
export interface CreateWorkEntryRequest {
  /** ID of the client to log time against */
  clientId: number;
  /** Hours worked (0.01-24) */
  hours: number;
  /** Optional description of work performed */
  description?: string;
  /** Date of work (ISO 8601 format) */
  date: string;
}

/**
 * Request payload for updating an existing work entry.
 */
export interface UpdateWorkEntryRequest {
  /** New client ID */
  clientId?: number;
  /** Updated hours (0.01-24) */
  hours?: number;
  /** Updated description */
  description?: string;
  /** Updated date (ISO 8601 format) */
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
 * Generic API response wrapper for typed responses.
 * @template T - The type of data contained in the response
 */
export interface ApiResponse<T> {
  /** Response data on success */
  data?: T;
  /** Error message on failure */
  error?: string;
  /** Additional message (success or info) */
  message?: string;
}
