import { describe, it, expect } from 'vitest';
import { AuthContext, type AuthContextType } from './authTypes';

describe('authTypes', () => {
  describe('AuthContext', () => {
    it('should be defined', () => {
      expect(AuthContext).toBeDefined();
    });

    it('should have undefined as default value', () => {
      expect(AuthContext._currentValue).toBeUndefined();
    });

    it('should be a valid React context', () => {
      expect(AuthContext.Provider).toBeDefined();
      expect(AuthContext.Consumer).toBeDefined();
    });
  });

  describe('AuthContextType interface', () => {
    it('should allow creating a valid AuthContextType object', () => {
      const mockContext: AuthContextType = {
        user: { email: 'test@example.com', createdAt: '2024-01-01' },
        login: async () => {},
        logout: () => {},
        isLoading: false,
        isAuthenticated: true,
      };

      expect(mockContext.user).toEqual({ email: 'test@example.com', createdAt: '2024-01-01' });
      expect(mockContext.isLoading).toBe(false);
      expect(mockContext.isAuthenticated).toBe(true);
      expect(typeof mockContext.login).toBe('function');
      expect(typeof mockContext.logout).toBe('function');
    });

    it('should allow null user', () => {
      const mockContext: AuthContextType = {
        user: null,
        login: async () => {},
        logout: () => {},
        isLoading: false,
        isAuthenticated: false,
      };

      expect(mockContext.user).toBeNull();
    });
  });
});
