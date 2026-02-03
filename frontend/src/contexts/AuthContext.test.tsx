import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React, { type ReactNode } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import apiClient from '../api/client'

vi.mock('../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
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
      
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('should login successfully and set user', async () => {
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' }
      vi.mocked(apiClient.login).mockResolvedValueOnce({ message: 'Success', user: mockUser })
      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Not authenticated'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.login('test@example.com')
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorage.getItem('userEmail')).toBe('test@example.com')
    })

    it('should throw error on login failure', async () => {
      const loginError = new Error('Login failed')
      vi.mocked(apiClient.login).mockRejectedValueOnce(loginError)
      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Not authenticated'))

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.login('test@example.com')
        })
      ).rejects.toThrow('Login failed')

      consoleError.mockRestore()
    })
  })

  describe('logout', () => {
    it('should clear user and localStorage on logout', async () => {
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' }
      vi.mocked(apiClient.login).mockResolvedValueOnce({ message: 'Success', user: mockUser })
      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Not authenticated'))

      const { result } = renderHook(() => useAuth(), { wrapper })

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
    it('should clear localStorage if auth check fails', async () => {
      localStorage.setItem('userEmail', 'test@example.com')
      vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Unauthorized'))

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('userEmail')).toBeNull()
      
      consoleError.mockRestore()
    })
  })
})
