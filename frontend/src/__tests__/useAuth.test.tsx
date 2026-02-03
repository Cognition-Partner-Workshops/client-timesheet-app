import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import { AuthContext, type AuthContextType } from '../contexts/AuthContextValue';
import React from 'react';

describe('useAuth hook', () => {
  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should return auth context when used within AuthProvider', () => {
        const mockAuthContext: AuthContextType = {
          user: { email: 'test@example.com', createdAt: '2024-01-01' },
          login: async () => {},
          logout: () => {},
          isLoading: false,
          isAuthenticated: true,
        };

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <AuthContext.Provider value={mockAuthContext}>
            {children}
          </AuthContext.Provider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.user).toEqual({ email: 'test@example.com', createdAt: '2024-01-01' });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return null user when not authenticated', () => {
    const mockAuthContext: AuthContextType = {
      user: null,
      login: async () => {},
      logout: () => {},
      isLoading: false,
      isAuthenticated: false,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return loading state correctly', () => {
    const mockAuthContext: AuthContextType = {
      user: null,
      login: async () => {},
      logout: () => {},
      isLoading: true,
      isAuthenticated: false,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });
});
