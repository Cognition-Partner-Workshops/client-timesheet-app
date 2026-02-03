import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import { render } from '../test/test-utils';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isLoading: false,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Time Tracker')).toBeInTheDocument();
    expect(screen.getByText('Enter your email to log in')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('should show info alert about no password', () => {
    render(<LoginPage />);
    
    expect(screen.getByText(/this app intentionally does not have a password field/i)).toBeInTheDocument();
  });

  it('should disable submit button when email is empty', () => {
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when email is entered', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should call login and navigate on successful submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com');
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show error message on login failure', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { error: 'Invalid email' } },
    });
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'bad@example.com');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('should show default error message when no specific error', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('should disable input during loading', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(emailInput).toBeDisabled();
    });
  });

  it('should prevent default form submission', async () => {
    mockLogin.mockResolvedValue(undefined);
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const form = emailInput.closest('form');
    expect(form).toBeInTheDocument();
    
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: vi.fn() });
    
    form?.dispatchEvent(submitEvent);
    
    expect(submitEvent.preventDefault).toHaveBeenCalled();
  });
});
