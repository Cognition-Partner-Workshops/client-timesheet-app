import { apiClient } from '../../api/client'

describe('ApiClient Module', () => {
  describe('Module Exports', () => {
    test('exports apiClient', () => {
      expect(apiClient).toBeDefined()
    })

    test('apiClient is an object', () => {
      expect(typeof apiClient).toBe('object')
    })
  })

  describe('Auth Methods', () => {
    test('has login method', () => {
      expect(typeof apiClient.login).toBe('function')
    })

    test('has getCurrentUser method', () => {
      expect(typeof apiClient.getCurrentUser).toBe('function')
    })
  })

  describe('Client Methods', () => {
    test('has getClients method', () => {
      expect(typeof apiClient.getClients).toBe('function')
    })

    test('has getClient method', () => {
      expect(typeof apiClient.getClient).toBe('function')
    })

    test('has createClient method', () => {
      expect(typeof apiClient.createClient).toBe('function')
    })

    test('has updateClient method', () => {
      expect(typeof apiClient.updateClient).toBe('function')
    })

    test('has deleteClient method', () => {
      expect(typeof apiClient.deleteClient).toBe('function')
    })
  })

  describe('Work Entry Methods', () => {
    test('has getWorkEntries method', () => {
      expect(typeof apiClient.getWorkEntries).toBe('function')
    })

    test('has getWorkEntry method', () => {
      expect(typeof apiClient.getWorkEntry).toBe('function')
    })

    test('has createWorkEntry method', () => {
      expect(typeof apiClient.createWorkEntry).toBe('function')
    })

    test('has updateWorkEntry method', () => {
      expect(typeof apiClient.updateWorkEntry).toBe('function')
    })

    test('has deleteWorkEntry method', () => {
      expect(typeof apiClient.deleteWorkEntry).toBe('function')
    })
  })

  describe('Report Methods', () => {
    test('has getClientReport method', () => {
      expect(typeof apiClient.getClientReport).toBe('function')
    })

    test('has exportClientReportCsv method', () => {
      expect(typeof apiClient.exportClientReportCsv).toBe('function')
    })

    test('has exportClientReportPdf method', () => {
      expect(typeof apiClient.exportClientReportPdf).toBe('function')
    })
  })

  describe('Health Check Method', () => {
    test('has healthCheck method', () => {
      expect(typeof apiClient.healthCheck).toBe('function')
    })
  })

  describe('API Method Count', () => {
    test('has all 16 expected methods', () => {
      const expectedMethods = [
        'login',
        'getCurrentUser',
        'getClients',
        'getClient',
        'createClient',
        'updateClient',
        'deleteClient',
        'getWorkEntries',
        'getWorkEntry',
        'createWorkEntry',
        'updateWorkEntry',
        'deleteWorkEntry',
        'getClientReport',
        'exportClientReportCsv',
        'exportClientReportPdf',
        'healthCheck',
      ]
      
      expectedMethods.forEach(method => {
        expect(typeof (apiClient as any)[method]).toBe('function')
      })
    })
  })
})
