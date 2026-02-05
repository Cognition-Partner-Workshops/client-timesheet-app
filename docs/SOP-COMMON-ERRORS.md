# Standard Operating Procedures (SOPs) for Common Errors and Fixes

This document provides comprehensive guidance for identifying and resolving common errors across all 6 repositories in the Cognition Partner Workshops organization.

## Table of Contents

1. [client-timesheet-app](#1-client-timesheet-app)
2. [hosting-client-timesheet-app](#2-hosting-client-timesheet-app)
3. [cal.com-infra](#3-calcom-infra)
4. [cal.com-dataeng](#4-calcom-dataeng)
5. [coreui-free-react-admin-template](#5-coreui-free-react-admin-template)
6. [spring-boot-realworld-example-app](#6-spring-boot-realworld-example-app)

---

## 1. client-timesheet-app

A full-stack web application for tracking employee hours with a React frontend and Express.js backend.

### 1.1 ESLint Errors

#### Error: react-refresh/only-export-components

**Symptom:**
```
error  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components
```

**Cause:** A file exports both React components and non-component items (constants, functions, types).

**Fix Steps:**
1. Identify the file with mixed exports (e.g., `src/contexts/AuthContext.tsx`)
2. Move non-component exports (constants, utility functions) to a separate file
3. Import the moved items where needed

**Example Fix:**
```typescript
// Before: AuthContext.tsx exports both context and useAuth hook
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => { ... }; // This triggers the error

// After: Split into separate files
// AuthContext.tsx - only exports the context provider component
// useAuth.ts - exports the hook separately
```

### 1.2 TypeScript Compilation Errors

#### Error: Type Errors During Build

**Symptom:**
```
error TS2322: Type 'X' is not assignable to type 'Y'
```

**Fix Steps:**
1. Run `cd frontend && npm run build` to identify all type errors
2. Check the error location and line number
3. Ensure proper type annotations and type guards
4. Use TypeScript's strict mode settings in `tsconfig.json`

**Common Fixes:**
- Add proper type annotations to function parameters
- Use type guards for nullable values
- Ensure interface properties match expected types

### 1.3 Jest Test Failures

#### Error: Coverage Threshold Not Met

**Symptom:**
```
Jest: "global" coverage threshold for statements (60%) not met: X%
```

**Cause:** Test coverage falls below the configured thresholds in `jest.config.js`.

**Fix Steps:**
1. Run `cd backend && npm run test:coverage` to see current coverage
2. Identify uncovered files in the coverage report
3. Add tests for uncovered code paths
4. Coverage thresholds: 60% statements/branches, 65% functions

**Configuration Reference:**
```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 60,
    functions: 65,
    lines: 60,
    statements: 60
  }
}
```

### 1.4 Security Scan Failures (Trivy)

#### Error: Vulnerability Detected

**Symptom:**
```
CRITICAL: CVE-XXXX-XXXXX in package-name
```

**Fix Steps:**
1. Review the Trivy scan results in GitHub Security tab
2. Update vulnerable packages: `npm update package-name`
3. If no fix available, add to `.trivyignore` with justification
4. Re-run security scan to verify

**Commands:**
```bash
# Update all packages
npm update

# Update specific package
npm install package-name@latest

# Check for vulnerabilities
npm audit
```

---

## 2. hosting-client-timesheet-app

Terraform infrastructure for deploying the client-timesheet-app to AWS.

### 2.1 Terraform Formatting Errors

#### Error: Terraform fmt Check Failed

**Symptom:**
```
main.tf
```
(File listed without "Success" message indicates formatting issues)

**Fix Steps:**
1. Run `terraform fmt` to auto-format all files
2. Review changes with `git diff`
3. Commit the formatted files

**Commands:**
```bash
cd terraform/infrastructure
terraform fmt -recursive
```

### 2.2 Missing Provider Error

#### Error: Missing Required Provider

**Symptom:**
```
Error: Missing required provider
This configuration requires provider registry.terraform.io/hashicorp/aws
```

**Cause:** Terraform providers not initialized.

**Fix Steps:**
1. Navigate to the terraform directory
2. Run `terraform init`
3. Verify with `terraform validate`

**Commands:**
```bash
cd terraform/infrastructure
terraform init
terraform validate
```

### 2.3 State Lock Errors

#### Error: Error Acquiring State Lock

**Symptom:**
```
Error: Error acquiring the state lock
Lock Info:
  ID:        xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  Path:      client-timesheet-terraform-state-XXXXX/infrastructure/terraform.tfstate
```

**Cause:** Another Terraform process is running or a previous process crashed.

**Fix Steps:**
1. Wait for other processes to complete
2. If stuck, force unlock (use with caution):
   ```bash
   terraform force-unlock LOCK_ID
   ```
3. Verify no other processes are running

### 2.4 Docker Build Failures

#### Error: Docker Build Failed

**Symptom:**
```
ERROR: failed to solve: process "/bin/sh -c npm install" did not complete successfully
```

**Fix Steps:**
1. Check Dockerfile syntax
2. Verify base image availability
3. Ensure all required files are present
4. Check network connectivity for package downloads

**Commands:**
```bash
cd docker
docker build -t client-timesheet-app .
```

---

## 3. cal.com-infra

AWS CDK infrastructure for Cal.com database provisioning.

### 3.1 TypeScript Compilation Errors

#### Error: TypeScript Build Failed

**Symptom:**
```
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**Fix Steps:**
1. Run `npm run build` to identify errors
2. Check CDK construct property types
3. Ensure aws-cdk-lib version compatibility

**Commands:**
```bash
npm run build
```

### 3.2 ts-jest Warning

#### Warning: Hybrid Module Kind

**Symptom:**
```
ts-jest[config] (WARN) message TS151002: Using hybrid module kind (Node16/18/Next) is only supported in "isolatedModules: true"
```

**Cause:** TypeScript configuration uses NodeNext module resolution without isolatedModules.

**Fix Steps:**
1. Add `isolatedModules: true` to `tsconfig.json`, OR
2. Add the warning code to ts-jest diagnostics ignore list

**Option 1 - tsconfig.json:**
```json
{
  "compilerOptions": {
    "isolatedModules": true
  }
}
```

**Option 2 - jest.config.js:**
```javascript
module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151002]
      }
    }
  }
}
```

### 3.3 CDK Synth Failures

#### Error: CDK Synthesis Failed

**Symptom:**
```
Error: Cannot find module 'aws-cdk-lib'
```

**Fix Steps:**
1. Install dependencies: `npm install`
2. Verify CDK version compatibility
3. Run `npx cdk synth`

**Commands:**
```bash
npm install
npx cdk synth
```

### 3.4 Missing AWS Credentials

#### Error: Unable to Locate Credentials

**Symptom:**
```
Error: Unable to locate credentials
```

**Fix Steps:**
1. Configure AWS credentials:
   ```bash
   aws configure
   ```
2. Or set environment variables:
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_DEFAULT_REGION=us-east-1
   ```
3. Verify with `aws sts get-caller-identity`

---

## 4. cal.com-dataeng

Terraform infrastructure for Databricks Lakehouse deployment.

### 4.1 Terraform Formatting Errors

#### Error: Terraform fmt Check Failed

**Symptom:**
```
variables.tf
main.tf
```

**Fix Steps:**
1. Run `terraform fmt` to auto-format
2. Commit formatted files

**Commands:**
```bash
cd terraform
terraform fmt -recursive
terraform fmt -check  # Verify formatting
```

### 4.2 Terraform Validation Errors

#### Error: Invalid Variable Value

**Symptom:**
```
Error: Invalid value for variable
```

**Fix Steps:**
1. Check `variables.tf` for variable definitions
2. Ensure `terraform.tfvars` has correct values
3. Validate variable types match definitions

**Example terraform.tfvars:**
```hcl
databricks_host     = "https://your-workspace.cloud.databricks.com"
databricks_token    = "your-token"
postgres_host       = "your-postgres-host"
postgres_user       = "your-user"
postgres_password   = "your-password"
```

### 4.3 Missing Databricks Credentials

#### Error: Authentication Failed

**Symptom:**
```
Error: cannot configure databricks provider
```

**Fix Steps:**
1. Create `terraform.tfvars` from example:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
2. Fill in Databricks host and token
3. Verify token has required permissions

### 4.4 Provider Initialization

#### Error: Provider Not Found

**Symptom:**
```
Error: Failed to query available provider packages
```

**Fix Steps:**
1. Run `terraform init`
2. Check `.terraform.lock.hcl` for version constraints
3. Verify network connectivity

**Commands:**
```bash
terraform init
terraform validate
```

---

## 5. coreui-free-react-admin-template

React admin dashboard template with CoreUI components.

### 5.1 ESLint Purity Errors

#### Error: Cannot Call Impure Function During Render

**Symptom:**
```
error  Error: Cannot call impure function during render
`Math.random` is an impure function  react-hooks/purity
```

**Cause:** Using `Math.random()` or other impure functions directly in component render.

**Fix Steps:**
1. Move random value generation to `useMemo` or `useState`
2. Generate values outside the render cycle

**Example Fix:**
```javascript
// Before (causes error)
const Charts = () => {
  const random = () => Math.round(Math.random() * 100)
  return <Chart data={random()} />
}

// After (fixed)
const Charts = () => {
  const [data] = useState(() => Math.round(Math.random() * 100))
  return <Chart data={data} />
}

// Or with useMemo for computed values
const Charts = () => {
  const data = useMemo(() => Math.round(Math.random() * 100), [])
  return <Chart data={data} />
}
```

### 5.2 Prettier Formatting Errors

#### Error: Prettier Formatting Mismatch

**Symptom:**
```
error  Replace `'` with `"`  prettier/prettier
```

**Fix Steps:**
1. Run Prettier to auto-fix:
   ```bash
   npx prettier --write src/
   ```
2. Or fix via ESLint:
   ```bash
   npm run lint -- --fix
   ```

### 5.3 Build Warnings - Large Chunks

#### Warning: Chunks Larger Than 500KB

**Symptom:**
```
(!) Some chunks are larger than 500 kB after minification
```

**Fix Steps:**
1. Implement code splitting with dynamic imports
2. Configure manual chunks in vite.config.mjs
3. Or adjust the warning limit

**Example vite.config.mjs:**
```javascript
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          coreui: ['@coreui/react', '@coreui/coreui']
        }
      }
    }
  }
})
```

### 5.4 Missing Dependencies

#### Error: Module Not Found

**Symptom:**
```
Error: Cannot find module '@coreui/react'
```

**Fix Steps:**
1. Install dependencies:
   ```bash
   npm install
   ```
2. Clear cache if issues persist:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 6. spring-boot-realworld-example-app

Java Spring Boot backend with MyBatis and GraphQL.

### 6.1 Spotless Formatting Errors

#### Error: IllegalAccessError with Google Java Format

**Symptom:**
```
java.lang.IllegalAccessError: class com.google.googlejavaformat.java.JavaInput cannot access class com.sun.tools.javac.parser.Tokens$TokenKind
```

**Cause:** Google Java Format incompatibility with Java 17+.

**Fix Steps:**
1. Add JVM arguments to allow access:
   ```bash
   ./gradlew spotlessApply --add-exports jdk.compiler/com.sun.tools.javac.api=ALL-UNNAMED \
     --add-exports jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED \
     --add-exports jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED \
     --add-exports jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED \
     --add-exports jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED
   ```
2. Or update Spotless plugin version in build.gradle
3. Or use Java 11 for formatting tasks

**Alternative - Update build.gradle:**
```groovy
spotless {
    java {
        target project.fileTree(project.rootDir) {
            include '**/*.java'
            exclude 'build/generated/**/*.*'
        }
        // Use palantir-java-format instead of google-java-format for Java 17+
        palantirJavaFormat()
    }
}
```

### 6.2 Gradle Build Failures

#### Error: Compilation Failed

**Symptom:**
```
> Task :compileJava FAILED
error: cannot find symbol
```

**Fix Steps:**
1. Check for missing imports
2. Verify Lombok annotation processing is enabled
3. Run clean build:
   ```bash
   ./gradlew clean compileJava --no-daemon
   ```

### 6.3 Test Failures

#### Error: Test Failed

**Symptom:**
```
> Task :test FAILED
X tests completed, Y failed
```

**Fix Steps:**
1. Run tests with verbose output:
   ```bash
   ./gradlew test --no-daemon --info
   ```
2. Check test reports in `build/reports/tests/test/index.html`
3. Fix failing assertions or update test expectations

### 6.4 Database Connection Errors

#### Error: SQLite Connection Failed

**Symptom:**
```
org.sqlite.SQLiteException: [SQLITE_ERROR] SQL error or missing database
```

**Fix Steps:**
1. Ensure dev.db exists or will be created
2. Check application.properties for correct path
3. Run clean to reset database:
   ```bash
   ./gradlew clean
   ```

---

## General Troubleshooting Tips

### Node.js Projects (client-timesheet-app, cal.com-infra, coreui-free-react-admin-template)

1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version compatibility:**
   ```bash
   node --version
   # Ensure version matches project requirements
   ```

3. **Update all dependencies:**
   ```bash
   npm update
   npm audit fix
   ```

### Terraform Projects (hosting-client-timesheet-app, cal.com-dataeng)

1. **Always initialize before operations:**
   ```bash
   terraform init
   ```

2. **Validate configuration:**
   ```bash
   terraform validate
   ```

3. **Format before committing:**
   ```bash
   terraform fmt -recursive
   ```

4. **Plan before apply:**
   ```bash
   terraform plan
   ```

### Java Projects (spring-boot-realworld-example-app)

1. **Clean build:**
   ```bash
   ./gradlew clean build --no-daemon
   ```

2. **Skip tests for quick builds:**
   ```bash
   ./gradlew build -x test --no-daemon
   ```

3. **Check Gradle version:**
   ```bash
   ./gradlew --version
   ```

---

## CI/CD Pipeline Troubleshooting

### GitHub Actions Failures

1. **View workflow logs:**
   - Navigate to Actions tab in GitHub
   - Click on failed workflow run
   - Expand failed step for details

2. **Re-run failed jobs:**
   - Click "Re-run failed jobs" button
   - Or re-run entire workflow

3. **Check secrets configuration:**
   - Ensure all required secrets are set in repository settings
   - Verify secret names match workflow references

### Common CI Failures

| Error Type | Likely Cause | Fix |
|------------|--------------|-----|
| Lint failure | Code style violations | Run linter locally and fix |
| Test failure | Broken tests or code | Run tests locally and debug |
| Build failure | Compilation errors | Check build output for specific errors |
| Security scan failure | Vulnerable dependencies | Update packages or add to ignore list |

---

## Quick Reference Commands

### client-timesheet-app
```bash
# Backend
cd backend && npm test                    # Run tests
cd backend && npm run test:coverage       # Run with coverage

# Frontend
cd frontend && npm run lint               # Run linter
cd frontend && npm run build              # Build for production
```

### hosting-client-timesheet-app
```bash
cd terraform/infrastructure
terraform init                            # Initialize
terraform fmt -check                      # Check formatting
terraform validate                        # Validate config
terraform plan                            # Preview changes
```

### cal.com-infra
```bash
npm run build                             # Compile TypeScript
npm run test                              # Run tests
npx cdk synth                             # Synthesize CloudFormation
npx cdk diff                              # Preview changes
```

### cal.com-dataeng
```bash
cd terraform
terraform init                            # Initialize
terraform fmt -check                      # Check formatting
terraform validate                        # Validate config
```

### coreui-free-react-admin-template
```bash
npm run lint                              # Run linter
npm run build                             # Build for production
npm start                                 # Start dev server
```

### spring-boot-realworld-example-app
```bash
./gradlew compileJava --no-daemon         # Compile
./gradlew test --no-daemon                # Run tests
./gradlew spotlessApply --no-daemon       # Format code
./gradlew bootRun                         # Run application
```

---

## Document Maintenance

This SOP document should be updated when:
- New error patterns are discovered
- Fixes for existing errors change
- New repositories are added to the organization
- Dependencies or tooling versions are updated

Last Updated: January 2026
