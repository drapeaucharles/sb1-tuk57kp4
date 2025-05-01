/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (integer, primary key)
      - `email` (varchar, unique)
      - `password_hash` (varchar)
      - `role` (varchar)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to read their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

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

-- Add role validation
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('client', 'host'));