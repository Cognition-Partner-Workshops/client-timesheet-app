import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../contexts/AuthContext';
import apiClient from '../api/client';

vi.mock('../api/client', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render login form', async () => {
    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByText('Time Tracker')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/enter your email to log in/i)).toBeInTheDocument();
    expect(screen.getByText(/this app intentionally does not have a password field/i)).toBeInTheDocument();
  });

  it('should disable submit button when email is empty', async () => {
    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled();
    });
  });

  it('should enable submit button when email is entered', async () => {
    renderLoginPage();

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/email address/i);

    await user.type(emailInput, 'test@example.com');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).not.toBeDisabled();
    });
  });

  it('should call login and navigate on successful submit', async () => {
    vi.mocked(apiClient.login).mockResolvedValue({
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
    });

    renderLoginPage();

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(apiClient.login).toHaveBeenCalledWith('test@example.com');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error message on login failure', async () => {
    vi.mocked(apiClient.login).mockRejectedValue({
      response: { data: { error: 'Invalid email' } },
    });

    renderLoginPage();

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    await user.type(emailInput, 'invalid@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('should display generic error message when no specific error', async () => {
    vi.mocked(apiClient.login).mockRejectedValue(new Error('Network error'));

    renderLoginPage();

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    vi.mocked(apiClient.login).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    renderLoginPage();

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('should disable input during loading', async () => {
    vi.mocked(apiClient.login).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    renderLoginPage();

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
    });
  });
});
