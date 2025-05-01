/*
  # Update properties schema and add stats columns

  1. Changes
    - Add user_id column with proper type and constraints
    - Add total_earnings and active_bids columns
    - Add foreign key reference to auth.users
    - Enable RLS and add policies
    - Add indexes for performance

  2. Security
    - Enable RLS on properties table
    - Add policies for:
      - Hosts can read/write their own properties
      - Public can read all properties
*/

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE properties ADD COLUMN user_id uuid;
  END IF;
END $$;

-- Add stats columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'total_earnings'
  ) THEN
    ALTER TABLE properties ADD COLUMN total_earnings numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'active_bids'
  ) THEN
    ALTER TABLE properties ADD COLUMN active_bids integer DEFAULT 0;
  END IF;
END $$;

-- Drop existing foreign key if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'properties_user_id_fkey'
  ) THEN
    ALTER TABLE properties DROP CONSTRAINT properties_user_id_fkey;
  END IF;
END $$;

-- Update existing null user_ids with a default value
UPDATE properties 
SET user_id = (
  SELECT id 
  FROM users 
  WHERE role = 'host' 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Set NOT NULL constraint and add foreign key
ALTER TABLE properties
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT properties_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Hosts can read own properties" ON properties;
DROP POLICY IF EXISTS "Hosts can insert own properties" ON properties;
DROP POLICY IF EXISTS "Hosts can update own properties" ON properties;
DROP POLICY IF EXISTS "Anyone can read properties" ON properties;

-- Create policies
CREATE POLICY "Hosts can read own properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Hosts can insert own properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Hosts can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Anyone can read properties"
  ON properties
  FOR SELECT
  TO anon, authenticated
  USING (true);