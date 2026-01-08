import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types/api';
import apiClient from '../api/client';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  requestAuthCode: (mobileNumber: string) => Promise<{ code: string; expiresIn: number }>;
  loginWithMobile: (mobileNumber: string, code: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedEmail = localStorage.getItem('userEmail');
      const storedMobile = localStorage.getItem('userMobile');
      
      if (storedEmail || storedMobile) {
        try {
          const response = await apiClient.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userMobile');
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
      localStorage.removeItem('userMobile');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const requestAuthCode = async (mobileNumber: string) => {
    try {
      const response = await apiClient.requestAuthCode(mobileNumber);
      return { code: response.code, expiresIn: response.expiresIn };
    } catch (error) {
      console.error('Request auth code failed:', error);
      throw error;
    }
  };

  const loginWithMobile = async (mobileNumber: string, code: string) => {
    try {
      const response = await apiClient.verifyAuthCode(mobileNumber, code);
      setUser(response.user);
      localStorage.setItem('userMobile', mobileNumber);
      localStorage.removeItem('userEmail');
    } catch (error) {
      console.error('Mobile login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userMobile');
  };

  const value: AuthContextType = {
    user,
    login,
    requestAuthCode,
    loginWithMobile,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
