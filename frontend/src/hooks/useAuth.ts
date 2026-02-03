/**
 * @fileoverview Custom hook for accessing authentication context.
 * Provides a convenient way to access auth state and methods in components.
 * @module hooks/useAuth
 */

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContextValue';

/**
 * Custom hook to access the authentication context.
 * Must be used within an AuthProvider component.
 * 
 * @returns The authentication context containing user state and auth methods
 * @throws Error if used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * if (isAuthenticated) {
 *   console.log(`Logged in as ${user.email}`);
 * }
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
