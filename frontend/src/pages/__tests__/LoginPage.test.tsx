import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../LoginPage';
import { AuthContext, type AuthContextType } from '../../contexts/AuthContextDef';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const theme = createTheme();

const renderLoginPage = (authContextValue: Partial<AuthContextType> = {}) => {
  const defaultAuthContext: AuthContextType = {
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: false,
    ...authContextValue,
  };

  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={defaultAuthContext}>
          <LoginPage />
        </AuthContext.Provider>
      </ThemeProvider>
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

  it('should show info alert about no password', () => {
    renderLoginPage();

    expect(screen.getByText(/this app intentionally does not have a password field/i)).toBeInTheDocument();
  });

  it('should disable login button when email is empty', () => {
    renderLoginPage();

    const loginButton = screen.getByRole('button', { name: /log in/i });
    expect(loginButton).toBeDisabled();
  });

  it('should enable login button when email is entered', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const loginButton = screen.getByRole('button', { name: /log in/i });
    expect(loginButton).toBeEnabled();
  });

  it('should call login and navigate on successful login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValueOnce(undefined);
    renderLoginPage({ login: mockLogin });

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const loginButton = screen.getByRole('button', { name: /log in/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show error message on login failure', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockRejectedValueOnce({
      response: { data: { error: 'Invalid email' } },
    });
    renderLoginPage({ login: mockLogin });

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid@example.com');

    const loginButton = screen.getByRole('button', { name: /log in/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('should show generic error message when no specific error is provided', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockRejectedValueOnce(new Error('Network error'));
    renderLoginPage({ login: mockLogin });

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
    const mockLogin = vi.fn().mockImplementation(() => new Promise(() => {}));
    renderLoginPage({ login: mockLogin });

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const loginButton = screen.getByRole('button', { name: /log in/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
