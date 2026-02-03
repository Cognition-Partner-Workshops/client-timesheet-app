/**
 * @fileoverview Authentication context type definitions and context creation.
 * Provides the AuthContext for sharing authentication state across the application.
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
  /** Authenticates user with email, stores credentials, and updates state */
  login: (email: string) => Promise<void>;
  /** Clears user session and removes stored credentials */
  logout: () => void;
  /** Indicates if authentication state is being loaded/verified */
  isLoading: boolean;
  /** Convenience boolean indicating if user is authenticated */
  isAuthenticated: boolean;
}

/**
 * React context for authentication state management.
 * Provides authentication state and methods to child components.
 * Must be used within an AuthProvider component.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
