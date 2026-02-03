import { vi } from 'vitest';
import { type User, type Client, type WorkEntry, type ClientReport } from '../types/api';

export const mockUser: User = {
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const mockClients: Client[] = [
  {
    id: 1,
    name: 'Client A',
    description: 'Description A',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Client B',
    description: null,
    created_at: '2024-01-02T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z',
  },
];

export const mockWorkEntries: WorkEntry[] = [
  {
    id: 1,
    client_id: 1,
    hours: 8,
    description: 'Development work',
    date: '2024-01-15',
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z',
    client_name: 'Client A',
  },
  {
    id: 2,
    client_id: 1,
    hours: 4,
    description: 'Code review',
    date: '2024-01-16',
    created_at: '2024-01-16T00:00:00.000Z',
    updated_at: '2024-01-16T00:00:00.000Z',
    client_name: 'Client A',
  },
];

export const mockClientReport: ClientReport = {
  client: mockClients[0],
  workEntries: mockWorkEntries,
  totalHours: 12,
  entryCount: 2,
};

export const createMockApiClient = () => ({
  login: vi.fn().mockResolvedValue({ message: 'Login successful', user: mockUser }),
  getCurrentUser: vi.fn().mockResolvedValue({ user: mockUser }),
  getClients: vi.fn().mockResolvedValue({ clients: mockClients }),
  getClient: vi.fn().mockResolvedValue({ client: mockClients[0] }),
  createClient: vi.fn().mockResolvedValue({ client: mockClients[0] }),
  updateClient: vi.fn().mockResolvedValue({ client: mockClients[0] }),
  deleteClient: vi.fn().mockResolvedValue({ message: 'Client deleted' }),
  getWorkEntries: vi.fn().mockResolvedValue({ workEntries: mockWorkEntries }),
  getWorkEntry: vi.fn().mockResolvedValue({ workEntry: mockWorkEntries[0] }),
  createWorkEntry: vi.fn().mockResolvedValue({ workEntry: mockWorkEntries[0] }),
  updateWorkEntry: vi.fn().mockResolvedValue({ workEntry: mockWorkEntries[0] }),
  deleteWorkEntry: vi.fn().mockResolvedValue({ message: 'Work entry deleted' }),
  getClientReport: vi.fn().mockResolvedValue(mockClientReport),
  exportClientReportCsv: vi.fn().mockResolvedValue(new Blob(['csv data'])),
  exportClientReportPdf: vi.fn().mockResolvedValue(new Blob(['pdf data'])),
  healthCheck: vi.fn().mockResolvedValue({ status: 'ok' }),
});
