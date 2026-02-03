/**
 * @fileoverview TypeScript type definitions for the Client Timesheet Application API.
 * Contains interfaces for all data models, request payloads, and API responses
 * used throughout the frontend application.
 * 
 * @module types/api
 */

/**
 * Represents an authenticated user in the system.
 * Users are identified by their email address.
 */
export interface User {
  /** User's email address (serves as unique identifier) */
  email: string;
  /** ISO timestamp of when the user account was created */
  createdAt: string;
}

/**
 * Represents a client/project that work entries can be logged against.
 * Clients are owned by specific users and support cascade deletion.
 */
export interface Client {
  /** Unique identifier for the client */
  id: number;
  /** Display name of the client */
  name: string;
  /** Optional description of the client or project */
  description: string | null;
  /** Optional department or team associated with the client */
  department: string | null;
  /** Optional contact email for the client */
  email: string | null;
  /** ISO timestamp of when the client was created */
  created_at: string;
  /** ISO timestamp of when the client was last updated */
  updated_at: string;
}

/**
 * Represents a time tracking entry for work performed.
 * Each entry is associated with a specific client and user.
 */
export interface WorkEntry {
  /** Unique identifier for the work entry */
  id: number;
  /** ID of the client this entry belongs to */
  client_id: number;
  /** Number of hours worked (0.01-24) */
  hours: number;
  /** Optional description of the work performed */
  description: string | null;
  /** Date when the work was performed (ISO format) */
  date: string;
  /** ISO timestamp of when the entry was created */
  created_at: string;
  /** ISO timestamp of when the entry was last updated */
  updated_at: string;
  /** Name of the associated client (included in joined queries) */
  client_name?: string;
}

/**
 * Work entry with guaranteed client name.
 * Used when work entries are fetched with client information joined.
 */
export interface WorkEntryWithClient extends WorkEntry {
  /** Name of the associated client (always present) */
  client_name: string;
}

/**
 * Aggregated report data for a specific client.
 * Contains summary statistics and all work entries for the client.
 */
export interface ClientReport {
  /** The client this report is for */
  client: Client;
  /** All work entries for this client */
  workEntries: WorkEntry[];
  /** Sum of all hours worked for this client */
  totalHours: number;
  /** Total number of work entries for this client */
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
  /** Optional contact email */
  email?: string;
}

/**
 * Request payload for updating an existing client.
 * All fields are optional for partial updates.
 */
export interface UpdateClientRequest {
  /** Updated client name */
  name?: string;
  /** Updated description */
  description?: string;
  /** Updated department */
  department?: string;
  /** Updated contact email */
  email?: string;
}

/**
 * Request payload for creating a new work entry.
 */
export interface CreateWorkEntryRequest {
  /** ID of the client this entry belongs to */
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
 * All fields are optional for partial updates.
 */
export interface UpdateWorkEntryRequest {
  /** Updated client ID */
  clientId?: number;
  /** Updated hours worked */
  hours?: number;
  /** Updated description */
  description?: string;
  /** Updated date */
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
 * Response from successful login request.
 */
export interface LoginResponse {
  /** Success message */
  message: string;
  /** Authenticated user information */
  user: User;
}

/**
 * Generic API response wrapper.
 * Used for consistent response handling across the application.
 * 
 * @template T - The type of data contained in the response
 */
export interface ApiResponse<T> {
  /** Response data (present on success) */
  data?: T;
  /** Error message (present on failure) */
  error?: string;
  /** Additional message from the server */
  message?: string;
}
