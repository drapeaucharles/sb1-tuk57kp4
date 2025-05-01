/*
  # Add stats tracking columns to properties and bookings tables

  1. Changes
    - Add total_earnings column to properties table
    - Add active_bids column to properties table
    - Add payout_status column to bookings table

  2. Security
    - Maintain existing RLS policies
*/

-- Add stats columns to properties if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'total_earnings'
  ) THEN
    ALTER TABLE properties ADD COLUMN total_earnings numeric(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'active_bids'
  ) THEN
    ALTER TABLE properties ADD COLUMN active_bids integer DEFAULT 0;
  END IF;
END $$;

-- Add payout status to bookings if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'payout_status'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN payout_status text 
    CHECK (payout_status IN ('pending', 'paid', 'cancelled')) 
    DEFAULT 'pending';
  END IF;
END $$;