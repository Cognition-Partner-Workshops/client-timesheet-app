import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

vi.mock('axios')

const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}

vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>)

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('constructor', () => {
    it('should create axios instance with correct config', async () => {
      await import('./client')
      
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should set up request interceptor', async () => {
      await import('./client')
      
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
    })

    it('should set up response interceptor', async () => {
      await import('./client')
      
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('request interceptor', () => {
    it('should add user email header when available', async () => {
      localStorage.setItem('userEmail', 'test@example.com')
      await import('./client')
      
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      const config = { headers: {} as Record<string, string> }
      const result = requestInterceptor(config)
      
      expect(result.headers['x-user-email']).toBe('test@example.com')
    })

    it('should not add header when no user email', async () => {
      await import('./client')
      
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      const config = { headers: {} as Record<string, string> }
      const result = requestInterceptor(config)
      
      expect(result.headers['x-user-email']).toBeUndefined()
    })

    it('should handle request interceptor error', async () => {
      await import('./client')
      
      const errorHandler = mockAxiosInstance.interceptors.request.use.mock.calls[0][1]
      const error = new Error('Request error')
      
      await expect(errorHandler(error)).rejects.toThrow('Request error')
    })
  })

  describe('response interceptor', () => {
    it('should pass through successful responses', async () => {
      await import('./client')
      
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0]
      const response = { data: { success: true } }
      const result = responseInterceptor(response)
      
      expect(result).toBe(response)
    })

    it('should handle 401 errors by clearing storage and redirecting', async () => {
      localStorage.setItem('userEmail', 'test@example.com')
      const originalLocation = window.location
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      })
      
      await import('./client')
      
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]
      const error = { response: { status: 401 } }
      
      await expect(errorHandler(error)).rejects.toEqual(error)
      expect(localStorage.getItem('userEmail')).toBeNull()
      expect(window.location.href).toBe('/login')
      
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      })
    })

    it('should reject non-401 errors', async () => {
      await import('./client')
      
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]
      const error = { response: { status: 500 } }
      
      await expect(errorHandler(error)).rejects.toEqual(error)
    })
  })

  describe('auth endpoints', () => {
    it('should call login endpoint', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { user: { email: 'test@example.com' } } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.login('test@example.com')
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@example.com' })
      expect(result).toEqual({ user: { email: 'test@example.com' } })
    })

    it('should call getCurrentUser endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { user: { email: 'test@example.com' } } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.getCurrentUser()
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/auth/me')
      expect(result).toEqual({ user: { email: 'test@example.com' } })
    })
  })

  describe('client endpoints', () => {
    it('should call getClients endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { clients: [] } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.getClients()
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients')
      expect(result).toEqual({ clients: [] })
    })

    it('should call getClient endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { client: { id: 1 } } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.getClient(1)
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/clients/1')
      expect(result).toEqual({ client: { id: 1 } })
    })

    it('should call createClient endpoint', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { client: { id: 1, name: 'Test' } } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.createClient({ name: 'Test', description: 'Desc' })
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/clients', { name: 'Test', description: 'Desc' })
      expect(result).toEqual({ client: { id: 1, name: 'Test' } })
    })

    it('should call updateClient endpoint', async () => {
      mockAxiosInstance.put.mockResolvedValueOnce({ data: { client: { id: 1, name: 'Updated' } } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.updateClient(1, { name: 'Updated' })
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/clients/1', { name: 'Updated' })
      expect(result).toEqual({ client: { id: 1, name: 'Updated' } })
    })

    it('should call deleteClient endpoint', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.deleteClient(1)
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/clients/1')
      expect(result).toEqual({ message: 'Deleted' })
    })
  })

  describe('work entry endpoints', () => {
    it('should call getWorkEntries endpoint without filter', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { workEntries: [] } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.getWorkEntries()
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: {} })
      expect(result).toEqual({ workEntries: [] })
    })

    it('should call getWorkEntries endpoint with clientId filter', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { workEntries: [] } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.getWorkEntries(1)
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries', { params: { clientId: 1 } })
      expect(result).toEqual({ workEntries: [] })
    })

    it('should call getWorkEntry endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { workEntry: { id: 1 } } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.getWorkEntry(1)
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/work-entries/1')
      expect(result).toEqual({ workEntry: { id: 1 } })
    })

    it('should call createWorkEntry endpoint', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { workEntry: { id: 1 } } })
      const { apiClient } = await import('./client')
      
      const entryData = { clientId: 1, hours: 8, description: 'Work', date: '2024-01-15' }
      const result = await apiClient.createWorkEntry(entryData)
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/work-entries', entryData)
      expect(result).toEqual({ workEntry: { id: 1 } })
    })

    it('should call updateWorkEntry endpoint', async () => {
      mockAxiosInstance.put.mockResolvedValueOnce({ data: { workEntry: { id: 1 } } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.updateWorkEntry(1, { hours: 10 })
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/work-entries/1', { hours: 10 })
      expect(result).toEqual({ workEntry: { id: 1 } })
    })

    it('should call deleteWorkEntry endpoint', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.deleteWorkEntry(1)
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/work-entries/1')
      expect(result).toEqual({ message: 'Deleted' })
    })
  })

  describe('report endpoints', () => {
    it('should call getClientReport endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { totalHours: 10 } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.getClientReport(1)
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/client/1')
      expect(result).toEqual({ totalHours: 10 })
    })

    it('should call exportClientReportCsv endpoint', async () => {
      const blob = new Blob(['csv'], { type: 'text/csv' })
      mockAxiosInstance.get.mockResolvedValueOnce({ data: blob })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.exportClientReportCsv(1)
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/csv/1', { responseType: 'blob' })
      expect(result).toBe(blob)
    })

    it('should call exportClientReportPdf endpoint', async () => {
      const blob = new Blob(['pdf'], { type: 'application/pdf' })
      mockAxiosInstance.get.mockResolvedValueOnce({ data: blob })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.exportClientReportPdf(1)
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/reports/export/pdf/1', { responseType: 'blob' })
      expect(result).toBe(blob)
    })
  })

  describe('health check', () => {
    it('should call healthCheck endpoint', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { status: 'ok' } })
      const { apiClient } = await import('./client')
      
      const result = await apiClient.healthCheck()
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health')
      expect(result).toEqual({ status: 'ok' })
    })
  })
})
