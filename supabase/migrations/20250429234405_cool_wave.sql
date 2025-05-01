/*
  # Update properties table schema to match form data

  1. Changes
    - Add minimum_bid_price column (renamed from basePrice)
    - Add deposit column
    - Add bidding_cutoff column
    - Add property_type column

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add property_type column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'property_type'
  ) THEN
    ALTER TABLE properties ADD COLUMN property_type text;
  END IF;

  -- Add deposit column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'deposit'
  ) THEN
    ALTER TABLE properties ADD COLUMN deposit numeric(10,2);
  END IF;

  -- Add bidding_cutoff column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'bidding_cutoff'
  ) THEN
    ALTER TABLE properties ADD COLUMN bidding_cutoff integer;
  END IF;
END $$;