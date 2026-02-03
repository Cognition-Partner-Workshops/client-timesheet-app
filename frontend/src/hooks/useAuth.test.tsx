import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from './useAuth'
import { AuthContext, type AuthContextType } from '../contexts/AuthContextValue'
import React, { type ReactNode } from 'react'

describe('useAuth', () => {
  const mockAuthValue: AuthContextType = {
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: true,
  }

  const createWrapper = (value: AuthContextType | undefined) => {
    return function Wrapper({ children }: { children: ReactNode }) {
      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    }
  }

  it('should return auth context value when used within AuthProvider', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockAuthValue),
    })

    expect(result.current.user).toEqual({ email: 'test@example.com', createdAt: '2024-01-01' })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth(), {
        wrapper: createWrapper(undefined),
      })
    }).toThrow('useAuth must be used within an AuthProvider')
  })

  it('should provide login function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockAuthValue),
    })

    expect(typeof result.current.login).toBe('function')
  })

  it('should provide logout function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(mockAuthValue),
    })

    expect(typeof result.current.logout).toBe('function')
  })

  it('should return user as null when not authenticated', () => {
    const unauthValue: AuthContextType = {
      ...mockAuthValue,
      user: null,
      isAuthenticated: false,
    }

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(unauthValue),
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should return isLoading true when loading', () => {
    const loadingValue: AuthContextType = {
      ...mockAuthValue,
      isLoading: true,
    }

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(loadingValue),
    })

    expect(result.current.isLoading).toBe(true)
  })
})
