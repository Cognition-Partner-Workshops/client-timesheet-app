-- Migration: 001_initial_schema
-- Description: Creates the initial database schema for the timesheet application
-- Created: 2026-02-03

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Create users table
-- Stores authenticated user records identified by email
CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table
-- Stores client information for time tracking, linked to users
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    email TEXT,
    user_email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
);

-- Create work_entries table
-- Stores time tracking records with hours worked per client
CREATE TABLE IF NOT EXISTS work_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    user_email TEXT NOT NULL,
    hours DECIMAL(5,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
    FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
);

-- Create indexes for query performance optimization
CREATE INDEX IF NOT EXISTS idx_clients_user_email ON clients (user_email);
CREATE INDEX IF NOT EXISTS idx_work_entries_client_id ON work_entries (client_id);
CREATE INDEX IF NOT EXISTS idx_work_entries_user_email ON work_entries (user_email);
CREATE INDEX IF NOT EXISTS idx_work_entries_date ON work_entries (date);

-- Create migrations tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_name TEXT NOT NULL UNIQUE,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Record this migration
INSERT INTO schema_migrations (migration_name) VALUES ('001_initial_schema');
