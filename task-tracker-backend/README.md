# Task Tracker Backend

A Spring Boot backend for the Task Tracking application with H2 in-memory database.

## Tech Stack

- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- H2 Database (in-memory)
- Lombok

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+

### Running the Application

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The server will start at `http://localhost:8080`

### H2 Console

Access the H2 database console at: `http://localhost:8080/h2-console`

- JDBC URL: `jdbc:h2:mem:taskdb`
- Username: `sa`
- Password: (empty)

## API Endpoints

### Buckets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/buckets | Get all buckets with their tasks |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks |
| GET | /api/tasks/{id} | Get task by ID |
| POST | /api/tasks | Create a new task |
| PUT | /api/tasks/{id} | Update a task |
| PUT | /api/tasks/{id}/move | Move task to different bucket/position |
| DELETE | /api/tasks/{id} | Delete a task |

### Request/Response Examples

#### Create Task
```json
POST /api/tasks
{
  "title": "New Task",
  "description": "Task description",
  "assignedTo": "John Doe",
  "priority": "High",
  "startedOn": "2026-01-01",
  "dueDate": "2026-01-15",
  "bucketId": 1
}
```

#### Move Task
```json
PUT /api/tasks/1/move
{
  "targetBucketId": 2,
  "targetPosition": 1
}
```

## Default Buckets

The application comes with 4 default buckets:
1. To Do
2. In Progress
3. Review
4. Done

## Note

This is a POC using H2 in-memory database. All data will be lost when the server restarts.
