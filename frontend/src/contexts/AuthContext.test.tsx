import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import apiClient from '../api/client';

vi.mock('../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

const TestComponent = () => {
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

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
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
          <div data-testid="child">Child content</div>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('child')).toHaveTextContent('Child content');
      });
    });

    it('should start with loading state', async () => {
      vi.mocked(apiClient.getCurrentUser).mockImplementation(() => new Promise(() => {}));
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    });

    it('should check auth on mount when email is stored', async () => {
      localStorage.setItem('userEmail', 'test@example.com');
      vi.mocked(apiClient.getCurrentUser).mockResolvedValue({ user: { email: 'test@example.com' } });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });
    });

    it('should handle auth check failure', async () => {
      localStorage.setItem('userEmail', 'test@example.com');
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Auth failed'));
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      });

      expect(localStorage.getItem('userEmail')).toBeNull();
      consoleError.mockRestore();
    });

    it('should not check auth when no email is stored', async () => {
      vi.mocked(apiClient.getCurrentUser).mockResolvedValue({ user: { email: 'test@example.com' } });
      
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
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('No user'));
      vi.mocked(apiClient.login).mockResolvedValue({ user: { email: 'test@example.com' } });
      
      const user = userEvent.setup();
      
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
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      expect(localStorage.getItem('userEmail')).toBe('test@example.com');
    });

    it('should handle login failure', async () => {
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('No user'));
      vi.mocked(apiClient.login).mockRejectedValue(new Error('Login failed'));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(consoleError).not.toHaveBeenCalled();
      
      consoleError.mockRestore();
    });

    it('should logout successfully', async () => {
      localStorage.setItem('userEmail', 'test@example.com');
      vi.mocked(apiClient.getCurrentUser).mockResolvedValue({ user: { email: 'test@example.com' } });
      
      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });

      await user.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });

      expect(localStorage.getItem('userEmail')).toBeNull();
    });
  });
});
