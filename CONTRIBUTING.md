# Contributing to Employee Time Tracking Application

Thank you for your interest in contributing to the Employee Time Tracking Application! This guide will help you get started with the development workflow and ensure your contributions meet our project standards.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [CI/CD Pipeline](#cicd-pipeline)
- [Reporting Issues](#reporting-issues)

## Getting Started

Before contributing, please familiarize yourself with the project by reading the [README.md](README.md) and [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) files. These documents provide an overview of the application architecture, features, and technical decisions.

### Prerequisites

- Node.js 18 or higher
- npm package manager
- Git

## Development Environment Setup

### 1. Fork and Clone the Repository

Fork the repository on GitHub, then clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/client-timesheet-app.git
cd client-timesheet-app
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create your environment file by copying the example:

```bash
cp .env.example .env
```

The default `.env` configuration works for local development. Key environment variables include `PORT` (default 3001), `NODE_ENV`, `FRONTEND_URL` for CORS, and `JWT_SECRET` for authentication.

Start the backend development server:

```bash
npm run dev
```

The backend will be available at `http://localhost:3001` with automatic reloading via nodemon.

### 3. Frontend Setup

In a new terminal, navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

The default configuration points to the local backend at `http://localhost:3001`.

Start the frontend development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` with hot module replacement enabled.

### 4. Verify Your Setup

Open `http://localhost:5173` in your browser and log in with any email address. If you can access the dashboard and create a test client, your development environment is working correctly.

## Project Structure

The repository is organized as a monorepo with separate frontend and backend directories:

```
client-timesheet-app/
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── database/        # SQLite database initialization
│   │   ├── middleware/      # Express middleware (auth, error handling)
│   │   ├── routes/          # API endpoint handlers
│   │   ├── validation/      # Joi validation schemas
│   │   ├── __tests__/       # Jest test suite
│   │   └── server.js        # Application entry point
│   └── package.json
│
├── frontend/                 # React application
│   ├── src/
│   │   ├── api/             # Axios API client
│   │   ├── components/      # Reusable React components
│   │   ├── contexts/        # React context providers
│   │   ├── pages/           # Page components
│   │   └── types/           # TypeScript type definitions
│   └── package.json
│
├── docker/                   # Docker configuration for deployment
├── .github/workflows/        # CI/CD pipeline definitions
└── README.md
```

## Development Workflow

### Creating a Feature Branch

Always create a new branch for your work. Use descriptive branch names that reflect the change:

```bash
git checkout -b feature/add-user-profile
git checkout -b fix/client-validation-error
git checkout -b docs/update-api-documentation
```

### Making Changes

When implementing changes, follow these guidelines:

For backend changes, ensure you add or update tests in the `backend/src/__tests__/` directory. The test suite uses Jest with a mocked database for fast, isolated testing. Run tests frequently during development with `npm test` or `npm run test:watch` for continuous feedback.

For frontend changes, maintain TypeScript strict mode compliance and follow the existing patterns for API calls, state management with React Query, and component structure. Run the linter with `npm run lint` to catch style issues early.

### Committing Changes

Write clear, descriptive commit messages that explain what changed and why. Use the imperative mood in commit messages (e.g., "Add user profile page" rather than "Added user profile page").

```bash
git add <specific-files>
git commit -m "Add validation for work entry hours field"
```

Avoid committing unrelated changes together. Each commit should represent a single logical change.

## Code Style Guidelines

### Backend (JavaScript)

The backend uses vanilla JavaScript with Express.js. Follow these conventions:

- Use async/await for asynchronous operations rather than callbacks or raw promises
- Validate all user input using Joi schemas defined in `src/validation/schemas.js`
- Handle errors consistently by passing them to the error handling middleware
- Use parameterized queries for all database operations to prevent SQL injection
- Keep route handlers focused on a single responsibility

When adding new API endpoints, follow the existing pattern in the routes directory. Each route file exports an Express router with handlers for specific HTTP methods.

### Frontend (TypeScript)

The frontend uses React with TypeScript in strict mode. Follow these conventions:

- Define TypeScript interfaces for all data structures in `src/types/`
- Use React Query for server state management with appropriate query keys
- Follow the existing component structure with pages in `src/pages/` and reusable components in `src/components/`
- Use Material UI components consistently with the existing design system
- Handle loading and error states appropriately in all data-fetching components

Run the linter before committing to ensure code style compliance:

```bash
cd frontend
npm run lint
```

### General Guidelines

- Keep functions small and focused on a single task
- Use meaningful variable and function names that describe their purpose
- Avoid magic numbers and strings; use constants with descriptive names
- Add comments only when the code's intent is not immediately clear from reading it

## Testing

### Running Backend Tests

The backend has a comprehensive test suite with 134 tests achieving approximately 79% code coverage. Run tests using:

```bash
cd backend
npm test                    # Run all tests once
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report
npm run test:coverage:html  # Generate HTML coverage report
```

### Test Structure

Tests are organized in `backend/src/__tests__/` mirroring the source code structure:

- `database/` - Database initialization tests
- `middleware/` - Authentication and error handling tests
- `routes/` - API endpoint tests
- `validation/` - Joi schema validation tests

### Writing Tests

When adding new features, write tests that cover the happy path, error cases, and edge cases. Follow the Arrange-Act-Assert pattern used throughout the existing test suite. Tests use mocked database operations for speed and isolation.

### Coverage Requirements

The project enforces minimum coverage thresholds in CI:

- Statements: 60%
- Branches: 60%
- Functions: 65%
- Lines: 60%

Ensure your changes maintain or improve these coverage levels.

## Pull Request Process

### Before Submitting

1. Ensure all tests pass locally by running `npm test` in the backend directory
2. Run the frontend linter with `npm run lint` in the frontend directory
3. Verify the application works correctly by testing your changes manually
4. Update documentation if your changes affect the API or user-facing features

### Creating a Pull Request

Push your branch to your fork and create a pull request against the `main` branch of the upstream repository. In your pull request description, include a clear explanation of what the change does and why it's needed. Reference any related issues using GitHub's issue linking syntax.

### Review Process

All pull requests require review before merging. Reviewers will check for code quality, test coverage, and adherence to project conventions. Be responsive to feedback and make requested changes promptly.

After addressing review comments, push additional commits to your branch. Avoid force-pushing or rebasing during review as it makes it harder to track changes.

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment. When you open a pull request, the following checks run automatically:

### Security Scanning

Trivy scans run on every pull request to check for vulnerabilities in dependencies, exposed secrets in the codebase, and configuration issues. These scans must pass before merging.

### Deployment

Merges to the `main` branch trigger automatic deployment to AWS. The pipeline builds a Docker image, pushes it to Amazon ECR, and deploys to EC2 via AWS Systems Manager.

## Reporting Issues

If you find a bug or have a feature request, please open an issue on GitHub. When reporting bugs, include steps to reproduce the issue, expected behavior, actual behavior, and any relevant error messages or screenshots.

For security vulnerabilities, please do not open a public issue. Instead, contact the maintainers directly to report the vulnerability responsibly.

## Questions

If you have questions about contributing that aren't answered in this guide, feel free to open a discussion on GitHub or reach out to the maintainers.

Thank you for contributing to the Employee Time Tracking Application!
