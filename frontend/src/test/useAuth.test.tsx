import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useAuth } from '../contexts/useAuth';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';

describe('useAuth', () => {
  const mockAuthContext: AuthContextType = {
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
    login: async () => {},
    logout: () => {},
    isLoading: false,
    isAuthenticated: true
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );

  it('should return auth context when used within AuthProvider', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockAuthContext.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should return login function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.login).toBe('function');
  });

  it('should return logout function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.logout).toBe('function');
  });

  it('should return null user when not authenticated', () => {
    const unauthenticatedContext: AuthContextType = {
      user: null,
      login: async () => {},
      logout: () => {},
      isLoading: false,
      isAuthenticated: false
    };

    const unauthWrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={unauthenticatedContext}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper: unauthWrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return isLoading true when loading', () => {
    const loadingContext: AuthContextType = {
      user: null,
      login: async () => {},
      logout: () => {},
      isLoading: true,
      isAuthenticated: false
    };

    const loadingWrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={loadingContext}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper: loadingWrapper });

    expect(result.current.isLoading).toBe(true);
  });
});
