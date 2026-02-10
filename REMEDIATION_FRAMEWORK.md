# Remediation Framework for Lint and Test Issues

This document captures common lint and test issues encountered in the client-timesheet-app project along with their remediation strategies.

## Common Lint Issues

### 1. react-refresh/only-export-components

**Error Message:**
```
Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
```

**Cause:** Files that export both React components and non-component exports (hooks, constants, utilities) trigger this ESLint rule because React Fast Refresh cannot properly handle mixed exports.

**Remediation Options:**

Option A - Configure ESLint to allow constant exports (recommended for context files):
```javascript
// eslint.config.js
rules: {
  'react-refresh/only-export-components': [
    'warn',
    { allowConstantExport: true },
  ],
}
```

Option B - Split exports into separate files:
- Move hooks to a separate `useXxx.ts` file
- Keep only the component in the original file

**When to use each:**
- Use Option A for React Context files that naturally export both Provider components and hooks
- Use Option B for utility functions that don't need to be co-located with components

### 2. TypeScript Strict Mode Issues

**Common Errors:**
- `'x' is possibly 'undefined'`
- `Type 'X' is not assignable to type 'Y'`

**Remediation:**
- Use optional chaining: `obj?.property`
- Use nullish coalescing: `value ?? defaultValue`
- Add proper type guards before accessing properties
- Avoid using `any` type - define proper interfaces

### 3. Unused Variables/Imports

**Error Message:**
```
'variableName' is declared but its value is never read.
```

**Remediation:**
- Remove unused imports and variables
- If intentionally unused (e.g., rest parameters), prefix with underscore: `_unusedVar`

## Common Test Issues

### 1. Async Test Timeouts

**Error Message:**
```
Exceeded timeout of 10000 ms for a test.
```

**Cause:** Tests involving streams, file operations, or network calls may not complete within the default timeout.

**Remediation Options:**

Option A - Properly mock async operations to resolve immediately:
```javascript
jest.mock('module', () => ({
  asyncFunction: jest.fn().mockResolvedValue(result)
}));
```

Option B - Ensure mocked streams properly end:
```javascript
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => {
    let pipedStream = null;
    return {
      pipe: jest.fn((stream) => { pipedStream = stream; }),
      end: jest.fn(function() {
        if (pipedStream) pipedStream.end();
      }),
      // ... other methods
    };
  });
});
```

Option C - Increase timeout for specific tests (use sparingly):
```javascript
test('long running test', async () => {
  // test code
}, 30000); // 30 second timeout
```

### 2. Database Mock Issues

**Problem:** Tests fail because database operations aren't properly mocked.

**Remediation:**
```javascript
jest.mock('../../database/init');

beforeEach(() => {
  mockDb = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn()
  };
  getDatabase.mockReturnValue(mockDb);
});

// Mock specific queries
mockDb.get.mockImplementation((query, params, callback) => {
  callback(null, { id: 1, name: 'Test' });
});
```

### 3. File System Mock Issues

**Problem:** Tests involving file operations fail or hang.

**Remediation:**
```javascript
jest.mock('fs');

beforeEach(() => {
  fs.existsSync = jest.fn().mockReturnValue(true);
  fs.mkdirSync = jest.fn();
  fs.unlink = jest.fn((path, callback) => callback(null));
  fs.readFileSync = jest.fn().mockReturnValue('file content');
});
```

### 4. Authentication Middleware Bypass

**Problem:** Tests fail because routes require authentication.

**Remediation:**
```javascript
jest.mock('../../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    req.userEmail = 'test@example.com';
    next();
  }
}));
```

## Test Coverage Guidelines

### Minimum Coverage Requirements
- Overall: 80% or above
- Individual files: Aim for 80%+ where practical

### Coverage Priorities
1. **Critical paths** - Authentication, data validation, error handling
2. **Business logic** - Core functionality like calculations, data transformations
3. **Edge cases** - Boundary conditions, error states, empty data

### Areas That May Have Lower Coverage
- File download/upload handlers (complex stream mocking)
- PDF/CSV generation internals (focus on error paths instead)
- Third-party library integrations

## Running Tests and Coverage

```bash
# Run all tests
cd backend && npm test

# Run tests with coverage
cd backend && npm run test:coverage

# Run tests in watch mode
cd backend && npm run test:watch

# Run frontend lint
cd frontend && npm run lint
```

## Historical Issues Log

| Date | Issue | File | Resolution |
|------|-------|------|------------|
| 2026-02-03 | react-refresh/only-export-components error | frontend/src/contexts/AuthContext.tsx | Configured ESLint rule to allow constant exports |
| 2026-02-03 | PDF export tests timing out | backend/src/__tests__/routes/reports.test.js | Fixed PDFDocument mock to properly end response stream |

## Best Practices

1. **Run lint before committing**: `cd frontend && npm run lint`
2. **Run tests before pushing**: `cd backend && npm test`
3. **Check coverage regularly**: `cd backend && npm run test:coverage`
4. **Mock external dependencies**: Always mock database, file system, and network calls in tests
5. **Test error paths**: Ensure error handling is covered by tests
6. **Keep tests isolated**: Each test should be independent and not rely on state from other tests
