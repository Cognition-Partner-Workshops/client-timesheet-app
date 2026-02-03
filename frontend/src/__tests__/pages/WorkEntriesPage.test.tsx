import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../api/client', () => ({
  default: {
    getWorkEntries: vi.fn(),
    getClients: vi.fn(),
    createWorkEntry: vi.fn(),
    updateWorkEntry: vi.fn(),
    deleteWorkEntry: vi.fn(),
  },
}));

import React from 'react';
import WorkEntriesPage from '../../pages/WorkEntriesPage';
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

describe('WorkEntriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApiClient.getWorkEntries.mockResolvedValue({ workEntries: [] });
    mockedApiClient.getClients.mockResolvedValue({ clients: [] });
  });

  it('should render page title', async () => {
    mockedApiClient.getClients.mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1' }],
    });

    render(<WorkEntriesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Work Entries')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    mockedApiClient.getWorkEntries.mockImplementation(() => new Promise(() => {}));
    mockedApiClient.getClients.mockImplementation(() => new Promise(() => {}));

    render(<WorkEntriesPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show message when no clients exist', async () => {
    render(<WorkEntriesPage />, { wrapper: createWrapper() });

    await screen.findByText(/you need to create at least one client/i);
  });

  it('should show empty state when no work entries', async () => {
    mockedApiClient.getClients.mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1' }],
    });

    render(<WorkEntriesPage />, { wrapper: createWrapper() });

    await screen.findByText(/no work entries found/i);
  });

  it('should display work entries in table', async () => {
    mockedApiClient.getClients.mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    mockedApiClient.getWorkEntries.mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 8, date: '2024-01-01', description: 'Work done' },
      ],
    });

    render(<WorkEntriesPage />, { wrapper: createWrapper() });

    await screen.findByText('Client A');
    expect(screen.getByText('8 hours')).toBeInTheDocument();
    expect(screen.getByText('Work done')).toBeInTheDocument();
  });

  it('should open add work entry dialog', async () => {
    const user = userEvent.setup();
    mockedApiClient.getClients.mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1' }],
    });

    render(<WorkEntriesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add work entry/i }));

    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();
  });

  it('should render form fields in dialog', async () => {
    const user = userEvent.setup();
    mockedApiClient.getClients.mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1' }],
    });

    render(<WorkEntriesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add work entry/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should close dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    mockedApiClient.getClients.mockResolvedValue({
      clients: [{ id: 1, name: 'Client 1' }],
    });

    render(<WorkEntriesPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add work entry/i }));
    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText('Add New Work Entry')).not.toBeInTheDocument();
    });
  });

  it('should delete work entry when confirmed', async () => {
    const user = userEvent.setup();
    mockedApiClient.getClients.mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    mockedApiClient.getWorkEntries.mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 8, date: '2024-01-01', description: null },
      ],
    });
    mockedApiClient.deleteWorkEntry.mockResolvedValue({ message: 'Deleted' });

    window.confirm = vi.fn().mockReturnValue(true);

    render(<WorkEntriesPage />, { wrapper: createWrapper() });

    await screen.findByText('Client A');

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(window.confirm).toHaveBeenCalled();
    expect(mockedApiClient.deleteWorkEntry).toHaveBeenCalledWith(1);
  });

  it('should open edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup();
    mockedApiClient.getClients.mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    mockedApiClient.getWorkEntries.mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 8, date: '2024-01-01', description: 'Test' },
      ],
    });

    render(<WorkEntriesPage />, { wrapper: createWrapper() });

    await screen.findByText('Client A');

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'));
    if (editButton) {
      await user.click(editButton);
    }

    expect(screen.getByText('Edit Work Entry')).toBeInTheDocument();
  });

  it('should show No description chip when entry has no description', async () => {
    mockedApiClient.getClients.mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    mockedApiClient.getWorkEntries.mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 8, date: '2024-01-01', description: null },
      ],
    });

    render(<WorkEntriesPage />, { wrapper: createWrapper() });

    await screen.findByText('No description');
  });
});
