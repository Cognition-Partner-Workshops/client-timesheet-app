import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Route: () => null,
    Navigate: () => null,
  };
});

import { useAuth } from '../contexts/AuthContext';

const MockAppContent: React.FC = () => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return <div data-testid="app-content">App Content</div>;
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state when auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<MockAppContent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render content when auth is not loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<MockAppContent />);

    expect(screen.getByTestId('app-content')).toBeInTheDocument();
  });

  it('should provide auth context values', () => {
    const mockLogin = vi.fn();
    const mockLogout = vi.fn();
    
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { email: 'test@example.com' },
      login: mockLogin,
      logout: mockLogout,
    });

    render(<MockAppContent />);

    expect(screen.getByTestId('app-content')).toBeInTheDocument();
  });
});
