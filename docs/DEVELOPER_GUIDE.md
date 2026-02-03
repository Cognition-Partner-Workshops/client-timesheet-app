# Developer Guide

This guide provides information for developers who want to contribute to or extend the Employee Time Tracking Application.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18 or higher
- npm (comes with Node.js)
- Git
- A code editor (VS Code recommended)

## Project Structure

```
client-timesheet-app/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── database/
│   │   │   └── init.js        # SQLite database initialization
│   │   ├── middleware/
│   │   │   ├── auth.js        # Authentication middleware
│   │   │   └── errorHandler.js # Centralized error handling
│   │   ├── routes/
│   │   │   ├── auth.js        # Authentication endpoints
│   │   │   ├── clients.js     # Client CRUD operations
│   │   │   ├── workEntries.js # Work entry CRUD operations
│   │   │   └── reports.js     # Reporting and export
│   │   ├── validation/
│   │   │   └── schemas.js     # Joi validation schemas
│   │   ├── __tests__/         # Jest test suites
│   │   └── server.js          # Express application entry point
│   ├── package.json
│   └── jest.config.js
├── frontend/                   # React application
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts      # API client with Axios
│   │   ├── components/
│   │   │   └── Layout.tsx     # Main layout component
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # Authentication state management
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ClientsPage.tsx
│   │   │   ├── WorkEntriesPage.tsx
│   │   │   └── ReportsPage.tsx
│   │   ├── types/
│   │   │   └── api.ts         # TypeScript interfaces
│   │   ├── App.tsx            # Root component with routing
│   │   └── main.tsx           # Application entry point
│   ├── package.json
│   └── vite.config.ts
├── docker/                     # Docker configuration
│   ├── Dockerfile
│   └── overrides/             # Production-specific overrides
├── .github/
│   └── workflows/             # CI/CD pipelines
└── docs/                       # Documentation
```

## Development Setup

### Clone the Repository

```bash
git clone https://github.com/Cognition-Partner-Workshops/client-timesheet-app.git
cd client-timesheet-app
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend server starts on `http://localhost:3001` with nodemon for auto-reload.

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend development server starts on `http://localhost:5173` with Vite's hot module replacement.

### Running Both Services

Open two terminal windows and run the backend and frontend in separate terminals. The frontend is configured to proxy API requests to the backend.

## Backend Architecture

### Database Layer

The application uses SQLite with an in-memory database by default. The database module (`src/database/init.js`) provides:

- `getDatabase()`: Returns the singleton database connection
- `initializeDatabase()`: Creates tables and indexes
- `closeDatabase()`: Gracefully closes the connection

Database schema includes three tables:
- `users`: Stores user emails and creation timestamps
- `clients`: Stores client information linked to users
- `work_entries`: Stores time entries linked to clients and users

Foreign key constraints with `ON DELETE CASCADE` ensure referential integrity.

### Middleware

**Authentication (`src/middleware/auth.js`)**: Validates the `x-user-email` header and verifies the user exists in the database. Sets `req.userEmail` for downstream handlers.

**Error Handler (`src/middleware/errorHandler.js`)**: Centralized error handling that processes Joi validation errors, SQLite errors, and generic errors into consistent JSON responses.

### Routes

Each route file follows a consistent pattern:
1. Import dependencies
2. Create Express router
3. Apply authentication middleware (where needed)
4. Define route handlers
5. Export router

Route handlers use callbacks for SQLite operations and pass errors to the error handler middleware.

### Validation

Joi schemas (`src/validation/schemas.js`) validate all incoming request data:
- `emailSchema`: Email format validation
- `clientSchema`: Client creation validation
- `updateClientSchema`: Client update validation
- `workEntrySchema`: Work entry creation validation
- `updateWorkEntrySchema`: Work entry update validation

## Frontend Architecture

### State Management

**Authentication Context (`src/contexts/AuthContext.tsx`)**: Manages user authentication state using React Context. Provides `login`, `logout`, and `user` state to the application.

**React Query**: Handles server state management with automatic caching, background refetching, and optimistic updates.

### API Client

The API client (`src/api/client.ts`) is a class-based Axios wrapper that:
- Automatically adds the `x-user-email` header to requests
- Handles 401 responses by clearing auth state and redirecting to login
- Provides typed methods for all API endpoints

### Routing

React Router v6 handles client-side routing with protected routes that redirect unauthenticated users to the login page.

### Component Structure

Pages are located in `src/pages/` and follow a consistent pattern:
- Use Material UI components for UI
- Use React Query hooks for data fetching
- Handle loading and error states
- Implement CRUD operations through dialogs

## Testing

### Running Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Generate coverage report
```

### Test Structure

Tests are located in `backend/src/__tests__/` and organized by module:
- `database/init.test.js`: Database initialization tests
- `middleware/auth.test.js`: Authentication middleware tests
- `middleware/errorHandler.test.js`: Error handler tests
- `routes/auth.test.js`: Authentication endpoint tests
- `routes/clients.test.js`: Client endpoint tests
- `routes/workEntries.test.js`: Work entry endpoint tests
- `routes/reports.test.js`: Report endpoint tests
- `validation/schemas.test.js`: Validation schema tests

### Writing Tests

Tests use Jest with mocked SQLite database. The test setup file (`src/__tests__/setup.js`) configures global mocks.

Example test structure:
```javascript
const request = require('supertest');
const express = require('express');

describe('Feature Name', () => {
  let app;

  beforeEach(() => {
    // Setup test app
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('x-user-email', 'test@example.com');

    expect(response.status).toBe(200);
  });
});
```

### Coverage Requirements

The project maintains the following coverage thresholds:
- Statements: 60%
- Branches: 60%
- Functions: 65%
- Lines: 60%

Current coverage exceeds 90% for most modules.

## Code Style

### JavaScript/Node.js

- Use ES6+ features
- Use async/await for asynchronous operations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### TypeScript/React

- Enable strict mode
- Define interfaces for all data types
- Use functional components with hooks
- Avoid `any` type

### General

- Use 2-space indentation
- Use single quotes for strings
- Add trailing commas in multi-line arrays/objects
- Keep functions small and focused

## Adding New Features

### Adding a New API Endpoint

1. Create or update the route file in `backend/src/routes/`
2. Add validation schema in `backend/src/validation/schemas.js`
3. Register the route in `backend/src/server.js`
4. Add tests in `backend/src/__tests__/routes/`
5. Update API documentation

### Adding a New Frontend Page

1. Create the page component in `frontend/src/pages/`
2. Add the route in `frontend/src/App.tsx`
3. Add navigation link in `frontend/src/components/Layout.tsx`
4. Add API methods in `frontend/src/api/client.ts`
5. Add TypeScript interfaces in `frontend/src/types/api.ts`

### Adding a New Database Table

1. Update `backend/src/database/init.js` with the new table schema
2. Add appropriate indexes for query performance
3. Create route handlers for CRUD operations
4. Add validation schemas
5. Update tests

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment mode | development |
| FRONTEND_URL | CORS allowed origin | http://localhost:5173 |
| JWT_SECRET | Secret for JWT signing | (required in production) |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | (empty, uses proxy) |

## Debugging

### Backend Debugging

- Use `console.log` for quick debugging
- Check the terminal output for error messages
- Use Node.js debugger with `--inspect` flag

### Frontend Debugging

- Use browser developer tools (F12)
- Check the Console tab for errors
- Use React Developer Tools extension
- Use Network tab to inspect API calls

### Common Issues

**CORS Errors**: Ensure `FRONTEND_URL` is correctly set in backend `.env`

**Database Errors**: Check that the database is initialized before making queries

**Authentication Errors**: Verify the `x-user-email` header is being sent with requests

## Deployment

See `backend/DEPLOYMENT.md` for detailed production deployment instructions.

### Docker Build

```bash
docker build -f docker/Dockerfile -t timesheet-app .
docker run -p 3001:3001 timesheet-app
```

### CI/CD

The project uses GitHub Actions for CI/CD:
- `deploy.yml`: Builds and deploys to AWS
- `security-scan.yml`: Runs security scans with Trivy

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Write or update tests
4. Ensure all tests pass
5. Submit a pull request

### Pull Request Guidelines

- Provide a clear description of changes
- Reference any related issues
- Ensure CI checks pass
- Request review from maintainers

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Material UI Documentation](https://mui.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Jest Documentation](https://jestjs.io/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
