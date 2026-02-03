/**
 * @fileoverview Authentication context provider for managing user authentication state.
 * This module provides React context for authentication, including login/logout functionality
 * and automatic session restoration from localStorage.
 */

import React, { useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types/api';
import apiClient from '../api/client';
import { AuthContext, type AuthContextType } from './AuthContextValue';

/**
 * Props for the AuthProvider component.
 */
interface AuthProviderProps {
  /** Child components that will have access to auth context */
  children: ReactNode;
}

/**
 * Provider component that wraps the application to provide authentication context.
 * Automatically checks for existing session on mount by reading from localStorage.
 * 
 * @param props - Component props
 * @returns Provider component wrapping children
 * 
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
   * Logs in a user with the provided email address.
   * Stores the email in localStorage for session persistence.
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
