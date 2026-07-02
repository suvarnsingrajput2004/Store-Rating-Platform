-- ============================================================================
-- Store Rating Platform — Railway Database Init Script
-- ============================================================================
-- IMPORTANT: This file is for Railway's managed MySQL service.
--   - Do NOT include CREATE DATABASE or USE statements — Railway creates and
--     selects the database for you automatically.
--   - Run this once after provisioning the Railway MySQL database plugin.
--
-- How to run (from your local machine after Railway MySQL is provisioned):
--   mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE> < database/init.sql
--
-- The MYSQL* values can be found in Railway dashboard → MySQL service → Variables.
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL CHECK (CHAR_LENGTH(name) >= 20),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER', 'STORE_OWNER') NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Stores Table
CREATE TABLE IF NOT EXISTS Stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Users(id) ON DELETE SET NULL,
    INDEX idx_stores_owner_id (owner_id),
    INDEX idx_stores_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Ratings Table
CREATE TABLE IF NOT EXISTS Ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES Stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_store (user_id, store_id),
    INDEX idx_ratings_store_id (store_id),
    INDEX idx_ratings_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Seed Data: Default ADMIN user
-- Credentials: admin@store.com / Admin@123  (bcrypt, 10 rounds)
-- ============================================================================
INSERT IGNORE INTO Users (name, email, password, role) VALUES (
  'System Administrator',
  'admin@store.com',
  '$2a$10$Q3PV6txLx16dMwZdn1H3duGW7kNEcmjzJr4utYUtdeofTTh1qPOfi',
  'ADMIN'
);
