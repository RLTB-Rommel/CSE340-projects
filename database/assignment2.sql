-- ============================================
-- Task 1 Query #1 - Insert Tony Stark's Account
-- ============================================

INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- ============================================
-- Task 1 Query #2 - Update Tony Stark's Account
-- ============================================

UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- ============================================
-- Task 1 Query #3 - Delete Tony Stark's Account
-- ============================================

DELETE FROM account
WHERE account_email = 'tony@starkent.com';

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
