import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Layout from './Layout';
import { render } from '../test/test-utils';

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

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
    logout: mockLogout,
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
  }),
}));

describe('Layout', () => {
  it('should render children', () => {
    render(
      <Layout>
        <div data-testid="child">Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should display app title in drawer', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getAllByText('Time Tracker').length).toBeGreaterThan(0);
  });

  it('should display logout button', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('should call logout when clicking logout button', async () => {
    const user = userEvent.setup();
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    await user.click(screen.getByRole('button', { name: /logout/i }));
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('should have mobile menu toggle button', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getByLabelText('open drawer')).toBeInTheDocument();
  });
});
