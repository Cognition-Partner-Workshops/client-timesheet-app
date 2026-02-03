import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkEntriesPage from '../WorkEntriesPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import apiClient from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    getWorkEntries: vi.fn(),
    getClients: vi.fn(),
    createWorkEntry: vi.fn(),
    updateWorkEntry: vi.fn(),
    deleteWorkEntry: vi.fn(),
  },
}));

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

const renderWorkEntriesPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <WorkEntriesPage />
        </ThemeProvider>
      </BrowserRouter>
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
      clients: [{ id: 1, name: 'Client A' }],
    });
    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Work Entries')).toBeInTheDocument();
  });

  it('should render Add Work Entry button', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /add work entry/i })).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    vi.mocked(apiClient.getWorkEntries).mockImplementation(() => new Promise(() => {}));
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));
    renderWorkEntriesPage();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show message when no clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    renderWorkEntriesPage();

    await screen.findByText(/you need to create at least one client/i);
  });

  it('should display empty state when no work entries exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({ workEntries: [] });

    renderWorkEntriesPage();

    await screen.findByText(/no work entries found/i);
  });

  it('should display work entries in table', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 8, date: '2024-01-01', description: 'Work done' },
      ],
    });

    renderWorkEntriesPage();

    await screen.findByText('Client A');
    await screen.findByText('8 hours');
    await screen.findByText('Work done');
  });

  it('should open add work entry dialog when Add Work Entry button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add work entry/i });
    await user.click(addButton);

    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();
  });

  it('should have create button in dialog', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add work entry/i });
    await user.click(addButton);

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('should delete a work entry after confirmation', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 8, date: '2024-01-01', description: 'Work done' },
      ],
    });
    vi.mocked(apiClient.deleteWorkEntry).mockResolvedValue({ message: 'Deleted' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWorkEntriesPage();

    await screen.findByText('Client A');

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    await waitFor(() => {
      expect(apiClient.deleteWorkEntry).toHaveBeenCalledWith(1);
    });
  });

  it('should close dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add work entry/i });
    await user.click(addButton);

    expect(screen.getByText('Add New Work Entry')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Add New Work Entry')).not.toBeInTheDocument();
    });
  });

  it('should create a new work entry', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.createWorkEntry).mockResolvedValue({ workEntry: { id: 1 } });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add work entry/i });
    await user.click(addButton);

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const option = await screen.findByRole('option', { name: 'Client A' });
    fireEvent.click(option);

    const hoursInput = screen.getByLabelText(/hours/i);
    await user.type(hoursInput, '8');

    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(apiClient.createWorkEntry).toHaveBeenCalled();
    });
  });

  it('should open edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 8, date: '2024-01-01', description: 'Work done' },
      ],
    });

    renderWorkEntriesPage();

    await screen.findByText('Client A');

    const editButtons = screen.getAllByRole('button', { name: '' });
    const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'));
    if (editButton) {
      await user.click(editButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Edit Work Entry')).toBeInTheDocument();
    });
  });

  it('should update a work entry', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 8, date: '2024-01-01', description: 'Work done' },
      ],
    });
    vi.mocked(apiClient.updateWorkEntry).mockResolvedValue({ workEntry: { id: 1 } });

    renderWorkEntriesPage();

    await screen.findByText('Client A');

    const editButtons = screen.getAllByRole('button', { name: '' });
    const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'));
    if (editButton) {
      await user.click(editButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Edit Work Entry')).toBeInTheDocument();
    });

    const hoursInput = screen.getByLabelText(/hours/i);
    await user.clear(hoursInput);
    await user.type(hoursInput, '10');

    const updateButton = screen.getByRole('button', { name: /update/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(apiClient.updateWorkEntry).toHaveBeenCalled();
    });
  });

  it('should show error when create fails', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.createWorkEntry).mockRejectedValue({
      response: { data: { error: 'Failed to create work entry' } },
    });

    renderWorkEntriesPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add work entry/i });
    await user.click(addButton);

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const option = await screen.findByRole('option', { name: 'Client A' });
    fireEvent.click(option);

    const hoursInput = screen.getByLabelText(/hours/i);
    await user.type(hoursInput, '8');

    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    await screen.findByText('Failed to create work entry');
  });

  it('should display work entry without description', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [{ id: 1, name: 'Client A' }],
    });
    vi.mocked(apiClient.getWorkEntries).mockResolvedValue({
      workEntries: [
        { id: 1, client_id: 1, client_name: 'Client A', hours: 8, date: '2024-01-01', description: null },
      ],
    });

    renderWorkEntriesPage();

    await screen.findByText('Client A');
    await screen.findByText('No description');
  });
});
