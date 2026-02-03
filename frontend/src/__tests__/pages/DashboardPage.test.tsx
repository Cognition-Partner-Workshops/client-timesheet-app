import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '../../pages/DashboardPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getWorkEntries: vi.fn(),
  },
}));

import apiClient from '../../api/client';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
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
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render stats cards', async () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Total Clients')).toBeInTheDocument();
    expect(screen.getByText('Total Work Entries')).toBeInTheDocument();
    expect(screen.getByText('Total Hours')).toBeInTheDocument();
  });

  it('should display correct client count', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client 1' },
        { id: 2, name: 'Client 2' },
      ],
    });

    renderWithProviders(<DashboardPage />);

    await screen.findByText('2');
  });

  it('should display correct work entries count', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, hours: 5, date: '2024-01-01' },
        { id: 2, hours: 3, date: '2024-01-02' },
        { id: 3, hours: 8, date: '2024-01-03' },
      ],
    });

    renderWithProviders(<DashboardPage />);

    await screen.findByText('3');
  });

  it('should calculate and display total hours', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, hours: 5, date: '2024-01-01' },
        { id: 2, hours: 3.5, date: '2024-01-02' },
      ],
    });

    renderWithProviders(<DashboardPage />);

    await screen.findByText('8.50');
  });

  it('should render quick actions section', async () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view reports/i })).toBeInTheDocument();
  });

  it('should render recent work entries section', async () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Recent Work Entries')).toBeInTheDocument();
  });

  it('should display no work entries message when empty', async () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('No work entries yet')).toBeInTheDocument();
  });

  it('should display recent work entries when available', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_name: 'Test Client', hours: 5, date: '2024-01-15', description: 'Test work' },
      ],
    });

    renderWithProviders(<DashboardPage />);

    await screen.findByText('Test Client');
    expect(screen.getByText(/5 hours/)).toBeInTheDocument();
    expect(screen.getByText('Test work')).toBeInTheDocument();
  });

  it('should navigate to clients page when Add Client is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />);

    await user.click(screen.getByRole('button', { name: /add client/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('should navigate to work entries page when Add Work Entry is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />);

    await user.click(screen.getByRole('button', { name: /add work entry/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
  });

  it('should navigate to reports page when View Reports is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />);

    await user.click(screen.getByRole('button', { name: /view reports/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });

  it('should navigate to work entries when Add Entry button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />);

    await user.click(screen.getByRole('button', { name: /add entry/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
  });

  it('should only show first 5 recent entries', async () => {
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_name: 'Client 1', hours: 1, date: '2024-01-01' },
        { id: 2, client_name: 'Client 2', hours: 2, date: '2024-01-02' },
        { id: 3, client_name: 'Client 3', hours: 3, date: '2024-01-03' },
        { id: 4, client_name: 'Client 4', hours: 4, date: '2024-01-04' },
        { id: 5, client_name: 'Client 5', hours: 5, date: '2024-01-05' },
        { id: 6, client_name: 'Client 6', hours: 6, date: '2024-01-06' },
      ],
    });

    renderWithProviders(<DashboardPage />);

    await screen.findByText('Client 1');
    expect(screen.getByText('Client 5')).toBeInTheDocument();
    expect(screen.queryByText('Client 6')).not.toBeInTheDocument();
  });
});
