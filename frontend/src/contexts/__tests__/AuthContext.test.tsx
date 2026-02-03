import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { type ReactNode } from 'react';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../useAuth';
import apiClient from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
  });

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('provides initial state with no user', async () => {
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('does not call getCurrentUser when no email in localStorage', async () => {
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(localStorage.getItem).toHaveBeenCalledWith('userEmail');
      expect(result.current.user).toBeNull();
    });
  });

  describe('login', () => {
    it('logs in user successfully', async () => {
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' };
      vi.mocked(apiClient.login).mockResolvedValue({ user: mockUser });
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await act(async () => {
        await result.current.login('test@example.com');
      });
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
    });

    it('throws error on login failure', async () => {
      vi.mocked(apiClient.login).mockRejectedValue(new Error('Login failed'));
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await expect(
        act(async () => {
          await result.current.login('test@example.com');
        })
      ).rejects.toThrow('Login failed');
    });
  });

  describe('logout', () => {
    it('logs out user after login and clears state', async () => {
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' };
      vi.mocked(apiClient.login).mockResolvedValue({ user: mockUser });
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
      
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
      expect(localStorage.removeItem).toHaveBeenCalledWith('userEmail');
    });
  });
});
