import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

vi.mock('../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

import apiClient from '../api/client';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);
  });

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('should provide initial state', async () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login successfully', async () => {
    const mockUser = { email: 'test@example.com', created_at: '2024-01-01' };
    vi.mocked(apiClient.login).mockResolvedValue({ user: mockUser });
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login('test@example.com');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(window.localStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
  });

  it('should handle login failure', async () => {
    vi.mocked(apiClient.login).mockRejectedValue(new Error('Login failed'));
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.login('test@example.com');
      })
    ).rejects.toThrow('Login failed');

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should logout successfully', async () => {
    const mockUser = { email: 'test@example.com', created_at: '2024-01-01' };
    vi.mocked(apiClient.login).mockResolvedValue({ user: mockUser });
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login('test@example.com');
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('userEmail');
  });

  it('should check auth on mount when email is stored', async () => {
    const mockUser = { email: 'stored@example.com', createdAt: '2024-01-01' };
    vi.mocked(window.localStorage.getItem).mockReturnValue('stored@example.com');
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.getCurrentUser).toHaveBeenCalled();
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should clear stored email when auth check fails', async () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue('invalid@example.com');
    vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Auth failed'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(window.localStorage.removeItem).toHaveBeenCalledWith('userEmail');
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });
});
