import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import React, { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

import apiClient from '../api/client'
import { AuthProvider, useAuth } from './AuthContext'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
      
      consoleError.mockRestore()
    })

    it('should provide initial state', async () => {
      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Not authenticated'))
      
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' }
      vi.mocked(apiClient.login).mockResolvedValueOnce({ user: mockUser })
      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Not authenticated'))
      
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      await act(async () => {
        await result.current.login('test@example.com')
      })
      
      expect(apiClient.login).toHaveBeenCalledWith('test@example.com')
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorage.getItem('userEmail')).toBe('test@example.com')
    })

    it('should handle login failure', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(apiClient.login).mockRejectedValueOnce(new Error('Login failed'))
      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Not authenticated'))
      
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      await expect(
        act(async () => {
          await result.current.login('test@example.com')
        })
      ).rejects.toThrow('Login failed')
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      
      consoleError.mockRestore()
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' }
      vi.mocked(apiClient.login).mockResolvedValueOnce({ user: mockUser })
      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Not authenticated'))
      
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      await act(async () => {
        await result.current.login('test@example.com')
      })
      
      expect(result.current.isAuthenticated).toBe(true)
      
      act(() => {
        result.current.logout()
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorage.getItem('userEmail')).toBeNull()
    })
  })

  describe('checkAuth on mount', () => {
    it('should restore user from localStorage', async () => {
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' }
      localStorage.setItem('userEmail', 'test@example.com')
      vi.mocked(apiClient.getCurrentUser).mockResolvedValueOnce({ user: mockUser })
      
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      
      expect(result.current.isLoading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should clear localStorage on auth check failure', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorage.setItem('userEmail', 'test@example.com')
      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Auth failed'))
      
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('userEmail')).toBeNull()
      
      consoleError.mockRestore()
    })

    it('should not check auth when no stored email', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(apiClient.getCurrentUser).not.toHaveBeenCalled()
      expect(result.current.user).toBeNull()
    })
  })
})
