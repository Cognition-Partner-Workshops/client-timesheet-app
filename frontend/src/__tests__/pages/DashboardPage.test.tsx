import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

import React from 'react';
import DashboardPage from '../../pages/DashboardPage';
import apiClient from '../../api/client';

const mockedApiClient = vi.mocked(apiClient);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApiClient.getClients.mockResolvedValue({ clients: [] });
    mockedApiClient.getWorkEntries.mockResolvedValue({ workEntries: [] });
  });

  it('should render dashboard title', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render stats cards', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Total Clients')).toBeInTheDocument();
    expect(screen.getByText('Total Work Entries')).toBeInTheDocument();
    expect(screen.getByText('Total Hours')).toBeInTheDocument();
  });

  it('should display client count', async () => {
    mockedApiClient.getClients.mockResolvedValue({
      clients: [
        { id: 1, name: 'Client 1' },
        { id: 2, name: 'Client 2' },
      ],
    });

    render(<DashboardPage />, { wrapper: createWrapper() });

    await screen.findByText('2');
  });

  it('should display work entries count', async () => {
    mockedApiClient.getWorkEntries.mockResolvedValue({
      workEntries: [
        { id: 1, hours: 8, client_name: 'Client 1', date: '2024-01-01' },
        { id: 2, hours: 4, client_name: 'Client 2', date: '2024-01-02' },
        { id: 3, hours: 6, client_name: 'Client 1', date: '2024-01-03' },
      ],
    });

    render(<DashboardPage />, { wrapper: createWrapper() });

    await screen.findByText('3');
  });

  it('should display total hours', async () => {
    mockedApiClient.getWorkEntries.mockResolvedValue({
      workEntries: [
        { id: 1, hours: 8, client_name: 'Client 1', date: '2024-01-01' },
        { id: 2, hours: 4.5, client_name: 'Client 2', date: '2024-01-02' },
      ],
    });

    render(<DashboardPage />, { wrapper: createWrapper() });

    await screen.findByText('12.50');
  });

  it('should navigate to clients when Total Clients card is clicked', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    const clientsCard = screen.getByText('Total Clients').closest('[class*="MuiCard"]');
    if (clientsCard) {
      fireEvent.click(clientsCard);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('should navigate to work-entries when Total Work Entries card is clicked', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    const entriesCard = screen.getByText('Total Work Entries').closest('[class*="MuiCard"]');
    if (entriesCard) {
      fireEvent.click(entriesCard);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
  });

  it('should navigate to reports when Total Hours card is clicked', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    const hoursCard = screen.getByText('Total Hours').closest('[class*="MuiCard"]');
    if (hoursCard) {
      fireEvent.click(hoursCard);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });

  it('should display recent work entries', async () => {
    mockedApiClient.getWorkEntries.mockResolvedValue({
      workEntries: [
        { id: 1, hours: 8, client_name: 'Test Client', date: '2024-01-01', description: 'Test work' },
      ],
    });

    render(<DashboardPage />, { wrapper: createWrapper() });

    await screen.findByText('Test Client');
    expect(screen.getByText('Test work')).toBeInTheDocument();
  });

  it('should show no work entries message when empty', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    await screen.findByText('No work entries yet');
  });

  it('should render quick action buttons', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view reports/i })).toBeInTheDocument();
  });

  it('should navigate when quick action buttons are clicked', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: /add client/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/clients');

    fireEvent.click(screen.getByRole('button', { name: /add work entry/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/work-entries');

    fireEvent.click(screen.getByRole('button', { name: /view reports/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });

  it('should navigate when Add Entry button is clicked', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });

    const addEntryButton = screen.getByRole('button', { name: /add entry/i });
    fireEvent.click(addEntryButton);

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
  });
});
