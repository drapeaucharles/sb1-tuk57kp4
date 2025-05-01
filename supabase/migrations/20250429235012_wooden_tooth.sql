/*
  # Add minimum nights requirement

  1. Changes
    - Add min_nights column to properties table
    - Set default value to 1
    - Add check constraint to ensure min_nights is at least 1

  2. Notes
    - This affects how users can book properties
    - Minimum nights requirement must be enforced in the frontend
*/

DO $$ 
BEGIN
  -- Add min_nights column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'min_nights'
  ) THEN
    ALTER TABLE properties 
    ADD COLUMN min_nights integer NOT NULL DEFAULT 1
    CHECK (min_nights >= 1);
  END IF;
END $$;