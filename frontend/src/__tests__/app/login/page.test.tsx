import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import { AuthContext, AuthContextType } from '@/contexts/AuthContextValue';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/login',
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithAuth = (authValue: AuthContextType) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <LoginPage />
      </AuthContext.Provider>
    );
  };

  it('should show loading spinner when isLoading is true', () => {
    const authValue: AuthContextType = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: true,
      isAuthenticated: false,
    };

    renderWithAuth(authValue);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should redirect to dashboard when already authenticated', async () => {
    const authValue: AuthContextType = {
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isAuthenticated: true,
    };

    renderWithAuth(authValue);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should render login form when not authenticated', async () => {
    const authValue: AuthContextType = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
    };

    renderWithAuth(authValue);

    expect(screen.getByText('Time Tracker')).toBeInTheDocument();
    expect(screen.getByText('Enter your email to log in')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('should show info alert about no password', () => {
    const authValue: AuthContextType = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
    };

    renderWithAuth(authValue);

    expect(screen.getByText(/this app intentionally does not have a password field/i)).toBeInTheDocument();
  });

  it('should disable submit button when email is empty', () => {
    const authValue: AuthContextType = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
    };

    renderWithAuth(authValue);

    const submitButton = screen.getByRole('button', { name: /log in/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when email is entered', async () => {
    const user = userEvent.setup();
    const authValue: AuthContextType = {
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
    };

    renderWithAuth(authValue);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /log in/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should call login and redirect on successful submit', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    const authValue: AuthContextType = {
      user: null,
      login: mockLogin,
      logout: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
    };

    renderWithAuth(authValue);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com');
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show error message on login failure', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn().mockRejectedValue({
      response: { data: { error: 'Invalid email' } },
    });
    const authValue: AuthContextType = {
      user: null,
      login: mockLogin,
      logout: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
    };

    renderWithAuth(authValue);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid@example.com');

    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('should show generic error message when no specific error', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn().mockRejectedValue(new Error('Network error'));
    const authValue: AuthContextType = {
      user: null,
      login: mockLogin,
      logout: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
    };

    renderWithAuth(authValue);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });
});
