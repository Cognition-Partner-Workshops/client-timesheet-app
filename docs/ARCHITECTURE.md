# Architecture Documentation

This document describes the system architecture, design decisions, and data flow of the Employee Time Tracking Application.

## System Overview

The Employee Time Tracking Application is a full-stack web application built with a modern JavaScript/TypeScript stack. It follows a client-server architecture with a React frontend communicating with an Express.js backend API.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React Application                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │   Pages     │  │  Components │  │  Auth Context   │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │  │
│  │         │                │                   │            │  │
│  │         └────────────────┼───────────────────┘            │  │
│  │                          │                                │  │
│  │                   ┌──────┴──────┐                         │  │
│  │                   │  API Client │                         │  │
│  │                   └──────┬──────┘                         │  │
│  └──────────────────────────┼────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTP/JSON
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express.js Server                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Middleware                            │  │
│  │  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌─────────────┐  │  │
│  │  │  CORS   │  │  Helmet  │  │  Auth  │  │ Rate Limit  │  │  │
│  │  └────┬────┘  └────┬─────┘  └───┬────┘  └──────┬──────┘  │  │
│  │       └────────────┴────────────┴──────────────┘          │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                  │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │                        Routes                              │  │
│  │  ┌────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐ │  │
│  │  │  Auth  │  │  Clients │  │ Work Entries│  │  Reports │ │  │
│  │  └───┬────┘  └────┬─────┘  └──────┬──────┘  └────┬─────┘ │  │
│  │      └────────────┴───────────────┴──────────────┘        │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                  │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │                    Database Layer                          │  │
│  │                   ┌──────────────┐                         │  │
│  │                   │    SQLite    │                         │  │
│  │                   └──────────────┘                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI framework | 19.x |
| TypeScript | Type safety | 5.x |
| Vite | Build tool | 7.x |
| Material UI | Component library | 7.x |
| React Query | Server state management | 5.x |
| React Router | Client-side routing | 7.x |
| Axios | HTTP client | 1.x |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 18+ |
| Express.js | Web framework | 4.x |
| SQLite3 | Database | 5.x |
| Joi | Validation | 17.x |
| PDFKit | PDF generation | 0.15.x |
| csv-writer | CSV generation | 1.x |
| Helmet | Security headers | 8.x |

## Design Decisions

### Email-Only Authentication

The application uses email-only authentication without passwords. This design decision was made based on the following considerations:

1. The application is intended for use within trusted internal networks
2. Simplifies the user experience by removing password management
3. Reduces security surface area (no password storage or reset flows)
4. Users are automatically created on first login

For production deployments requiring stronger authentication, integration with SSO providers is recommended.

### In-Memory Database

SQLite with an in-memory database is used by default for the following reasons:

1. Zero configuration required for development
2. Fast performance for development and testing
3. No external database dependencies
4. Easy to reset state between development sessions

For production deployments, the database can be configured to use file-based storage by setting the `DATABASE_PATH` environment variable.

### Monolithic Architecture

The application uses a monolithic architecture rather than microservices because:

1. Simplicity for a small-to-medium sized application
2. Easier deployment and operations
3. Lower latency (no inter-service communication)
4. Appropriate for the current scale and complexity

### Client-Side Routing

React Router handles all routing on the client side, with the backend serving only API endpoints. This provides:

1. Fast navigation without full page reloads
2. Better user experience with instant transitions
3. Reduced server load
4. Offline capability potential

## Data Model

### Entity Relationship Diagram

```
┌─────────────────┐
│      users      │
├─────────────────┤
│ email (PK)      │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│     clients     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ description     │
│ user_email (FK) │◄──────┐
│ created_at      │       │
│ updated_at      │       │
└────────┬────────┘       │
         │                │
         │ 1:N            │
         ▼                │
┌─────────────────┐       │
│  work_entries   │       │
├─────────────────┤       │
│ id (PK)         │       │
│ client_id (FK)  │       │
│ user_email (FK) │───────┘
│ hours           │
│ description     │
│ date            │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

### Table Definitions

**users**
- `email` (TEXT, PRIMARY KEY): User's email address
- `created_at` (DATETIME): Account creation timestamp

**clients**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): Unique identifier
- `name` (TEXT, NOT NULL): Client name
- `description` (TEXT): Optional description
- `user_email` (TEXT, FOREIGN KEY): Owner's email
- `created_at` (DATETIME): Creation timestamp
- `updated_at` (DATETIME): Last update timestamp

**work_entries**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): Unique identifier
- `client_id` (INTEGER, FOREIGN KEY): Associated client
- `user_email` (TEXT, FOREIGN KEY): Owner's email
- `hours` (DECIMAL(5,2), NOT NULL): Hours worked
- `description` (TEXT): Work description
- `date` (DATE, NOT NULL): Date of work
- `created_at` (DATETIME): Creation timestamp
- `updated_at` (DATETIME): Last update timestamp

### Indexes

The following indexes optimize query performance:

- `idx_clients_user_email`: Fast client lookup by user
- `idx_work_entries_client_id`: Fast work entry lookup by client
- `idx_work_entries_user_email`: Fast work entry lookup by user
- `idx_work_entries_date`: Fast date-based queries

### Cascade Deletes

Foreign key constraints with `ON DELETE CASCADE` ensure data integrity:

- Deleting a user removes all their clients and work entries
- Deleting a client removes all associated work entries

## Request Flow

### Authentication Flow

```
1. User enters email on login page
2. Frontend sends POST /api/auth/login with email
3. Backend validates email format
4. Backend checks if user exists
   - If exists: Return user data
   - If not: Create user, return user data
5. Frontend stores email in localStorage
6. Frontend redirects to dashboard
```

### Authenticated Request Flow

```
1. User initiates action (e.g., create client)
2. React component calls API client method
3. API client adds x-user-email header from localStorage
4. Request sent to backend
5. Auth middleware validates header
6. Auth middleware verifies user exists in database
7. Route handler processes request
8. Validation middleware checks input
9. Database operation performed
10. Response sent to client
11. React Query updates cache
12. UI re-renders with new data
```

### Report Export Flow

```
1. User selects client and clicks export
2. Frontend requests /api/reports/export/{format}/{clientId}
3. Backend verifies client ownership
4. Backend fetches work entries
5. Backend generates file (CSV or PDF)
6. File sent as download response
7. Browser prompts user to save file
```

## Security Architecture

### Authentication

- Email-based authentication via `x-user-email` header
- User verification on every authenticated request
- Automatic session invalidation on 401 responses

### Authorization

- All data is scoped to the authenticated user
- Users can only access their own clients and work entries
- Client ownership verified before work entry operations

### Input Validation

- Joi schemas validate all incoming data
- Parameterized SQL queries prevent injection
- Input sanitization (trimming, length limits)

### Security Headers

Helmet middleware adds security headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (in production)

### Rate Limiting

- Login endpoint: 5 attempts per 15 minutes per IP
- Prevents brute force attacks

### CORS

- Configured to allow only the frontend origin
- Prevents unauthorized cross-origin requests

## Scalability Considerations

### Current Limitations

1. In-memory database limits data persistence
2. Single-server architecture limits horizontal scaling
3. No caching layer for frequently accessed data
4. Synchronous database operations

### Scaling Strategies

For higher scale deployments, consider:

1. **Database**: Migrate to PostgreSQL or MySQL for better concurrency
2. **Caching**: Add Redis for session and query caching
3. **Load Balancing**: Deploy multiple backend instances behind a load balancer
4. **CDN**: Serve static frontend assets from a CDN
5. **Async Processing**: Use message queues for report generation

## Deployment Architecture

### Development

```
┌─────────────────┐     ┌─────────────────┐
│  Vite Dev       │     │  Express Dev    │
│  Server         │────▶│  Server         │
│  (Port 5173)    │     │  (Port 3001)    │
└─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  React App      │     │  SQLite         │
│  (HMR)          │     │  (In-Memory)    │
└─────────────────┘     └─────────────────┘
```

### Production (Docker)

```
┌─────────────────────────────────────────┐
│            Docker Container             │
│  ┌───────────────────────────────────┐  │
│  │         Express Server            │  │
│  │  ┌─────────────┐ ┌─────────────┐  │  │
│  │  │ Static      │ │ API         │  │  │
│  │  │ Files       │ │ Routes      │  │  │
│  │  │ (React)     │ │             │  │  │
│  │  └─────────────┘ └─────────────┘  │  │
│  └───────────────────────────────────┘  │
│                    │                    │
│                    ▼                    │
│  ┌───────────────────────────────────┐  │
│  │     SQLite (File-based)           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### AWS Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                            │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │   GitHub    │───▶│   GitHub    │───▶│      ECR        │ │
│  │   Repo      │    │   Actions   │    │   (Images)      │ │
│  └─────────────┘    └─────────────┘    └────────┬────────┘ │
│                                                  │          │
│                                                  ▼          │
│                     ┌────────────────────────────────────┐  │
│                     │              EC2                   │  │
│                     │  ┌──────────────────────────────┐  │  │
│                     │  │      Docker Container        │  │  │
│                     │  │  ┌────────────────────────┐  │  │  │
│                     │  │  │   Timesheet App        │  │  │  │
│                     │  │  └────────────────────────┘  │  │  │
│                     │  └──────────────────────────────┘  │  │
│                     └────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Monitoring and Observability

### Logging

- Console logging for development
- Structured logging recommended for production
- Error logging with stack traces

### Health Checks

- `GET /health` endpoint for container orchestration
- Returns `{ "status": "ok" }` when healthy

### Recommended Additions

For production deployments, consider adding:

1. **APM**: Application performance monitoring (e.g., New Relic, Datadog)
2. **Log Aggregation**: Centralized logging (e.g., ELK Stack, CloudWatch)
3. **Error Tracking**: Exception monitoring (e.g., Sentry)
4. **Metrics**: Custom metrics collection (e.g., Prometheus)

## Future Architecture Considerations

### Potential Enhancements

1. **Real-time Updates**: WebSocket integration for live data sync
2. **Offline Support**: Service worker for offline capability
3. **Multi-tenancy**: Organization-level data isolation
4. **API Versioning**: Version prefixes for backward compatibility
5. **GraphQL**: Alternative API layer for flexible queries
6. **Microservices**: Split into services as complexity grows

### Migration Paths

**Database Migration**:
1. Export data from SQLite
2. Set up PostgreSQL/MySQL
3. Import data with schema adjustments
4. Update connection configuration

**Authentication Migration**:
1. Integrate OAuth provider
2. Add password support
3. Migrate existing users
4. Deprecate email-only auth
