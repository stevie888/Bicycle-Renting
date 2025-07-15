-- Add date columns to umbrellas table
-- This script adds created_at and updated_at columns for tracking when umbrellas were added or modified

-- Temporarily disable safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Add created_at column (will be NULL for existing records, but new records will have timestamps)
ALTER TABLE umbrellas ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column (will be NULL for existing records, but new records will have timestamps)
ALTER TABLE umbrellas ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing records to have a created_at timestamp (using current time)
-- Using a more specific WHERE clause to satisfy safe update mode
UPDATE umbrellas SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL AND id IS NOT NULL;

-- Update existing records to have an updated_at timestamp (using current time)
-- Using a more specific WHERE clause to satisfy safe update mode
UPDATE umbrellas SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL AND id IS NOT NULL;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Verify the changes
SELECT id, description, location, status, inventory, created_at, updated_at FROM umbrellas LIMIT 5; 