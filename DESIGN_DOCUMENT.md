# Client Timesheet Application - Design Document

## Document Information

| Field | Value |
|-------|-------|
| Document Version | 1.0 |
| Last Updated | February 2026 |
| Status | Final |

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Architecture Design](#3-architecture-design)
4. [Data Model](#4-data-model)
5. [API Design](#5-api-design)
6. [Frontend Design](#6-frontend-design)
7. [Security Design](#7-security-design)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Future Considerations](#10-future-considerations)

---

## 1. Executive Summary

### 1.1 Purpose

The Client Timesheet Application is a full-stack web application designed for tracking and reporting employee hourly work across multiple clients. It provides a streamlined solution for consultants, freelancers, and employees who need to bill hours to various clients.

### 1.2 Scope

This document describes the technical design and architecture of the Client Timesheet Application, including the frontend React application, backend Node.js API server, SQLite database, and AWS deployment infrastructure.

### 1.3 Key Features

The application provides the following core capabilities:

- **User Authentication**: Email-based login system with automatic user creation
- **Client Management**: Full CRUD operations for managing client records
- **Time Entry Tracking**: Record work entries with hours, dates, and descriptions
- **Reporting**: Generate aggregated reports showing total hours per client
- **Export Functionality**: Export time tracking data in CSV and PDF formats

### 1.4 Target Users

The primary users of this application are consultants, freelancers, or employees who bill hours to multiple clients and need a centralized system to track their time and generate reports for billing or payroll purposes.

---

## 2. System Overview

### 2.1 High-Level Architecture

The application follows a three-tier architecture pattern consisting of a presentation layer (React frontend), business logic layer (Express.js backend), and data layer (SQLite database).

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Browser                               │
│                    (React SPA + Material UI)                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS EC2 Instance                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     Docker Container                          │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                  Express.js Server                      │  │  │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │  │
│  │  │  │ Static Files│  │  REST API   │  │   Middleware    │  │  │  │
│  │  │  │  (React)    │  │   Routes    │  │ (Auth, CORS,    │  │  │  │
│  │  │  │             │  │             │  │  Rate Limit)    │  │  │  │
│  │  │  └─────────────┘  └─────────────┘  └─────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                            │                                   │  │
│  │                            ▼                                   │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │                   SQLite Database                       │  │  │
│  │  │         (File-based in production, in-memory dev)       │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

#### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI component library |
| TypeScript | 5.x | Type-safe JavaScript |
| Vite | 7.x | Build tool and dev server |
| Material UI | 7.3.6 | Component library |
| TanStack Query | 5.90.11 | Server state management |
| React Router | 7.10.0 | Client-side routing |
| Axios | 1.13.2 | HTTP client |

#### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | JavaScript runtime |
| Express.js | 4.21.2 | Web framework |
| SQLite3 | 5.1.7 | Database |
| Joi | 17.13.3 | Input validation |
| Helmet | 8.0.0 | Security headers |
| PDFKit | 0.15.1 | PDF generation |
| csv-writer | 1.6.0 | CSV export |

#### Infrastructure Technologies

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| AWS ECR | Container registry |
| AWS EC2 | Application hosting |
| AWS SSM | Remote deployment |
| GitHub Actions | CI/CD pipeline |

---

## 3. Architecture Design

### 3.1 Frontend Architecture

The frontend follows a component-based architecture using React with TypeScript. The application is organized into distinct layers for separation of concerns.

```
frontend/src/
├── api/                    # API client layer
│   └── client.ts          # Axios HTTP client with interceptors
├── components/            # Reusable UI components
│   └── Layout.tsx         # Main application layout
├── contexts/              # React Context providers
│   └── AuthContext.tsx    # Authentication state management
├── pages/                 # Page-level components
│   ├── LoginPage.tsx      # Authentication page
│   ├── DashboardPage.tsx  # Main dashboard
│   ├── ClientsPage.tsx    # Client management
│   ├── WorkEntriesPage.tsx # Time entry management
│   └── ReportsPage.tsx    # Reporting and export
├── types/                 # TypeScript type definitions
│   └── api.ts             # API response types
├── App.tsx                # Root component with routing
└── main.tsx               # Application entry point
```

#### 3.1.1 State Management Strategy

The application employs a hybrid state management approach:

- **Server State**: Managed by TanStack Query (React Query) for data fetching, caching, and synchronization with the backend
- **Authentication State**: Managed by React Context (AuthContext) for user session information
- **Local Component State**: Managed by React useState for form inputs and UI state

#### 3.1.2 Data Flow Pattern

```
User Interaction
       │
       ▼
┌─────────────────┐
│  React Component │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  React Query    │ ◄─── Cache Management
│  (useQuery/     │
│   useMutation)  │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  API Client     │ ◄─── JWT Token Injection
│  (Axios)        │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Backend API    │
└─────────────────┘
```

### 3.2 Backend Architecture

The backend follows a layered architecture pattern with clear separation between routing, middleware, and data access.

```
backend/src/
├── database/              # Data access layer
│   └── init.js           # Database initialization and connection
├── middleware/            # Express middleware
│   ├── auth.js           # Authentication middleware
│   └── errorHandler.js   # Centralized error handling
├── routes/                # API route handlers
│   ├── auth.js           # Authentication endpoints
│   ├── clients.js        # Client CRUD endpoints
│   ├── workEntries.js    # Work entry endpoints
│   └── reports.js        # Reporting endpoints
├── validation/            # Input validation
│   └── schemas.js        # Joi validation schemas
└── server.js              # Application entry point
```

#### 3.2.1 Request Processing Pipeline

```
HTTP Request
     │
     ▼
┌─────────────────┐
│  Security       │  Helmet, CORS, Rate Limiting
│  Middleware     │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│  Body Parser    │  JSON parsing, URL encoding
└─────────────────┘
     │
     ▼
┌─────────────────┐
│  Authentication │  Email header validation
│  Middleware     │  User creation/lookup
└─────────────────┘
     │
     ▼
┌─────────────────┐
│  Route Handler  │  Business logic execution
│                 │  Input validation (Joi)
└─────────────────┘
     │
     ▼
┌─────────────────┐
│  Database       │  SQLite queries
│  Operations     │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│  Error Handler  │  Centralized error processing
│  Middleware     │
└─────────────────┘
     │
     ▼
HTTP Response
```

### 3.3 Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                     │
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │ LoginPage   │    │ Dashboard   │    │ ClientsPage │                  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                  │
│         │                  │                  │                          │
│         └──────────────────┼──────────────────┘                          │
│                            │                                             │
│                            ▼                                             │
│                   ┌─────────────────┐                                    │
│                   │   AuthContext   │                                    │
│                   └────────┬────────┘                                    │
│                            │                                             │
│                            ▼                                             │
│                   ┌─────────────────┐                                    │
│                   │   API Client    │                                    │
│                   └────────┬────────┘                                    │
└────────────────────────────┼─────────────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                      │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        Express Server                            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │    │
│  │  │ /auth    │  │ /clients │  │ /work-   │  │ /reports         │ │    │
│  │  │          │  │          │  │ entries  │  │                  │ │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │    │
│  │       │             │             │                 │           │    │
│  │       └─────────────┴─────────────┴─────────────────┘           │    │
│  │                                   │                              │    │
│  │                                   ▼                              │    │
│  │                          ┌───────────────┐                       │    │
│  │                          │   Database    │                       │    │
│  │                          │   (SQLite)    │                       │    │
│  │                          └───────────────┘                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Model

### 4.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│    ┌─────────────────┐         ┌─────────────────┐                     │
│    │     USERS       │         │     CLIENTS     │                     │
│    ├─────────────────┤         ├─────────────────┤                     │
│    │ email (PK)      │◄────────│ user_email (FK) │                     │
│    │ created_at      │    1:N  │ id (PK)         │                     │
│    └─────────────────┘         │ name            │                     │
│            │                   │ description     │                     │
│            │                   │ created_at      │                     │
│            │                   │ updated_at      │                     │
│            │                   └────────┬────────┘                     │
│            │                            │                              │
│            │                            │ 1:N                          │
│            │                            ▼                              │
│            │                   ┌─────────────────┐                     │
│            │                   │  WORK_ENTRIES   │                     │
│            │                   ├─────────────────┤                     │
│            └──────────────────►│ user_email (FK) │                     │
│                           1:N  │ client_id (FK)  │                     │
│                                │ id (PK)         │                     │
│                                │ hours           │                     │
│                                │ description     │                     │
│                                │ date            │                     │
│                                │ created_at      │                     │
│                                │ updated_at      │                     │
│                                └─────────────────┘                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Table Definitions

#### 4.2.1 Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| email | TEXT | PRIMARY KEY | User's email address (unique identifier) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

#### 4.2.2 Clients Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique client identifier |
| name | TEXT | NOT NULL | Client name |
| description | TEXT | NULLABLE | Optional client description |
| user_email | TEXT | NOT NULL, FOREIGN KEY | Owner's email (references users.email) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp |

#### 4.2.3 Work Entries Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique entry identifier |
| client_id | INTEGER | NOT NULL, FOREIGN KEY | Associated client (references clients.id) |
| user_email | TEXT | NOT NULL, FOREIGN KEY | Owner's email (references users.email) |
| hours | DECIMAL(5,2) | NOT NULL | Hours worked (0.01 - 24.00) |
| description | TEXT | NULLABLE | Work description |
| date | DATE | NOT NULL | Date of work performed |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp |

### 4.3 Database Indexes

The following indexes are created to optimize query performance:

| Index Name | Table | Column(s) | Purpose |
|------------|-------|-----------|---------|
| idx_clients_user_email | clients | user_email | Optimize client lookups by user |
| idx_work_entries_client_id | work_entries | client_id | Optimize work entry queries by client |
| idx_work_entries_user_email | work_entries | user_email | Optimize work entry queries by user |
| idx_work_entries_date | work_entries | date | Optimize date-based queries |

### 4.4 Referential Integrity

The database enforces referential integrity through foreign key constraints with CASCADE DELETE behavior:

- Deleting a user cascades to delete all associated clients and work entries
- Deleting a client cascades to delete all associated work entries

---

## 5. API Design

### 5.1 API Overview

The backend exposes a RESTful API with the following base URL structure:

```
Base URL: /api
```

All authenticated endpoints require the `x-user-email` header containing the user's email address.

### 5.2 Authentication Endpoints

#### POST /api/auth/login

Authenticates a user by email. Creates a new user account if one doesn't exist.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK - Existing User):**
```json
{
  "message": "Login successful",
  "user": {
    "email": "user@example.com",
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

**Response (201 Created - New User):**
```json
{
  "message": "User created and logged in successfully",
  "user": {
    "email": "user@example.com",
    "createdAt": "2026-02-03T06:00:00.000Z"
  }
}
```

#### GET /api/auth/me

Returns the current authenticated user's information.

**Headers:**
```
x-user-email: user@example.com
```

**Response (200 OK):**
```json
{
  "user": {
    "email": "user@example.com",
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

### 5.3 Client Endpoints

#### GET /api/clients

Returns all clients for the authenticated user.

**Response (200 OK):**
```json
{
  "clients": [
    {
      "id": 1,
      "name": "Acme Corporation",
      "description": "Main consulting client",
      "created_at": "2026-01-15T10:30:00.000Z",
      "updated_at": "2026-01-20T14:00:00.000Z"
    }
  ]
}
```

#### GET /api/clients/:id

Returns a specific client by ID.

**Response (200 OK):**
```json
{
  "client": {
    "id": 1,
    "name": "Acme Corporation",
    "description": "Main consulting client",
    "created_at": "2026-01-15T10:30:00.000Z",
    "updated_at": "2026-01-20T14:00:00.000Z"
  }
}
```

#### POST /api/clients

Creates a new client.

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "description": "Main consulting client"
}
```

**Response (201 Created):**
```json
{
  "message": "Client created successfully",
  "client": {
    "id": 1,
    "name": "Acme Corporation",
    "description": "Main consulting client",
    "created_at": "2026-02-03T06:00:00.000Z",
    "updated_at": "2026-02-03T06:00:00.000Z"
  }
}
```

#### PUT /api/clients/:id

Updates an existing client.

**Request Body:**
```json
{
  "name": "Acme Corp",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "message": "Client updated successfully",
  "client": {
    "id": 1,
    "name": "Acme Corp",
    "description": "Updated description",
    "created_at": "2026-01-15T10:30:00.000Z",
    "updated_at": "2026-02-03T06:00:00.000Z"
  }
}
```

#### DELETE /api/clients/:id

Deletes a client and all associated work entries.

**Response (200 OK):**
```json
{
  "message": "Client deleted successfully"
}
```

### 5.4 Work Entry Endpoints

#### GET /api/work-entries

Returns all work entries for the authenticated user. Supports optional filtering by client.

**Query Parameters:**
- `clientId` (optional): Filter entries by client ID

**Response (200 OK):**
```json
{
  "workEntries": [
    {
      "id": 1,
      "client_id": 1,
      "hours": 8.5,
      "description": "Development work",
      "date": "2026-02-01",
      "created_at": "2026-02-01T17:00:00.000Z",
      "updated_at": "2026-02-01T17:00:00.000Z",
      "client_name": "Acme Corporation"
    }
  ]
}
```

#### GET /api/work-entries/:id

Returns a specific work entry by ID.

#### POST /api/work-entries

Creates a new work entry.

**Request Body:**
```json
{
  "clientId": 1,
  "hours": 8.5,
  "description": "Development work",
  "date": "2026-02-01"
}
```

**Response (201 Created):**
```json
{
  "message": "Work entry created successfully",
  "workEntry": {
    "id": 1,
    "client_id": 1,
    "hours": 8.5,
    "description": "Development work",
    "date": "2026-02-01",
    "created_at": "2026-02-01T17:00:00.000Z",
    "updated_at": "2026-02-01T17:00:00.000Z",
    "client_name": "Acme Corporation"
  }
}
```

#### PUT /api/work-entries/:id

Updates an existing work entry.

#### DELETE /api/work-entries/:id

Deletes a work entry.

### 5.5 Report Endpoints

#### GET /api/reports/client/:clientId

Returns an aggregated report for a specific client.

**Response (200 OK):**
```json
{
  "client": {
    "id": 1,
    "name": "Acme Corporation"
  },
  "workEntries": [
    {
      "id": 1,
      "hours": 8.5,
      "description": "Development work",
      "date": "2026-02-01",
      "created_at": "2026-02-01T17:00:00.000Z",
      "updated_at": "2026-02-01T17:00:00.000Z"
    }
  ],
  "totalHours": 8.5,
  "entryCount": 1
}
```

#### GET /api/reports/export/csv/:clientId

Exports the client report as a CSV file.

**Response:** CSV file download

#### GET /api/reports/export/pdf/:clientId

Exports the client report as a PDF file.

**Response:** PDF file download

### 5.6 Input Validation Rules

| Field | Validation Rules |
|-------|------------------|
| email | Valid email format, required |
| client.name | String, 1-255 characters, required |
| client.description | String, max 1000 characters, optional |
| workEntry.clientId | Positive integer, required |
| workEntry.hours | Positive number, max 24, 2 decimal precision, required |
| workEntry.description | String, max 1000 characters, optional |
| workEntry.date | ISO date format, required |

### 5.7 Error Response Format

All error responses follow a consistent format:

```json
{
  "error": "Error message",
  "details": ["Additional details if applicable"]
}
```

| HTTP Status | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid authentication |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error - Server-side error |

---

## 6. Frontend Design

### 6.1 Page Structure

#### 6.1.1 Login Page

The login page provides email-based authentication with the following features:

- Email input field with validation
- Submit button with loading state
- Error message display
- Automatic redirect to dashboard on successful login

#### 6.1.2 Dashboard Page

The dashboard serves as the main landing page after authentication and displays:

- Summary statistics cards (total clients, work entries, hours)
- Recent work entries list
- Quick action buttons for common tasks
- Navigation to other sections

#### 6.1.3 Clients Page

The clients management page provides:

- Table view of all clients with name, description, and creation date
- Add client button opening a modal dialog
- Edit and delete actions for each client
- Confirmation dialog for delete operations

#### 6.1.4 Work Entries Page

The work entries page enables time tracking with:

- Table view of all work entries sorted by date
- Add entry button opening a modal dialog
- Client selection dropdown
- Date picker for entry date
- Hours input with validation (0.01 - 24)
- Description text area
- Edit and delete actions

#### 6.1.5 Reports Page

The reports page provides analytics and export functionality:

- Client selection dropdown
- Summary statistics (total hours, entry count, average hours)
- Detailed work entries table
- CSV export button
- PDF export button

### 6.2 Component Hierarchy

```
App
├── QueryClientProvider (React Query)
│   └── ThemeProvider (Material UI)
│       └── AuthProvider (Authentication Context)
│           └── AppContent
│               ├── LoginPage (unauthenticated)
│               └── Layout (authenticated)
│                   ├── Sidebar Navigation
│                   └── Routes
│                       ├── DashboardPage
│                       ├── ClientsPage
│                       ├── WorkEntriesPage
│                       └── ReportsPage
```

### 6.3 User Interface Patterns

#### 6.3.1 Form Handling

All forms in the application follow a consistent pattern:

1. Form state managed by React useState
2. Validation performed on submit
3. Error messages displayed inline
4. Loading state shown during API calls
5. Success triggers data refresh via React Query invalidation

#### 6.3.2 Data Tables

Tables throughout the application use Material UI Table components with:

- Sortable columns
- Action buttons in the last column
- Empty state messages when no data exists
- Loading spinners during data fetch

#### 6.3.3 Modal Dialogs

Create and edit operations use Material UI Dialog components with:

- Form inputs for data entry
- Cancel and Submit buttons
- Loading state on submit
- Automatic close on success

---

## 7. Security Design

### 7.1 Authentication Mechanism

The application uses a simplified email-based authentication system designed for trusted internal networks. The authentication flow is as follows:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │   Server    │     │  Database   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  POST /login      │                   │
       │  {email}          │                   │
       │──────────────────►│                   │
       │                   │  Check user       │
       │                   │──────────────────►│
       │                   │                   │
       │                   │  User exists?     │
       │                   │◄──────────────────│
       │                   │                   │
       │                   │  Create if new    │
       │                   │──────────────────►│
       │                   │                   │
       │  {user, message}  │                   │
       │◄──────────────────│                   │
       │                   │                   │
       │  Store email      │                   │
       │  in localStorage  │                   │
       │                   │                   │
       │  Subsequent       │                   │
       │  requests with    │                   │
       │  x-user-email     │                   │
       │──────────────────►│                   │
       │                   │                   │
```

### 7.2 Security Middleware Stack

The backend implements multiple security layers:

#### 7.2.1 Helmet

Helmet middleware sets various HTTP headers to protect against common vulnerabilities:

- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection

#### 7.2.2 CORS

Cross-Origin Resource Sharing is configured to allow requests only from the specified frontend URL:

```javascript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
})
```

#### 7.2.3 Rate Limiting

Rate limiting protects against brute force attacks:

- Window: 15 minutes
- Maximum requests: 100 per IP per window

### 7.3 Input Validation

All user input is validated using Joi schemas before processing:

- Email format validation
- String length limits
- Numeric range validation
- Required field enforcement

### 7.4 SQL Injection Prevention

All database queries use parameterized statements to prevent SQL injection:

```javascript
db.get('SELECT * FROM users WHERE email = ?', [email], callback);
```

### 7.5 Data Isolation

Users can only access their own data. All queries include user email filtering:

```javascript
db.all('SELECT * FROM clients WHERE user_email = ?', [req.userEmail], callback);
```

### 7.6 Security Recommendations for Production

For production deployment, the following additional security measures are recommended:

1. Implement proper password-based or SSO authentication
2. Use HTTPS with valid SSL certificates
3. Implement JWT tokens with expiration
4. Add request logging and monitoring
5. Implement database encryption at rest
6. Regular security audits and penetration testing

---

## 8. Deployment Architecture

### 8.1 Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              GitHub                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     GitHub Actions                               │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │   │
│  │  │ Build Job   │───►│ Push to ECR │───►│ Deploy via SSM      │  │   │
│  │  └─────────────┘    └─────────────┘    └─────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                                   │
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│  │                 │    │                 │    │                 │    │
│  │   Amazon ECR    │    │   Amazon EC2    │    │   AWS SSM       │    │
│  │                 │    │                 │    │                 │    │
│  │  ┌───────────┐  │    │  ┌───────────┐  │    │  Remote         │    │
│  │  │ Docker    │  │───►│  │ Docker    │  │◄───│  Command        │    │
│  │  │ Images    │  │    │  │ Container │  │    │  Execution      │    │
│  │  └───────────┘  │    │  └───────────┘  │    │                 │    │
│  │                 │    │                 │    │                 │    │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Docker Configuration

The application uses a multi-stage Docker build for optimized production images:

**Stage 1: Frontend Builder**
- Base image: node:20-alpine
- Builds React application with Vite
- Outputs optimized static files

**Stage 2: Backend Builder**
- Base image: node:20-alpine
- Installs production Node.js dependencies

**Stage 3: Production**
- Base image: node:20-alpine
- Combines built frontend and backend
- Runs as non-root user (nodejs:1001)
- Uses dumb-init for proper signal handling
- Exposes port 3001
- Includes health check endpoint

### 8.3 CI/CD Pipeline

#### 8.3.1 Deployment Workflow (deploy.yml)

**Triggers:**
- Push to main branch
- Manual workflow dispatch

**Jobs:**

1. **build-and-push**
   - Checkout code
   - Configure AWS credentials
   - Login to Amazon ECR
   - Build Docker image
   - Tag with commit SHA and 'latest'
   - Push to ECR

2. **deploy**
   - Get EC2 instance ID by tag
   - Send deployment command via SSM
   - Wait for deployment completion
   - Perform health check

#### 8.3.2 Security Scan Workflow (security-scan.yml)

**Triggers:**
- Push to main branch
- Pull requests to main
- Manual workflow dispatch

**Jobs:**

1. **trivy-scan** - Vulnerability scanning
2. **trivy-secret-scan** - Secret detection
3. **trivy-config-scan** - Configuration scanning

### 8.4 Environment Configuration

#### Development Environment

| Variable | Value |
|----------|-------|
| PORT | 3001 |
| NODE_ENV | development |
| FRONTEND_URL | http://localhost:5173 |
| DATABASE_PATH | :memory: |

#### Production Environment

| Variable | Value |
|----------|-------|
| PORT | 3001 |
| NODE_ENV | production |
| FRONTEND_URL | (configured per deployment) |
| DATABASE_PATH | /app/data/timesheet.db |

---

## 9. Non-Functional Requirements

### 9.1 Performance Requirements

| Metric | Target |
|--------|--------|
| API Response Time | < 200ms for 95th percentile |
| Page Load Time | < 3 seconds initial load |
| Database Query Time | < 50ms for simple queries |
| Concurrent Users | Support 50+ simultaneous users |

### 9.2 Scalability Considerations

The current architecture is designed for single-server deployment. For horizontal scaling, the following modifications would be required:

1. Replace SQLite with PostgreSQL or MySQL
2. Implement session storage in Redis
3. Add load balancer for multiple instances
4. Implement database connection pooling

### 9.3 Availability Requirements

| Metric | Target |
|--------|--------|
| Uptime | 99.5% availability |
| Recovery Time Objective (RTO) | < 1 hour |
| Recovery Point Objective (RPO) | < 24 hours |

### 9.4 Maintainability

The codebase follows these maintainability practices:

- Modular architecture with clear separation of concerns
- TypeScript for type safety and documentation
- Consistent code formatting and naming conventions
- Comprehensive test coverage (90%+ backend coverage)
- Detailed inline documentation

### 9.5 Testing Strategy

#### Backend Testing

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| Database | 8 | 100% |
| Auth Middleware | 11 | 100% |
| Error Handler | 8 | 100% |
| Auth Routes | 11 | 100% |
| Client Routes | 24 | 97.89% |
| Work Entry Routes | 24 | 98.41% |
| Report Routes | 17 | 64.15% |
| Validation Schemas | 38 | 100% |
| **Total** | **161** | **90.16%** |

---

## 10. Future Considerations

### 10.1 Planned Enhancements

The following enhancements are planned for future releases:

1. **Persistent Database Storage**: Migrate from in-memory SQLite to file-based or cloud database
2. **Enhanced Authentication**: Integrate with SSO providers (OAuth 2.0, SAML)
3. **User Roles and Permissions**: Implement role-based access control
4. **Multi-tenancy Support**: Enable organization-level data isolation
5. **Real-time Updates**: Implement WebSocket connections for live data sync
6. **Advanced Reporting**: Add date range filtering, charts, and analytics
7. **Email Notifications**: Send reminders and report summaries
8. **Mobile Application**: Develop native iOS and Android apps
9. **Calendar Integration**: Sync with Google Calendar, Outlook

### 10.2 Technical Debt

The following items are identified as technical debt to be addressed:

1. Improve test coverage for report export functionality
2. Add frontend unit and integration tests
3. Implement proper error boundary components
4. Add request/response logging for debugging
5. Implement database migrations for schema changes

### 10.3 Known Limitations

1. **In-memory Database**: Data is lost on server restart in development mode
2. **Email-only Authentication**: No password protection, assumes trusted network
3. **No User Roles**: All users have equal access to their own data
4. **Single-server Architecture**: Not designed for horizontal scaling
5. **No Real-time Updates**: Changes require page refresh to see updates

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| Client | A business entity for which work is performed and hours are tracked |
| Work Entry | A record of hours worked for a specific client on a specific date |
| Report | An aggregated view of work entries for a client with total hours |
| SPA | Single Page Application - a web application that loads a single HTML page |
| JWT | JSON Web Token - a compact, URL-safe means of representing claims |
| CRUD | Create, Read, Update, Delete - basic data operations |
| SSM | AWS Systems Manager - service for remote command execution |
| ECR | Elastic Container Registry - AWS Docker image repository |

---

## Appendix B: References

- [React Documentation](https://react.dev/)
- [Material UI Documentation](https://mui.com/)
- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [AWS Systems Manager Documentation](https://docs.aws.amazon.com/systems-manager/)
