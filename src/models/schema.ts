import { client } from "./client";

client.exec(`
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    role TEXT,
    created_at TIMESTAMP
);


CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    max_users INTEGER,
    created_at TIMESTAMP
);


CREATE TABLE queues (
    id INTEGER PRIMARY KEY,
    status TEXT,
    created_at TIMESTAMP,
    product_id INTEGER,
    FOREIGN KEY (product_id) REFERENCES products(id)
);


CREATE TABLE queue_users (
    queue_id INTEGER,
    user_id INTEGER,
    PRIMARY KEY (queue_id, user_id),
    FOREIGN KEY (queue_id) REFERENCES queues(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


INSERT INTO users (name, role, created_at) VALUES
    ('user1', 'member', DATETIME('now')),
    ('user2', 'member', DATETIME('now')),
    ('user3', 'member', DATETIME('now')),
    ('user4', 'member', DATETIME('now')),
    ('user5', 'member', DATETIME('now')),
    ('user6', 'member', DATETIME('now'));

INSERT INTO products (name, description, max_users, created_at) VALUES
    ('Netflix', 'Streaming service for movies and TV shows', 5, DATETIME('now')),
    ('YouTube', 'Video sharing platform', 5, DATETIME('now'));
`)