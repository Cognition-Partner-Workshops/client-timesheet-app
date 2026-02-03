import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Layout from '../Layout';
import { AuthContext, type AuthContextType } from '../../contexts/AuthContextDef';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const theme = createTheme();

const renderLayout = (
  authContextValue: Partial<AuthContextType> = {},
  initialRoute: string = '/dashboard'
) => {
  const defaultAuthContext: AuthContextType = {
    user: { email: 'test@example.com', createdAt: '2024-01-01' },
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: true,
    ...authContextValue,
  };

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={defaultAuthContext}>
          <Layout>
            <div data-testid="child-content">Child Content</div>
          </Layout>
        </AuthContext.Provider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', () => {
    renderLayout();

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should display app title in drawer', () => {
    renderLayout();

    expect(screen.getAllByText('Time Tracker').length).toBeGreaterThan(0);
  });

  it('should display user email', () => {
    renderLayout();

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display user avatar with first letter', () => {
    renderLayout();

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should render navigation menu items', () => {
    renderLayout();

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Clients').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Work Entries').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0);
  });

  it('should render logout button', () => {
    renderLayout();

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    const mockLogout = vi.fn();
    renderLayout({ logout: mockLogout });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('should navigate to dashboard when Dashboard menu item is clicked', async () => {
    const user = userEvent.setup();
    renderLayout();

    const dashboardItems = screen.getAllByText('Dashboard');
    const menuItem = dashboardItems.find(el => el.closest('[role="button"]'));
    if (menuItem) {
      await user.click(menuItem);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should navigate to clients when Clients menu item is clicked', async () => {
    const user = userEvent.setup();
    renderLayout();

    const clientsItems = screen.getAllByText('Clients');
    const menuItem = clientsItems.find(el => el.closest('[role="button"]'));
    if (menuItem) {
      await user.click(menuItem);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('should navigate to work entries when Work Entries menu item is clicked', async () => {
    const user = userEvent.setup();
    renderLayout();

    const workEntriesItems = screen.getAllByText('Work Entries');
    const menuItem = workEntriesItems.find(el => el.closest('[role="button"]'));
    if (menuItem) {
      await user.click(menuItem);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
  });

  it('should navigate to reports when Reports menu item is clicked', async () => {
    const user = userEvent.setup();
    renderLayout();

    const reportsItems = screen.getAllByText('Reports');
    const menuItem = reportsItems.find(el => el.closest('[role="button"]'));
    if (menuItem) {
      await user.click(menuItem);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });

  it('should render mobile menu toggle button', () => {
    renderLayout();

    expect(screen.getByLabelText('open drawer')).toBeInTheDocument();
  });

  it('should toggle mobile drawer when menu button is clicked', async () => {
    const user = userEvent.setup();
    renderLayout();

    const menuButton = screen.getByLabelText('open drawer');
    await user.click(menuButton);

    const drawers = document.querySelectorAll('.MuiDrawer-root');
    expect(drawers.length).toBeGreaterThan(0);
  });
});
