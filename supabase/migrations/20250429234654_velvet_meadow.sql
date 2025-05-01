/*
  # Add beds and bedrooms to properties table

  1. Changes
    - Add num_beds column (integer)
    - Add num_bedrooms column (integer)
*/

DO $$ 
BEGIN
  -- Add num_beds column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'num_beds'
  ) THEN
    ALTER TABLE properties ADD COLUMN num_beds integer;
  END IF;

  -- Add num_bedrooms column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'num_bedrooms'
  ) THEN
    ALTER TABLE properties ADD COLUMN num_bedrooms integer;
  END IF;
END $$;