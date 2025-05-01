/*
  # Add deposit amount column to bids table

  1. Changes
    - Add deposit_amount column to bids table
    - Set default value to 0
    - Make column NOT NULL
*/

DO $$ 
BEGIN
  -- Add deposit_amount column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'bids' 
    AND column_name = 'deposit_amount'
  ) THEN
    ALTER TABLE bids 
    ADD COLUMN deposit_amount numeric(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;