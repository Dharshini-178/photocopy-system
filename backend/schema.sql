-- =============================================
-- Xerox Portal Database Schema
-- Run this in MySQL Workbench or your hosted MySQL console
-- =============================================

CREATE DATABASE IF NOT EXISTS xerox_db;
USE xerox_db;

-- =============================================
-- Users Table
-- =============================================
DROP TABLE IF EXISTS paper_requests;
DROP TABLE IF EXISTS print_jobs;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    department VARCHAR(50) DEFAULT 'ECE',
    role ENUM('staff', 'admin') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin user
INSERT INTO users (id, email, username, password, phone, department, role)
VALUES ('admin', 'admin@xerox.com', 'admin', 'admin123', '0000000000', 'Admin', 'admin');

-- Sample staff users
INSERT INTO users (id, email, username, password, phone, department, role)
VALUES
    ('Dharshini', 'p.dharshinilogesh@gmail.com', 'Dharshini', '123', '6379558620', 'ECE', 'staff'),
    ('john01', 'john.doe@college.com', 'johndoe', 'password123', '9876543210', 'CSE', 'staff'),
    ('jane01', 'jane.smith@college.com', 'janesmith', 'password123', '9876543211', 'IT', 'staff');

-- =============================================
-- Print Jobs Table
-- =============================================
CREATE TABLE print_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    print_type VARCHAR(50) NOT NULL,
    orientation VARCHAR(20) DEFAULT 'vertical',
    color VARCHAR(20) DEFAULT 'bw',
    copies INT DEFAULT 1,
    pages INT DEFAULT 1,
    file_name VARCHAR(255) DEFAULT NULL,
    date DATE NOT NULL,
    status ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- Paper Requests Table
-- =============================================
CREATE TABLE paper_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    paper_type VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    date DATE NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- Sample Data
-- =============================================
INSERT INTO print_jobs (user_id, user_name, print_type, orientation, color, copies, pages, file_name, date, status)
VALUES
    ('Dharshini', 'Dharshini', 'single-side', 'vertical', 'bw', 2, 10, 'document1.pdf', CURDATE(), 'Pending'),
    ('Dharshini', 'Dharshini', 'front-and-back', 'horizontal', 'color', 1, 5, 'presentation.pptx', CURDATE(), 'Completed'),
    ('john01', 'John Doe', 'single-side', 'vertical', 'bw', 5, 20, 'notes.pdf', CURDATE(), 'Pending');

INSERT INTO paper_requests (user_id, user_name, paper_type, quantity, date, status)
VALUES
    ('Dharshini', 'Dharshini', 'A4', 5, CURDATE(), 'Pending'),
    ('john01', 'John Doe', 'Bond', 3, CURDATE(), 'Approved');
