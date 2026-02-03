import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContextValue';

/**
 * Custom hook to access the authentication context.
 * This hook must be used within an AuthProvider component.
 * 
 * This hook was moved to a separate file from AuthContext.tsx to comply with
 * the react-refresh/only-export-components ESLint rule. The rule requires that
 * files only export components for fast refresh (hot module replacement) to
 * work properly during development.
 * 
 * Fix for issue #3, PR #143
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
