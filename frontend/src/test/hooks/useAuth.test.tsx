import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { AuthContext, type AuthContextType } from '../../contexts/AuthContextValue';
import type { ReactNode } from 'react';

describe('useAuth hook', () => {
  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should return auth context when used within AuthProvider', () => {
    const mockAuthContext: AuthContextType = {
      user: { id: 1, email: 'test@example.com', name: 'Test User' },
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      isAuthenticated: true,
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual({ id: 1, email: 'test@example.com', name: 'Test User' });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return unauthenticated state when user is null', () => {
    const mockAuthContext: AuthContextType = {
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
