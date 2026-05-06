-- Lightweight IAM System Schema for Kogi State Polytechnic, Lokoja

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    code TEXT UNIQUE NOT NULL
);

-- Levels Table
CREATE TABLE IF NOT EXISTS levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL -- e.g., ND1, ND2, HND1, HND2
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    matric_number TEXT UNIQUE, 
    staff_id TEXT UNIQUE,       
    department_id INTEGER,
    level_id INTEGER,
    phone TEXT,
    gender TEXT,
    address TEXT,
    failed_attempts INTEGER DEFAULT 0,
    locked_until DATETIME,
    last_login_ip TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (level_id) REFERENCES levels(id)
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    department_id INTEGER NOT NULL,
    level_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (level_id) REFERENCES levels(id)
);

-- User Courses (for enrollment/lecturer assignments)
CREATE TABLE IF NOT EXISTS user_courses (
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    module TEXT -- e.g., 'USERS', 'ROLES', 'ACADEMIC'
);

-- RolePermissions Mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER,
    permission_id INTEGER,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    ip_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed Initial Roles
INSERT OR IGNORE INTO roles (name, description) VALUES ('ADMIN', 'System Administrator with full access');
INSERT OR IGNORE INTO roles (name, description) VALUES ('REGISTRAR', 'Manages student records and provisioning');
INSERT OR IGNORE INTO roles (name, description) VALUES ('LECTURER', 'Academic staff with grading access');
INSERT OR IGNORE INTO roles (name, description) VALUES ('STUDENT', 'Enrolled student with portal access');
INSERT OR IGNORE INTO roles (name, description) VALUES ('SUPPORT_STAFF', 'Technical and administrative support staff');

-- Seed Initial Levels
INSERT OR IGNORE INTO levels (name) VALUES ('ND 1');
INSERT OR IGNORE INTO levels (name) VALUES ('ND 2');
INSERT OR IGNORE INTO levels (name) VALUES ('HND 1');
INSERT OR IGNORE INTO levels (name) VALUES ('HND 2');

-- Seed Initial Permissions
INSERT OR IGNORE INTO permissions (name, description, module) VALUES ('MANAGE_USERS', 'Create, update, and delete users', 'USERS');
INSERT OR IGNORE INTO permissions (name, description, module) VALUES ('MANAGE_ROLES', 'Manage roles and permissions', 'ROLES');
INSERT OR IGNORE INTO permissions (name, description, module) VALUES ('MANAGE_ACADEMIC', 'Manage departments, levels, and courses', 'ACADEMIC');
INSERT OR IGNORE INTO permissions (name, description, module) VALUES ('VIEW_AUDIT', 'View system audit logs', 'SECURITY');
INSERT OR IGNORE INTO permissions (name, description, module) VALUES ('MANAGE_SECURITY', 'Handle security alerts and locks', 'SECURITY');
INSERT OR IGNORE INTO permissions (name, description, module) VALUES ('ACCESS_PORTAL', 'Basic access to the institutional portal', 'GENERAL');
