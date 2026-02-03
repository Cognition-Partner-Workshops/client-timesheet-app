import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { AuthContext, type AuthContextType } from '../AuthContextDef';
import React from 'react';

describe('useAuth', () => {
  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should return context value when used within AuthProvider', () => {
    const mockContextValue: AuthContextType = {
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
      login: async () => {},
      logout: () => {},
      isLoading: false,
      isAuthenticated: true,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockContextValue.user);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should return null user when not authenticated', () => {
    const mockContextValue: AuthContextType = {
      user: null,
      login: async () => {},
      logout: () => {},
      isLoading: false,
      isAuthenticated: false,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
