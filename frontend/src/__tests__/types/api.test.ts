import {
  User,
  Client,
  WorkEntry,
  WorkEntryWithClient,
  ClientReport,
  CreateClientRequest,
  UpdateClientRequest,
  CreateWorkEntryRequest,
  UpdateWorkEntryRequest,
  LoginRequest,
  LoginResponse,
  ApiResponse,
} from '../../types/api'

describe('API Types', () => {
  describe('User Type', () => {
    test('User has required properties', () => {
      const user: User = {
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
      }
      expect(user.email).toBe('test@example.com')
      expect(user.createdAt).toBe('2024-01-01T00:00:00Z')
    })
  })

  describe('Client Type', () => {
    test('Client has required properties', () => {
      const client: Client = {
        id: 1,
        name: 'Test Client',
        description: 'Test Description',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      expect(client.id).toBe(1)
      expect(client.name).toBe('Test Client')
      expect(client.description).toBe('Test Description')
    })

    test('Client description can be null', () => {
      const client: Client = {
        id: 1,
        name: 'Test Client',
        description: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      expect(client.description).toBeNull()
    })
  })

  describe('WorkEntry Type', () => {
    test('WorkEntry has required properties', () => {
      const workEntry: WorkEntry = {
        id: 1,
        client_id: 1,
        hours: 8,
        description: 'Test work',
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      expect(workEntry.id).toBe(1)
      expect(workEntry.client_id).toBe(1)
      expect(workEntry.hours).toBe(8)
      expect(workEntry.description).toBe('Test work')
      expect(workEntry.date).toBe('2024-01-01')
    })

    test('WorkEntry description can be null', () => {
      const workEntry: WorkEntry = {
        id: 1,
        client_id: 1,
        hours: 8,
        description: null,
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      expect(workEntry.description).toBeNull()
    })

    test('WorkEntry can have optional client_name', () => {
      const workEntry: WorkEntry = {
        id: 1,
        client_id: 1,
        hours: 8,
        description: 'Test work',
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Client',
      }
      expect(workEntry.client_name).toBe('Test Client')
    })
  })

  describe('WorkEntryWithClient Type', () => {
    test('WorkEntryWithClient has required client_name', () => {
      const workEntry: WorkEntryWithClient = {
        id: 1,
        client_id: 1,
        hours: 8,
        description: 'Test work',
        date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Client',
      }
      expect(workEntry.client_name).toBe('Test Client')
    })
  })

  describe('ClientReport Type', () => {
    test('ClientReport has required properties', () => {
      const report: ClientReport = {
        client: {
          id: 1,
          name: 'Test Client',
          description: 'Test Description',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        workEntries: [],
        totalHours: 40,
        entryCount: 5,
      }
      expect(report.client.id).toBe(1)
      expect(report.totalHours).toBe(40)
      expect(report.entryCount).toBe(5)
      expect(report.workEntries).toEqual([])
    })

    test('ClientReport can have work entries', () => {
      const report: ClientReport = {
        client: {
          id: 1,
          name: 'Test Client',
          description: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        workEntries: [
          {
            id: 1,
            client_id: 1,
            hours: 8,
            description: 'Test work',
            date: '2024-01-01',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        totalHours: 8,
        entryCount: 1,
      }
      expect(report.workEntries.length).toBe(1)
    })
  })

  describe('Request Types', () => {
    test('CreateClientRequest has required name', () => {
      const request: CreateClientRequest = {
        name: 'New Client',
      }
      expect(request.name).toBe('New Client')
    })

    test('CreateClientRequest can have optional description', () => {
      const request: CreateClientRequest = {
        name: 'New Client',
        description: 'Client description',
      }
      expect(request.description).toBe('Client description')
    })

    test('UpdateClientRequest can have optional name', () => {
      const request: UpdateClientRequest = {
        name: 'Updated Name',
      }
      expect(request.name).toBe('Updated Name')
    })

    test('UpdateClientRequest can have optional description', () => {
      const request: UpdateClientRequest = {
        description: 'Updated description',
      }
      expect(request.description).toBe('Updated description')
    })

    test('CreateWorkEntryRequest has required properties', () => {
      const request: CreateWorkEntryRequest = {
        clientId: 1,
        hours: 8,
        date: '2024-01-01',
      }
      expect(request.clientId).toBe(1)
      expect(request.hours).toBe(8)
      expect(request.date).toBe('2024-01-01')
    })

    test('CreateWorkEntryRequest can have optional description', () => {
      const request: CreateWorkEntryRequest = {
        clientId: 1,
        hours: 8,
        date: '2024-01-01',
        description: 'Work description',
      }
      expect(request.description).toBe('Work description')
    })

    test('UpdateWorkEntryRequest can have optional properties', () => {
      const request: UpdateWorkEntryRequest = {
        hours: 10,
      }
      expect(request.hours).toBe(10)
    })

    test('LoginRequest has required email', () => {
      const request: LoginRequest = {
        email: 'test@example.com',
      }
      expect(request.email).toBe('test@example.com')
    })
  })

  describe('Response Types', () => {
    test('LoginResponse has required properties', () => {
      const response: LoginResponse = {
        message: 'Login successful',
        user: {
          email: 'test@example.com',
          createdAt: '2024-01-01T00:00:00Z',
        },
      }
      expect(response.message).toBe('Login successful')
      expect(response.user.email).toBe('test@example.com')
    })

    test('ApiResponse can have data', () => {
      const response: ApiResponse<string> = {
        data: 'test data',
      }
      expect(response.data).toBe('test data')
    })

    test('ApiResponse can have error', () => {
      const response: ApiResponse<string> = {
        error: 'Something went wrong',
      }
      expect(response.error).toBe('Something went wrong')
    })

    test('ApiResponse can have message', () => {
      const response: ApiResponse<string> = {
        message: 'Operation completed',
      }
      expect(response.message).toBe('Operation completed')
    })
  })
})
