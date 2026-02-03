import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientsPage from '../ClientsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import apiClient from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    getClients: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
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

const renderClientsPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ClientsPage />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
  });

  it('should render page title', async () => {
    renderClientsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Clients')).toBeInTheDocument();
  });

  it('should render Add Client button', async () => {
    renderClientsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /add client/i })).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    vi.mocked(apiClient.getClients).mockImplementation(() => new Promise(() => {}));
    renderClientsPage();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display empty state when no clients exist', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({ clients: [] });
    renderClientsPage();

    await screen.findByText(/no clients found/i);
  });

  it('should display clients in table', async () => {
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01' },
        { id: 2, name: 'Client B', description: null, created_at: '2024-01-02' },
      ],
    });

    renderClientsPage();

    await screen.findByText('Client A');
    await screen.findByText('Description A');
    await screen.findByText('Client B');
    await screen.findByText('No description');
  });

  it('should open add client dialog when Add Client button is clicked', async () => {
    const user = userEvent.setup();
    renderClientsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addButton);

    expect(screen.getByText('Add New Client')).toBeInTheDocument();
    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('should create a new client', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.createClient).mockResolvedValue({ client: { id: 1, name: 'New Client' } });
    renderClientsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addButton);

    const nameInput = screen.getByLabelText(/client name/i);
    await user.type(nameInput, 'New Client');

    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(apiClient.createClient).toHaveBeenCalledWith({
        name: 'New Client',
        description: undefined,
      });
    });
  });

  it('should have create button in dialog', async () => {
    const user = userEvent.setup();
    renderClientsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addButton);

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('should open edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01' },
      ],
    });

    renderClientsPage();

    await screen.findByText('Client A');

    const editButtons = screen.getAllByRole('button', { name: '' });
    const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'));
    if (editButton) {
      await user.click(editButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Edit Client')).toBeInTheDocument();
    });
  });

  it('should update a client', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01' },
      ],
    });
    vi.mocked(apiClient.updateClient).mockResolvedValue({ client: { id: 1, name: 'Updated Client' } });

    renderClientsPage();

    await screen.findByText('Client A');

    const editButtons = screen.getAllByRole('button', { name: '' });
    const editButton = editButtons.find(btn => btn.querySelector('[data-testid="EditIcon"]'));
    if (editButton) {
      await user.click(editButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Edit Client')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/client name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Client');

    const updateButton = screen.getByRole('button', { name: /update/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(apiClient.updateClient).toHaveBeenCalledWith(1, {
        name: 'Updated Client',
        description: 'Description A',
      });
    });
  });

  it('should delete a client after confirmation', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01' },
      ],
    });
    vi.mocked(apiClient.deleteClient).mockResolvedValue({ message: 'Deleted' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderClientsPage();

    await screen.findByText('Client A');

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    await waitFor(() => {
      expect(apiClient.deleteClient).toHaveBeenCalledWith(1);
    });
  });

  it('should not delete client when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.getClients).mockResolvedValue({
      clients: [
        { id: 1, name: 'Client A', description: 'Description A', created_at: '2024-01-01' },
      ],
    });
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderClientsPage();

    await screen.findByText('Client A');

    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(apiClient.deleteClient).not.toHaveBeenCalled();
  });

  it('should close dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderClientsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addButton);

    expect(screen.getByText('Add New Client')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Add New Client')).not.toBeInTheDocument();
    });
  });

  it('should show error when create fails', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.createClient).mockRejectedValue({
      response: { data: { error: 'Client already exists' } },
    });

    renderClientsPage();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add client/i });
    await user.click(addButton);

    const nameInput = screen.getByLabelText(/client name/i);
    await user.type(nameInput, 'Existing Client');

    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    await screen.findByText('Client already exists');
  });
});
