/**
 * @fileoverview Authentication context provider for the Client Timesheet Application.
 * Manages user authentication state, login/logout functionality, and session persistence.
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
  /** Child components that will have access to the auth context */
  children: ReactNode;
}

/**
 * Authentication provider component that wraps the application.
 * Manages user state, handles login/logout operations, and persists
 * authentication across page refreshes using localStorage.
 * 
 * @param props - Component props
 * @param props.children - Child components to render
 * @returns Provider component wrapping children with auth context
 * 
 * @example
 * // Wrap your app with AuthProvider
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
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
