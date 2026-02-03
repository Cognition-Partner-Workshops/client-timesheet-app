# Client Timesheet App - Selenium Automation Tests

This project contains Selenium WebDriver automation tests for the Client Timesheet Application using TestNG framework.

## Project Structure

```
selenium-tests/
├── pom.xml                                    # Maven configuration
├── src/
│   ├── main/java/com/timesheet/
│   │   ├── pages/                            # Page Object Model classes
│   │   │   ├── BasePage.java                 # Base page with common methods
│   │   │   ├── LoginPage.java                # Login page interactions
│   │   │   ├── DashboardPage.java            # Dashboard page interactions
│   │   │   ├── ClientsPage.java              # Clients page interactions
│   │   │   ├── WorkEntriesPage.java          # Work entries page interactions
│   │   │   └── ReportsPage.java              # Reports page interactions
│   │   └── utils/                            # Utility classes
│   │       ├── ConfigReader.java             # Configuration file reader
│   │       ├── DriverManager.java            # WebDriver management
│   │       ├── WaitUtils.java                # Wait utilities
│   │       └── ScreenshotUtils.java          # Screenshot utilities
│   └── test/
│       ├── java/com/timesheet/tests/         # Test classes
│       │   ├── BaseTest.java                 # Base test with setup/teardown
│       │   ├── LoginTests.java               # Login functionality tests
│       │   ├── DashboardTests.java           # Dashboard functionality tests
│       │   ├── ClientsTests.java             # Client CRUD tests
│       │   ├── WorkEntriesTests.java         # Work entry CRUD tests
│       │   ├── ReportsTests.java             # Reports functionality tests
│       │   ├── NavigationTests.java          # Navigation tests
│       │   └── EndToEndTests.java            # End-to-end workflow tests
│       └── resources/
│           ├── config.properties             # Test configuration
│           └── testng.xml                    # TestNG suite configuration
```

## Prerequisites

Before running the tests, ensure you have the following installed:

1. **Java JDK 17 or higher**
   ```bash
   java -version
   ```

2. **Maven 3.6 or higher**
   ```bash
   mvn -version
   ```

3. **Google Chrome browser** (for Chrome WebDriver)

4. **The Client Timesheet Application running locally**
   - Backend running on `http://localhost:3001`
   - Frontend running on `http://localhost:5173`

## Starting the Application

Before running the tests, start the application:

```bash
# Terminal 1: Start the backend
cd backend
npm install
npm run dev

# Terminal 2: Start the frontend
cd frontend
npm install
npm run dev
```

## Configuration

Edit `src/test/resources/config.properties` to customize test settings:

```properties
# Application URLs
base.url=http://localhost:5173
api.url=http://localhost:3001

# Browser settings
browser=chrome
headless=true

# Wait timeouts (in seconds)
implicit.wait=10
explicit.wait=15
page.load.timeout=30

# Test user
test.user.email=testuser@example.com

# Screenshot settings
screenshot.on.failure=true
screenshot.path=target/screenshots

# Report settings
report.path=target/reports
```

## Running the Tests

### Run All Tests

```bash
cd selenium-tests
mvn clean test
```

### Run Specific Test Class

```bash
mvn test -Dtest=LoginTests
mvn test -Dtest=ClientsTests
mvn test -Dtest=WorkEntriesTests
mvn test -Dtest=ReportsTests
mvn test -Dtest=DashboardTests
mvn test -Dtest=NavigationTests
mvn test -Dtest=EndToEndTests
```

### Run Tests with Custom Browser

```bash
# Run with Firefox
mvn test -Dbrowser=firefox

# Run with Edge
mvn test -Dbrowser=edge
```

### Run Tests in Non-Headless Mode (Visible Browser)

```bash
mvn test -Dheadless=false
```

### Run Tests with Custom Base URL

```bash
mvn test -Dbase.url=http://your-app-url:port
```

## Test Coverage

The automation suite covers the following functionalities:

### Login Tests (8 tests)
- Login page display verification
- Info alert about no password
- Login button state (enabled/disabled)
- Successful login with valid email
- User email display after login
- Different email format support

### Dashboard Tests (15 tests)
- Dashboard display verification
- Stats cards (Total Clients, Work Entries, Hours)
- Recent entries section
- Quick actions section
- Navigation buttons
- Sidebar navigation
- Logout functionality

### Clients Tests (11 tests)
- Clients page display
- Create client with all fields
- Create client with required fields only
- Edit existing client
- Delete client
- Cancel button functionality
- Clear all clients
- Empty state message

### Work Entries Tests (12 tests)
- Work entries page display
- Create work entry with all fields
- Create work entry without description
- Edit existing work entry
- Delete work entry
- Maximum/minimum hours validation
- Decimal hours support
- Multiple work entries creation

### Reports Tests (15 tests)
- Reports page display
- Client dropdown functionality
- Report display after client selection
- Total hours calculation
- Total entries count
- Average hours calculation
- CSV export functionality
- PDF export functionality
- Switching between clients
- Empty client report handling

### Navigation Tests (10 tests)
- Navigation between all pages
- Logout redirect
- Unauthenticated user redirect
- Stats cards navigation
- Page refresh authentication
- Browser back button
- Direct URL navigation

### End-to-End Tests (5 tests)
- Complete workflow (Login -> Create Client -> Add Work Entry -> View Report)
- Data persistence after logout/re-login
- Client CRUD operations
- Work entry CRUD operations
- Report accuracy with multiple data

## Test Reports

After running the tests, reports are generated in:

- **TestNG HTML Report**: `target/surefire-reports/index.html`
- **Extent Report**: `target/reports/TestReport.html`
- **Screenshots (on failure)**: `target/screenshots/`

## Troubleshooting

### Common Issues

1. **WebDriver not found**
   - The project uses WebDriverManager to automatically download the correct driver
   - Ensure you have internet connectivity

2. **Tests fail with timeout**
   - Increase wait times in `config.properties`
   - Ensure the application is running and accessible

3. **Element not found errors**
   - The application UI may have changed
   - Update the locators in the Page Object classes

4. **Browser not starting**
   - Ensure Chrome/Firefox is installed
   - Try running in non-headless mode to debug

### Debug Mode

Run tests with verbose output:

```bash
mvn test -X
```

## Best Practices

1. **Run tests in headless mode** for CI/CD pipelines
2. **Use unique test data** (UUID-based names) to avoid conflicts
3. **Clean up test data** after tests when possible
4. **Check application logs** if tests fail unexpectedly

## CI/CD Integration

To run tests in a CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Run Selenium Tests
  run: |
    cd selenium-tests
    mvn clean test -Dheadless=true
```

## Contributing

When adding new tests:

1. Follow the Page Object Model pattern
2. Add new page methods to the appropriate Page class
3. Create test methods with descriptive names
4. Use `@Test` annotations with priority and description
5. Log important steps using `logInfo()`, `logPass()`, `logFail()`
