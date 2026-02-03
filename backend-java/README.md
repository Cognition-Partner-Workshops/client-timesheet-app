# Client Timesheet API - Java/Spring Boot Backend

A Java 21 / Spring Boot 3.4 backend implementation of the Client Timesheet API, providing the same functionality as the Node.js backend.

## Technology Stack

- **Java 21** - Latest LTS version
- **Spring Boot 3.4.2** - Modern Spring framework
- **Spring Security** - JWT-based authentication
- **Spring Data JPA** - Database access with Hibernate
- **SQLite** - Lightweight database (same as Node.js version)
- **iText 8** - PDF generation
- **OpenCSV** - CSV export
- **Lombok** - Reduce boilerplate code

## Project Structure

```
backend-java/
├── src/main/java/com/timesheet/api/
│   ├── config/           # Security and app configuration
│   ├── controller/       # REST API endpoints
│   ├── dto/              # Data Transfer Objects
│   ├── entity/           # JPA entities
│   ├── repository/       # Data access layer
│   ├── security/         # JWT authentication
│   └── service/          # Business logic
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (creates user if doesn't exist)
- `GET /api/auth/me` - Get current user info (requires auth)

### Clients
- `GET /api/clients` - List all clients
- `GET /api/clients/{id}` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client
- `DELETE /api/clients` - Delete all clients

### Work Entries
- `GET /api/work-entries` - List all work entries (optional `clientId` filter)
- `GET /api/work-entries/{id}` - Get work entry by ID
- `POST /api/work-entries` - Create new work entry
- `PUT /api/work-entries/{id}` - Update work entry
- `DELETE /api/work-entries/{id}` - Delete work entry

### Reports
- `GET /api/reports/client/{clientId}` - Get client report with total hours
- `GET /api/reports/export/csv/{clientId}` - Export report as CSV
- `GET /api/reports/export/pdf/{clientId}` - Export report as PDF

## Running Locally

### Prerequisites
- Java 21 or higher
- Maven 3.9+

### Build and Run

```bash
# Build the project
./mvnw clean package

# Run the application
./mvnw spring-boot:run
```

The API will be available at `http://localhost:3002`

### Configuration

Edit `src/main/resources/application.properties` to customize:
- `server.port` - Server port (default: 3002)
- `jwt.secret` - JWT signing secret
- `jwt.expiration` - Token expiration in milliseconds

## Authentication

All endpoints except `/api/auth/login` require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is returned in the login response.

## Differences from Node.js Backend

1. **Port**: Runs on port 3002 (Node.js runs on 3001)
2. **Database**: Uses file-based SQLite (`timesheet.db`) instead of in-memory
3. **JWT**: Returns token in login response (same behavior)
4. **API Contract**: Identical to Node.js version for frontend compatibility

## Testing

```bash
# Run tests
./mvnw test
```

## Docker Support

```bash
# Build Docker image
docker build -t timesheet-api-java .

# Run container
docker run -p 3002:3002 timesheet-api-java
```
