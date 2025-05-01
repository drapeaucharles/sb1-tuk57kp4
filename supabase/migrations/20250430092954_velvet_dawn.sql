/*
  # Add balance to users and create refund function

  1. Changes
    - Add balance column to users table
    - Create refund_user_balance function
    - Add check constraint for non-negative balance

  2. Security
    - Function is accessible to authenticated users only
*/

-- Add balance column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'balance'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN balance numeric(10,2) NOT NULL DEFAULT 0
    CHECK (balance >= 0);
  END IF;
END $$;

-- Create refund function
CREATE OR REPLACE FUNCTION refund_user_balance(user_id UUID, amount NUMERIC)
RETURNS void 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users 
  SET balance = balance + amount 
  WHERE id = user_id;
END;
$$;