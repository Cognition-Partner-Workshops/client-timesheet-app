import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

vi.mock('../../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

import apiClient from '../../api/client';

const TestComponent: React.FC = () => {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user?.email || 'no-user'}</div>
      <button onClick={() => login('test@example.com')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
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
    it('should provide initial state with isLoading true', async () => {
      vi.mocked(apiClient.getCurrentUser).mockResolvedValue({ user: null });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });
    });

    it('should set isAuthenticated to false when no user', async () => {
      vi.mocked(apiClient.getCurrentUser).mockResolvedValue({ user: null });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
      });
    });

    it('should check auth on mount when email is stored', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('stored@example.com');
      vi.mocked(apiClient.getCurrentUser).mockResolvedValue({ 
        user: { email: 'stored@example.com', createdAt: '2024-01-01' } 
      });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(apiClient.getCurrentUser).toHaveBeenCalled();
        expect(screen.getByTestId('user')).toHaveTextContent('stored@example.com');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
      });
    });

    it('should clear localStorage when auth check fails', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('stored@example.com');
      vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Auth failed'));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('userEmail');
      });
      
      consoleError.mockRestore();
    });

    it('should login successfully', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.login).mockResolvedValue({ 
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
        expect(apiClient.login).toHaveBeenCalledWith('test@example.com');
        expect(localStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });
    });

    it('should call login API when login is triggered', async () => {
      const user = userEvent.setup();
      vi.mocked(apiClient.login).mockResolvedValue({ 
        user: { email: 'another@example.com', createdAt: '2024-01-01' } 
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
        expect(apiClient.login).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should logout successfully', async () => {
      const user = userEvent.setup();
      vi.mocked(localStorage.getItem).mockReturnValue('test@example.com');
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

      await user.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('userEmail');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });
    });

    it('should not call getCurrentUser when no email stored', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      
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
  });
});
