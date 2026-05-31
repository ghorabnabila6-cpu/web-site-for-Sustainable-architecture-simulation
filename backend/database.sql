CREATE DATABASE IF NOT EXISTS simarch_db;
USE simarch_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('architect', 'client') NOT NULL
);

INSERT INTO users (email, password, role) VALUES
('archi@simarch.dz', 'admin123', 'architect'),
('client@email.com', 'client123', 'client');
