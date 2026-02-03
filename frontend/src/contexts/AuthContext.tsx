/**
 * @fileoverview Authentication context provider for managing user authentication state.
 *
 * This module provides React context for authentication, including login/logout
 * functionality and user state management. It persists authentication state
 * using localStorage and automatically validates sessions on app load.
 *
 * @module contexts/AuthContext
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types/api';
import apiClient from '../api/client';

/**
 * Type definition for the authentication context value.
 *
 * @interface AuthContextType
 * @property {User | null} user - Current authenticated user or null if not logged in
 * @property {function} login - Async function to log in with email
 * @property {function} logout - Function to log out and clear session
 * @property {boolean} isLoading - True while checking authentication status
 * @property {boolean} isAuthenticated - True if user is logged in
 */
interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * React context for authentication state.
 * @type {React.Context<AuthContextType | undefined>}
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access authentication context.
 *
 * @function useAuth
 * @returns {AuthContextType} The authentication context value
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Props for the AuthProvider component.
 * @interface AuthProviderProps
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component that wraps the application.
 *
 * Manages authentication state including:
 * - Checking for existing session on mount
 * - Providing login/logout functions
 * - Persisting user email in localStorage
 *
 * @component
 * @param {AuthProviderProps} props - Component props
 * @returns {JSX.Element} Provider component wrapping children
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
