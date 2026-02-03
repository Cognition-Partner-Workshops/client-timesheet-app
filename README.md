# Client Timesheet Application

A full-stack web application for tracking and reporting employee hourly work across multiple clients. The application enables consultants, freelancers, and employees to manage client information, record work entries with hours and descriptions, generate reports showing total hours worked per client, and export time tracking data in CSV and PDF formats.

## Technical Specifications

### System Requirements

The application requires Node.js version 18 or higher and npm package manager. For containerized deployment, Docker 20.10+ is required. The backend runs on port 3001 by default, while the frontend development server runs on port 5173.

### Architecture Overview

The application follows a client-server architecture with a React single-page application frontend communicating with an Express.js REST API backend. Data persistence is handled through SQLite, which can operate in-memory for development or file-based for production deployments.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client Browser                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    React SPA (TypeScript + Vite)                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │  LoginPage  │  │ DashboardPage│  │ ClientsPage │  │ ReportsPage │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  │                              │                                         │  │
│  │                    ┌─────────▼─────────┐                              │  │
│  │                    │   TanStack Query   │                              │  │
│  │                    │   + Axios Client   │                              │  │
│  │                    └─────────┬─────────┘                              │  │
│  └──────────────────────────────┼────────────────────────────────────────┘  │
└─────────────────────────────────┼────────────────────────────────────────────┘
                                  │ HTTP/REST + JWT
┌─────────────────────────────────▼────────────────────────────────────────────┐
│                           Express.js Backend                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         Middleware Stack                               │  │
│  │  Helmet → CORS → Rate Limiter → Morgan → Body Parser → Auth → Routes  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  /api/auth  │  │ /api/clients│  │/api/work-   │  │ /api/reports│        │
│  │             │  │             │  │  entries    │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                              │                                              │
│                    ┌─────────▼─────────┐                                   │
│                    │   SQLite Database  │                                   │
│                    │  (in-memory/file)  │                                   │
│                    └───────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI component library |
| TypeScript | 5.9.3 | Static type checking |
| Vite | 7.2.4 | Build tool and dev server |
| Material UI | 7.3.6 | Component library |
| TanStack React Query | 5.90.11 | Server state management |
| React Router DOM | 7.10.0 | Client-side routing |
| Axios | 1.13.2 | HTTP client |
| date-fns | 4.1.0 | Date manipulation |
| Emotion | 11.14.0 | CSS-in-JS styling |

#### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | JavaScript runtime |
| Express | 4.18.2 | Web framework |
| SQLite3 | 5.1.6 | Database engine |
| JSON Web Token | 9.0.2 | Authentication |
| Joi | 17.11.0 | Input validation |
| Helmet | 7.1.0 | Security headers |
| CORS | 2.8.5 | Cross-origin resource sharing |
| express-rate-limit | 7.1.5 | Rate limiting |
| PDFKit | 0.13.0 | PDF generation |
| csv-writer | 1.6.0 | CSV export |
| Morgan | 1.10.0 | HTTP request logging |

#### Development and Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| Jest | 29.7.0 | Testing framework |
| Supertest | 6.3.3 | HTTP assertion library |
| Nodemon | 3.0.2 | Development auto-reload |
| ESLint | 9.39.1 | Code linting |

### Database Schema

The application uses SQLite with three main tables and foreign key relationships with cascade delete behavior.

```sql
-- Users table: stores authenticated user records
CREATE TABLE users (
    email TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clients table: stores client information per user
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    email TEXT,
    user_email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
);

-- Work entries table: stores time tracking records
CREATE TABLE work_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    user_email TEXT NOT NULL,
    hours DECIMAL(5,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX idx_clients_user_email ON clients (user_email);
CREATE INDEX idx_work_entries_client_id ON work_entries (client_id);
CREATE INDEX idx_work_entries_user_email ON work_entries (user_email);
CREATE INDEX idx_work_entries_date ON work_entries (date);
```

### API Specification

All authenticated endpoints require the `Authorization: Bearer <token>` header. The API uses JSON for request and response bodies.

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/login | Authenticate with email, returns JWT token | No |
| GET | /api/auth/me | Get current authenticated user info | Yes |

#### Client Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/clients | List all clients for authenticated user | Yes |
| GET | /api/clients/:id | Get specific client by ID | Yes |
| POST | /api/clients | Create new client | Yes |
| PUT | /api/clients/:id | Update existing client | Yes |
| DELETE | /api/clients/:id | Delete client and associated work entries | Yes |

#### Work Entry Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/work-entries | List work entries (optional ?clientId filter) | Yes |
| GET | /api/work-entries/:id | Get specific work entry | Yes |
| POST | /api/work-entries | Create new work entry | Yes |
| PUT | /api/work-entries/:id | Update existing work entry | Yes |
| DELETE | /api/work-entries/:id | Delete work entry | Yes |

#### Report Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/reports/client/:clientId | Get JSON report with aggregated hours | Yes |
| GET | /api/reports/export/csv/:clientId | Export report as CSV file | Yes |
| GET | /api/reports/export/pdf/:clientId | Export report as PDF file | Yes |

#### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /health | Application health status | No |

### Input Validation Schemas

The backend uses Joi for input validation with the following schemas:

**Client Schema**: name (required, 1-255 chars), description (optional, max 1000 chars), department (optional, max 255 chars), email (optional, valid email format)

**Work Entry Schema**: clientId (required, positive integer), hours (required, 0.01-24.00), description (optional, max 1000 chars), date (required, ISO date format)

**Email Schema**: email (required, valid email format)

### Security Implementation

The application implements multiple security layers. JWT-based authentication uses 24-hour token expiration with tokens stored in browser localStorage. Rate limiting restricts authentication endpoints to 5 attempts per 15 minutes per IP address. Helmet middleware adds security headers including Content-Security-Policy, X-Content-Type-Options, and X-Frame-Options. CORS is configured to accept requests only from the specified frontend URL. All database queries use parameterized statements to prevent SQL injection attacks.

### Project Structure

```
client-timesheet-app/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # CI/CD deployment pipeline
│       └── security-scan.yml       # Trivy vulnerability scanning
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   └── init.js             # SQLite initialization and schema
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT authentication middleware
│   │   │   └── errorHandler.js     # Centralized error handling
│   │   ├── routes/
│   │   │   ├── auth.js             # Authentication endpoints
│   │   │   ├── clients.js          # Client CRUD operations
│   │   │   ├── workEntries.js      # Work entry CRUD operations
│   │   │   └── reports.js          # Reporting and export
│   │   ├── validation/
│   │   │   └── schemas.js          # Joi validation schemas
│   │   ├── __tests__/              # Jest test suites
│   │   └── server.js               # Express application entry point
│   ├── package.json
│   └── jest.config.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts           # Axios HTTP client with interceptors
│   │   ├── components/
│   │   │   └── Layout.tsx          # Main application layout
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx     # Authentication state management
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx       # Email authentication form
│   │   │   ├── DashboardPage.tsx   # Metrics and navigation hub
│   │   │   ├── ClientsPage.tsx     # Client management interface
│   │   │   ├── WorkEntriesPage.tsx # Time entry interface
│   │   │   └── ReportsPage.tsx     # Report viewing and export
│   │   ├── types/
│   │   │   └── api.ts              # TypeScript interfaces
│   │   ├── App.tsx                 # Root component with routing
│   │   └── index.css               # Global styles
│   ├── package.json
│   └── vite.config.ts
├── docker/
│   ├── Dockerfile                  # Multi-stage production build
│   └── overrides/
│       ├── server.js               # Production Express configuration
│       └── database/
│           └── init.js             # File-based SQLite for production
└── README.md
```

### Development Setup

#### Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file with the following configuration:

```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secure-secret-key-change-this
```

Start the development server with auto-reload:

```bash
npm run dev
```

The backend API will be available at http://localhost:3001 with the health check endpoint at http://localhost:3001/health.

#### Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend application will be available at http://localhost:5173. The Vite dev server proxies API requests to the backend automatically.

### Testing

The backend includes a comprehensive Jest test suite with 161 tests across 8 test suites. Run tests using the following commands:

```bash
cd backend
npm test                    # Run all tests
npm run test:coverage       # Generate coverage report
npm run test:watch          # Run tests in watch mode
npm run test:ci             # CI mode with coverage
```

#### Test Coverage

| Module | Statements | Branches | Functions | Lines |
|--------|------------|----------|-----------|-------|
| Overall | 90.16% | 93.82% | 92.18% | 90.35% |
| database/init.js | 100% | 100% | 100% | 100% |
| middleware/auth.js | 100% | 100% | 100% | 100% |
| middleware/errorHandler.js | 100% | 100% | 100% | 100% |
| routes/auth.js | 100% | 100% | 100% | 100% |
| routes/clients.js | 97.89% | 100% | 100% | 97.89% |
| routes/workEntries.js | 98.41% | 100% | 100% | 98.41% |
| routes/reports.js | 64.15% | 69.44% | 68.75% | 64.42% |
| validation/schemas.js | 100% | 100% | 100% | 100% |

Coverage thresholds are configured in jest.config.js requiring minimum 60% for branches, statements, and lines, and 65% for functions.

### Production Build

#### Frontend Build

```bash
cd frontend
npm run build
```

This generates an optimized production build in the `dist/` directory. Preview the build locally with:

```bash
npm run preview
```

#### Backend Production Mode

```bash
cd backend
npm start
```

### Docker Deployment

The application uses a multi-stage Docker build for production deployment. The Dockerfile creates an optimized image with the following stages:

1. **frontend-builder**: Builds the React application using Vite
2. **backend-builder**: Installs production Node.js dependencies
3. **production**: Combines built assets with minimal runtime dependencies

Build and run the Docker container:

```bash
docker build -f docker/Dockerfile -t client-timesheet-app .
docker run -p 3001:3001 -e JWT_SECRET=your-secret client-timesheet-app
```

The production container runs as a non-root user with dumb-init for proper signal handling. SQLite data is persisted at `/app/data/timesheet.db` when using the production configuration.

### CI/CD Pipeline

The repository includes GitHub Actions workflows for automated deployment and security scanning.

#### Deployment Workflow (deploy.yml)

Triggers on push to main branch or manual dispatch. The workflow builds the Docker image, pushes to AWS ECR with commit SHA and latest tags, deploys to EC2 via AWS Systems Manager, and performs health checks.

#### Security Scanning (security-scan.yml)

Runs Trivy vulnerability scanner on push, pull requests, and manual dispatch. Scans for vulnerabilities (CRITICAL, HIGH, MEDIUM severity), secrets, and misconfigurations. Results are uploaded to GitHub Security tab in SARIF format.

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3001 | Backend server port |
| NODE_ENV | No | development | Environment mode |
| FRONTEND_URL | No | http://localhost:5173 | Allowed CORS origin |
| JWT_SECRET | Yes | - | Secret key for JWT signing |
| DATABASE_PATH | No | :memory: | SQLite database file path |

### Known Limitations

The application uses an in-memory SQLite database by default, meaning all data is lost when the backend server restarts. For persistent storage, set the DATABASE_PATH environment variable to a file path. Authentication is email-only without password protection, assuming a trusted internal network environment. All authenticated users have equal access to their own data with no role-based permissions. The single-server architecture is not designed for horizontal scaling, and changes require page refresh as there are no real-time updates via WebSockets.

### License

MIT
