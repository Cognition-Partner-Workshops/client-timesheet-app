/**
 * @fileoverview TypeScript type definitions for API data structures.
 * Defines interfaces for all entities, request payloads, and response types
 * used throughout the frontend application.
 */

/**
 * Represents an authenticated user in the system.
 */
export interface User {
  /** User's email address (unique identifier) */
  email: string;
  /** ISO timestamp of when the user account was created */
  createdAt: string;
}

/**
 * Represents a client entity for time tracking.
 * Clients are owned by users and can have multiple work entries.
 */
export interface Client {
  /** Unique identifier for the client */
  id: number;
  /** Display name of the client */
  name: string;
  /** Optional description of the client */
  description: string | null;
  /** ISO timestamp of when the client was created */
  created_at: string;
  /** ISO timestamp of when the client was last updated */
  updated_at: string;
}

/**
 * Represents a work entry (time tracking record).
 * Work entries are linked to both a client and a user.
 */
export interface WorkEntry {
  /** Unique identifier for the work entry */
  id: number;
  /** ID of the associated client */
  client_id: number;
  /** Number of hours worked (0.01-24) */
  hours: number;
  /** Optional description of work performed */
  description: string | null;
  /** Date of work in ISO format (YYYY-MM-DD) */
  date: string;
  /** ISO timestamp of when the entry was created */
  created_at: string;
  /** ISO timestamp of when the entry was last updated */
  updated_at: string;
  /** Name of the associated client (included in some API responses) */
  client_name?: string;
}

/**
 * Work entry with guaranteed client name.
 * Used when client name is always included in the response.
 */
export interface WorkEntryWithClient extends WorkEntry {
  /** Name of the associated client */
  client_name: string;
}

/**
 * Report data for a specific client's time tracking.
 * Includes aggregated statistics and all work entries.
 */
export interface ClientReport {
  /** The client this report is for */
  client: Client;
  /** All work entries for this client */
  workEntries: WorkEntry[];
  /** Sum of all hours across work entries */
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
 * At least one field must be provided.
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
  /** ID of the client to associate with this entry */
  clientId: number;
  /** Hours worked (0.01-24) */
  hours: number;
  /** Optional description of work performed */
  description?: string;
  /** Date of work in ISO format (YYYY-MM-DD) */
  date: string;
}

/**
 * Request payload for updating an existing work entry.
 * At least one field must be provided.
 */
export interface UpdateWorkEntryRequest {
  /** New client ID to associate with entry */
  clientId?: number;
  /** Updated hours worked (0.01-24) */
  hours?: number;
  /** Updated description */
  description?: string;
  /** Updated date in ISO format */
  date?: string;
}

/**
 * Request payload for user login.
 */
export interface LoginRequest {
  /** User's email address for authentication */
  email: string;
}

/**
 * Response from successful login request.
 */
export interface LoginResponse {
  /** Success message from server */
  message: string;
  /** Authenticated user data */
  user: User;
}

/**
 * Generic API response wrapper.
 * Used for consistent response handling across endpoints.
 *
 * @template T - Type of the data payload
 */
export interface ApiResponse<T> {
  /** Response data on success */
  data?: T;
  /** Error message on failure */
  error?: string;
  /** Additional message from server */
  message?: string;
}
