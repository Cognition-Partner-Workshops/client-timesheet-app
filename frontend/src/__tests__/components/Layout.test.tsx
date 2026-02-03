import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../../components/Layout';

vi.mock('../../api/client', () => ({
  default: {
    getCurrentUser: vi.fn().mockResolvedValue({ user: { email: 'test@example.com', createdAt: '2024-01-01' } }),
    login: vi.fn(),
  },
  apiClient: {
    getCurrentUser: vi.fn().mockResolvedValue({ user: { email: 'test@example.com', createdAt: '2024-01-01' } }),
    login: vi.fn(),
  },
}));

const mockUser = { email: 'test@example.com', createdAt: '2024-01-01' };

vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
      isAuthenticated: true,
    }),
  };
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children content', () => {
    renderWithProviders(
      <Layout>
        <div data-testid="child-content">Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render the app title', () => {
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getAllByText('Time Tracker').length).toBeGreaterThan(0);
  });

  it('should render navigation menu items', () => {
    renderWithProviders(
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
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display user avatar with first letter of email', () => {
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should render logout button', () => {
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('should have mobile menu toggle button', () => {
    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    expect(screen.getByLabelText('open drawer')).toBeInTheDocument();
  });
});
