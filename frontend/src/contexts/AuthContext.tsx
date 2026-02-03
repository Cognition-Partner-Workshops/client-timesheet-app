import React, { useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types/api';
import apiClient from '../api/client';
import { AuthContext, type AuthContextType } from './AuthContextType';

// Storage keys for authentication
const TOKEN_KEY = 'authToken';
const USER_EMAIL_KEY = 'userEmail';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
      
      if (storedToken || storedEmail) {
        try {
          const response = await apiClient.getCurrentUser();
          setUser(response.user);
        } catch {
          // Clear invalid credentials
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_EMAIL_KEY);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string) => {
    const response = await apiClient.login(email);
    setUser(response.user);
    // Store both token and email for authentication
    if (response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
    }
    localStorage.setItem(USER_EMAIL_KEY, email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
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
