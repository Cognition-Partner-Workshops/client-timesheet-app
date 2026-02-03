# Employee Time Tracking Application

A full-stack web application for tracking and reporting employee hourly work across different clients.

## ⚠️ Important Notes

### Data Persistence
**This application uses SQLite in-memory database as specified in requirements.**
- ⚠️ **All data is lost when the backend server restarts**
- Suitable for development and testing
- For production use, modify `backend/src/database/init.js` to use file-based SQLite instead of `:memory:`

### Authentication
- Email-only authentication with JWT tokens
- No password required - assumes trusted internal network
- Anyone with a valid email can create an account and log in
- Consider integrating with company SSO for production use

## Features

- ✅ User authentication (email-based with JWT tokens)
- ✅ Add, edit, and delete clients
- ✅ Add, edit, and delete hourly work entries for each client
- ✅ View hourly reports for each client
- ✅ Export hourly reports to CSV or PDF

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Material UI** for components
- **React Query** for server state management
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **SQLite** in-memory database
- **JWT** for authentication
- **Joi** for validation
- **PDFKit** for PDF generation
- **csv-writer** for CSV export

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   └── init.js           # Database initialization
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT authentication
│   │   │   └── errorHandler.js  # Error handling
│   │   ├── routes/
│   │   │   ├── auth.js           # Authentication endpoints
│   │   │   ├── clients.js        # Client CRUD
│   │   │   ├── workEntries.js    # Work entry CRUD
│   │   │   └── reports.js        # Reporting & export
│   │   ├── validation/
│   │   │   └── schemas.js        # Joi validation schemas
│   │   └── server.js             # Express server
│   ├── package.json
│   └── DEPLOYMENT.md             # Production deployment guide
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.ts         # API client with JWT
    │   ├── components/
    │   │   └── Layout.tsx        # Main layout
    │   ├── contexts/
    │   │   └── AuthContext.tsx   # Auth state management
    │   ├── pages/
    │   │   ├── LoginPage.tsx     # Login page
    │   │   ├── DashboardPage.tsx # Dashboard
    │   │   ├── ClientsPage.tsx   # Client management
    │   │   ├── WorkEntriesPage.tsx # Work entry management
    │   │   └── ReportsPage.tsx   # Reports & exports
    │   ├── types/
    │   │   └── api.ts            # TypeScript interfaces
    │   └── App.tsx               # Main app component
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secure-secret-key-change-this
```

5. Start the development server:
```bash
npm run dev
```

Backend will be running at `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env`:
```bash
VITE_API_URL=http://localhost:3001
```

5. Start the development server:
```bash
npm run dev
```

Frontend will be running at `http://localhost:5173`

## Usage

1. Open `http://localhost:5173` in your browser
2. Enter any email address to log in (no password required)
3. Start adding clients and tracking work hours
4. View reports and export data as CSV or PDF

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email, returns JWT token
- `GET /api/auth/me` - Get current user info (requires auth)

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get specific client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Work Entries
- `GET /api/work-entries` - Get all work entries (optional ?clientId filter)
- `POST /api/work-entries` - Create new work entry
- `GET /api/work-entries/:id` - Get specific work entry
- `PUT /api/work-entries/:id` - Update work entry
- `DELETE /api/work-entries/:id` - Delete work entry

### Reports
- `GET /api/reports/client/:clientId` - Get hourly report for client
- `GET /api/reports/export/csv/:clientId` - Export report as CSV
- `GET /api/reports/export/pdf/:clientId` - Export report as PDF

All authenticated endpoints require `Authorization: Bearer <token>` header.

## Security Features

- JWT-based authentication with 24-hour token expiration
- Rate limiting on authentication endpoints (5 attempts per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation with Joi schemas
- SQL injection protection with parameterized queries

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Vite dev server with HMR
```

### Running Tests

**Backend:**
```bash
cd backend
npm test                    # Run all tests
npm run test:coverage       # Run tests with coverage report
npm run test:watch          # Run tests in watch mode
```

### Test Coverage

The backend has comprehensive test coverage with **161 tests** across 8 test suites:

| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| **Overall** | **90.16%** | **93.82%** | **92.18%** | **90.35%** |
| database/init.js | 100% | 100% | 100% | 100% |
| middleware/auth.js | 100% | 100% | 100% | 100% |
| middleware/errorHandler.js | 100% | 100% | 100% | 100% |
| routes/auth.js | 100% | 100% | 100% | 100% |
| routes/clients.js | 97.89% | 100% | 100% | 97.89% |
| routes/workEntries.js | 98.41% | 100% | 100% | 98.41% |
| routes/reports.js | 64.15% | 69.44% | 68.75% | 64.42% |
| validation/schemas.js | 100% | 100% | 100% | 100% |

Coverage thresholds are configured in `jest.config.js`:
- Statements: 60%
- Branches: 60%
- Functions: 65%
- Lines: 60%

### Building for Production

**Backend:**
```bash
cd backend
npm start  # Production mode
```

**Frontend:**
```bash
cd frontend
npm run build  # Creates optimized production build in dist/
npm run preview  # Preview production build
```

## Production Deployment

See `backend/DEPLOYMENT.md` for detailed production deployment instructions.

### Quick Production Checklist
- [ ] Set strong `JWT_SECRET` in environment variables
- [ ] Configure proper `FRONTEND_URL` for CORS
- [ ] Consider switching to file-based SQLite for data persistence
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure proper logging and monitoring
- [ ] Set up automated backups (if using persistent storage)
- [ ] Review and adjust rate limiting settings
- [ ] Consider integrating with company SSO

## Known Limitations

1. **In-memory database** - All data is lost on server restart
2. **Email-only auth** - No password protection, assumes trusted network
3. **No user roles** - All users have equal access to all data
4. **Single-server architecture** - Not designed for horizontal scaling
5. **No real-time updates** - Changes require page refresh

## Future Enhancements

- Persistent database storage
- User roles and permissions
- Multi-tenancy support
- Real-time updates with WebSockets
- Advanced reporting and analytics
- Email notifications
- Mobile app
- Integration with calendar systems

## Database Schema

The application uses SQLite with the following schema:

```sql
-- Users table (identified by email)
CREATE TABLE users (
  email TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clients table (linked to users)
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  user_email TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
);

-- Work entries table (linked to clients and users)
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
```

**Indexes for Performance:**
- `idx_clients_user_email` - Optimize client lookups by user
- `idx_work_entries_client_id` - Optimize work entry queries by client
- `idx_work_entries_user_email` - Optimize work entry queries by user
- `idx_work_entries_date` - Optimize date-based queries

**Data Isolation:** All queries filter by `user_email` to ensure users only access their own data. Foreign keys use `ON DELETE CASCADE` to automatically clean up related records when a parent is deleted.

## Docker Containerization

The application uses a multi-stage Docker build for optimized production images.

### Dockerfile Overview

Located at `docker/Dockerfile`, the build process consists of three stages:

1. **frontend-builder** - Builds the React application with Vite
2. **backend-builder** - Installs production Node.js dependencies
3. **production** - Combines built frontend and backend into a minimal image

### Key Features

- **Base Image:** `node:20-alpine` for minimal footprint
- **Process Manager:** `dumb-init` for proper signal handling
- **Security:** Runs as non-root user (`nodejs:1001`)
- **Health Check:** Built-in health check on `/health` endpoint
- **Persistent Storage:** SQLite database stored at `/app/data/timesheet.db`

### Building the Docker Image

```bash
# Build the image
docker build -f docker/Dockerfile -t client-timesheet-app .

# Run the container
docker run -d \
  -p 3001:3001 \
  -e JWT_SECRET=your-secure-secret \
  -v timesheet-data:/app/data \
  client-timesheet-app
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3001` | Server port |
| `DATABASE_PATH` | `/app/data/timesheet.db` | SQLite database location |
| `JWT_SECRET` | - | Secret key for JWT tokens (required) |

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment.

### Workflows

#### 1. Deploy to AWS (`deploy.yml`)

Triggered on push to `main` branch or manual dispatch.

**Jobs:**

**build-and-push:**
- Checks out the repository
- Configures AWS credentials
- Logs into Amazon ECR
- Builds Docker image using multi-stage Dockerfile
- Tags image with commit SHA and `latest`
- Pushes to ECR repository

**deploy:**
- Retrieves EC2 instance ID by tag (`Name=client-timesheet-app`)
- Executes deployment script via AWS Systems Manager (SSM)
- Runs `/opt/app/deploy.sh` on the EC2 instance
- Performs health check on `/health` endpoint

**Required Secrets:**
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

#### 2. Security Vulnerability Scan (`security-scan.yml`)

Triggered on push/PR to `main` or manual dispatch.

**Jobs:**

- **trivy-scan** - Scans for vulnerabilities (CRITICAL, HIGH, MEDIUM severity)
- **trivy-secret-scan** - Scans for exposed secrets in code
- **trivy-config-scan** - Scans for misconfigurations

Results are uploaded to GitHub Security tab in SARIF format.

### Deployment Architecture

```
GitHub Actions → Build Docker Image → Push to ECR → SSM Command → EC2 Instance
                                                                      ↓
                                                              /opt/app/deploy.sh
                                                                      ↓
                                                              Docker Pull & Run
```

### Manual Deployment

```bash
# Trigger deployment manually via GitHub CLI
gh workflow run deploy.yml

# Or push to main branch
git push origin main
```

## License

MIT

## Support

For issues or questions, please contact your system administrator.
