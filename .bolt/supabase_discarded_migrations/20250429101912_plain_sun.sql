/*
  # Convert IDs to UUID and update foreign key relationships

  1. Changes
    - Convert users.id to UUID
    - Update foreign key relationships in properties, bids, etc.
    - Add RLS policies for proper data access

  2. Security
    - Enable RLS on users table
    - Add policies for data access control
*/

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create temporary column for UUID migration
ALTER TABLE users ADD COLUMN temp_id uuid DEFAULT uuid_generate_v4();

-- Update foreign keys to use temp_id
UPDATE properties SET user_id = users.temp_id FROM users WHERE properties.user_id::text = users.id::text;
UPDATE bids SET user_id = users.temp_id FROM users WHERE bids.user_id::text = users.id::text;
UPDATE messages SET sender_id = users.temp_id FROM users WHERE messages.sender_id::text = users.id::text;
UPDATE messages SET receiver_id = users.temp_id FROM users WHERE messages.receiver_id::text = users.id::text;
UPDATE reviews SET reviewer_id = users.temp_id FROM users WHERE reviews.reviewer_id::text = users.id::text;
UPDATE reviews SET host_id = users.temp_id FROM users WHERE reviews.host_id::text = users.id::text;
UPDATE bookings SET client_id = users.temp_id FROM users WHERE bookings.client_id::text = users.id::text;
UPDATE bookings SET host_id = users.temp_id FROM users WHERE bookings.host_id::text = users.id::text;
UPDATE wallets SET user_id = users.temp_id FROM users WHERE wallets.user_id::text = users.id::text;

-- Drop existing foreign keys
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_user_id_fkey;
ALTER TABLE bids DROP CONSTRAINT IF EXISTS bids_user_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_host_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_client_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_host_id_fkey;
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;

-- Modify columns to UUID
ALTER TABLE properties ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE bids ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE messages ALTER COLUMN sender_id TYPE uuid USING sender_id::uuid;
ALTER TABLE messages ALTER COLUMN receiver_id TYPE uuid USING receiver_id::uuid;
ALTER TABLE reviews ALTER COLUMN reviewer_id TYPE uuid USING reviewer_id::uuid;
ALTER TABLE reviews ALTER COLUMN host_id TYPE uuid USING host_id::uuid;
ALTER TABLE bookings ALTER COLUMN client_id TYPE uuid USING client_id::uuid;
ALTER TABLE bookings ALTER COLUMN host_id TYPE uuid USING host_id::uuid;
ALTER TABLE wallets ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Drop old id column and rename temp_id
ALTER TABLE users DROP CONSTRAINT users_pkey CASCADE;
ALTER TABLE users DROP COLUMN id;
ALTER TABLE users RENAME COLUMN temp_id TO id;
ALTER TABLE users ADD PRIMARY KEY (id);

-- Recreate foreign key constraints
ALTER TABLE properties ADD CONSTRAINT properties_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE bids ADD CONSTRAINT bids_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT reviews_host_id_fkey FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT bookings_client_id_fkey FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT bookings_host_id_fkey FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE wallets ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable public registration" ON users;

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow public registration
CREATE POLICY "Enable public registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow public to read minimal user data
CREATE POLICY "Allow public read access"
  ON users
  FOR SELECT
  TO public
  USING (true);