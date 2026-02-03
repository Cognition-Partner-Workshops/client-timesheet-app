# Client Timesheet E2E Tests

Selenium BDD Cucumber test suite for the Client Timesheet Application. This test suite covers all critical flows with both positive and negative test scenarios, and supports multi-browser testing.

## Features Covered

- **Login Flow**: Email authentication, validation, error handling
- **Dashboard**: Metrics display, navigation, quick actions
- **Client Management**: CRUD operations (Create, Read, Update, Delete)
- **Work Entries**: Time entry management with validation
- **Reports**: Report viewing and export (CSV/PDF)

## Test Categories

- `@positive` - Positive test scenarios (happy path)
- `@negative` - Negative test scenarios (error handling, validation)
- `@smoke` - Critical smoke tests for quick validation

## Prerequisites

- Node.js 18+ installed
- Chrome, Firefox, or Edge browser installed
- Application running locally (frontend on port 5173, backend on port 3001)

## Installation

```bash
cd e2e-tests
npm install
```

## Running Tests

### Start the Application First

```bash
# Terminal 1 - Start backend
cd backend && npm run dev

# Terminal 2 - Start frontend
cd frontend && npm run dev
```

### Run Tests

```bash
# Run all tests with Chrome (default)
npm test

# Run tests with specific browser
npm run test:chrome
npm run test:firefox
npm run test:edge

# Run tests in headless mode
npm run test:headless

# Run tests on all browsers sequentially
npm run test:all-browsers
```

### Run Specific Feature

```bash
# Run only login tests
npx wdio run ./wdio.conf.js --spec ./features/login.feature

# Run only smoke tests
npx wdio run ./wdio.conf.js --cucumberOpts.tagExpression='@smoke'

# Run only positive tests
npx wdio run ./wdio.conf.js --cucumberOpts.tagExpression='@positive'

# Run only negative tests
npx wdio run ./wdio.conf.js --cucumberOpts.tagExpression='@negative'
```

## Project Structure

```
e2e-tests/
├── features/                 # Gherkin feature files
│   ├── login.feature        # Login flow tests
│   ├── dashboard.feature    # Dashboard tests
│   ├── clients.feature      # Client management tests
│   ├── work-entries.feature # Work entries tests
│   └── reports.feature      # Reports tests
├── page-objects/            # Page Object Model classes
│   ├── BasePage.js          # Base page with common methods
│   ├── LoginPage.js         # Login page interactions
│   ├── DashboardPage.js     # Dashboard page interactions
│   ├── ClientsPage.js       # Clients page interactions
│   ├── WorkEntriesPage.js   # Work entries page interactions
│   └── ReportsPage.js       # Reports page interactions
├── step-definitions/        # Cucumber step definitions
│   ├── common.steps.js      # Common/shared steps
│   ├── login.steps.js       # Login-specific steps
│   ├── dashboard.steps.js   # Dashboard-specific steps
│   ├── clients.steps.js     # Clients-specific steps
│   ├── work-entries.steps.js# Work entries-specific steps
│   └── reports.steps.js     # Reports-specific steps
├── support/                 # Support files
│   └── hooks.js             # Before/After hooks
├── wdio.conf.js             # WebdriverIO configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## Multi-Browser Support

The test suite supports the following browsers:

| Browser | Command | Environment Variable |
|---------|---------|---------------------|
| Chrome | `npm run test:chrome` | `BROWSER=chrome` |
| Firefox | `npm run test:firefox` | `BROWSER=firefox` |
| Microsoft Edge | `npm run test:edge` | `BROWSER=MicrosoftEdge` |

### Headless Mode

Run tests in headless mode (no browser UI) by setting `HEADLESS=true`:

```bash
HEADLESS=true npm test
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Application base URL | `http://localhost:5173` |
| `BROWSER` | Browser to use | `chrome` |
| `HEADLESS` | Run in headless mode | `false` |

### Custom Configuration

Edit `wdio.conf.js` to customize:
- Timeouts
- Browser capabilities
- Reporter options
- Screenshot settings

## Test Scenarios Summary

### Login (9 scenarios)
- Successful login with valid email
- Login with different email formats
- Login page element verification
- Login button disabled states
- Invalid email handling

### Dashboard (14 scenarios)
- Metrics display verification
- Navigation from cards
- Quick action buttons
- Recent work entries
- Empty state handling
- Authentication protection

### Clients (12 scenarios)
- View clients page
- Create client (required fields only)
- Create client (all fields)
- Edit existing client
- Delete client
- Cancel operations
- Validation errors (empty name, invalid email)

### Work Entries (16 scenarios)
- View work entries page
- Create work entry (all fields)
- Create with min/max hours
- Edit existing entry
- Delete entry
- Validation errors (no client, invalid hours)

### Reports (11 scenarios)
- View reports page
- View client report with data
- Export to CSV/PDF
- Empty client report
- Switch between clients
- Disabled export buttons

## Troubleshooting

### Common Issues

1. **Browser not found**: Ensure the browser is installed and the driver is compatible
2. **Connection refused**: Make sure the application is running on the correct ports
3. **Element not found**: Increase `waitforTimeout` in `wdio.conf.js`
4. **Stale element**: Add appropriate waits in page objects

### Debug Mode

Run with verbose logging:
```bash
npx wdio run ./wdio.conf.js --logLevel=debug
```

## Contributing

1. Create feature files following Gherkin syntax
2. Implement step definitions
3. Use Page Object Model for UI interactions
4. Tag scenarios appropriately (@positive, @negative, @smoke)
