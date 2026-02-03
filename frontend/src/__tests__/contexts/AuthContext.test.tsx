import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';

vi.mock('../../api/client', () => ({
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
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <button onClick={() => login('test@example.com')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleError.mockRestore();
    });
  });

  describe('AuthProvider', () => {
    it('should show loading state initially', async () => {
      (apiClient.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({ user: null });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    });

    it('should check auth on mount when email is stored', async () => {
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('stored@example.com');
      (apiClient.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({ 
        user: { email: 'stored@example.com', createdAt: '2024-01-01' } 
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
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    it('should clear stored email on auth check failure', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('stored@example.com');
      (apiClient.getCurrentUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Auth failed'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(window.localStorage.removeItem).toHaveBeenCalledWith('userEmail');
      consoleError.mockRestore();
    });

    it('should not check auth when no email is stored', async () => {
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);

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

    it('should login successfully', async () => {
      const user = userEvent.setup();
      (apiClient.login as ReturnType<typeof vi.fn>).mockResolvedValue({ 
        user: { email: 'test@example.com', createdAt: '2024-01-01' } 
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

      expect(apiClient.login).toHaveBeenCalledWith('test@example.com');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    it('should handle login failure', async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      (apiClient.login as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Login failed'));

      const TestComponentWithErrorHandling = () => {
        const { user, isLoading, isAuthenticated, login, logout } = useAuth();
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
            <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
            <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
            <div data-testid="user-email">{user?.email || 'no-user'}</div>
            <div data-testid="error">{error || 'no-error'}</div>
            <button onClick={handleLogin}>Login</button>
            <button onClick={logout}>Logout</button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponentWithErrorHandling />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      await user.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Login failed');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      consoleError.mockRestore();
    });

    it('should logout successfully', async () => {
      const user = userEvent.setup();
      (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('test@example.com');
      (apiClient.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({ 
        user: { email: 'test@example.com', createdAt: '2024-01-01' } 
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

      expect(window.localStorage.removeItem).toHaveBeenCalledWith('userEmail');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    });
  });
});
