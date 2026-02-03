import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/testUtils';
import Layout from '../Layout';
import { useAuth } from '../../contexts/useAuth';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

vi.mock('../../contexts/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('Layout', () => {
  const mockLogout = vi.fn();
  const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      logout: mockLogout,
      isLoading: false,
      isAuthenticated: true,
    });
  });

  it('renders children content', () => {
    render(
      <Layout>
        <div data-testid="child-content">Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays user email in header', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('displays user avatar with first letter of email', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders navigation menu items', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Clients').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Work Entries').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0);
  });

  it('calls logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('navigates to correct path when menu item is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    const clientsMenuItem = screen.getAllByText('Clients')[0];
    await user.click(clientsMenuItem);
    
    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('displays app title in drawer', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getAllByText('Time Tracker').length).toBeGreaterThan(0);
  });
});
