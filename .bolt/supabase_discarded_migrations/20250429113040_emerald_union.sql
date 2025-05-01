/*
  # Update users table ID to UUID

  1. Changes
    - Modify users table to use UUID instead of integer for id column
    - Update foreign key constraints in related tables
    
  2. Security
    - Maintain existing RLS policies
    - No changes to security settings
*/

-- Temporarily disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop existing foreign key constraints
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_user_id_fkey;
ALTER TABLE bids DROP CONSTRAINT IF EXISTS bids_user_id_fkey;
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_host_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_client_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_host_id_fkey;

-- Modify the users table
ALTER TABLE users 
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN id TYPE uuid USING id::text::uuid;

-- Update related tables to use UUID
ALTER TABLE properties ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE bids ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE wallets ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;
ALTER TABLE messages ALTER COLUMN sender_id TYPE uuid USING sender_id::text::uuid;
ALTER TABLE messages ALTER COLUMN receiver_id TYPE uuid USING receiver_id::text::uuid;
ALTER TABLE reviews ALTER COLUMN host_id TYPE uuid USING host_id::text::uuid;
ALTER TABLE reviews ALTER COLUMN reviewer_id TYPE uuid USING reviewer_id::text::uuid;
ALTER TABLE bookings ALTER COLUMN client_id TYPE uuid USING client_id::text::uuid;
ALTER TABLE bookings ALTER COLUMN host_id TYPE uuid USING host_id::text::uuid;

-- Recreate foreign key constraints
ALTER TABLE properties ADD CONSTRAINT properties_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE bids ADD CONSTRAINT bids_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE wallets ADD CONSTRAINT wallets_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_receiver_id_fkey 
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT reviews_host_id_fkey 
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD CONSTRAINT reviews_reviewer_id_fkey 
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT bookings_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT bookings_host_id_fkey 
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;