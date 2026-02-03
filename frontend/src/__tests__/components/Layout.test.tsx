import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../../components/Layout';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
    logout: mockLogout,
  }),
}));

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children content', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div data-testid="child-content">Test Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should display user email', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display user avatar with first letter of email', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should render navigation menu items', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Clients').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Work Entries').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0);
  });

  it('should render Time Tracker title in drawer', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getAllByText('Time Tracker').length).toBeGreaterThan(0);
  });

  it('should render logout button', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /logout/i }));

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should navigate when menu item is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );

    const clientsButtons = screen.getAllByText('Clients');
    await user.click(clientsButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('should toggle mobile drawer when menu icon is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );

    const menuButton = screen.getByLabelText('open drawer');
    await user.click(menuButton);
  });
});
