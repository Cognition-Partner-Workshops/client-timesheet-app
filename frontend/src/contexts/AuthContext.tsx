/**
 * @fileoverview Authentication context for the Client Timesheet application.
 * Provides global authentication state management using React Context API.
 * 
 * @module contexts/AuthContext
 * @description This module exports the AuthProvider component and useAuth hook
 * for managing user authentication state throughout the application.
 * 
 * @example
 * ```tsx
 * // Wrap your app with AuthProvider
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * // Use the hook in components
 * const { user, login, logout, isAuthenticated } = useAuth();
 * ```
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types/api';
import apiClient from '../api/client';

/**
 * Shape of the authentication context value.
 * 
 * @interface AuthContextType
 * @property {User | null} user - Current authenticated user or null if not logged in
 * @property {Function} login - Function to authenticate a user by email
 * @property {Function} logout - Function to log out the current user
 * @property {boolean} isLoading - True while checking authentication status
 * @property {boolean} isAuthenticated - True if a user is currently logged in
 */
interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to access the authentication context.
 * Must be used within an AuthProvider component.
 * 
 * @returns {AuthContextType} The authentication context value
 * @throws {Error} If used outside of an AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <button onClick={() => login('user@example.com')}>Login</button>;
 *   }
 *   
 *   return <div>Welcome, {user?.email}!</div>;
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

/**
 * Props for the AuthProvider component.
 * @interface AuthProviderProps
 */
interface AuthProviderProps {
  /** Child components that will have access to auth context */
  children: ReactNode;
}

/**
 * Authentication provider component that wraps the application.
 * Manages user authentication state and provides login/logout functionality.
 * 
 * @component
 * @param {AuthProviderProps} props - Component props
 * @returns {JSX.Element} Provider component wrapping children
 * 
 * @example
 * ```tsx
 * // In your main App file
 * import { AuthProvider } from './contexts/AuthContext';
 * 
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router>
 *         <Routes />
 *       </Router>
 *     </AuthProvider>
 *   );
 * }
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
