/*
  # Add total_amount column to bids table

  1. Changes
    - Add `total_amount` column to `bids` table
      - Type: numeric
      - Nullable: false
      - Default: 0
    
  2. Reasoning
    - Required for storing the total bid amount
    - Set as non-nullable with default to ensure data consistency
    - Using numeric type to handle currency values accurately
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bids' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE bids ADD COLUMN total_amount numeric NOT NULL DEFAULT 0;
  END IF;
END $$;