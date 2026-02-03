import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WorkEntriesPage from './WorkEntriesPage';
import { mockClients, mockWorkEntries } from '../test/mocks';

vi.mock('../api/client', () => ({
  default: {
    getClients: vi.fn(),
    getWorkEntries: vi.fn(),
    createWorkEntry: vi.fn(),
    updateWorkEntry: vi.fn(),
    deleteWorkEntry: vi.fn(),
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

describe('WorkEntriesPage', () => {
  const renderWorkEntriesPage = () => {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WorkEntriesPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render work entries page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.getByText('Work Entries')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));
    vi.mocked(apiClient.getWorkEntries).mockImplementation(() => new Promise(() => {}));

    renderWorkEntriesPage();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display work entries in table', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.getByText('Development work')).toBeInTheDocument();
    });

    expect(screen.getByText('Code review')).toBeInTheDocument();
  });

  it('should show no work entries message when empty', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.getByText(/no work entries found/i)).toBeInTheDocument();
    });
  });

  it('should have add work entry button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument();
    });
  });

  it('should open add work entry dialog when clicking add button', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.getByText('Add Work Entry')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Work Entry'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should display table headers', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should show edit and delete buttons for each entry', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [mockWorkEntries[0]] });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.getByText('Development work')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTestId('EditIcon');
    const deleteButtons = screen.getAllByTestId('DeleteIcon');

    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('should delete work entry when delete is confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [mockWorkEntries[0]] });
    vi.mocked(apiClient.deleteWorkEntry).mockResolvedValue({ message: 'Deleted' });

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.getByText('Development work')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('DeleteIcon').closest('button');
    await user.click(deleteButton!);

    await waitFor(() => {
      expect(apiClient.deleteWorkEntry).toHaveBeenCalledWith(1);
    });

    confirmSpy.mockRestore();
  });

  it('should display hours with chip styling', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: mockClients });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: mockWorkEntries });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.getByText('8 hours')).toBeInTheDocument();
    });

    expect(screen.getByText('4 hours')).toBeInTheDocument();
  });
});
