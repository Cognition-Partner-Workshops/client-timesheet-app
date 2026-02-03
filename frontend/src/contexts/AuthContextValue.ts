/**
 * @fileoverview Authentication context value definitions for the Time Tracker application.
 * Provides type definitions and context creation for authentication state management.
 * @module contexts/AuthContextValue
 */

import { createContext } from 'react';
import { type User } from '../types/api';

/**
 * Type definition for the authentication context value.
 * Provides user state and authentication methods to consuming components.
 */
export interface AuthContextType {
  /** Currently authenticated user or null if not logged in */
  user: User | null;
  /** Authenticates a user by email address */
  login: (email: string) => Promise<void>;
  /** Logs out the current user and clears session */
  logout: () => void;
  /** Indicates if authentication state is being loaded */
  isLoading: boolean;
  /** Indicates if a user is currently authenticated */
  isAuthenticated: boolean;
}

/**
 * React context for authentication state.
 * Undefined when accessed outside of AuthProvider.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
