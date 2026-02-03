import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
  },
  apiClient: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.getItem = vi.fn().mockReturnValue(null);
    window.localStorage.setItem = vi.fn();
    window.localStorage.removeItem = vi.fn();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('should provide initial state', async () => {
      mockedApiClient.getCurrentUser.mockResolvedValue({ user: null });
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should check auth on mount when email is stored', async () => {
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' };
      window.localStorage.getItem = vi.fn().mockReturnValue('test@example.com');
      mockedApiClient.getCurrentUser.mockResolvedValue({ user: mockUser });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedApiClient.getCurrentUser).toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle auth check failure', async () => {
      window.localStorage.getItem = vi.fn().mockReturnValue('test@example.com');
      mockedApiClient.getCurrentUser.mockRejectedValue(new Error('Auth failed'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(window.localStorage.removeItem).toHaveBeenCalledWith('userEmail');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should login successfully', async () => {
      const mockUser = { email: 'new@example.com', createdAt: '2024-01-01' };
      mockedApiClient.login.mockResolvedValue({ user: mockUser });
      mockedApiClient.getCurrentUser.mockResolvedValue({ user: null });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('new@example.com');
      });

      expect(mockedApiClient.login).toHaveBeenCalledWith('new@example.com');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('userEmail', 'new@example.com');
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle login failure', async () => {
      mockedApiClient.login.mockRejectedValue(new Error('Login failed'));
      mockedApiClient.getCurrentUser.mockResolvedValue({ user: null });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login('bad@example.com');
        })
      ).rejects.toThrow('Login failed');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should logout successfully', async () => {
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' };
      window.localStorage.getItem = vi.fn().mockReturnValue('test@example.com');
      mockedApiClient.getCurrentUser.mockResolvedValue({ user: mockUser });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        result.current.logout();
      });

      expect(window.localStorage.removeItem).toHaveBeenCalledWith('userEmail');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
