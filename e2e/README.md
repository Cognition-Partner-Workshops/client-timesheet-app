# Client Timesheet App - E2E Test Automation Framework

A comprehensive Playwright with Cucumber BDD automation framework for testing the Client Timesheet Application.

## Framework Structure

```
e2e/
├── src/
│   ├── features/           # Cucumber feature files (BDD scenarios)
│   │   ├── login.feature
│   │   ├── dashboard.feature
│   │   ├── clients.feature
│   │   ├── workEntries.feature
│   │   └── reports.feature
│   ├── pages/              # Page Object Model (POM) classes
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── ClientsPage.ts
│   │   ├── WorkEntriesPage.ts
│   │   └── ReportsPage.ts
│   ├── steps/              # Step definitions
│   │   ├── login.steps.ts
│   │   ├── dashboard.steps.ts
│   │   ├── clients.steps.ts
│   │   ├── workEntries.steps.ts
│   │   └── reports.steps.ts
│   ├── support/            # Support files
│   │   ├── world.ts        # Custom World with Playwright
│   │   ├── hooks.ts        # Before/After hooks
│   │   ├── config.ts       # Configuration
│   │   └── report-generator.js
│   └── reports/            # Test reports (generated)
├── cucumber.js             # Cucumber configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## Prerequisites

- Node.js 18+
- npm or yarn
- The application running locally (frontend on port 5173, backend on port 3001)

## Installation

```bash
cd e2e
npm install
npx playwright install chromium
```

## Running Tests

### Run all tests in headless mode (default)
```bash
npm test
```

### Run tests in headed mode (visible browser)
```bash
npm run test:headed
```

### Run specific feature
```bash
npx cucumber-js src/features/login.feature
```

### Run tests by tag
```bash
npx cucumber-js --tags "@smoke"
npx cucumber-js --tags "@positive"
npx cucumber-js --tags "@negative"
```

## Test Reports

After test execution, reports are generated in:
- `src/reports/cucumber-report.json` - JSON report
- `src/reports/cucumber-report.html` - HTML report
- `src/reports/screenshots/` - Screenshots of failed tests

To generate a detailed HTML report:
```bash
npm run report
```

## Test Coverage

### Login Feature
- Positive: Valid email login, page elements display
- Negative: Empty email, invalid email formats, unauthenticated access

### Dashboard Feature
- Positive: All elements display, navigation to other pages, stats cards
- Negative: Empty state messages

### Clients Feature
- Positive: CRUD operations (Create, Read, Update, Delete)
- Negative: Empty name validation, special characters, long names

### Work Entries Feature
- Positive: CRUD operations with client selection, hours validation
- Negative: Missing client, invalid hours (0, negative, >24)

### Reports Feature
- Positive: View reports, export CSV/PDF, switch clients
- Negative: No clients, no entries, disabled export buttons

## Page Object Model (POM)

Each page has a corresponding Page Object class that encapsulates:
- Element selectors
- Page actions (click, fill, navigate)
- Assertions and validations

## Configuration

Environment variables:
- `BASE_URL` - Frontend URL (default: http://localhost:5173)
- `API_URL` - Backend URL (default: http://localhost:3001)
- `HEADLESS` - Run in headless mode (default: true)

## Linting

```bash
npm run lint
```
