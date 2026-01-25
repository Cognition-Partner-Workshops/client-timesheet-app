# Contributing to Employee Time Tracking Application

Thank you for your interest in contributing to the Employee Time Tracking Application! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [CI/CD Pipeline](#cicd-pipeline)
- [Security Guidelines](#security-guidelines)

## Getting Started

Before contributing, please familiarize yourself with the project by reading the [README.md](README.md) and [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) files.

### Prerequisites

- Node.js 18 or higher
- npm package manager
- Git

### Forking and Cloning

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/client-timesheet-app.git
   cd client-timesheet-app
   ```
3. Add the upstream repository as a remote:
   ```bash
   git remote add upstream https://github.com/Cognition-Partner-Workshops/client-timesheet-app.git
   ```

## Development Environment Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with the following variables:
   ```
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=your-secure-secret-key-change-this
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be running at `http://localhost:3001`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file:
   ```
   VITE_API_URL=http://localhost:3001
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be running at `http://localhost:5173`.

## Project Structure

```
client-timesheet-app/
├── backend/
│   ├── src/
│   │   ├── database/          # Database initialization
│   │   ├── middleware/        # Express middleware (auth, error handling)
│   │   ├── routes/            # API endpoint handlers
│   │   ├── validation/        # Joi validation schemas
│   │   ├── __tests__/         # Test files
│   │   └── server.js          # Express server entry point
│   ├── jest.config.js         # Jest configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/               # API client
│   │   ├── components/        # Reusable React components
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   ├── types/             # TypeScript type definitions
│   │   └── App.tsx            # Root component
│   ├── eslint.config.js       # ESLint configuration
│   └── package.json
│
├── .github/workflows/         # CI/CD workflows
└── docker/                    # Docker configuration
```

## Development Workflow

### Creating a Branch

Always create a new branch for your changes. Use descriptive branch names:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
# or
git checkout -b docs/documentation-update
```

### Making Changes

1. Make your changes in the appropriate files
2. Follow the code style guidelines outlined below
3. Write or update tests as needed
4. Test your changes locally

### Running the Application

You'll need two terminal windows to run both the backend and frontend:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:5173` and log in with any email address.

## Code Style Guidelines

### General Guidelines

- Write clear, readable code with meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Add comments only when the code's purpose isn't immediately clear
- Follow existing patterns and conventions in the codebase

### Backend (Node.js/Express)

- Use async/await for asynchronous operations
- Validate all user input using Joi schemas in `validation/schemas.js`
- Handle errors appropriately and use the centralized error handler
- Use parameterized queries to prevent SQL injection
- Follow the existing route structure for new endpoints

### Frontend (React/TypeScript)

- Use TypeScript strict mode - avoid `any` types
- Use functional components with hooks
- Follow Material UI component patterns
- Use React Query for server state management
- Define types in `types/api.ts` for API responses
- Run ESLint before committing:
  ```bash
  cd frontend
  npm run lint
  ```

### Commit Messages

Write clear, concise commit messages that describe what changed and why:

```
feat: add export to Excel functionality
fix: resolve date picker timezone issue
docs: update API documentation
test: add tests for client validation
refactor: simplify authentication middleware
```

## Testing

### Running Backend Tests

The backend uses Jest for testing with a comprehensive test suite.

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Coverage Requirements

The project enforces minimum coverage thresholds:

- Statements: 60%
- Branches: 60%
- Functions: 65%
- Lines: 60%

Current coverage is approximately 79% statements, 80% branches, and 89% functions.

### Writing Tests

Tests are located in `backend/src/__tests__/` and organized by module:

- `database/` - Database initialization tests
- `middleware/` - Authentication and error handler tests
- `routes/` - API endpoint tests
- `validation/` - Joi schema tests

When adding new features, include corresponding tests. Follow the existing test patterns and use the AAA (Arrange-Act-Assert) structure:

```javascript
describe('Feature', () => {
  it('should do something specific', () => {
    // Arrange - set up test data and mocks
    const input = { ... };
    
    // Act - execute the code being tested
    const result = functionUnderTest(input);
    
    // Assert - verify the expected outcome
    expect(result).toBe(expectedValue);
  });
});
```

## Pull Request Process

### Before Submitting

1. Ensure your code follows the style guidelines
2. Run the linter on frontend code:
   ```bash
   cd frontend && npm run lint
   ```
3. Run all backend tests and ensure they pass:
   ```bash
   cd backend && npm test
   ```
4. Update documentation if you've changed APIs or added features
5. Rebase your branch on the latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin your-branch-name
   ```

2. Create a Pull Request on GitHub against the `main` branch

3. Fill out the PR template with:
   - A clear description of the changes
   - The motivation for the changes
   - Any related issues
   - Screenshots for UI changes

4. Wait for CI checks to pass

5. Address any review feedback by pushing additional commits

### Review Process

- All PRs require at least one approval before merging
- CI checks must pass (security scans, tests)
- Reviewers may request changes or ask questions
- Once approved, the PR will be merged by a maintainer

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment.

### Security Scanning

On every push and PR to `main`, the following security scans run:

1. **Trivy Vulnerability Scanner** - Scans dependencies for known CVEs (CRITICAL, HIGH, MEDIUM severity)
2. **Trivy Secret Scanner** - Detects hardcoded credentials and secrets
3. **Trivy Configuration Scanner** - Checks for misconfigurations

Results are uploaded to the GitHub Security tab for review.

### Deployment

The deployment workflow (`deploy.yml`) runs on pushes to `main` and:

1. Builds a Docker image
2. Pushes to Amazon ECR
3. Deploys to EC2 via AWS SSM
4. Runs health checks

Note: Deployment requires appropriate AWS credentials configured as repository secrets.

## Security Guidelines

### Do's

- Use parameterized queries for all database operations
- Validate all user input with Joi schemas
- Keep dependencies up to date
- Report security vulnerabilities privately to maintainers

### Don'ts

- Never commit secrets, API keys, or credentials
- Never disable security middleware (Helmet, CORS, rate limiting)
- Never use `eval()` or similar dynamic code execution
- Never trust user input without validation

### Reporting Security Issues

If you discover a security vulnerability, please report it privately to the maintainers rather than opening a public issue. This allows us to address the issue before it becomes public knowledge.

## Questions and Support

If you have questions about contributing:

1. Check existing issues and documentation
2. Open a new issue with the "question" label
3. Contact the maintainers

Thank you for contributing to the Employee Time Tracking Application!
