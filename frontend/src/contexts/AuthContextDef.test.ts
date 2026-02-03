import { describe, it, expect } from 'vitest';
import { AuthContext, type AuthContextType } from './AuthContextDef';

describe('AuthContextDef', () => {
  describe('AuthContext', () => {
    it('should be defined', () => {
      expect(AuthContext).toBeDefined();
    });

    it('should have undefined as default value', () => {
      expect(AuthContext._currentValue).toBeUndefined();
    });
  });

  describe('AuthContextType', () => {
    it('should define the correct shape', () => {
      const mockContext: AuthContextType = {
        user: { email: 'test@example.com', createdAt: '2024-01-01' },
        login: async () => {},
        logout: () => {},
        isLoading: false,
        isAuthenticated: true,
      };

      expect(mockContext.user).toBeDefined();
      expect(mockContext.login).toBeDefined();
      expect(mockContext.logout).toBeDefined();
      expect(mockContext.isLoading).toBe(false);
      expect(mockContext.isAuthenticated).toBe(true);
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
      expect(mockContext.isAuthenticated).toBe(false);
    });
  });
});
