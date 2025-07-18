-- ============================================
-- RESET: Drop tables and type if they exist
-- ============================================
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS classification;
DROP TABLE IF EXISTS account;
DROP TYPE IF EXISTS account_type_enum;

-- ============================================
-- CREATE TYPE: account_type_enum
-- ============================================
CREATE TYPE account_type_enum AS ENUM ('Client', 'Admin');

-- ============================================
-- CREATE TABLES
-- ============================================

-- 1. Account Table
CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  account_firstname VARCHAR(50) NOT NULL,
  account_lastname VARCHAR(50) NOT NULL,
  account_email VARCHAR(255) UNIQUE NOT NULL,
  account_password VARCHAR(255) NOT NULL,
  account_type account_type_enum DEFAULT 'Client'
);

-- 2. Classification Table
CREATE TABLE classification (
  classification_id SERIAL PRIMARY KEY,
  classification_name VARCHAR(50) NOT NULL
);

-- 3. Inventory Table
CREATE TABLE inventory (
  inv_id SERIAL PRIMARY KEY,
  inv_make VARCHAR(50) NOT NULL,
  inv_model VARCHAR(50) NOT NULL,
  inv_description TEXT NOT NULL,
  inv_image TEXT,
  inv_thumbnail TEXT,
  classification_id INT REFERENCES classification(classification_id)
);

-- ============================================
-- INSERT SEED DATA
-- ============================================

-- Classification Data
INSERT INTO classification (classification_name)
VALUES ('SUV'), ('Truck'), ('Sport');

-- Inventory Data
INSERT INTO inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, classification_id)
VALUES
('GM', 'Hummer', 'large vehicle with small interiors', '/images/hummer.jpg', '/images/thumb-hummer.jpg', 1),
('Toyota', 'Supra', 'high performance sports car', '/images/supra.jpg', '/images/thumb-supra.jpg', 3),
('Mazda', 'MX-5', 'compact convertible sport vehicle', '/images/mx5.jpg', '/images/thumb-mx5.jpg', 3);

-- ============================================
-- Task 1 Query #4 - Replace Description of GM Hummer
-- ============================================

UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- ============================================
-- Task 1 Query #5 - Join inventory and classification for Sport Category
-- ============================================

SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- ============================================
-- Task 1 Query #6 - Update file paths in inv image and inv thumbnail
-- ============================================

UPDATE inventory
SET 
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');