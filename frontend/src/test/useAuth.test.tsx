import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from '../hooks/useAuth'
import { AuthContext, type AuthContextType } from '../contexts/AuthContextDef'
import React from 'react'

describe('useAuth', () => {
  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')
  })

  it('returns context value when used within AuthProvider', () => {
    const mockContextValue: AuthContextType = {
      user: { email: 'test@example.com' },
      login: async () => {},
      logout: () => {},
      isLoading: false,
      isAuthenticated: true,
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>
        {children}
      </AuthContext.Provider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toEqual({ email: 'test@example.com' })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('returns null user when not authenticated', () => {
    const mockContextValue: AuthContextType = {
      user: null,
      login: async () => {},
      logout: () => {},
      isLoading: false,
      isAuthenticated: false,
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>
        {children}
      </AuthContext.Provider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('returns loading state correctly', () => {
    const mockContextValue: AuthContextType = {
      user: null,
      login: async () => {},
      logout: () => {},
      isLoading: true,
      isAuthenticated: false,
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>
        {children}
      </AuthContext.Provider>
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isLoading).toBe(true)
  })
})
