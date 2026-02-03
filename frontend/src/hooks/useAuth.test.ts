import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useAuth } from './useAuth';
import { AuthContext, type AuthContextType } from '../contexts/AuthContextDef';

describe('useAuth', () => {
  const mockAuthContext: AuthContextType = {
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return auth context when used within AuthProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: mockAuthContext }, children);

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

  it('should provide login function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: mockAuthContext }, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.login).toBe('function');
  });

  it('should provide logout function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: mockAuthContext }, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.logout).toBe('function');
  });

  it('should return null user when not authenticated', () => {
    const unauthenticatedContext: AuthContextType = {
      ...mockAuthContext,
      user: null,
      isAuthenticated: false,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: unauthenticatedContext }, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return isLoading true when loading', () => {
    const loadingContext: AuthContextType = {
      ...mockAuthContext,
      isLoading: true,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: loadingContext }, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });
});
