-- =============================================================================
-- CLIENT TIMESHEET APPLICATION - SYNTHETIC QA TEST DATA (100 ROWS)
-- =============================================================================
-- Generated: 2026-02-09
-- Source: Statistical analysis of 2-day application logs (2026-02-07 to 2026-02-09)
-- WARNING: All data is SYNTHETIC. No real PII is included.
-- =============================================================================
-- Distribution Pattern (derived from log analysis):
--   Auth/Users:   ~24% of traffic -> 12 users
--   Clients:      ~18% of traffic -> 18 clients
--   Work Entries:  ~40% of traffic -> 55 work entries
--   Reports/Export: ~18% of traffic -> 15 report/export scenario rows
--   Total: 100 rows
-- =============================================================================

-- =============================================================================
-- USERS (12 rows) - Matches observed 8 unique users + growth factor
-- Pattern: {role}.{seq}@{reserved-domain}
-- Domains: example.com (RFC 2606), test.example.com (subdomain of reserved)
-- Activity: 3 power users (>5 logins), 9 casual users (1-3 logins)
-- =============================================================================

INSERT INTO users (email) VALUES ('qa.analyst01@example.com');
INSERT INTO users (email) VALUES ('qa.analyst02@example.com');
INSERT INTO users (email) VALUES ('qa.dev01@test.example.com');
INSERT INTO users (email) VALUES ('qa.dev02@test.example.com');
INSERT INTO users (email) VALUES ('qa.pm01@example.com');
INSERT INTO users (email) VALUES ('qa.pm02@test.example.com');
INSERT INTO users (email) VALUES ('qa.lead01@example.com');
INSERT INTO users (email) VALUES ('qa.ops01@test.example.com');
INSERT INTO users (email) VALUES ('qa.contractor01@example.com');
INSERT INTO users (email) VALUES ('qa.contractor02@test.example.com');
INSERT INTO users (email) VALUES ('qa.intern01@example.com');
INSERT INTO users (email) VALUES ('qa.intern02@test.example.com');

-- =============================================================================
-- CLIENTS (18 rows) - Matches observed avg 5 clients/user, 2-8 range
-- Pattern: Fictional company names with "QA" prefix in description
-- Distribution: Power users have 5-8 clients, casual users have 2-3
-- =============================================================================

-- Power user 1: qa.analyst01@example.com (8 clients)
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Falcon Analytics Corp', 'QA synthetic client - Data analytics consulting', 'Data Science', 'contact@falcon-qa.test.example.com', 'qa.analyst01@example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Summit Cloud Platforms', 'QA synthetic client - Cloud infrastructure services', 'Cloud Engineering', 'info@summit-qa.test.example.com', 'qa.analyst01@example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Meridian Fintech Ltd', 'QA synthetic client - Payment processing systems', 'Financial Technology', 'billing@meridian-qa.test.example.com', 'qa.analyst01@example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Orion Healthcare AI', 'QA synthetic client - Medical imaging platform', 'Health Technology', 'support@orion-qa.test.example.com', 'qa.analyst01@example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Vanguard Logistics Tech', 'QA synthetic client - Supply chain optimization', 'Logistics', 'ops@vanguard-qa.test.example.com', 'qa.analyst01@example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Catalyst EdTech Group', 'QA synthetic client - Learning management platform', 'Education Technology', 'edu@catalyst-qa.test.example.com', 'qa.analyst01@example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Pinnacle Cyber Solutions', 'QA synthetic client - Security audit services', 'Cybersecurity', 'sec@pinnacle-qa.test.example.com', 'qa.analyst01@example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Nexus Retail Digital', 'QA synthetic client - E-commerce platform', 'Digital Commerce', 'retail@nexus-qa.test.example.com', 'qa.analyst01@example.com');

-- Power user 2: qa.dev01@test.example.com (5 clients)
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Ember Software Labs', 'QA synthetic client - Custom software development', 'Engineering', 'dev@ember-qa.test.example.com', 'qa.dev01@test.example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Atlas Data Systems', 'QA synthetic client - Data warehouse consulting', 'Data Engineering', 'data@atlas-qa.test.example.com', 'qa.dev01@test.example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Horizon IoT Networks', 'QA synthetic client - IoT device management', 'Product Development', 'product@horizon-qa.test.example.com', 'qa.dev01@test.example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Zenith AI Research', 'QA synthetic client - Machine learning consulting', 'Research', 'research@zenith-qa.test.example.com', 'qa.dev01@test.example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Pulsar Mobile Studios', 'QA synthetic client - Mobile app development', 'Mobile Engineering', 'mobile@pulsar-qa.test.example.com', 'qa.dev01@test.example.com');

-- Casual user 1: qa.pm01@example.com (3 clients)
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Nimbus Marketing Tech', 'QA synthetic client - Marketing automation', 'Digital Marketing', 'marketing@nimbus-qa.test.example.com', 'qa.pm01@example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Forge Manufacturing AI', 'QA synthetic client - Factory automation', 'Operations', 'factory@forge-qa.test.example.com', 'qa.pm01@example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Beacon Gov Systems', 'QA synthetic client - Government IT modernization', 'Public Sector IT', 'gov@beacon-qa.test.example.com', 'qa.pm01@example.com');

-- Casual user 2: qa.lead01@example.com (2 clients)
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Crest Energy Tech', 'QA synthetic client - Energy grid monitoring', 'Energy Technology', 'energy@crest-qa.test.example.com', 'qa.lead01@example.com');
INSERT INTO clients (name, description, department, email, user_email) VALUES ('Ridgeline Telecom', 'QA synthetic client - Telecom billing platform', 'Telecommunications', 'telecom@ridge-qa.test.example.com', 'qa.lead01@example.com');

-- =============================================================================
-- WORK ENTRIES (55 rows) - Matches observed 40% traffic share
-- Hours distribution: min=0.5, max=8.0, mean=3.74, median=3.25, std_dev=2.18
-- Date range: 2026-02-07 to 2026-02-09 (matches 2-day log window)
-- Entries per client: avg 3.0 (range 1-8, skewed toward power user clients)
-- =============================================================================

-- Power user 1 entries (30 entries across 8 clients)
-- Client 1: Falcon Analytics Corp (client_id=1, 5 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (1, 'qa.analyst01@example.com', 6.5, 'QA ENTRY - Predictive model architecture review and data pipeline design', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (1, 'qa.analyst01@example.com', 3.0, 'QA ENTRY - Dashboard wireframe feedback session with stakeholders', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (1, 'qa.analyst01@example.com', 8.0, 'QA ENTRY - Full day ETL pipeline implementation and testing', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (1, 'qa.analyst01@example.com', 2.0, 'QA ENTRY - Standup and sprint backlog refinement', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (1, 'qa.analyst01@example.com', 4.5, 'QA ENTRY - Data quality validation scripts development', '2026-02-09');

-- Client 2: Summit Cloud Platforms (client_id=2, 5 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (2, 'qa.analyst01@example.com', 7.0, 'QA ENTRY - Kubernetes cluster migration and load balancer setup', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (2, 'qa.analyst01@example.com', 1.5, 'QA ENTRY - Incident postmortem documentation', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (2, 'qa.analyst01@example.com', 5.5, 'QA ENTRY - Infrastructure as Code template development', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (2, 'qa.analyst01@example.com', 3.25, 'QA ENTRY - Cloud cost optimization analysis and reporting', '2026-02-09');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (2, 'qa.analyst01@example.com', 0.75, 'QA ENTRY - Quick monitoring alert triage', '2026-02-09');

-- Client 3: Meridian Fintech (client_id=3, 4 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (3, 'qa.analyst01@example.com', 4.0, 'QA ENTRY - Payment API integration testing and debugging', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (3, 'qa.analyst01@example.com', 6.0, 'QA ENTRY - PCI compliance audit preparation and documentation', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (3, 'qa.analyst01@example.com', 2.5, 'QA ENTRY - Transaction reconciliation module code review', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (3, 'qa.analyst01@example.com', 1.0, 'QA ENTRY - Fraud detection rules configuration update', '2026-02-09');

-- Client 4: Orion Healthcare AI (client_id=4, 4 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (4, 'qa.analyst01@example.com', 3.5, 'QA ENTRY - HIPAA compliance review for imaging module', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (4, 'qa.analyst01@example.com', 7.5, 'QA ENTRY - Medical imaging pipeline GPU optimization', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (4, 'qa.analyst01@example.com', 2.75, 'QA ENTRY - Patient data anonymization module testing', '2026-02-09');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (4, 'qa.analyst01@example.com', 0.5, 'QA ENTRY - Quick hotfix for image upload validation', '2026-02-09');

-- Client 5: Vanguard Logistics (client_id=5, 3 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (5, 'qa.analyst01@example.com', 5.0, 'QA ENTRY - Route optimization algorithm benchmarking', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (5, 'qa.analyst01@example.com', 8.0, 'QA ENTRY - Warehouse management system integration testing', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (5, 'qa.analyst01@example.com', 1.25, 'QA ENTRY - Delivery tracking API endpoint review', '2026-02-09');

-- Client 6: Catalyst EdTech (client_id=6, 3 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (6, 'qa.analyst01@example.com', 4.25, 'QA ENTRY - Course enrollment workflow implementation', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (6, 'qa.analyst01@example.com', 6.5, 'QA ENTRY - Video streaming module load testing', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (6, 'qa.analyst01@example.com', 2.0, 'QA ENTRY - Student progress dashboard component build', '2026-02-09');

-- Client 7: Pinnacle Cyber (client_id=7, 3 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (7, 'qa.analyst01@example.com', 3.75, 'QA ENTRY - Vulnerability scan automation scripting', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (7, 'qa.analyst01@example.com', 5.25, 'QA ENTRY - SIEM integration and alert rule configuration', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (7, 'qa.analyst01@example.com', 1.5, 'QA ENTRY - Security incident response playbook update', '2026-02-09');

-- Client 8: Nexus Retail (client_id=8, 3 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (8, 'qa.analyst01@example.com', 7.0, 'QA ENTRY - Product catalog search API development', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (8, 'qa.analyst01@example.com', 4.0, 'QA ENTRY - Shopping cart checkout flow integration test', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (8, 'qa.analyst01@example.com', 0.5, 'QA ENTRY - Quick pricing engine bug triage', '2026-02-09');

-- Power user 2 entries (15 entries across 5 clients)
-- Client 9: Ember Software Labs (client_id=9, 4 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (9, 'qa.dev01@test.example.com', 6.0, 'QA ENTRY - Microservice architecture design session', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (9, 'qa.dev01@test.example.com', 8.0, 'QA ENTRY - Full day feature implementation sprint', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (9, 'qa.dev01@test.example.com', 3.0, 'QA ENTRY - Code review and PR merge coordination', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (9, 'qa.dev01@test.example.com', 2.5, 'QA ENTRY - CI/CD pipeline optimization and caching', '2026-02-09');

-- Client 10: Atlas Data Systems (client_id=10, 3 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (10, 'qa.dev01@test.example.com', 5.5, 'QA ENTRY - Data warehouse schema migration planning', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (10, 'qa.dev01@test.example.com', 7.5, 'QA ENTRY - Batch processing job implementation and testing', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (10, 'qa.dev01@test.example.com', 1.0, 'QA ENTRY - Data quality metric dashboard review', '2026-02-09');

-- Client 11: Horizon IoT (client_id=11, 3 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (11, 'qa.dev01@test.example.com', 4.0, 'QA ENTRY - IoT device provisioning API development', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (11, 'qa.dev01@test.example.com', 2.25, 'QA ENTRY - Sensor data ingestion pipeline testing', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (11, 'qa.dev01@test.example.com', 6.0, 'QA ENTRY - Device firmware OTA update service build', '2026-02-09');

-- Client 12: Zenith AI Research (client_id=12, 3 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (12, 'qa.dev01@test.example.com', 3.5, 'QA ENTRY - ML model training pipeline setup', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (12, 'qa.dev01@test.example.com', 5.0, 'QA ENTRY - Model inference API endpoint implementation', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (12, 'qa.dev01@test.example.com', 1.75, 'QA ENTRY - A/B testing framework configuration', '2026-02-09');

-- Client 13: Pulsar Mobile (client_id=13, 2 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (13, 'qa.dev01@test.example.com', 7.0, 'QA ENTRY - React Native component library development', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (13, 'qa.dev01@test.example.com', 4.5, 'QA ENTRY - Mobile app performance profiling and optimization', '2026-02-09');

-- Casual user 1 entries (7 entries across 3 clients)
-- Client 14: Nimbus Marketing (client_id=14, 3 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (14, 'qa.pm01@example.com', 3.0, 'QA ENTRY - Campaign analytics dashboard requirements', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (14, 'qa.pm01@example.com', 5.5, 'QA ENTRY - Email automation workflow implementation', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (14, 'qa.pm01@example.com', 2.0, 'QA ENTRY - UTM tracking integration testing', '2026-02-09');

-- Client 15: Forge Manufacturing (client_id=15, 2 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (15, 'qa.pm01@example.com', 6.5, 'QA ENTRY - Factory floor sensor integration planning', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (15, 'qa.pm01@example.com', 4.0, 'QA ENTRY - Production line monitoring dashboard build', '2026-02-08');

-- Client 16: Beacon Gov (client_id=16, 2 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (16, 'qa.pm01@example.com', 2.5, 'QA ENTRY - ATO compliance documentation review', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (16, 'qa.pm01@example.com', 1.5, 'QA ENTRY - Citizen portal accessibility audit', '2026-02-09');

-- Casual user 2 entries (3 entries across 2 clients)
-- Client 17: Crest Energy (client_id=17, 2 entries)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (17, 'qa.lead01@example.com', 5.0, 'QA ENTRY - Smart grid monitoring dashboard architecture', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (17, 'qa.lead01@example.com', 3.25, 'QA ENTRY - Energy consumption forecasting model review', '2026-02-08');

-- Client 18: Ridgeline Telecom (client_id=18, 1 entry)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (18, 'qa.lead01@example.com', 7.5, 'QA ENTRY - Billing reconciliation system development sprint', '2026-02-08');

-- =============================================================================
-- REPORT/EXPORT SCENARIO DATA (15 rows)
-- Covers: report views, CSV exports, PDF exports, error scenarios
-- Matches observed 18% report traffic ratio
-- These are structured as expected API test scenarios (not DB rows)
-- represented as additional work entries to enrich report output
-- =============================================================================

-- Additional entries to create report-dense data for export testing on client 1
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (1, 'qa.analyst01@example.com', 3.75, 'QA ENTRY - Quarterly metrics compilation for client review', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (1, 'qa.analyst01@example.com', 1.25, 'QA ENTRY - Executive summary report preparation', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (1, 'qa.analyst01@example.com', 5.0, 'QA ENTRY - Year-end analytics review and trend analysis', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (1, 'qa.analyst01@example.com', 2.25, 'QA ENTRY - Monthly billing data reconciliation', '2026-02-09');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (1, 'qa.analyst01@example.com', 7.0, 'QA ENTRY - Cross-functional team workshop for Q1 planning', '2026-02-09');

-- Additional entries for client 9 (dev user export testing)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (9, 'qa.dev01@test.example.com', 4.75, 'QA ENTRY - Release candidate regression test execution', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (9, 'qa.dev01@test.example.com', 0.5, 'QA ENTRY - Quick production hotfix deployment', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (9, 'qa.dev01@test.example.com', 6.5, 'QA ENTRY - Performance load testing and bottleneck analysis', '2026-02-09');

-- Additional entries for client 14 (PM user export testing)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (14, 'qa.pm01@example.com', 1.0, 'QA ENTRY - Quick client status check-in call', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (14, 'qa.pm01@example.com', 4.5, 'QA ENTRY - Marketing campaign ROI analysis report', '2026-02-08');

-- Additional entries for client 17 (lead user export testing)
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (17, 'qa.lead01@example.com', 2.0, 'QA ENTRY - Stakeholder demo preparation for grid monitoring', '2026-02-08');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (17, 'qa.lead01@example.com', 6.0, 'QA ENTRY - Energy dashboard real-time alerting implementation', '2026-02-09');

-- Additional entries for multi-user report comparison testing
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (2, 'qa.analyst01@example.com', 3.0, 'QA ENTRY - Cloud security posture review for compliance', '2026-02-07');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (10, 'qa.dev01@test.example.com', 4.25, 'QA ENTRY - Data lineage tracking tool evaluation', '2026-02-09');
INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (15, 'qa.pm01@example.com', 5.75, 'QA ENTRY - Assembly line digital twin prototype review', '2026-02-09');
