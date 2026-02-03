import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/testUtils';
import DashboardPage from '../DashboardPage';
import apiClient from '../../api/client';

vi.mock('../../api/client');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    render(<DashboardPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should display stats cards', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Total Clients')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Work Entries')).toBeInTheDocument();
    expect(screen.getByText('Total Hours')).toBeInTheDocument();
  });

  it('should display recent work entries section', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Recent Work Entries')).toBeInTheDocument();
    });
  });

  it('should show empty state when no work entries', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('No work entries yet')).toBeInTheDocument();
    });
  });

  it('should navigate to clients page when clicking Total Clients card', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Total Clients')).toBeInTheDocument();
    });

    const clientsCard = screen.getByText('Total Clients').closest('[class*="MuiCard"]');
    if (clientsCard) {
      await user.click(clientsCard);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/clients');
  });

  it('should render quick actions section', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view reports/i })).toBeInTheDocument();
  });

  it('should navigate to work entries when clicking Add Entry button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    const user = userEvent.setup();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Recent Work Entries')).toBeInTheDocument();
    });

    const addEntryButton = screen.getByRole('button', { name: /add entry/i });
    await user.click(addEntryButton);

    expect(mockNavigate).toHaveBeenCalledWith('/work-entries');
  });
});
