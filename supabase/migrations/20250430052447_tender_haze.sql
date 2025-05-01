/*
  # Create bids table with RLS policies

  1. New Tables
    - `bids`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `property_id` (uuid, references properties)
      - `nights` (jsonb, array of bid dates and amounts)
      - `total_amount` (numeric, total bid amount)
      - `deposit_amount` (numeric, security deposit amount)
      - `status` (text, check constraint: pending/won/lost/outbid)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS
    - Add policies for:
      - Users can read their own bids
      - Users can create bids
      - Hosts can read bids on their properties
*/

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  nights jsonb NOT NULL,
  total_amount numeric NOT NULL,
  deposit_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'outbid')),
  created_at timestamptz DEFAULT now(),
  
  -- Add constraint to ensure nights is an array
  CONSTRAINT bids_nights_is_array CHECK (jsonb_typeof(nights) = 'array')
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_property_id ON bids(property_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);

-- Enable RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Users can read their own bids
CREATE POLICY "Users can read own bids"
  ON bids
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create bids
CREATE POLICY "Users can create bids"
  ON bids
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Hosts can read bids on their properties
CREATE POLICY "Hosts can read bids on their properties"
  ON bids
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id
      AND p.user_id = auth.uid()
    )
  );