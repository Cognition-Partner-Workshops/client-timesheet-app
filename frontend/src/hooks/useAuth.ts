/**
 * @fileoverview Custom hook for accessing authentication context.
 * 
 * This hook provides a convenient way to access the authentication context
 * from any component within the AuthProvider tree. It includes runtime
 * validation to ensure proper usage.
 * 
 * @module hooks/useAuth
 */

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContextValue';

/**
 * Custom hook for accessing authentication state and methods.
 * 
 * Provides access to:
 * - `user`: The currently authenticated user (or null)
 * - `login(email)`: Function to authenticate a user
 * - `logout()`: Function to log out the current user
 * - `isLoading`: Whether auth state is being loaded
 * - `isAuthenticated`: Boolean indicating if user is logged in
 * 
 * @returns The authentication context value
 * @throws Error if used outside of an AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, login, logout, isAuthenticated } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <LoginButton onClick={() => login('user@example.com')} />;
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
