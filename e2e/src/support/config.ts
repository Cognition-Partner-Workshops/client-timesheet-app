export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  timeout: {
    default: 30000,
    navigation: 60000,
    element: 10000
  },
  testUser: {
    email: 'test@example.com',
    invalidEmail: 'invalid-email',
    emptyEmail: ''
  }
};
