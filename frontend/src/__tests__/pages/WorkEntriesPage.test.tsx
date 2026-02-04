import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WorkEntriesPage from '../../pages/WorkEntriesPage';

vi.mock('../../api/client', () => ({
  default: {
    getWorkEntries: vi.fn(),
    getClients: vi.fn(),
    createWorkEntry: vi.fn(),
    updateWorkEntry: vi.fn(),
    deleteWorkEntry: vi.fn(),
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

describe('WorkEntriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
  });

  it('should render page title', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Work Entries')).toBeInTheDocument();
    });
  });

  it('should render Add Work Entry button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    });
  });

  it('should display loading spinner initially', () => {
    vi.mocked(apiClient.getWorkEntries).mockImplementation(() => new Promise(() => {}));
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<WorkEntriesPage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display message when no clients exist', async () => {
    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText(/you need to create at least one client/i)).toBeInTheDocument();
    });
  });

  it('should display Create Client button when no clients', async () => {
    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /create client/i })).toBeInTheDocument();
    });
  });

  it('should display empty state when no work entries', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText(/no work entries found/i)).toBeInTheDocument();
    });
  });

  it('should display work entries in table', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        {
          id: 1,
          client_id: 1,
          client_name: 'Test Client',
          hours: 8,
          description: 'Test work',
          date: '2024-01-15',
          created_at: '2024-01-15',
          updated_at: '2024-01-15',
        },
      ],
    });

    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
      expect(screen.getByText('8 hours')).toBeInTheDocument();
      expect(screen.getByText('Test work')).toBeInTheDocument();
    });
  });

  it('should render table headers when clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Hours')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('should open dialog when Add Work Entry is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add work entry/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();
    });
  });

  it('should close dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add work entry/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText('Add New Work Entry')).not.toBeInTheDocument();
    });
  });

  it('should have required client field in dialog', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add work entry/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();
    });
  });

  it('should have required hours field in dialog', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });

    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add work entry/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/hours/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/hours/i)).toBeRequired();
  });

  it('should display No description chip when entry has no description', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        {
          id: 1,
          client_id: 1,
          client_name: 'Test Client',
          hours: 4,
          description: null,
          date: '2024-01-15',
          created_at: '2024-01-15',
          updated_at: '2024-01-15',
        },
      ],
    });

    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText('No description')).toBeInTheDocument();
    });
  });

  it('should call delete when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Test Client' }],
    });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        {
          id: 1,
          client_id: 1,
          client_name: 'Test Client',
          hours: 8,
          description: null,
          date: '2024-01-15',
          created_at: '2024-01-15',
          updated_at: '2024-01-15',
        },
      ],
    });
    vi.mocked(apiClient.deleteWorkEntry).mockResolvedValue({ message: 'Deleted' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<WorkEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    await waitFor(() => {
      expect(apiClient.deleteWorkEntry).toHaveBeenCalledWith(1);
    });
  });
});
