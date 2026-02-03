import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';

vi.mock('../api/client', () => ({
  default: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
  },
}));

const TestComponent = () => {
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

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render children', async () => {
    vi.mocked(apiClient.getCurrentUser).mockRejectedValue(new Error('Not authenticated'));
    
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );
    
    expect(screen.getByText('Test Child')).toBeInTheDocument();
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
    expect(screen.getByTestId('user')).toHaveTextContent('stored@example.com');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
  });

  it('should clear localStorage on auth check failure', async () => {
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
    
    await act(async () => {
      await user.click(screen.getByText('Login'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
    
    expect(localStorage.getItem('userEmail')).toBe('test@example.com');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
  });

  it('should handle login failure and remain unauthenticated', async () => {
    vi.mocked(apiClient.login).mockRejectedValue(new Error('Login failed'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
    
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(apiClient.login).not.toHaveBeenCalled();
  });

  it('should logout successfully', async () => {
    const user = userEvent.setup();
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
    
    await act(async () => {
      await user.click(screen.getByText('Logout'));
    });
    
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(localStorage.getItem('userEmail')).toBeNull();
  });
});
