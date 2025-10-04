CREATE DATABASE IF NOT EXISTS expense_manager;
USE expense_manager;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS approval_rules;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS rule_approvers;
-- Then CREATE TABLE statements here
DROP TABLE IF EXISTS expense_approvals;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  base_currency VARCHAR(3),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
  manager_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE TABLE expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT,
  employee_id INT,
  description TEXT,
  category VARCHAR(50),
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  converted_amount DECIMAL(10,2),
  conversion_rate DECIMAL(10,6) DEFAULT 1,
  expense_date DATE,
  paid_by INT,
  receipt_url VARCHAR(255),
  status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (paid_by) REFERENCES users(id)
);

CREATE TABLE approval_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT,
  category VARCHAR(50),
  manager_approves_first BOOLEAN DEFAULT TRUE,
  approval_type ENUM('sequential', 'percentage') DEFAULT 'sequential',
  min_percentage INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE rule_approvers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rule_id INT,
  approver_id INT,
  sequence_order INT,
  is_required BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (rule_id) REFERENCES approval_rules(id),
  FOREIGN KEY (approver_id) REFERENCES users(id)
);

CREATE TABLE expense_approvals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expense_id INT,
  approver_id INT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  comments TEXT,
  approved_at TIMESTAMP NULL,
  FOREIGN KEY (expense_id) REFERENCES expenses(id),
  FOREIGN KEY (approver_id) REFERENCES users(id)
);
