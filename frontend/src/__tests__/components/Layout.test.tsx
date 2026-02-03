import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Layout from '@/components/Layout';
import { AuthContext, AuthContextType } from '@/contexts/AuthContextValue';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}));

describe('Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAuthContext: AuthContextType = {
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    isAuthenticated: true,
  };

  const renderWithAuth = (children: React.ReactNode) => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <Layout>{children}</Layout>
      </AuthContext.Provider>
    );
  };

  it('should render children', () => {
    renderWithAuth(<div>Test Content</div>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should display user email', () => {
    renderWithAuth(<div>Test Content</div>);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display user avatar with first letter', () => {
    renderWithAuth(<div>Test Content</div>);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should render navigation menu items', () => {
    renderWithAuth(<div>Test Content</div>);
    const dashboardItems = screen.getAllByText('Dashboard');
    const clientsItems = screen.getAllByText('Clients');
    const workEntriesItems = screen.getAllByText('Work Entries');
    const reportsItems = screen.getAllByText('Reports');
    expect(dashboardItems.length).toBeGreaterThan(0);
    expect(clientsItems.length).toBeGreaterThan(0);
    expect(workEntriesItems.length).toBeGreaterThan(0);
    expect(reportsItems.length).toBeGreaterThan(0);
  });

  it('should navigate to dashboard when clicking Dashboard menu item', () => {
    renderWithAuth(<div>Test Content</div>);
    const dashboardItems = screen.getAllByText('Dashboard');
    fireEvent.click(dashboardItems[1]);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should navigate to clients when clicking Clients menu item', () => {
    renderWithAuth(<div>Test Content</div>);
    const clientsItems = screen.getAllByText('Clients');
    fireEvent.click(clientsItems[0]);
    expect(mockPush).toHaveBeenCalledWith('/clients');
  });

  it('should navigate to work-entries when clicking Work Entries menu item', () => {
    renderWithAuth(<div>Test Content</div>);
    const workEntriesItems = screen.getAllByText('Work Entries');
    fireEvent.click(workEntriesItems[0]);
    expect(mockPush).toHaveBeenCalledWith('/work-entries');
  });

  it('should navigate to reports when clicking Reports menu item', () => {
    renderWithAuth(<div>Test Content</div>);
    const reportsItems = screen.getAllByText('Reports');
    fireEvent.click(reportsItems[0]);
    expect(mockPush).toHaveBeenCalledWith('/reports');
  });

  it('should call logout and redirect to login when clicking Logout button', () => {
    renderWithAuth(<div>Test Content</div>);
    fireEvent.click(screen.getByText('Logout'));
    expect(mockAuthContext.logout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should toggle mobile drawer when clicking menu icon', () => {
    renderWithAuth(<div>Test Content</div>);
    const menuButton = screen.getByLabelText('open drawer');
    fireEvent.click(menuButton);
  });

  it('should display Time Tracker title in drawer', () => {
    renderWithAuth(<div>Test Content</div>);
    const titles = screen.getAllByText('Time Tracker');
    expect(titles.length).toBeGreaterThan(0);
  });
});
