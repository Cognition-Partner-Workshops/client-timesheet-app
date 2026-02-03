import { createContext } from 'react';

export interface AuthContextType {
  user: { email: string; created_at: string } | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
