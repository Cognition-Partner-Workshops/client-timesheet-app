import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from './DashboardPage';
import { mockClients, mockWorkEntries } from '../test/mocks';

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getWorkEntries: vi.fn(),
  },
}));

import apiClient from '../api/client';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

describe('DashboardPage', () => {
  const renderDashboardPage = () => {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    renderDashboardPage();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render stats cards', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('Total Clients')).toBeInTheDocument();
    });
  });

  it('should display total clients count', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('Total Clients')).toBeInTheDocument();
      const twoElements = screen.getAllByText('2');
      expect(twoElements.length).toBeGreaterThan(0);
    });
  });

  it('should display total work entries count', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('Total Work Entries')).toBeInTheDocument();
      const twoElements = screen.getAllByText('2');
      expect(twoElements.length).toBeGreaterThan(0);
    });
  });

  it('should display total hours', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
      const hoursElements = screen.getAllByText('12.00');
      expect(hoursElements.length).toBeGreaterThan(0);
    });
  });

  it('should show zero values when no data', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    renderDashboardPage();

    await waitFor(() => {
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
      const zeroHoursElements = screen.getAllByText('0.00');
      expect(zeroHoursElements.length).toBeGreaterThan(0);
    });
  });

  it('should display recent work entries section', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('Recent Work Entries')).toBeInTheDocument();
    });
  });

  it('should show no work entries message when empty', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('No work entries yet')).toBeInTheDocument();
    });
  });

  it('should display quick actions section', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    expect(screen.getByText('Add Client')).toBeInTheDocument();
    expect(screen.getByText('Add Work Entry')).toBeInTheDocument();
    expect(screen.getByText('View Reports')).toBeInTheDocument();
  });

  it('should have add entry button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('Add Entry')).toBeInTheDocument();
    });
  });
});
