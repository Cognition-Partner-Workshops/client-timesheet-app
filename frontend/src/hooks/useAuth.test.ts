import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useAuth } from './useAuth';
import { AuthContext, type AuthContextType } from '../contexts/AuthContextValue';

describe('useAuth', () => {
  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should return context value when used within AuthProvider', () => {
    const mockContextValue: AuthContextType = {
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      isAuthenticated: true,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: mockContextValue }, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockContextValue.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return null user when not authenticated', () => {
    const mockContextValue: AuthContextType = {
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: mockContextValue }, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return loading state', () => {
    const mockContextValue: AuthContextType = {
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: true,
      isAuthenticated: false,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: mockContextValue }, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });
});
