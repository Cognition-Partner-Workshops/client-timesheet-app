import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../useAuth';
import apiClient from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

const TestComponent = () => {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const handleLogin = async () => {
    try {
      await login('test@example.com');
    } catch {
      console.error('Login failed');
    }
  };
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should show loading state initially when checking auth', async () => {
    vi.mocked(apiClient.getCurrentUser).mockImplementation(() => new Promise(() => {}));
    localStorage.setItem('userEmail', 'test@example.com');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('should show not authenticated when no stored email', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
  });

  it('should authenticate user when stored email exists and API succeeds', async () => {
    localStorage.setItem('userEmail', 'test@example.com');
    vi.mocked(apiClient.getCurrentUser).mockResolvedValueOnce({
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

    expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  it('should clear stored email when auth check fails', async () => {
    localStorage.setItem('userEmail', 'test@example.com');
    vi.mocked(apiClient.getCurrentUser).mockRejectedValueOnce(new Error('Auth failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(localStorage.getItem('userEmail')).toBeNull();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
  });

  it('should login user successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.login).mockResolvedValueOnce({
      message: 'Login successful',
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
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    expect(localStorage.getItem('userEmail')).toBe('test@example.com');
  });

  it('should logout user', async () => {
    const user = userEvent.setup();
    localStorage.setItem('userEmail', 'test@example.com');
    vi.mocked(apiClient.getCurrentUser).mockResolvedValueOnce({
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    await user.click(screen.getByText('Logout'));

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(localStorage.getItem('userEmail')).toBeNull();
  });

  it('should throw error when login fails', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(apiClient.login).mockRejectedValueOnce(new Error('Login failed'));

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
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});
