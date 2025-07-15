-- Alternative approach: Add date columns to umbrellas table (Safe Update Mode Compatible)
-- This script adds created_at and updated_at columns without disabling safe update mode

-- Add created_at column
ALTER TABLE umbrellas ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column
ALTER TABLE umbrellas ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing records with more specific WHERE clauses
-- This approach works with safe update mode enabled
UPDATE umbrellas 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL 
  AND id IS NOT NULL 
  AND description IS NOT NULL;

UPDATE umbrellas 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL 
  AND id IS NOT NULL 
  AND description IS NOT NULL;

-- Verify the changes
SELECT id, description, location, status, inventory, created_at, updated_at FROM umbrellas LIMIT 5; 