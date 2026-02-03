import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContextValue';

// Fix for issue #3, PR #143 - Moved to separate file for react-refresh compatibility
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
