# Client Timesheet App

A full-stack web application for tracking billable hours across multiple clients, featuring a React frontend and Node.js/Express backend with SQLite storage.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Security](#security)
- [Production Deployment](#production-deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Client Timesheet App enables employees to log work hours against specific clients, manage client records, and generate exportable reports in CSV or PDF format. The application uses email-based authentication with JWT tokens, making it suitable for trusted internal networks where simplicity is preferred over complex credential management.

### Tech Stack

The frontend is built with React 19 and TypeScript, using Vite for fast development builds and Material-UI for the component library. Server state is managed through TanStack React Query, with React Router handling navigation and Axios managing API communication.

The backend runs on Node.js with Express, storing data in SQLite. Authentication uses JSON Web Tokens, input validation is handled by Joi, and report exports are generated using PDFKit and csv-writer.

### Requirements

- Node.js 18 or higher
- npm or yarn

## Quick Start

Clone the repository and set up both the backend and frontend:

```bash
# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend starts on `http://localhost:3001`. In a separate terminal, set up the frontend:

```bash
# Frontend setup
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend starts on `http://localhost:5173`. Open this URL in your browser, enter any email address to log in, and begin tracking time.

### Environment Configuration

The backend `.env` file supports the following variables:

```bash
PORT=3001                              # Server port
NODE_ENV=development                   # Environment mode
FRONTEND_URL=http://localhost:5173     # CORS origin
JWT_SECRET=your-secure-secret-key      # Token signing key (change in production)
```

The frontend `.env` file requires only the API URL:

```bash
VITE_API_URL=http://localhost:3001
```

## Project Structure

```
client-timesheet-app/
├── backend/
│   └── src/
│       ├── database/init.js        # SQLite initialization
│       ├── middleware/
│       │   ├── auth.js             # JWT authentication
│       │   └── errorHandler.js     # Centralized error handling
│       ├── routes/
│       │   ├── auth.js             # Login and user info
│       │   ├── clients.js          # Client CRUD operations
│       │   ├── workEntries.js      # Time entry management
│       │   └── reports.js          # Report generation and export
│       ├── validation/schemas.js   # Joi validation schemas
│       └── server.js               # Express application entry
│
└── frontend/
    └── src/
        ├── api/client.ts           # Axios API client with JWT
        ├── components/Layout.tsx   # Application shell
        ├── contexts/AuthContext.tsx # Authentication state
        └── pages/
            ├── LoginPage.tsx       # Email-based login
            ├── DashboardPage.tsx   # Overview and metrics
            ├── ClientsPage.tsx     # Client management
            ├── WorkEntriesPage.tsx # Time entry logging
            └── ReportsPage.tsx     # Report viewing and export
```

## API Reference

All endpoints except login require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email, returns JWT |
| GET | `/api/auth/me` | Get current user info |

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List all clients |
| POST | `/api/clients` | Create a client |
| GET | `/api/clients/:id` | Get a specific client |
| PUT | `/api/clients/:id` | Update a client |
| DELETE | `/api/clients/:id` | Delete a client |

### Work Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/work-entries` | List entries (supports `?clientId` filter) |
| POST | `/api/work-entries` | Create an entry |
| GET | `/api/work-entries/:id` | Get a specific entry |
| PUT | `/api/work-entries/:id` | Update an entry |
| DELETE | `/api/work-entries/:id` | Delete an entry |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/client/:clientId` | Get hourly report as JSON |
| GET | `/api/reports/export/csv/:clientId` | Download report as CSV |
| GET | `/api/reports/export/pdf/:clientId` | Download report as PDF |

## Testing

The backend includes a comprehensive test suite with over 160 tests covering routes, middleware, validation, and database operations.

```bash
cd backend
npm test                    # Run all tests
npm run test:coverage       # Generate coverage report
npm run test:watch          # Watch mode for development
npm run test:verbose        # Detailed test output
npm run test:ci             # CI mode with coverage enforcement
```

Coverage thresholds are enforced at 60% for statements, branches, and lines, and 65% for functions.

## Security

The application implements several security measures. Rate limiting restricts authentication endpoints to 5 attempts per 15 minutes. Helmet middleware sets security-related HTTP headers. CORS is configured to accept requests only from the specified frontend URL. All database queries use parameterized statements to prevent SQL injection. JWT tokens expire after 24 hours.

## Production Deployment

The default configuration uses an in-memory SQLite database, meaning all data is lost when the server restarts. For production deployments, modify `backend/src/database/init.js` to use file-based SQLite or migrate to a persistent database.

Additional production considerations include setting a strong `JWT_SECRET`, configuring HTTPS, integrating with company SSO for authentication, and setting up proper logging and monitoring. See `backend/DEPLOYMENT.md` for detailed deployment instructions.

### Known Limitations

The current implementation has several constraints to be aware of. The in-memory database does not persist data across restarts. Email-only authentication assumes a trusted network environment. All authenticated users have equal access to their own data without role-based permissions. The architecture is designed for single-server deployment rather than horizontal scaling.

## Contributing

Contributions are welcome. Please ensure all tests pass before submitting a pull request:

```bash
cd backend
npm run test:ci
```

Follow the existing code style and include tests for new functionality. The frontend uses TypeScript with Material-UI components, and the backend follows Express conventions with Joi validation.

## License

MIT

---

_Originally written and maintained by contributors and [Devin](https://devin.ai), with updates from the core team._
