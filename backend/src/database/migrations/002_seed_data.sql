-- Migration: 002_seed_data
-- Description: Seeds the database with sample data for development and testing
-- Created: 2026-02-03

-- Insert sample users
INSERT INTO users (email, created_at) VALUES 
    ('john.doe@example.com', '2026-01-01 09:00:00'),
    ('jane.smith@example.com', '2026-01-02 10:30:00'),
    ('mike.johnson@example.com', '2026-01-03 08:15:00'),
    ('sarah.williams@example.com', '2026-01-05 11:00:00'),
    ('david.brown@example.com', '2026-01-07 14:30:00');

-- Insert sample clients for john.doe@example.com
INSERT INTO clients (name, description, department, email, user_email, created_at, updated_at) VALUES 
    ('Acme Corporation', 'Enterprise software development project', 'Engineering', 'contact@acme.com', 'john.doe@example.com', '2026-01-02 09:00:00', '2026-01-02 09:00:00'),
    ('TechStart Inc', 'Mobile app development', 'Product', 'info@techstart.com', 'john.doe@example.com', '2026-01-03 10:00:00', '2026-01-03 10:00:00'),
    ('Global Finance Ltd', 'Financial reporting system', 'Finance', 'support@globalfinance.com', 'john.doe@example.com', '2026-01-05 11:00:00', '2026-01-05 11:00:00');

-- Insert sample clients for jane.smith@example.com
INSERT INTO clients (name, description, department, email, user_email, created_at, updated_at) VALUES 
    ('Healthcare Plus', 'Patient management system', 'Healthcare', 'admin@healthcareplus.com', 'jane.smith@example.com', '2026-01-04 09:30:00', '2026-01-04 09:30:00'),
    ('EduTech Solutions', 'Learning management platform', 'Education', 'contact@edutech.com', 'jane.smith@example.com', '2026-01-06 14:00:00', '2026-01-06 14:00:00');

-- Insert sample clients for mike.johnson@example.com
INSERT INTO clients (name, description, department, email, user_email, created_at, updated_at) VALUES 
    ('RetailMax', 'E-commerce platform optimization', 'Sales', 'tech@retailmax.com', 'mike.johnson@example.com', '2026-01-08 08:00:00', '2026-01-08 08:00:00'),
    ('LogiTrans Corp', 'Supply chain management system', 'Operations', 'support@logitrans.com', 'mike.johnson@example.com', '2026-01-09 10:30:00', '2026-01-09 10:30:00');

-- Insert sample clients for sarah.williams@example.com
INSERT INTO clients (name, description, department, email, user_email, created_at, updated_at) VALUES 
    ('MediaStream', 'Video streaming platform', 'Media', 'dev@mediastream.com', 'sarah.williams@example.com', '2026-01-10 09:00:00', '2026-01-10 09:00:00'),
    ('GreenEnergy Co', 'Renewable energy monitoring dashboard', 'Energy', 'info@greenenergy.com', 'sarah.williams@example.com', '2026-01-11 11:30:00', '2026-01-11 11:30:00');

-- Insert sample clients for david.brown@example.com
INSERT INTO clients (name, description, department, email, user_email, created_at, updated_at) VALUES 
    ('SecureBank', 'Banking security audit system', 'Security', 'security@securebank.com', 'david.brown@example.com', '2026-01-12 08:30:00', '2026-01-12 08:30:00');

-- Insert sample work entries for john.doe@example.com - Acme Corporation (client_id = 1)
INSERT INTO work_entries (client_id, user_email, hours, description, date, created_at, updated_at) VALUES 
    (1, 'john.doe@example.com', 8.00, 'Initial project setup and requirements gathering', '2026-01-15', '2026-01-15 17:00:00', '2026-01-15 17:00:00'),
    (1, 'john.doe@example.com', 6.50, 'Database schema design and documentation', '2026-01-16', '2026-01-16 16:30:00', '2026-01-16 16:30:00'),
    (1, 'john.doe@example.com', 7.00, 'API endpoint development - authentication module', '2026-01-17', '2026-01-17 17:00:00', '2026-01-17 17:00:00'),
    (1, 'john.doe@example.com', 5.50, 'Code review and bug fixes', '2026-01-18', '2026-01-18 15:30:00', '2026-01-18 15:30:00'),
    (1, 'john.doe@example.com', 8.00, 'Integration testing and deployment preparation', '2026-01-19', '2026-01-19 18:00:00', '2026-01-19 18:00:00');

-- Insert sample work entries for john.doe@example.com - TechStart Inc (client_id = 2)
INSERT INTO work_entries (client_id, user_email, hours, description, date, created_at, updated_at) VALUES 
    (2, 'john.doe@example.com', 4.00, 'Mobile app UI wireframe review', '2026-01-20', '2026-01-20 13:00:00', '2026-01-20 13:00:00'),
    (2, 'john.doe@example.com', 6.00, 'React Native component development', '2026-01-21', '2026-01-21 16:00:00', '2026-01-21 16:00:00'),
    (2, 'john.doe@example.com', 7.50, 'API integration and state management', '2026-01-22', '2026-01-22 17:30:00', '2026-01-22 17:30:00');

-- Insert sample work entries for john.doe@example.com - Global Finance Ltd (client_id = 3)
INSERT INTO work_entries (client_id, user_email, hours, description, date, created_at, updated_at) VALUES 
    (3, 'john.doe@example.com', 3.00, 'Financial reporting requirements analysis', '2026-01-23', '2026-01-23 12:00:00', '2026-01-23 12:00:00'),
    (3, 'john.doe@example.com', 5.00, 'Dashboard prototype development', '2026-01-24', '2026-01-24 15:00:00', '2026-01-24 15:00:00');

-- Insert sample work entries for jane.smith@example.com - Healthcare Plus (client_id = 4)
INSERT INTO work_entries (client_id, user_email, hours, description, date, created_at, updated_at) VALUES 
    (4, 'jane.smith@example.com', 8.00, 'HIPAA compliance review and documentation', '2026-01-15', '2026-01-15 18:00:00', '2026-01-15 18:00:00'),
    (4, 'jane.smith@example.com', 7.00, 'Patient data model design', '2026-01-16', '2026-01-16 17:00:00', '2026-01-16 17:00:00'),
    (4, 'jane.smith@example.com', 6.50, 'Appointment scheduling module development', '2026-01-17', '2026-01-17 16:30:00', '2026-01-17 16:30:00'),
    (4, 'jane.smith@example.com', 8.00, 'Security audit and penetration testing', '2026-01-18', '2026-01-18 18:00:00', '2026-01-18 18:00:00');

-- Insert sample work entries for jane.smith@example.com - EduTech Solutions (client_id = 5)
INSERT INTO work_entries (client_id, user_email, hours, description, date, created_at, updated_at) VALUES 
    (5, 'jane.smith@example.com', 5.00, 'Course management feature specification', '2026-01-20', '2026-01-20 15:00:00', '2026-01-20 15:00:00'),
    (5, 'jane.smith@example.com', 6.00, 'Student progress tracking implementation', '2026-01-21', '2026-01-21 16:00:00', '2026-01-21 16:00:00'),
    (5, 'jane.smith@example.com', 4.50, 'Quiz and assessment module testing', '2026-01-22', '2026-01-22 14:30:00', '2026-01-22 14:30:00');

-- Insert sample work entries for mike.johnson@example.com - RetailMax (client_id = 6)
INSERT INTO work_entries (client_id, user_email, hours, description, date, created_at, updated_at) VALUES 
    (6, 'mike.johnson@example.com', 7.00, 'Product catalog optimization', '2026-01-15', '2026-01-15 17:00:00', '2026-01-15 17:00:00'),
    (6, 'mike.johnson@example.com', 8.00, 'Shopping cart performance improvements', '2026-01-16', '2026-01-16 18:00:00', '2026-01-16 18:00:00'),
    (6, 'mike.johnson@example.com', 6.00, 'Payment gateway integration', '2026-01-17', '2026-01-17 16:00:00', '2026-01-17 16:00:00');

-- Insert sample work entries for mike.johnson@example.com - LogiTrans Corp (client_id = 7)
INSERT INTO work_entries (client_id, user_email, hours, description, date, created_at, updated_at) VALUES 
    (7, 'mike.johnson@example.com', 5.50, 'Inventory tracking system design', '2026-01-20', '2026-01-20 15:30:00', '2026-01-20 15:30:00'),
    (7, 'mike.johnson@example.com', 7.00, 'Real-time shipment tracking implementation', '2026-01-21', '2026-01-21 17:00:00', '2026-01-21 17:00:00');

-- Insert sample work entries for sarah.williams@example.com - MediaStream (client_id = 8)
INSERT INTO work_entries (client_id, user_email, hours, description, date, created_at, updated_at) VALUES 
    (8, 'sarah.williams@example.com', 8.00, 'Video encoding pipeline optimization', '2026-01-15', '2026-01-15 18:00:00', '2026-01-15 18:00:00'),
    (8, 'sarah.williams@example.com', 7.50, 'CDN integration and caching strategy', '2026-01-16', '2026-01-16 17:30:00', '2026-01-16 17:30:00'),
    (8, 'sarah.williams@example.com', 6.00, 'User analytics dashboard development', '2026-01-17', '2026-01-17 16:00:00', '2026-01-17 16:00:00');

-- Insert sample work entries for sarah.williams@example.com - GreenEnergy Co (client_id = 9)
INSERT INTO work_entries (client_id, user_email, hours, description, date, created_at, updated_at) VALUES 
    (9, 'sarah.williams@example.com', 4.00, 'Solar panel monitoring API design', '2026-01-20', '2026-01-20 14:00:00', '2026-01-20 14:00:00'),
    (9, 'sarah.williams@example.com', 5.50, 'Energy consumption visualization charts', '2026-01-21', '2026-01-21 15:30:00', '2026-01-21 15:30:00');

-- Insert sample work entries for david.brown@example.com - SecureBank (client_id = 10)
INSERT INTO work_entries (client_id, user_email, hours, description, date, created_at, updated_at) VALUES 
    (10, 'david.brown@example.com', 8.00, 'Security vulnerability assessment', '2026-01-15', '2026-01-15 18:00:00', '2026-01-15 18:00:00'),
    (10, 'david.brown@example.com', 7.00, 'Two-factor authentication implementation', '2026-01-16', '2026-01-16 17:00:00', '2026-01-16 17:00:00'),
    (10, 'david.brown@example.com', 8.00, 'Encryption key management system', '2026-01-17', '2026-01-17 18:00:00', '2026-01-17 18:00:00'),
    (10, 'david.brown@example.com', 6.50, 'Audit logging and compliance reporting', '2026-01-18', '2026-01-18 16:30:00', '2026-01-18 16:30:00'),
    (10, 'david.brown@example.com', 5.00, 'Security documentation and training materials', '2026-01-19', '2026-01-19 15:00:00', '2026-01-19 15:00:00');

-- Record this migration
INSERT INTO schema_migrations (migration_name) VALUES ('002_seed_data');
