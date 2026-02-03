import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AuthGuard from '@/components/AuthGuard';
import { AuthContext, AuthContextType } from '@/contexts/AuthContextValue';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithAuth = (authValue: AuthContextType, children: React.ReactNode) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <AuthGuard>{children}</AuthGuard>
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

    renderWithAuth(authValue, <div>Protected Content</div>);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated', async () => {
    const authValue: AuthContextType = {
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isAuthenticated: true,
    };

    renderWithAuth(authValue, <div>Protected Content</div>);

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
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

    renderWithAuth(authValue, <div>Protected Content</div>);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should not render children when not authenticated', () => {
    const authValue: AuthContextType = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
    };

    renderWithAuth(authValue, <div>Protected Content</div>);

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should not redirect while loading', () => {
    const authValue: AuthContextType = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: true,
      isAuthenticated: false,
    };

    renderWithAuth(authValue, <div>Protected Content</div>);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
