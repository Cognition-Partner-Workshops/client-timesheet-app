/**
 * @fileoverview Authentication context type definitions and context creation.
 * Provides the shape of the authentication context used throughout the application.
 * 
 * @module contexts/AuthContextValue
 */

import { createContext } from 'react';
import { type User } from '../types/api';

/**
 * Type definition for the authentication context.
 * Provides user state and authentication methods to consuming components.
 */
export interface AuthContextType {
  /** Currently authenticated user, or null if not logged in */
  user: User | null;
  /** 
   * Authenticates a user by email address.
   * @param email - User's email address
   * @returns Promise that resolves when login is complete
   */
  login: (email: string) => Promise<void>;
  /** Logs out the current user and clears stored credentials */
  logout: () => void;
  /** Indicates if authentication state is being determined */
  isLoading: boolean;
  /** Indicates if a user is currently authenticated */
  isAuthenticated: boolean;
}

/**
 * React context for authentication state.
 * Must be used within an AuthProvider component.
 * 
 * @example
 * // Access via useAuth hook
 * const { user, login, logout } = useAuth();
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
