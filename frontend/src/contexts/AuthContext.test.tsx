import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';

const mockLogin = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock('../api/client', () => ({
  default: {
    login: (...args: unknown[]) => mockLogin(...args),
    getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('should provide initial state', async () => {
      mockGetCurrentUser.mockRejectedValue(new Error('No user'));
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should check auth on mount when email is stored', async () => {
      localStorageMock.setItem('userEmail', 'test@example.com');
      mockGetCurrentUser.mockResolvedValue({
        user: { email: 'test@example.com', createdAt: '2024-01-01' },
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.user).toEqual({ email: 'test@example.com', createdAt: '2024-01-01' });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear localStorage on auth check failure', async () => {
      localStorageMock.setItem('userEmail', 'test@example.com');
      mockGetCurrentUser.mockRejectedValue(new Error('Auth failed'));
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(localStorageMock.getItem('userEmail')).toBe(null);
      expect(result.current.user).toBe(null);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      mockLogin.mockResolvedValue({
        user: { email: 'new@example.com', createdAt: '2024-01-01' },
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.login('new@example.com');
      });
      
      expect(result.current.user).toEqual({ email: 'new@example.com', createdAt: '2024-01-01' });
      expect(localStorageMock.getItem('userEmail')).toBe('new@example.com');
    });

    it('should throw error on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Login failed'));
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await expect(
        act(async () => {
          await result.current.login('bad@example.com');
        })
      ).rejects.toThrow('Login failed');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      localStorageMock.setItem('userEmail', 'test@example.com');
      mockGetCurrentUser.mockResolvedValue({
        user: { email: 'test@example.com', createdAt: '2024-01-01' },
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
      
      act(() => {
        result.current.logout();
      });
      
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorageMock.getItem('userEmail')).toBe(null);
    });
  });
});
