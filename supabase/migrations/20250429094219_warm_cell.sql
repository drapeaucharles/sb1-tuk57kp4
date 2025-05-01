/*
  # Enable RLS and add policies for users table

  1. Security
    - Enable RLS on users table
    - Add policies for:
      - Users can read their own data
      - Users can update their own data
      - Public can create new users (registration)

  2. Changes
    - Enable RLS on users table
    - Add authentication policies
*/

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