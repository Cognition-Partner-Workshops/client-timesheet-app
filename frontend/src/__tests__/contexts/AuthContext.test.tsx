import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  login: jest.fn(),
  getCurrentUser: jest.fn(),
}));

const TestComponent = () => {
  const { user, login, logout, isLoading, isAuthenticated } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <button onClick={() => login('test@example.com')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  it('should render children', async () => {
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });
  });

  it('should start with loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('should check auth on mount when email is stored', async () => {
    localStorage.getItem.mockReturnValue('stored@example.com');
    (apiClient.getCurrentUser as jest.Mock).mockResolvedValue({
      user: { email: 'stored@example.com', createdAt: '2024-01-01' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(apiClient.getCurrentUser).toHaveBeenCalled();
    expect(screen.getByTestId('user-email')).toHaveTextContent('stored@example.com');
  });

  it('should handle auth check failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.getItem.mockReturnValue('stored@example.com');
    (apiClient.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Auth failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('userEmail');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    consoleSpy.mockRestore();
  });

  it('should login successfully', async () => {
    const user = userEvent.setup();
    (apiClient.login as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
  });

  it('should handle login failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (apiClient.login as jest.Mock).mockRejectedValue(new Error('Login failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(apiClient.login).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should logout successfully', async () => {
    const user = userEvent.setup();
    localStorage.getItem.mockReturnValue('test@example.com');
    (apiClient.getCurrentUser as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    await user.click(screen.getByText('Logout'));

    expect(localStorage.removeItem).toHaveBeenCalledWith('userEmail');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
  });

  it('should not check auth when no email is stored', async () => {
    localStorage.getItem.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(apiClient.getCurrentUser).not.toHaveBeenCalled();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
  });
});
