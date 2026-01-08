// Mock pg (PostgreSQL) globally to avoid native module loading issues in tests
const mockPool = {
  query: jest.fn(),
  end: jest.fn().mockResolvedValue(undefined),
  on: jest.fn()
};

jest.mock('pg', () => {
  return {
    Pool: jest.fn(() => mockPool)
  };
});

// Export mockPool for use in tests
global.mockPool = mockPool;
