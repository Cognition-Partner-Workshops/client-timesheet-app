/**
 * @fileoverview Authentication context type definitions and context creation.
 * 
 * This module defines the shape of the authentication context and creates
 * the React context object. It is separated from the provider implementation
 * to comply with React Fast Refresh requirements (only export components from
 * component files).
 * 
 * @module contexts/AuthContextValue
 */

import { createContext } from 'react';
import { type User } from '../types/api';

/**
 * Type definition for the authentication context value.
 * 
 * This interface defines all the properties and methods available
 * to components that consume the AuthContext.
 */
export interface AuthContextType {
  /** The currently authenticated user, or null if not logged in */
  user: User | null;
  
  /**
   * Authenticates a user with the given email address.
   * Creates a new account if the email doesn't exist.
   * 
   * @param email - The user's email address
   * @returns Promise that resolves when login is complete
   * @throws Error if login fails
   */
  login: (email: string) => Promise<void>;
  
  /**
   * Logs out the current user by clearing stored credentials
   * and resetting the user state.
   */
  logout: () => void;
  
  /** Whether the auth state is currently being loaded/verified */
  isLoading: boolean;
  
  /** Convenience boolean indicating if a user is currently authenticated */
  isAuthenticated: boolean;
}

/**
 * React context for authentication state.
 * 
 * This context provides authentication state and methods to all child components.
 * Must be used within an AuthProvider component.
 * 
 * @example
 * ```tsx
 * // In a component:
 * const { user, login, logout, isAuthenticated } = useAuth();
 * ```
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
