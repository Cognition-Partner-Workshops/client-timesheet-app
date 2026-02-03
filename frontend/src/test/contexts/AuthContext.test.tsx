import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn()
  }
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

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
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
    it('should render children', async () => {
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
      
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
      localStorage.setItem('userEmail', 'stored@example.com');
      vi.mocked(apiClient.getCurrentUser).mockResolvedValue({ 
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
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('stored@example.com');
    });

    it('should clear stored email on auth check failure', async () => {
      localStorage.setItem('userEmail', 'stored@example.com');
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Auth failed'));

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

    it('should not check auth when no email is stored', async () => {
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
      vi.mocked(apiClient.login).mockResolvedValue({ 
        message: 'Login successful',
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

      const user = userEvent.setup();
      await user.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });

      expect(apiClient.login).toHaveBeenCalledWith('test@example.com');
      expect(localStorage.getItem('userEmail')).toBe('test@example.com');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    it('should handle login failure', async () => {
      vi.mocked(apiClient.login).mockRejectedValue(new Error('Login failed'));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponentWithErrorHandling = () => {
        const { login, isLoading, isAuthenticated } = useAuth();
        const [error, setError] = React.useState<string | null>(null);
        
        const handleLogin = async () => {
          try {
            await login('test@example.com');
          } catch {
            setError('Login failed');
          }
        };
        
        return (
          <div>
            <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
            <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
            <div data-testid="error">{error || 'no-error'}</div>
            <button onClick={handleLogin}>Login</button>
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

      const user = userEvent.setup();
      await user.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Login failed');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      consoleError.mockRestore();
    });

    it('should logout successfully', async () => {
      localStorage.setItem('userEmail', 'test@example.com');
      vi.mocked(apiClient.getCurrentUser).mockResolvedValue({ 
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

      const user = userEvent.setup();
      await user.click(screen.getByText('Logout'));

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
      expect(localStorage.getItem('userEmail')).toBeNull();
    });
  });
});
