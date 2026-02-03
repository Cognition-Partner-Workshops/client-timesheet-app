/**
 * @fileoverview Authentication context provider for managing user session state.
 * Provides authentication state and methods throughout the React application
 * using React Context API. Handles login, logout, and session persistence.
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
 * Authentication provider component that wraps the application.
 * Manages user authentication state, handles session persistence via localStorage,
 * and provides login/logout functionality to child components.
 *
 * On mount, checks for existing session by validating stored email with backend.
 * If validation fails, clears stored credentials.
 *
 * @param props - Component props containing children to render.
 * @returns Provider component wrapping children with auth context.
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

  /**
   * Effect that runs on mount to check for existing authentication.
   * Validates stored email with backend and restores session if valid.
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
   * Authenticates user by email and establishes session.
   * Stores email in localStorage for session persistence.
   *
   * @param email - User's email address for authentication.
   * @throws Error if login request fails.
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
   * Logs out the current user by clearing state and stored credentials.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userEmail');
  };

  /** Context value provided to consuming components */
  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
