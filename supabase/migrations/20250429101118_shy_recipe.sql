/*
  # Update users table constraints and policies

  1. Changes
    - Drop and recreate role check constraint
    - Add NOT NULL constraints for role and email
    - Add unique constraint for email
    - Enable RLS and add policies for user data access

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Reading own data
      - Updating own data
      - Public registration
*/

DO $$ BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_role_check' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_role_check;
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable public registration" ON users;

-- Ensure proper constraints
DO $$ BEGIN
  -- Set NOT NULL constraints if not already set
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'role' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE users ALTER COLUMN role SET NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'email' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE users ALTER COLUMN email SET NOT NULL;
  END IF;
END $$;

-- Add role check constraint
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('client', 'host'));

-- Add unique email constraint if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_email_unique' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Allow public registration
CREATE POLICY "Enable public registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Insert test host account if it doesn't exist
INSERT INTO users (email, role, password_hash)
VALUES ('dummyhost@bidbnb.com', 'host', 'dummy_hash')
ON CONFLICT (email) DO NOTHING;