/**
 * @fileoverview TypeScript type definitions for the Time Tracker API.
 * 
 * This module contains all the interface definitions used for API communication
 * between the frontend and backend. These types ensure type safety when making
 * API calls and handling responses.
 * 
 * @module types/api
 */

// ==================== Entity Types ====================

/**
 * Represents an authenticated user in the system.
 * Users are identified by their email address.
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
  /** Client name (required) */
  name: string;
  /** Optional description of the client or project */
  description: string | null;
  /** Optional department name */
  department: string | null;
  /** Optional contact email for the client */
  email: string | null;
  /** ISO timestamp of when the client was created */
  created_at: string;
  /** ISO timestamp of when the client was last updated */
  updated_at: string;
}

/**
 * Represents a work entry (time log) for a client.
 * Work entries track hours worked on a specific date.
 */
export interface WorkEntry {
  /** Unique identifier for the work entry */
  id: number;
  /** ID of the client this entry belongs to */
  client_id: number;
  /** Number of hours worked (0.01 to 24) */
  hours: number;
  /** Optional description of work performed */
  description: string | null;
  /** Date of the work entry (ISO format: YYYY-MM-DD) */
  date: string;
  /** ISO timestamp of when the entry was created */
  created_at: string;
  /** ISO timestamp of when the entry was last updated */
  updated_at: string;
  /** Client name (included when fetching entries with client info) */
  client_name?: string;
}

/**
 * Work entry with guaranteed client name.
 * Used when work entries are fetched with client information joined.
 */
export interface WorkEntryWithClient extends WorkEntry {
  /** Client name (always present in this type) */
  client_name: string;
}

// ==================== Report Types ====================

/**
 * Aggregated report data for a specific client.
 * Contains all work entries and calculated totals.
 */
export interface ClientReport {
  /** The client this report is for */
  client: Client;
  /** All work entries for this client */
  workEntries: WorkEntry[];
  /** Sum of all hours worked */
  totalHours: number;
  /** Total number of work entries */
  entryCount: number;
}

// ==================== Request Types ====================

/**
 * Request payload for creating a new client.
 */
export interface CreateClientRequest {
  /** Client name (required) */
  name: string;
  /** Optional description */
  description?: string;
  /** Optional department name */
  department?: string;
  /** Optional contact email */
  email?: string;
}

/**
 * Request payload for updating an existing client.
 * All fields are optional - only provided fields will be updated.
 */
export interface UpdateClientRequest {
  /** New client name */
  name?: string;
  /** New description */
  description?: string;
  /** New department name */
  department?: string;
  /** New contact email */
  email?: string;
}

/**
 * Request payload for creating a new work entry.
 */
export interface CreateWorkEntryRequest {
  /** ID of the client this entry is for */
  clientId: number;
  /** Hours worked (0.01 to 24) */
  hours: number;
  /** Optional description of work performed */
  description?: string;
  /** Date of work (ISO format: YYYY-MM-DD) */
  date: string;
}

/**
 * Request payload for updating an existing work entry.
 * All fields are optional - only provided fields will be updated.
 */
export interface UpdateWorkEntryRequest {
  /** New client ID */
  clientId?: number;
  /** New hours value */
  hours?: number;
  /** New description */
  description?: string;
  /** New date */
  date?: string;
}

/**
 * Request payload for user login.
 */
export interface LoginRequest {
  /** User's email address */
  email: string;
}

// ==================== Response Types ====================

/**
 * Response from the login endpoint.
 */
export interface LoginResponse {
  /** Success message */
  message: string;
  /** The authenticated user */
  user: User;
}

/**
 * Generic API response wrapper.
 * Used for standardized error handling across endpoints.
 * 
 * @template T - The type of data in the response
 */
export interface ApiResponse<T> {
  /** Response data (present on success) */
  data?: T;
  /** Error message (present on failure) */
  error?: string;
  /** Additional message (success or info) */
  message?: string;
}
