import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import { AuthContext, AuthContextType } from '@/contexts/AuthContextValue';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
}));

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithAuth = (authValue: AuthContextType) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <Home />
      </AuthContext.Provider>
    );
  };

  it('should show loading spinner when isLoading is true', () => {
    const authValue: AuthContextType = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: true,
      isAuthenticated: false,
    };

    renderWithAuth(authValue);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should redirect to dashboard when authenticated', async () => {
    const authValue: AuthContextType = {
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isAuthenticated: true,
    };

    renderWithAuth(authValue);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should redirect to login when not authenticated', async () => {
    const authValue: AuthContextType = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
    };

    renderWithAuth(authValue);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should not redirect while loading', () => {
    const authValue: AuthContextType = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: true,
      isAuthenticated: false,
    };

    renderWithAuth(authValue);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
