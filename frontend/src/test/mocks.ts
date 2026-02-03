import { vi } from 'vitest'

export const mockClients = [
  {
    id: 1,
    name: 'Acme Corp',
    description: 'A test client',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Tech Solutions',
    description: null,
    created_at: '2024-01-02T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z',
  },
]

export const mockWorkEntries = [
  {
    id: 1,
    client_id: 1,
    client_name: 'Acme Corp',
    hours: 8,
    description: 'Development work',
    date: '2024-01-15',
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 2,
    client_id: 1,
    client_name: 'Acme Corp',
    hours: 4,
    description: null,
    date: '2024-01-16',
    created_at: '2024-01-16T00:00:00.000Z',
    updated_at: '2024-01-16T00:00:00.000Z',
  },
  {
    id: 3,
    client_id: 2,
    client_name: 'Tech Solutions',
    hours: 6,
    description: 'Meeting',
    date: '2024-01-17',
    created_at: '2024-01-17T00:00:00.000Z',
    updated_at: '2024-01-17T00:00:00.000Z',
  },
]

export const mockUser = {
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
}

export const mockClientReport = {
  client: mockClients[0],
  workEntries: mockWorkEntries.filter((e) => e.client_id === 1),
  totalHours: 12,
  entryCount: 2,
}

export const createMockApiClient = () => ({
  login: vi.fn().mockResolvedValue({ user: mockUser }),
  getCurrentUser: vi.fn().mockResolvedValue({ user: mockUser }),
  getClients: vi.fn().mockResolvedValue({ clients: mockClients }),
  getClient: vi.fn().mockResolvedValue({ client: mockClients[0] }),
  createClient: vi.fn().mockResolvedValue({ client: { ...mockClients[0], id: 3 } }),
  updateClient: vi.fn().mockResolvedValue({ client: mockClients[0] }),
  deleteClient: vi.fn().mockResolvedValue({ message: 'Client deleted' }),
  getWorkEntries: vi.fn().mockResolvedValue({ workEntries: mockWorkEntries }),
  getWorkEntry: vi.fn().mockResolvedValue({ workEntry: mockWorkEntries[0] }),
  createWorkEntry: vi.fn().mockResolvedValue({ workEntry: mockWorkEntries[0] }),
  updateWorkEntry: vi.fn().mockResolvedValue({ workEntry: mockWorkEntries[0] }),
  deleteWorkEntry: vi.fn().mockResolvedValue({ message: 'Work entry deleted' }),
  getClientReport: vi.fn().mockResolvedValue(mockClientReport),
  exportClientReportCsv: vi.fn().mockResolvedValue(new Blob(['csv data'], { type: 'text/csv' })),
  exportClientReportPdf: vi.fn().mockResolvedValue(new Blob(['pdf data'], { type: 'application/pdf' })),
  healthCheck: vi.fn().mockResolvedValue({ status: 'ok' }),
})

export const mockNavigate = vi.fn()
export const mockLocation = { pathname: '/dashboard' }

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  }
})
