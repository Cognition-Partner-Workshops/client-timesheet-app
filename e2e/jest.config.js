module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  testTimeout: 60000,
  verbose: true,
  setupFilesAfterEnv: ['./setup.js'],
  maxWorkers: 1
};
