/**
 * @fileoverview Authentication Provider component for the Time Tracker application.
 * 
 * This module provides the AuthProvider component that wraps the application
 * and manages authentication state. It handles login, logout, and session
 * persistence via localStorage.
 * 
 * The context value and types are defined in AuthContextValue.ts to comply
 * with React Fast Refresh requirements.
 * 
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
  /** Child components that will have access to auth context */
  children: ReactNode;
}

/**
 * Authentication Provider component that manages user authentication state.
 * 
 * This component:
 * 1. Checks for existing session on mount (via localStorage)
 * 2. Provides login/logout functionality to child components
 * 3. Persists authentication state across page refreshes
 * 
 * @example
 * ```tsx
 * // In App.tsx:
 * <AuthProvider>
 *   <Router>
 *     <App />
 *   </Router>
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  /** Current authenticated user, null if not logged in */
  const [user, setUser] = useState<User | null>(null);
  
  /** Loading state while checking authentication on mount */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Effect: Check for existing authentication on component mount.
   * 
   * If a user email is stored in localStorage, attempts to verify
   * the session by fetching the current user from the API.
   * Clears stored credentials if verification fails.
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
   * Authenticates a user with the given email address.
   * 
   * On successful login:
   * - Updates the user state with the returned user data
   * - Stores the email in localStorage for session persistence
   * 
   * @param email - The user's email address
   * @throws Error if the API login request fails
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
   * Logs out the current user.
   * 
   * Clears the user state and removes stored credentials from localStorage.
   * The API client's response interceptor will handle redirecting to login
   * if any subsequent API calls return 401.
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
