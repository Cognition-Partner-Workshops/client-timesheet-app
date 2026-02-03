# API Documentation

This document provides detailed documentation for all API endpoints in the Employee Time Tracking Application.

## Base URL

Development: `http://localhost:3001`
Production: Configured via environment variables

## Authentication

The API uses email-based authentication with JWT-like tokens. All authenticated endpoints require the `x-user-email` header.

### Headers

| Header | Description | Required |
|--------|-------------|----------|
| `x-user-email` | User's email address | Yes (for authenticated endpoints) |
| `Content-Type` | `application/json` | Yes (for POST/PUT requests) |

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid authentication |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

## Endpoints

### Authentication

#### POST /api/auth/login

Authenticates a user by email. Creates a new user if the email doesn't exist.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 - Existing User):**
```json
{
  "message": "Login successful",
  "user": {
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Success Response (201 - New User):**
```json
{
  "message": "User created and logged in successfully",
  "user": {
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "error": "\"email\" must be a valid email"
}
```

#### GET /api/auth/me

Returns the current authenticated user's information.

**Headers Required:** `x-user-email`

**Success Response (200):**
```json
{
  "user": {
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "User not found"
}
```

### Clients

All client endpoints require authentication via the `x-user-email` header.

#### GET /api/clients

Returns all clients for the authenticated user.

**Success Response (200):**
```json
{
  "clients": [
    {
      "id": 1,
      "name": "Acme Corporation",
      "description": "Main consulting client",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Tech Startup Inc",
      "description": null,
      "created_at": "2024-01-16T14:20:00.000Z",
      "updated_at": "2024-01-16T14:20:00.000Z"
    }
  ]
}
```

#### GET /api/clients/:id

Returns a specific client by ID.

**URL Parameters:**
- `id` (integer): Client ID

**Success Response (200):**
```json
{
  "client": {
    "id": 1,
    "name": "Acme Corporation",
    "description": "Main consulting client",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Client not found"
}
```

#### POST /api/clients

Creates a new client.

**Request Body:**
```json
{
  "name": "New Client Name",
  "description": "Optional description"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 1-255 characters |
| description | string | No | Max 1000 characters |

**Success Response (201):**
```json
{
  "message": "Client created successfully",
  "client": {
    "id": 3,
    "name": "New Client Name",
    "description": "Optional description",
    "created_at": "2024-01-17T09:00:00.000Z",
    "updated_at": "2024-01-17T09:00:00.000Z"
  }
}
```

#### PUT /api/clients/:id

Updates an existing client.

**URL Parameters:**
- `id` (integer): Client ID

**Request Body:**
```json
{
  "name": "Updated Client Name",
  "description": "Updated description"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | No | 1-255 characters |
| description | string | No | Max 1000 characters |

At least one field must be provided.

**Success Response (200):**
```json
{
  "message": "Client updated successfully",
  "client": {
    "id": 1,
    "name": "Updated Client Name",
    "description": "Updated description",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-17T11:00:00.000Z"
  }
}
```

#### DELETE /api/clients/:id

Deletes a client and all associated work entries (cascade delete).

**URL Parameters:**
- `id` (integer): Client ID

**Success Response (200):**
```json
{
  "message": "Client deleted successfully"
}
```

### Work Entries

All work entry endpoints require authentication via the `x-user-email` header.

#### GET /api/work-entries

Returns all work entries for the authenticated user.

**Query Parameters:**
- `clientId` (optional, integer): Filter entries by client ID

**Success Response (200):**
```json
{
  "workEntries": [
    {
      "id": 1,
      "client_id": 1,
      "hours": 8.5,
      "description": "Frontend development",
      "date": "2024-01-15",
      "created_at": "2024-01-15T18:00:00.000Z",
      "updated_at": "2024-01-15T18:00:00.000Z",
      "client_name": "Acme Corporation"
    },
    {
      "id": 2,
      "client_id": 2,
      "hours": 4.0,
      "description": "Code review",
      "date": "2024-01-16",
      "created_at": "2024-01-16T12:00:00.000Z",
      "updated_at": "2024-01-16T12:00:00.000Z",
      "client_name": "Tech Startup Inc"
    }
  ]
}
```

#### GET /api/work-entries/:id

Returns a specific work entry by ID.

**URL Parameters:**
- `id` (integer): Work entry ID

**Success Response (200):**
```json
{
  "workEntry": {
    "id": 1,
    "client_id": 1,
    "hours": 8.5,
    "description": "Frontend development",
    "date": "2024-01-15",
    "created_at": "2024-01-15T18:00:00.000Z",
    "updated_at": "2024-01-15T18:00:00.000Z",
    "client_name": "Acme Corporation"
  }
}
```

#### POST /api/work-entries

Creates a new work entry.

**Request Body:**
```json
{
  "clientId": 1,
  "hours": 8.5,
  "description": "Frontend development",
  "date": "2024-01-15"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| clientId | integer | Yes | Must be a valid client ID owned by the user |
| hours | number | Yes | Positive number, max 24, up to 2 decimal places |
| description | string | No | Max 1000 characters |
| date | string | Yes | ISO 8601 date format (YYYY-MM-DD) |

**Success Response (201):**
```json
{
  "message": "Work entry created successfully",
  "workEntry": {
    "id": 3,
    "client_id": 1,
    "hours": 8.5,
    "description": "Frontend development",
    "date": "2024-01-15",
    "created_at": "2024-01-17T09:00:00.000Z",
    "updated_at": "2024-01-17T09:00:00.000Z",
    "client_name": "Acme Corporation"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Client not found or does not belong to user"
}
```

#### PUT /api/work-entries/:id

Updates an existing work entry.

**URL Parameters:**
- `id` (integer): Work entry ID

**Request Body:**
```json
{
  "clientId": 2,
  "hours": 6.0,
  "description": "Updated description",
  "date": "2024-01-16"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| clientId | integer | No | Must be a valid client ID owned by the user |
| hours | number | No | Positive number, max 24, up to 2 decimal places |
| description | string | No | Max 1000 characters |
| date | string | No | ISO 8601 date format (YYYY-MM-DD) |

At least one field must be provided.

**Success Response (200):**
```json
{
  "message": "Work entry updated successfully",
  "workEntry": {
    "id": 1,
    "client_id": 2,
    "hours": 6.0,
    "description": "Updated description",
    "date": "2024-01-16",
    "created_at": "2024-01-15T18:00:00.000Z",
    "updated_at": "2024-01-17T11:00:00.000Z",
    "client_name": "Tech Startup Inc"
  }
}
```

#### DELETE /api/work-entries/:id

Deletes a work entry.

**URL Parameters:**
- `id` (integer): Work entry ID

**Success Response (200):**
```json
{
  "message": "Work entry deleted successfully"
}
```

### Reports

All report endpoints require authentication via the `x-user-email` header.

#### GET /api/reports/client/:clientId

Returns a detailed report for a specific client including all work entries and total hours.

**URL Parameters:**
- `clientId` (integer): Client ID

**Success Response (200):**
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
      "description": "Frontend development",
      "date": "2024-01-15",
      "created_at": "2024-01-15T18:00:00.000Z",
      "updated_at": "2024-01-15T18:00:00.000Z"
    },
    {
      "id": 3,
      "hours": 4.0,
      "description": "Bug fixes",
      "date": "2024-01-17",
      "created_at": "2024-01-17T16:00:00.000Z",
      "updated_at": "2024-01-17T16:00:00.000Z"
    }
  ],
  "totalHours": 12.5,
  "entryCount": 2
}
```

#### GET /api/reports/export/csv/:clientId

Exports the client report as a CSV file.

**URL Parameters:**
- `clientId` (integer): Client ID

**Success Response:**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="ClientName_report_timestamp.csv"`

**CSV Format:**
```csv
Date,Hours,Description,Created At
2024-01-15,8.5,Frontend development,2024-01-15T18:00:00.000Z
2024-01-17,4.0,Bug fixes,2024-01-17T16:00:00.000Z
```

#### GET /api/reports/export/pdf/:clientId

Exports the client report as a PDF file.

**URL Parameters:**
- `clientId` (integer): Client ID

**Success Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="ClientName_report_timestamp.pdf"`

The PDF includes:
- Report title with client name
- Total hours and entry count
- Generation timestamp
- Table of all work entries with date, hours, and description

### Health Check

#### GET /health

Returns the health status of the API server.

**Success Response (200):**
```json
{
  "status": "ok"
}
```

## Rate Limiting

The authentication endpoint (`POST /api/auth/login`) is rate-limited to 5 attempts per 15 minutes per IP address to prevent brute force attacks.

## Validation Rules

### Email
- Must be a valid email format
- Required for authentication

### Client Name
- Required
- Minimum 1 character
- Maximum 255 characters
- Trimmed of whitespace

### Client Description
- Optional
- Maximum 1000 characters
- Trimmed of whitespace

### Work Entry Hours
- Required
- Must be a positive number
- Maximum 24 hours
- Up to 2 decimal places precision

### Work Entry Date
- Required
- Must be in ISO 8601 format (YYYY-MM-DD)

### Work Entry Description
- Optional
- Maximum 1000 characters
- Trimmed of whitespace
