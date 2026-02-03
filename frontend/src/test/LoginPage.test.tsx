import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { AuthContext, type AuthContextType } from '../contexts/authContextDef';
import type { ReactNode } from 'react';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createWrapper = (authValue: AuthContextType) => {
  return ({ children }: { children: ReactNode }) => (
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const defaultAuthValue: AuthContextType = {
    user: null,
    login: mockLogin,
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    render(<LoginPage />, { wrapper: createWrapper(defaultAuthValue) });

    expect(screen.getByText('Time Tracker')).toBeInTheDocument();
    expect(screen.getByText('Enter your email to log in')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('should disable login button when email is empty', () => {
    render(<LoginPage />, { wrapper: createWrapper(defaultAuthValue) });

    const loginButton = screen.getByRole('button', { name: /log in/i });
    expect(loginButton).toBeDisabled();
  });

  it('should enable login button when email is entered', async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper: createWrapper(defaultAuthValue) });

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const loginButton = screen.getByRole('button', { name: /log in/i });
    expect(loginButton).not.toBeDisabled();
  });

  it('should call login and navigate on successful submit', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />, { wrapper: createWrapper(defaultAuthValue) });

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const loginButton = screen.getByRole('button', { name: /log in/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error message on login failure', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue({
      response: { data: { error: 'Invalid email' } },
    });

    render(<LoginPage />, { wrapper: createWrapper(defaultAuthValue) });

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid@example.com');

    const loginButton = screen.getByRole('button', { name: /log in/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('should display generic error message when no specific error', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Network error'));

    render(<LoginPage />, { wrapper: createWrapper(defaultAuthValue) });

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const loginButton = screen.getByRole('button', { name: /log in/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    let resolveLogin: () => void;
    mockLogin.mockImplementation(() => new Promise((resolve) => {
      resolveLogin = resolve;
    }));

    render(<LoginPage />, { wrapper: createWrapper(defaultAuthValue) });

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const loginButton = screen.getByRole('button', { name: /log in/i });
    await user.click(loginButton);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    resolveLogin!();
  });

  it('should display info message about no password', () => {
    render(<LoginPage />, { wrapper: createWrapper(defaultAuthValue) });

    expect(screen.getByText(/this app intentionally does not have a password field/i)).toBeInTheDocument();
  });
});
