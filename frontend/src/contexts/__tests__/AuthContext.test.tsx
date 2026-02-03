import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../useAuth';
import apiClient from '../../api/client';

vi.mock('../../api/client');

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('should provide initial state', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should login successfully', async () => {
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' };
      vi.mocked(apiClient.login).mockResolvedValue({ user: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('test@example.com');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('userEmail')).toBe('test@example.com');
    });

    it('should handle login failure', async () => {
      vi.mocked(apiClient.login).mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login('test@example.com');
        })
      ).rejects.toThrow('Login failed');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should logout successfully', async () => {
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' };
      vi.mocked(apiClient.login).mockResolvedValue({ user: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('test@example.com');
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('userEmail')).toBeNull();
    });

    it('should restore session from localStorage', async () => {
      localStorage.setItem('userEmail', 'stored@example.com');
      const mockUser = { email: 'stored@example.com', createdAt: '2024-01-01' };
      vi.mocked(apiClient.getCurrentUser).mockResolvedValue({ user: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear session on auth check failure', async () => {
      localStorage.setItem('userEmail', 'stored@example.com');
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Auth failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('userEmail')).toBeNull();
    });
  });
});
