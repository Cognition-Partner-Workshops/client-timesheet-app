import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import { AuthProvider } from '../../contexts/AuthContext';
import apiClient from '../../api/client';

vi.mock('../../api/client', () => ({
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
    (window.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', async () => {
    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByText('Time Tracker')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/enter your email to log in/i)).toBeInTheDocument();
  });

  it('should show info alert about no password', async () => {
    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByText(/this app intentionally does not have a password field/i)).toBeInTheDocument();
    });
  });

  it('should disable login button when email is empty', async () => {
    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled();
    });
  });

  it('should enable login button when email is entered', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');

    expect(screen.getByRole('button', { name: /log in/i })).toBeEnabled();
  });

  it('should call login and navigate on successful submit', async () => {
    const user = userEvent.setup();
    (apiClient.login as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: 'test@example.com', createdAt: '2024-01-01' },
    });

    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(apiClient.login).toHaveBeenCalledWith('test@example.com');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show error message on login failure', async () => {
    const user = userEvent.setup();
    (apiClient.login as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { data: { error: 'Invalid email' } },
    });

    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email address/i), 'invalid@example.com');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('should show generic error message when no specific error', async () => {
    const user = userEvent.setup();
    (apiClient.login as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: unknown) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    (apiClient.login as ReturnType<typeof vi.fn>).mockReturnValue(loginPromise);

    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    resolveLogin!({ user: { email: 'test@example.com' } });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('should disable email input during loading', async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: unknown) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    (apiClient.login as ReturnType<typeof vi.fn>).mockReturnValue(loginPromise);

    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(screen.getByLabelText(/email address/i)).toBeDisabled();

    resolveLogin!({ user: { email: 'test@example.com' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeEnabled();
    });
  });
});
