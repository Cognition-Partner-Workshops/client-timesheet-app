/**
 * @fileoverview Custom hook for accessing authentication context.
 * Provides a convenient way to access authentication state and methods.
 * 
 * @module hooks/useAuth
 */

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContextValue';

/**
 * Custom hook for accessing the authentication context.
 * Provides access to user state, login/logout functions, and loading state.
 * Must be used within a component wrapped by AuthProvider.
 * 
 * @returns Authentication context containing user state and auth methods
 * @throws {Error} If used outside of an AuthProvider
 * 
 * @example
 * const { user, login, logout, isAuthenticated, isLoading } = useAuth();
 * 
 * if (isLoading) return <Spinner />;
 * if (!isAuthenticated) return <LoginPage />;
 * return <Dashboard user={user} />;
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
