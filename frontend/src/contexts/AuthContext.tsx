/**
 * @fileoverview Authentication provider component for managing user authentication state.
 * Wraps the application to provide authentication context to all child components.
 * Handles login, logout, and automatic session restoration from localStorage.
 * @module contexts/AuthContext
 */

import React, { useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types/api';
import apiClient from '../api/client';
import { AuthContext, type AuthContextType } from './AuthContextValue';

/**
 * Props for the AuthProvider component.
 */
interface AuthProviderProps {
  /** Child components that will have access to authentication context */
  children: ReactNode;
}

/**
 * Authentication provider component that manages user authentication state.
 * Provides login/logout functionality and persists authentication across page reloads.
 * 
 * Features:
 * - Automatic session restoration from localStorage on mount
 * - Email-based authentication via API
 * - Loading state during authentication verification
 * 
 * @param props - Component props containing children to wrap
 * @returns Provider component wrapping children with auth context
 * 
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Effect to check and restore authentication state on component mount.
   * Verifies stored email with the backend and restores user session if valid.
   */
  useEffect(() => {
    const checkAuth = async () => {
      const storedEmail = localStorage.getItem('userEmail');
      
      if (storedEmail) {
        try {
          const response = await apiClient.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('userEmail');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Authenticates user with the provided email address.
   * Stores email in localStorage for session persistence.
   * @param email - User's email address for authentication
   * @throws Error if login API call fails
   */
  const login = async (email: string) => {
    try {
      const response = await apiClient.login(email);
      setUser(response.user);
      localStorage.setItem('userEmail', email);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Logs out the current user by clearing state and localStorage.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userEmail');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
