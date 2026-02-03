import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';

vi.mock('../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

import apiClient from '../api/client';

const TestComponent = () => {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user?.email || 'no-user'}</div>
      <button onClick={() => login('test@example.com').catch(() => {})}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
  });

  describe('AuthProvider', () => {
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

    it('should set isAuthenticated to false when no stored email', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.login).mockResolvedValue({
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
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      expect(apiClient.login).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle login failure gracefully', async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(apiClient.login).mockRejectedValue(new Error('Login failed'));

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

  describe('logout', () => {
    it('should logout and clear user', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.login).mockResolvedValue({
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
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      await user.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    });
  });
});
