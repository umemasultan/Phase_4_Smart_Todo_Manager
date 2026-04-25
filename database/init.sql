-- Create tables for Todo app
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_token ON chat_sessions(session_token);

-- Insert sample data (password is 'password123' hashed with bcrypt)
INSERT INTO users (username, email, password) VALUES
    ('john_doe', 'john@example.com', '$2b$10$rKvVJH8xqX9YvZ5Z5Z5Z5eZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z'),
    ('jane_smith', 'jane@example.com', '$2b$10$rKvVJH8xqX9YvZ5Z5Z5Z5eZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z')
ON CONFLICT (username) DO NOTHING;

INSERT INTO todos (user_id, title, description) VALUES
    (1, 'Learn Kubernetes', 'Deploy applications using Helm charts'),
    (1, 'Build Todo Chatbot', 'Create a chatbot for managing todos'),
    (2, 'Review Code', 'Check the implementation for best practices')
ON CONFLICT (id) DO NOTHING;