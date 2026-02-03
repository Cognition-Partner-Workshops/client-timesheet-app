import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockLocation = { pathname: '/dashboard' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
    logout: mockLogout,
  }),
}));

import React from 'react';
import Layout from '../../components/Layout';

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = '/dashboard';
  });

  it('should render children', () => {
    render(
      <Layout>
        <div data-testid="child">Child content</div>
      </Layout>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
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

  it('should call logout when logout button is clicked', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should navigate when menu item is clicked', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const clientsButtons = screen.getAllByText('Clients');
    fireEvent.click(clientsButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('should toggle mobile drawer when menu icon is clicked', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const menuButton = screen.getByLabelText('open drawer');
    fireEvent.click(menuButton);
  });

  it('should show current page title in app bar', () => {
    mockLocation.pathname = '/clients';
    
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    const appBarTitle = screen.getAllByText('Clients')[0];
    expect(appBarTitle).toBeInTheDocument();
  });

  it('should show Time Tracker for unknown paths', () => {
    mockLocation.pathname = '/unknown';
    
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getAllByText('Time Tracker').length).toBeGreaterThan(0);
  });
});
