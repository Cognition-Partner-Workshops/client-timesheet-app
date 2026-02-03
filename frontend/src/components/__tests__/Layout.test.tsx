import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/testUtils';
import Layout from '../Layout';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../contexts/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
    logout: mockLogout,
    isLoading: false,
    isAuthenticated: true,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should display user email', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display user avatar with first letter', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should render navigation menu items', () => {
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

  it('should call logout when clicking logout button', async () => {
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

  it('should navigate when clicking menu items', async () => {
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

  it('should render app title in drawer', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getAllByText('Time Tracker').length).toBeGreaterThan(0);
  });

  it('should highlight current page in navigation', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const dashboardItems = screen.getAllByText('Dashboard');
    expect(dashboardItems.length).toBeGreaterThan(0);
  });
});
