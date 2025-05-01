/*
  # Add stats tracking columns for host dashboard

  1. New Columns
    - `properties` table:
      - `total_earnings` (numeric) - Total earnings from confirmed bookings
      - `active_bids` (integer) - Count of active bids
    - `bookings` table:
      - `payout_status` (text) - Status of host payout

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

-- Create function to update active_bids count
CREATE OR REPLACE FUNCTION update_property_active_bids()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE properties 
    SET active_bids = active_bids + 1
    WHERE id = NEW.property_id;
  ELSIF TG_OP = 'DELETE' OR NEW.bid_status != 'pending' THEN
    UPDATE properties 
    SET active_bids = active_bids - 1
    WHERE id = OLD.property_id AND active_bids > 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for active_bids
DROP TRIGGER IF EXISTS update_active_bids_trigger ON bids;
CREATE TRIGGER update_active_bids_trigger
AFTER INSERT OR UPDATE OR DELETE ON bids
FOR EACH ROW
EXECUTE FUNCTION update_property_active_bids();

-- Create function to update total_earnings
CREATE OR REPLACE FUNCTION update_property_earnings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_status = 'completed' AND OLD.booking_status != 'completed' THEN
    UPDATE properties 
    SET total_earnings = total_earnings + NEW.total_paid_amount
    WHERE id = NEW.property_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for total_earnings
DROP TRIGGER IF EXISTS update_earnings_trigger ON bookings;
CREATE TRIGGER update_earnings_trigger
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_property_earnings();