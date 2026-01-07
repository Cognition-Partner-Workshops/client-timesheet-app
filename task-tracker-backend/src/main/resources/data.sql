-- Insert default buckets
INSERT INTO buckets (name, position) VALUES ('To Do', 1);
INSERT INTO buckets (name, position) VALUES ('In Progress', 2);
INSERT INTO buckets (name, position) VALUES ('Review', 3);
INSERT INTO buckets (name, position) VALUES ('Done', 4);

-- Insert sample tasks
INSERT INTO tasks (title, description, assigned_to, priority, started_on, due_date, position, bucket_id, created_at, updated_at) 
VALUES ('Design database schema', 'Create the initial database schema for the task tracker', 'John Doe', 'High', '2026-01-01', '2026-01-10', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tasks (title, description, assigned_to, priority, started_on, due_date, position, bucket_id, created_at, updated_at) 
VALUES ('Setup Spring Boot project', 'Initialize the Spring Boot backend with required dependencies', 'Jane Smith', 'High', '2026-01-02', '2026-01-08', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tasks (title, description, assigned_to, priority, started_on, due_date, position, bucket_id, created_at, updated_at) 
VALUES ('Implement REST APIs', 'Create CRUD endpoints for tasks and buckets', 'John Doe', 'Medium', '2026-01-03', '2026-01-15', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tasks (title, description, assigned_to, priority, started_on, due_date, position, bucket_id, created_at, updated_at) 
VALUES ('Create React frontend', 'Build the Kanban board UI with drag and drop', 'Jane Smith', 'Medium', '2026-01-04', '2026-01-20', 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tasks (title, description, assigned_to, priority, started_on, due_date, position, bucket_id, created_at, updated_at) 
VALUES ('Code review for APIs', 'Review the REST API implementation', 'Mike Johnson', 'Low', '2026-01-05', '2026-01-12', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO tasks (title, description, assigned_to, priority, started_on, due_date, actual_end_date, position, bucket_id, created_at, updated_at) 
VALUES ('Project setup complete', 'Initial project structure and configuration done', 'John Doe', 'High', '2025-12-28', '2025-12-30', '2025-12-29', 1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
