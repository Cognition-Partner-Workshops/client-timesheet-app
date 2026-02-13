/**
 * Authentication Context Provider
 *
 * Manages the global authentication state for the React app. Wraps the
 * component tree (see App.tsx) so any descendant can access auth state
 * via the `useAuth()` hook (hooks/useAuth.ts).
 *
 * State:
 *  - user           — The current User object (email + createdAt), or null.
 *  - isLoading      — True while the initial session-rehydration check runs.
 *  - isAuthenticated — Derived boolean (`!!user`).
 *
 * Provided actions:
 *  - login(email)   — Calls POST /api/auth/login via apiClient, stores the
 *                      email in localStorage, and sets the user state.
 *  - logout()       — Clears user state and removes the email from localStorage.
 *
 * Session rehydration (useEffect on mount):
 *  If `userEmail` exists in localStorage from a previous session, the provider
 *  calls GET /api/auth/me to verify the session is still valid. On failure it
 *  clears the stale email so the user is shown the login page.
 *
 * How auth flows end-to-end:
 *  1. User enters email on LoginPage → AuthProvider.login() is called.
 *  2. login() stores email in localStorage and updates `user` state.
 *  3. The apiClient request interceptor (api/client.ts) reads localStorage
 *     and attaches `x-user-email` to every outgoing request.
 *  4. The backend's authenticateUser middleware (middleware/auth.js) reads
 *     that header and sets `req.userEmail` for data-scoped queries.
 *  5. On 401 responses the apiClient response interceptor clears localStorage
 *     and redirects to /login.
 *
 * Related files:
 *  - contexts/AuthContextValue.ts  — AuthContext creation & AuthContextType
 *  - hooks/useAuth.ts              — convenience consumer hook
 *  - api/client.ts                 — apiClient.login() and getCurrentUser()
 *  - App.tsx                       — wraps AppContent in <AuthProvider>
 *  - pages/LoginPage.tsx           — calls login() on form submit
 *  - backend middleware/auth.js    — server-side counterpart
 */
import React, { useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types/api';
import apiClient from '../api/client';
import { AuthContext, type AuthContextType } from './AuthContextValue';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: attempt to rehydrate an existing session from localStorage.
  // This runs once (empty deps) before any protected route renders.
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

  // login: persists the email and updates React state so the auth guard in
  // AppContent (App.tsx) re-evaluates and renders the protected route tree.
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

  // logout: clears both React state and localStorage. The next render cycle
  // will see isAuthenticated=false and redirect to /login.
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
