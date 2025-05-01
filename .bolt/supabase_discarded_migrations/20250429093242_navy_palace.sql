/*
  # Add bookings table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references users)
      - `host_id` (uuid, references users)
      - `property_id` (uuid, references properties)
      - `nights_booked` (jsonb, array of dates and prices)
      - `total_paid_amount` (numeric)
      - `booking_status` (text, with check constraint)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `bookings` table
    - Add policies for:
      - Clients can read their own bookings
      - Hosts can read bookings for their properties
      - System can create bookings

  3. Changes
    - Add foreign key constraints with CASCADE delete
    - Add check constraint for booking_status values
*/

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users(id) ON DELETE CASCADE,
  host_id uuid REFERENCES users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  nights_booked jsonb NOT NULL,
  total_paid_amount numeric(10,2) NOT NULL,
  booking_status text DEFAULT 'confirmed' CHECK (
    booking_status IN ('confirmed', 'completed', 'cancelled')
  ),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Clients can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Hosts can view bookings for their properties"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "System can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS bookings_client_id_idx ON bookings(client_id);
CREATE INDEX IF NOT EXISTS bookings_host_id_idx ON bookings(host_id);
CREATE INDEX IF NOT EXISTS bookings_property_id_idx ON bookings(property_id);
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings(created_at);