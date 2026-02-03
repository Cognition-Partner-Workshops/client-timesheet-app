import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import React from 'react';

vi.mock('../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const TestComponent: React.FC = () => {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={() => login('test@example.com')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children', async () => {
    vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('No user'));

    render(
      <AuthProvider>
        <div data-testid="child">Child content</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('child')).toHaveTextContent('Child content');
    });
  });

  it('should start with isLoading true and then set to false', async () => {
    vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('No user'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  it('should check auth on mount when userEmail is in localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValue('stored@example.com');
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue({
      user: { email: 'stored@example.com', createdAt: '2024-01-01' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('stored@example.com');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    expect(apiClient.getCurrentUser).toHaveBeenCalled();
  });

  it('should clear localStorage when auth check fails', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid@example.com');
    vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Auth failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userEmail');
  });

  it('should not check auth when no userEmail in localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(apiClient.getCurrentUser).not.toHaveBeenCalled();
  });

  it('should login successfully', async () => {
    const user = userEvent.setup();
    mockLocalStorage.getItem.mockReturnValue(null);
    vi.mocked(apiClient.login).mockResolvedValue({
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

    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    expect(apiClient.login).toHaveBeenCalledWith('test@example.com');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
  });

  it('should throw error when login fails', async () => {
    const user = userEvent.setup();
    mockLocalStorage.getItem.mockReturnValue(null);
    const loginError = new Error('Login failed');
    vi.mocked(apiClient.login).mockRejectedValue(loginError);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponentWithError: React.FC = () => {
      const { login } = useAuth();
      const [error, setError] = React.useState<string | null>(null);

      const handleLogin = async () => {
        try {
          await login('test@example.com');
        } catch (e) {
          setError((e as Error).message);
        }
      };

      return (
        <div>
          {error && <div data-testid="login-error">{error}</div>}
          <button onClick={handleLogin}>Login</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponentWithError />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toHaveTextContent('Login failed');
    });

    consoleErrorSpy.mockRestore();
  });

  it('should logout successfully', async () => {
    const user = userEvent.setup();
    mockLocalStorage.getItem.mockReturnValue('test@example.com');
    vi.mocked(apiClient.getCurrentUser).mockResolvedValue({
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userEmail');
  });

  it('should set isAuthenticated based on user presence', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    });
  });
});
