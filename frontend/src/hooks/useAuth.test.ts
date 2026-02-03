import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useAuth } from './useAuth';
import { AuthContext, type AuthContextType } from '../contexts/AuthContextValue';

describe('useAuth', () => {
  it('should return auth context when used within AuthProvider', () => {
    const mockAuthValue: AuthContextType = {
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      isAuthenticated: true,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(AuthContext.Provider, { value: mockAuthValue }, children)
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockAuthValue.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should return login function', () => {
    const mockLogin = vi.fn();
    const mockAuthValue: AuthContextType = {
      user: null,
      login: mockLogin,
      logout: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(AuthContext.Provider, { value: mockAuthValue }, children)
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.login).toBe(mockLogin);
  });

  it('should return logout function', () => {
    const mockLogout = vi.fn();
    const mockAuthValue: AuthContextType = {
      user: null,
      login: vi.fn(),
      logout: mockLogout,
      isLoading: false,
      isAuthenticated: false,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(AuthContext.Provider, { value: mockAuthValue }, children)
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.logout).toBe(mockLogout);
  });
});
