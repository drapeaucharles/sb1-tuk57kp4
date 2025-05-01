/*
  # Initial Schema Setup for BnBidder

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `minimum_bid_price` (numeric)
      - `available_dates` (jsonb)
      - `images` (jsonb)
      - `created_at` (timestamptz)

    - `bids`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `property_id` (uuid, references properties)
      - `nights` (jsonb)
      - `total_bid_amount` (numeric)
      - `wallet_address` (text)
      - `bid_status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  minimum_bid_price numeric(10,2) NOT NULL,
  available_dates jsonb NOT NULL,
  images jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  property_id uuid REFERENCES properties ON DELETE CASCADE,
  nights jsonb NOT NULL,
  total_bid_amount numeric(10,2) NOT NULL,
  wallet_address text,
  bid_status text DEFAULT 'pending' CHECK (bid_status IN ('pending', 'won', 'lost', 'canceled')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Anyone can view properties"
  ON properties
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Hosts can insert their own properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can update their own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bids policies
CREATE POLICY "Users can view their own bids"
  ON bids
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Property owners can view bids on their properties"
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

CREATE POLICY "Authenticated users can place bids"
  ON bids
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending bids"
  ON bids
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND bid_status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id
    AND bid_status = 'pending'
  );