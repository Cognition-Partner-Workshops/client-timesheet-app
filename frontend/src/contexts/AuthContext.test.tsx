import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import apiClient from '../api/client';

// Mock the API client
vi.mock('../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

// Test component that uses the auth context
const TestComponent = ({ onLoginError }: { onLoginError?: (error: Error) => void }) => {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login('test@example.com');
    } catch (error) {
      if (onLoginError) {
        onLoginError(error as Error);
      }
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not authenticated'}</div>
      <div data-testid="user-email">{user?.email || 'no user'}</div>
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useAuth', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleError.mockRestore();
    });
  });

  describe('AuthProvider', () => {
    it('should render children', async () => {
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('No user'));
      
      render(
        <AuthProvider>
          <div>Child content</div>
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Child content')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      vi.mocked(apiClient.getCurrentUser).mockImplementation(() => new Promise(() => {}));
      localStorage.setItem('userEmail', 'test@example.com');
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should check auth on mount when email is stored', async () => {
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' };
      vi.mocked(apiClient.getCurrentUser).mockResolvedValue({ user: mockUser });
      localStorage.setItem('userEmail', 'test@example.com');
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });
      
      expect(apiClient.getCurrentUser).toHaveBeenCalled();
    });

    it('should clear stored email on auth check failure', async () => {
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Auth failed'));
      localStorage.setItem('userEmail', 'test@example.com');
      
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
      });
      
      expect(localStorage.getItem('userEmail')).toBeNull();
      consoleError.mockRestore();
    });

    it('should not check auth when no email is stored', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
      });
      
      expect(apiClient.getCurrentUser).not.toHaveBeenCalled();
    });

    it('should login successfully', async () => {
      const user = userEvent.setup();
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' };
      vi.mocked(apiClient.login).mockResolvedValue({ user: mockUser });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
      });
      
      await user.click(screen.getByText('Login'));
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });
      
      expect(localStorage.getItem('userEmail')).toBe('test@example.com');
    });

    it('should handle login failure', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.login).mockRejectedValue(new Error('Login failed'));
      
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onLoginError = vi.fn();
      
      render(
        <AuthProvider>
          <TestComponent onLoginError={onLoginError} />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
      });
      
      await user.click(screen.getByText('Login'));
      
      await waitFor(() => {
        expect(onLoginError).toHaveBeenCalled();
      });
      
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
      consoleError.mockRestore();
    });

    it('should logout successfully', async () => {
      const user = userEvent.setup();
      const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' };
      vi.mocked(apiClient.getCurrentUser).mockResolvedValue({ user: mockUser });
      localStorage.setItem('userEmail', 'test@example.com');
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
      
      await user.click(screen.getByText('Logout'));
      
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no user');
      expect(localStorage.getItem('userEmail')).toBeNull();
    });
  });
});
