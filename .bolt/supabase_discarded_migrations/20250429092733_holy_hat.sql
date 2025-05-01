/*
  # Initial Schema Setup for BnBidder

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `role` (text, check constraint for 'client' or 'host')
      - `created_at` (timestamptz)

    - `properties`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `minimum_bid_price` (numeric)
      - `available_dates` (jsonb)
      - `images` (jsonb)
      - `created_at` (timestamptz)

    - `bids`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `property_id` (uuid, references properties)
      - `nights` (jsonb)
      - `total_bid_amount` (numeric)
      - `wallet_address` (text)
      - `bid_status` (text, check constraint)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'host')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  minimum_bid_price numeric(10,2) NOT NULL CHECK (minimum_bid_price >= 0),
  available_dates jsonb NOT NULL,
  images jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Hosts can insert own properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'host'
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Hosts can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  nights jsonb NOT NULL,
  total_bid_amount numeric(10,2) NOT NULL CHECK (total_bid_amount >= 0),
  wallet_address text,
  bid_status text NOT NULL DEFAULT 'pending' CHECK (bid_status IN ('pending', 'won', 'lost', 'canceled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own bids"
  ON bids
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Hosts can view bids on own properties"
  ON bids
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can insert bids"
  ON bids
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'client'
    )
    AND user_id = auth.uid()
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_property_id ON bids(property_id);