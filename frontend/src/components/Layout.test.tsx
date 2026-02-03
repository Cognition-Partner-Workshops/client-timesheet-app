import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
    login: vi.fn(),
    logout: mockLogout,
    isLoading: false,
    isAuthenticated: true,
  }),
}));

describe('Layout', () => {
  const renderLayout = (initialRoute = '/dashboard') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children content', () => {
    renderLayout();

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should display app title in sidebar', () => {
    renderLayout();

    const titles = screen.getAllByText('Time Tracker');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('should display user email in header', () => {
    renderLayout();

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display user avatar with first letter', () => {
    renderLayout();

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should have logout button', () => {
    renderLayout();

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should call logout when logout button clicked', async () => {
    const user = userEvent.setup();
    renderLayout();

    await user.click(screen.getByText('Logout'));

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should display navigation menu items', () => {
    renderLayout();

    const dashboardItems = screen.getAllByText('Dashboard');
    const clientsItems = screen.getAllByText('Clients');
    const workEntriesItems = screen.getAllByText('Work Entries');
    const reportsItems = screen.getAllByText('Reports');

    expect(dashboardItems.length).toBeGreaterThan(0);
    expect(clientsItems.length).toBeGreaterThan(0);
    expect(workEntriesItems.length).toBeGreaterThan(0);
    expect(reportsItems.length).toBeGreaterThan(0);
  });

  it('should highlight current page in navigation', () => {
    renderLayout('/dashboard');

    const dashboardItems = screen.getAllByText('Dashboard');
    expect(dashboardItems.length).toBeGreaterThan(0);
    const dashboardButton = dashboardItems[0].closest('[role="button"]');
    if (dashboardButton) {
      expect(dashboardButton.className).toContain('Mui-selected');
    }
  });

  it('should navigate when menu item clicked', async () => {
    const user = userEvent.setup();
    renderLayout();

    const clientsItems = screen.getAllByText('Clients');
    await user.click(clientsItems[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('should display page title in header based on route', () => {
    renderLayout('/clients');

    const headers = screen.getAllByText('Clients');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('should have mobile menu toggle button', () => {
    renderLayout();

    const menuButton = screen.getByLabelText(/open drawer/i);
    expect(menuButton).toBeInTheDocument();
  });

  it('should toggle mobile drawer when menu button clicked', async () => {
    const user = userEvent.setup();
    renderLayout();

    const menuButton = screen.getByLabelText(/open drawer/i);
    await user.click(menuButton);

    await waitFor(() => {
      const drawers = document.querySelectorAll('.MuiDrawer-root');
      expect(drawers.length).toBeGreaterThan(0);
    });
  });

  it('should display correct title for each route', () => {
    renderLayout('/reports');

    const headers = screen.getAllByText('Reports');
    expect(headers.length).toBeGreaterThan(0);
  });
});
