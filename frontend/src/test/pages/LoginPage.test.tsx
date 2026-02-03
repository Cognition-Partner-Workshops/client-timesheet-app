import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import { AuthContext, type AuthContextType } from '../../contexts/AuthContextValue';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLoginPage = (authContext: Partial<AuthContextType> = {}) => {
  const defaultContext: AuthContextType = {
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: false,
    ...authContext,
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={defaultContext}>
        <LoginPage />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    renderLoginPage();

    expect(screen.getByText('Time Tracker')).toBeInTheDocument();
    expect(screen.getByText('Enter your email to log in')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('should have disabled submit button when email is empty', () => {
    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: /log in/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when email is entered', async () => {
    renderLoginPage();
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /log in/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should call login function on form submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    renderLoginPage({ login: mockLogin });
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should navigate to dashboard on successful login', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    renderLoginPage({ login: mockLogin });
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error message on login failure', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: { data: { error: 'Invalid email' } },
    });
    renderLoginPage({ login: mockLogin });
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid@example.com');

    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('should display info message about no password field', () => {
    renderLoginPage();

    expect(screen.getByText(/this app intentionally does not have a password field/i)).toBeInTheDocument();
  });
});
