import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../DashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import apiClient from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getWorkEntries: vi.fn(),
  },
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const theme = createTheme();

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const renderDashboardPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <DashboardPage />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
  });

  it('should render dashboard title', async () => {
    renderDashboardPage();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render stats cards', async () => {
    renderDashboardPage();

    expect(screen.getByText('Total Clients')).toBeInTheDocument();
    expect(screen.getByText('Total Work Entries')).toBeInTheDocument();
    expect(screen.getByText('Total Hours')).toBeInTheDocument();
  });

  it('should display client count', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client 1' },
        { id: 2, name: 'Client 2' },
      ],
    });

    renderDashboardPage();

    await screen.findByText('2');
  });

  it('should display work entries count', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, hours: 8, client_name: 'Client 1', date: '2024-01-01' },
        { id: 2, hours: 4, client_name: 'Client 2', date: '2024-01-02' },
        { id: 3, hours: 6, client_name: 'Client 1', date: '2024-01-03' },
      ],
    });

    renderDashboardPage();

    await screen.findByText('3');
  });

  it('should display total hours', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, hours: 8, client_name: 'Client 1', date: '2024-01-01' },
        { id: 2, hours: 4, client_name: 'Client 2', date: '2024-01-02' },
      ],
    });

    renderDashboardPage();

    await screen.findByText('12.00');
  });

  it('should render quick actions', async () => {
    renderDashboardPage();

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view reports/i })).toBeInTheDocument();
  });

  it('should navigate to clients page when Add Client is clicked', async () => {
    const user = userEvent.setup();
    renderDashboardPage();

    const addClientButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addClientButton);

    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('should navigate to work entries page when Add Work Entry is clicked', async () => {
    const user = userEvent.setup();
    renderDashboardPage();

    const addWorkEntryButton = screen.getByRole('button', { name: /add work entry/i });
    await user.click(addWorkEntryButton);

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
  });

  it('should navigate to reports page when View Reports is clicked', async () => {
    const user = userEvent.setup();
    renderDashboardPage();

    const viewReportsButton = screen.getByRole('button', { name: /view reports/i });
    await user.click(viewReportsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });

  it('should display recent work entries', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, hours: 8, client_name: 'Test Client', date: '2024-01-01', description: 'Test work' },
      ],
    });

    renderDashboardPage();

    await screen.findByText('Test Client');
    await screen.findByText(/8 hours/);
    await screen.findByText('Test work');
  });

  it('should show message when no work entries exist', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    renderDashboardPage();

    await screen.findByText('No work entries yet');
  });
});
