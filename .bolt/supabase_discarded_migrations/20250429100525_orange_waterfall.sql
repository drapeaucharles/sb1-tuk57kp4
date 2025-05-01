/*
  # Create users table and authentication setup

  1. New Tables
    - `users`
      - `id` (integer, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `role` (text, check constraint for 'client' or 'host')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on users table
    - Add policies for user access
*/

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_role_check CHECK (role IN ('client', 'host'))
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id::text = current_user);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id::text = current_user)
  WITH CHECK (id::text = current_user);

-- Allow public registration
CREATE POLICY "Enable public registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Insert test host account if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'dummyhost@bidbnb.com') THEN
    INSERT INTO users (email, password_hash, role)
    VALUES ('dummyhost@bidbnb.com', 'dummy_hash', 'host');
  END IF;
END $$;