/*
  # Update bid statuses and add cancel/refund functionality

  1. Changes
    - Drop existing status constraint
    - Update status values
    - Add new status constraint with updated values
    - Add balance column to users if missing
    - Create cancel_bid_and_refund function

  2. Security
    - Function runs with security definer
    - Maintains RLS policies
*/

-- First drop the existing constraint
ALTER TABLE bids DROP CONSTRAINT IF EXISTS bids_status_check;

-- Update existing status values
UPDATE bids 
SET status = CASE 
  WHEN status = 'pending' THEN 'active'
  WHEN status = 'outbid' THEN 'over_bid'
  ELSE status 
END;

-- Add new status constraint
ALTER TABLE bids ADD CONSTRAINT bids_status_check 
  CHECK (status IN ('active', 'over_bid', 'won', 'canceled', 'confirmed'));

-- Ensure users table has balance column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'balance'
  ) THEN
    ALTER TABLE users ADD COLUMN balance numeric DEFAULT 0;
  END IF;
END $$;

-- Create cancel_bid_and_refund function
CREATE OR REPLACE FUNCTION cancel_bid_and_refund(p_bid_id UUID)
RETURNS void AS $$
DECLARE
  bid_record RECORD;
BEGIN
  -- Get bid details
  SELECT * INTO bid_record 
  FROM bids 
  WHERE id = p_bid_id;

  -- Validate bid status
  IF bid_record.status = 'confirmed' OR bid_record.status = 'won' THEN
    RAISE EXCEPTION 'Cannot cancel a confirmed or won bid';
  END IF;

  -- Update bid status
  UPDATE bids 
  SET status = 'canceled' 
  WHERE id = p_bid_id;

  -- Refund user
  UPDATE users
  SET balance = balance + bid_record.total_amount + bid_record.deposit_amount
  WHERE id = bid_record.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;