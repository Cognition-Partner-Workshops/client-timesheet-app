# Contributing to Employee Time Tracking Application

Thank you for your interest in contributing to the Employee Time Tracking Application! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style and Standards](#code-style-and-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Pull Request Process](#pull-request-process)
- [Security](#security)

## Getting Started

Before contributing, please familiarize yourself with the project structure and architecture by reading the [README.md](README.md) and [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) files.

### Prerequisites

- Node.js 18 or higher
- npm package manager
- Git

### Repository Structure

The project is organized as a monorepo with two main directories:

- `backend/` - Express.js API server with SQLite database
- `frontend/` - React application with TypeScript and Material UI

## Development Setup

### Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create your environment file by copying the example:

```bash
cp .env.example .env
```

The default configuration in `.env.example` should work for local development. Start the development server:

```bash
npm run dev
```

The backend will be available at `http://localhost:3001`.

### Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Running Both Services

For development, you'll need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
```

## Code Style and Standards

### TypeScript (Frontend)

The frontend uses TypeScript with strict mode enabled. All new code should be properly typed, avoiding the use of `any` types where possible. The project uses ESLint for code quality enforcement:

```bash
cd frontend
npm run lint
```

### JavaScript (Backend)

The backend uses vanilla JavaScript with ES6+ features. Follow these conventions:

- Use `const` and `let` instead of `var`
- Use async/await for asynchronous operations
- Use descriptive variable and function names
- Keep functions focused and single-purpose

### Input Validation

All API endpoints use Joi schemas for input validation. When adding new endpoints or modifying existing ones, ensure proper validation is in place. Validation schemas are located in `backend/src/validation/schemas.js`.

### Database Queries

Always use parameterized queries to prevent SQL injection:

```javascript
// Good
db.get('SELECT * FROM clients WHERE id = ?', [clientId], callback);

// Bad - Never do this
db.get(`SELECT * FROM clients WHERE id = ${clientId}`, callback);
```

### Error Handling

Use the centralized error handler middleware. Throw errors with appropriate status codes:

```javascript
const error = new Error('Resource not found');
error.status = 404;
throw error;
```

## Testing

### Backend Tests

The backend has a comprehensive test suite using Jest. Tests are located in `backend/src/__tests__/`.

Run all tests:

```bash
cd backend
npm test
```

Run tests with coverage report:

```bash
npm run test:coverage
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

### Coverage Requirements

The project enforces minimum coverage thresholds:

- Statements: 60%
- Branches: 60%
- Functions: 65%
- Lines: 60%

When adding new features, ensure your code is covered by tests and that overall coverage does not drop below these thresholds.

### Writing Tests

Tests follow the AAA (Arrange-Act-Assert) pattern:

```javascript
describe('Feature', () => {
  it('should do something specific', async () => {
    // Arrange - Set up test data and mocks
    const testData = { name: 'Test' };
    
    // Act - Execute the code being tested
    const result = await someFunction(testData);
    
    // Assert - Verify the expected outcome
    expect(result).toBeDefined();
    expect(result.name).toBe('Test');
  });
});
```

### Frontend Testing

When adding frontend tests, use React Testing Library conventions and focus on testing user behavior rather than implementation details.

## Submitting Changes

### Branch Naming

Create a descriptive branch name for your changes:

```bash
git checkout -b feature/add-new-report-type
git checkout -b fix/client-validation-error
git checkout -b docs/update-api-documentation
```

### Commit Messages

Write clear, concise commit messages that describe what the change does:

- Use the imperative mood ("Add feature" not "Added feature")
- Keep the first line under 72 characters
- Reference issue numbers when applicable

Examples:
```
Add CSV export for work entries
Fix validation error on client creation
Update README with new API endpoints
```

### Before Submitting

Before submitting your changes, ensure:

1. All tests pass: `cd backend && npm test`
2. Frontend linting passes: `cd frontend && npm run lint`
3. Frontend builds successfully: `cd frontend && npm run build`
4. Your code follows the existing style and conventions
5. You've added tests for new functionality
6. Documentation is updated if needed

## Pull Request Process

1. Push your branch to the repository
2. Create a Pull Request against the `main` branch
3. Fill out the PR template with a clear description of your changes
4. Wait for CI checks to pass (security scans run automatically)
5. Address any review feedback
6. Once approved, your PR will be merged

### CI/CD Pipeline

Pull requests trigger automated checks including:

- **Trivy Vulnerability Scanner** - Scans for security vulnerabilities in dependencies
- **Trivy Secret Scanner** - Checks for accidentally committed secrets
- **Trivy Configuration Scanner** - Validates configuration files

Ensure all checks pass before requesting review.

### Code Review Guidelines

When reviewing code, consider:

- Does the code follow project conventions?
- Are there adequate tests?
- Is the code readable and maintainable?
- Are there any security concerns?
- Does the change introduce any breaking changes?

## Security

### Reporting Security Issues

If you discover a security vulnerability, please do not open a public issue. Instead, contact the maintainers directly to report the issue.

### Security Best Practices

When contributing, follow these security practices:

- Never commit secrets, API keys, or credentials
- Use environment variables for sensitive configuration
- Validate all user input
- Use parameterized database queries
- Follow the principle of least privilege

### Environment Variables

Never commit `.env` files. Use `.env.example` files to document required environment variables without exposing actual values.

## Questions?

If you have questions about contributing, please open an issue for discussion or contact the maintainers.

Thank you for contributing to the Employee Time Tracking Application!
