-- =============================================================================
-- CLIENT TIMESHEET APPLICATION - TEST DATA
-- =============================================================================
-- WARNING: This file contains SYNTHETIC TEST DATA only.
-- All names, emails, and company names are fictional and clearly marked as test data.
-- DO NOT use this data in production environments.
-- =============================================================================

-- =============================================================================
-- SCENARIO 1: USER AUTHENTICATION / LOGIN (10 entries)
-- =============================================================================
-- Method: Synthetic email addresses using @example.com and @testdomain.com
-- Rationale: Covers diverse user roles (QA, dev, PM, admin, contractor)
--            with clearly fake domains per RFC 2606 (example.com is reserved)
-- Pattern: {role}.{identifier}@{test-domain}
-- =============================================================================

INSERT INTO users (email) VALUES ('test.user1@example.com');
INSERT INTO users (email) VALUES ('test.user2@example.com');
INSERT INTO users (email) VALUES ('qa.engineer@testdomain.com');
INSERT INTO users (email) VALUES ('dev.lead@testdomain.com');
INSERT INTO users (email) VALUES ('project.manager@example.com');
INSERT INTO users (email) VALUES ('junior.dev@testdomain.com');
INSERT INTO users (email) VALUES ('senior.consultant@example.com');
INSERT INTO users (email) VALUES ('admin.tester@testdomain.com');
INSERT INTO users (email) VALUES ('contractor.alpha@example.com');
INSERT INTO users (email) VALUES ('intern.beta@testdomain.com');

-- =============================================================================
-- SCENARIO 2: CLIENT MANAGEMENT (10 entries)
-- =============================================================================
-- Method: Fictional company names with generic industry descriptions
-- Rationale: Covers various industries (tech, finance, healthcare, retail, etc.)
--            Each client is assigned to test.user1@example.com for consistency
-- Pattern: {fictional-prefix} {industry-term} {suffix}
-- =============================================================================

INSERT INTO clients (name, description, department, email, user_email) VALUES (
  'Acme Tech Solutions',
  'Test client - Software development consulting',
  'Engineering',
  'contact@acme-test.example.com',
  'test.user1@example.com'
);

INSERT INTO clients (name, description, department, email, user_email) VALUES (
  'Globex Financial Services',
  'Test client - Financial advisory and reporting',
  'Finance',
  'info@globex-test.example.com',
  'test.user1@example.com'
);

INSERT INTO clients (name, description, department, email, user_email) VALUES (
  'Initech Healthcare Systems',
  'Test client - Healthcare IT infrastructure',
  'IT Operations',
  'support@initech-test.example.com',
  'test.user1@example.com'
);

INSERT INTO clients (name, description, department, email, user_email) VALUES (
  'Umbrella Retail Group',
  'Test client - E-commerce platform development',
  'Digital Commerce',
  'dev@umbrella-test.example.com',
  'test.user1@example.com'
);

INSERT INTO clients (name, description, department, email, user_email) VALUES (
  'Stark Manufacturing Co',
  'Test client - Manufacturing process automation',
  'Operations',
  'ops@stark-test.example.com',
  'test.user1@example.com'
);

INSERT INTO clients (name, description, department, email, user_email) VALUES (
  'Wayne Logistics Inc',
  'Test client - Supply chain management system',
  'Logistics',
  'logistics@wayne-test.example.com',
  'qa.engineer@testdomain.com'
);

INSERT INTO clients (name, description, department, email, user_email) VALUES (
  'Oceanic Airlines Digital',
  'Test client - Airline booking platform',
  'Product Development',
  'product@oceanic-test.example.com',
  'qa.engineer@testdomain.com'
);

INSERT INTO clients (name, description, department, email, user_email) VALUES (
  'Wonka EdTech Labs',
  'Test client - Educational software platform',
  'Education Technology',
  'edu@wonka-test.example.com',
  'dev.lead@testdomain.com'
);

INSERT INTO clients (name, description, department, email, user_email) VALUES (
  'Pied Piper Data Corp',
  'Test client - Data compression services',
  'Research and Development',
  'rd@piedpiper-test.example.com',
  'dev.lead@testdomain.com'
);

INSERT INTO clients (name, description, department, email, user_email) VALUES (
  'Hooli Cloud Services',
  'Test client - Cloud infrastructure migration',
  'Cloud Engineering',
  'cloud@hooli-test.example.com',
  'project.manager@example.com'
);

-- =============================================================================
-- SCENARIO 3: TIME ENTRY TRACKING (10 entries)
-- =============================================================================
-- Method: Realistic work descriptions with varied hours and dates
-- Rationale: Covers typical consulting activities (meetings, development, testing,
--            documentation, deployment) with hours ranging from 0.5 to 8.0
-- Pattern: Work entries span a two-week period with diverse task types
-- Note: client_id values 1-5 correspond to clients owned by test.user1@example.com
-- =============================================================================

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  1, 'test.user1@example.com', 4.5,
  'TEST ENTRY - Sprint planning and backlog grooming session',
  '2025-12-01'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  1, 'test.user1@example.com', 8.0,
  'TEST ENTRY - Full day backend API development for user module',
  '2025-12-02'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  2, 'test.user1@example.com', 3.0,
  'TEST ENTRY - Financial report dashboard wireframe review',
  '2025-12-03'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  2, 'test.user1@example.com', 6.5,
  'TEST ENTRY - Quarterly compliance data integration work',
  '2025-12-04'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  3, 'test.user1@example.com', 2.0,
  'TEST ENTRY - HIPAA security audit preparation meeting',
  '2025-12-05'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  3, 'test.user1@example.com', 7.5,
  'TEST ENTRY - Patient records system database migration',
  '2025-12-08'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  4, 'test.user1@example.com', 5.0,
  'TEST ENTRY - E-commerce checkout flow implementation',
  '2025-12-09'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  4, 'test.user1@example.com', 1.5,
  'TEST ENTRY - Payment gateway integration testing',
  '2025-12-10'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  5, 'test.user1@example.com', 0.5,
  'TEST ENTRY - Quick deployment hotfix for production issue',
  '2025-12-11'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  5, 'test.user1@example.com', 6.0,
  'TEST ENTRY - Manufacturing dashboard real-time monitoring setup',
  '2025-12-12'
);

-- =============================================================================
-- SCENARIO 4: REPORTING (10 entries)
-- =============================================================================
-- Method: Additional work entries for clients 6-10 to enable report generation
-- Rationale: Provides data for report queries including aggregated hours,
--            entry counts, and date ranges per client
-- Pattern: Multiple entries per client to produce meaningful report summaries
-- Note: client_id 6-7 belong to qa.engineer, 8-9 to dev.lead, 10 to project.manager
-- =============================================================================

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  6, 'qa.engineer@testdomain.com', 3.5,
  'TEST ENTRY - Logistics API load testing and benchmarking',
  '2025-12-01'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  6, 'qa.engineer@testdomain.com', 7.0,
  'TEST ENTRY - Warehouse management module QA testing',
  '2025-12-02'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  7, 'qa.engineer@testdomain.com', 4.0,
  'TEST ENTRY - Flight booking system regression test suite',
  '2025-12-03'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  7, 'qa.engineer@testdomain.com', 2.5,
  'TEST ENTRY - Airline API endpoint performance profiling',
  '2025-12-04'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  8, 'dev.lead@testdomain.com', 6.0,
  'TEST ENTRY - Learning management system architecture review',
  '2025-12-05'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  8, 'dev.lead@testdomain.com', 8.0,
  'TEST ENTRY - Course enrollment microservice development',
  '2025-12-08'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  9, 'dev.lead@testdomain.com', 5.5,
  'TEST ENTRY - Data compression algorithm optimization',
  '2025-12-09'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  9, 'dev.lead@testdomain.com', 3.0,
  'TEST ENTRY - Compression benchmark report generation',
  '2025-12-10'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  10, 'project.manager@example.com', 4.0,
  'TEST ENTRY - Cloud migration project kickoff and planning',
  '2025-12-11'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  10, 'project.manager@example.com', 7.5,
  'TEST ENTRY - Infrastructure as Code templates for AWS setup',
  '2025-12-12'
);

-- =============================================================================
-- SCENARIO 5: DATA EXPORT (10 entries)
-- =============================================================================
-- Method: Dense work entries for client 1 (Acme Tech Solutions) to produce
--         rich CSV/PDF export output with varied dates, hours, and descriptions
-- Rationale: Provides sufficient volume and variety for meaningful export testing
--            including edge cases (short descriptions, max hours, fractional hours)
-- Pattern: Entries span a full month to test date range coverage in exports
-- =============================================================================

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  1, 'test.user1@example.com', 2.25,
  'TEST ENTRY - Code review for authentication module pull requests',
  '2025-11-03'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  1, 'test.user1@example.com', 7.0,
  'TEST ENTRY - Frontend React component library build and testing',
  '2025-11-05'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  1, 'test.user1@example.com', 1.0,
  'TEST ENTRY - Standup and team sync',
  '2025-11-07'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  1, 'test.user1@example.com', 5.75,
  'TEST ENTRY - Database schema migration and data validation scripts',
  '2025-11-10'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  1, 'test.user1@example.com', 8.0,
  'TEST ENTRY - Full day onsite client workshop for requirements gathering',
  '2025-11-12'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  1, 'test.user1@example.com', 3.5,
  'TEST ENTRY - CI/CD pipeline configuration and deployment automation',
  '2025-11-14'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  1, 'test.user1@example.com', 0.75,
  'TEST ENTRY - Quick bug triage session',
  '2025-11-17'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  1, 'test.user1@example.com', 6.0,
  'TEST ENTRY - REST API integration testing with third-party services',
  '2025-11-19'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  1, 'test.user1@example.com', 4.25,
  'TEST ENTRY - Technical documentation and API specification writing',
  '2025-11-21'
);

INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (
  1, 'test.user1@example.com', 2.0,
  'TEST ENTRY - Sprint retrospective and process improvement planning',
  '2025-11-24'
);
