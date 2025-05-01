/*
  # Convert users table to use UUID

  1. Changes
    - Convert users table to use UUID as primary key
    - Update foreign key constraints
    - Set up RLS policies for proper authentication

  2. Security
    - Enable RLS on users table
    - Add policies for authenticated users
    - Add public read access policy
*/

-- Create temporary column for new UUID
ALTER TABLE users
ADD COLUMN new_id uuid DEFAULT gen_random_uuid();

-- Update foreign keys to use temporary column
ALTER TABLE properties
DROP CONSTRAINT IF EXISTS properties_user_id_fkey CASCADE;

ALTER TABLE bids
DROP CONSTRAINT IF EXISTS bids_user_id_fkey CASCADE;

ALTER TABLE wallets
DROP CONSTRAINT IF EXISTS wallets_user_id_fkey CASCADE;

ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey CASCADE;
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey CASCADE;

ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey CASCADE;
ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_host_id_fkey CASCADE;

ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_client_id_fkey CASCADE;
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_host_id_fkey CASCADE;

-- Update foreign key columns to use new UUID
ALTER TABLE properties
ADD COLUMN new_user_id uuid;

ALTER TABLE bids
ADD COLUMN new_user_id uuid;

ALTER TABLE wallets
ADD COLUMN new_user_id uuid;

ALTER TABLE messages
ADD COLUMN new_sender_id uuid,
ADD COLUMN new_receiver_id uuid;

ALTER TABLE reviews
ADD COLUMN new_reviewer_id uuid,
ADD COLUMN new_host_id uuid;

ALTER TABLE bookings
ADD COLUMN new_client_id uuid,
ADD COLUMN new_host_id uuid;

-- Update the new columns with corresponding UUIDs
UPDATE properties
SET new_user_id = users.new_id
FROM users
WHERE properties.user_id = users.id;

UPDATE bids
SET new_user_id = users.new_id
FROM users
WHERE bids.user_id = users.id;

UPDATE wallets
SET new_user_id = users.new_id
FROM users
WHERE wallets.user_id = users.id;

UPDATE messages
SET new_sender_id = sender.new_id,
    new_receiver_id = receiver.new_id
FROM users sender, users receiver
WHERE messages.sender_id = sender.id
AND messages.receiver_id = receiver.id;

UPDATE reviews
SET new_reviewer_id = reviewer.new_id,
    new_host_id = host.new_id
FROM users reviewer, users host
WHERE reviews.reviewer_id = reviewer.id
AND reviews.host_id = host.id;

UPDATE bookings
SET new_client_id = client.new_id,
    new_host_id = host.new_id
FROM users client, users host
WHERE bookings.client_id = client.id
AND bookings.host_id = host.id;

-- Drop old columns and rename new ones
ALTER TABLE properties
DROP COLUMN user_id CASCADE,
RENAME COLUMN new_user_id TO user_id;

ALTER TABLE bids
DROP COLUMN user_id CASCADE,
RENAME COLUMN new_user_id TO user_id;

ALTER TABLE wallets
DROP COLUMN user_id CASCADE,
RENAME COLUMN new_user_id TO user_id;

ALTER TABLE messages
DROP COLUMN sender_id CASCADE,
DROP COLUMN receiver_id CASCADE,
RENAME COLUMN new_sender_id TO sender_id,
RENAME COLUMN new_receiver_id TO receiver_id;

ALTER TABLE reviews
DROP COLUMN reviewer_id CASCADE,
DROP COLUMN host_id CASCADE,
RENAME COLUMN new_reviewer_id TO reviewer_id,
RENAME COLUMN new_host_id TO host_id;

ALTER TABLE bookings
DROP COLUMN client_id CASCADE,
DROP COLUMN host_id CASCADE,
RENAME COLUMN new_client_id TO client_id,
RENAME COLUMN new_host_id TO host_id;

-- Drop old ID and rename new ID in users table
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_pkey CASCADE,
DROP COLUMN id CASCADE,
RENAME COLUMN new_id TO id;

-- Add primary key constraint to users table
ALTER TABLE users
ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Re-add foreign key constraints
ALTER TABLE properties
ADD CONSTRAINT properties_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

ALTER TABLE bids
ADD CONSTRAINT bids_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

ALTER TABLE wallets
ADD CONSTRAINT wallets_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

ALTER TABLE messages
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) 
REFERENCES users(id) 
ON DELETE CASCADE,
ADD CONSTRAINT messages_receiver_id_fkey 
FOREIGN KEY (receiver_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

ALTER TABLE reviews
ADD CONSTRAINT reviews_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) 
REFERENCES users(id) 
ON DELETE CASCADE,
ADD CONSTRAINT reviews_host_id_fkey 
FOREIGN KEY (host_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

ALTER TABLE bookings
ADD CONSTRAINT bookings_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES users(id) 
ON DELETE CASCADE,
ADD CONSTRAINT bookings_host_id_fkey 
FOREIGN KEY (host_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Update RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable public registration" ON users;
DROP POLICY IF EXISTS "Allow public read access" ON users;

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

-- Allow users to insert their own data during registration
CREATE POLICY "Enable user registration"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow public to read minimal user data
CREATE POLICY "Allow public read access"
ON users
FOR SELECT
TO public
USING (true);