/*
  # Add is_bid_cancelable function

  1. New Functions
    - `is_bid_cancelable`: Checks if a bid can be canceled
      - Returns true if bid has at least one night that's been outbid
      - Only active or over_bid bids can be canceled
      - Compares each night's bid price against highest bid for that date

  2. Security
    - Function is security definer to ensure consistent access
    - Only checks active and over_bid bids
*/

-- Create is_bid_cancelable function
CREATE OR REPLACE FUNCTION is_bid_cancelable(p_bid_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  bid_record RECORD;
  night_record RECORD;
  highest_bid NUMERIC;
BEGIN
  -- Get bid details
  SELECT * INTO bid_record 
  FROM bids 
  WHERE id = p_bid_id;

  -- Early return if bid status is not cancelable
  IF bid_record.status NOT IN ('active', 'over_bid') THEN
    RETURN FALSE;
  END IF;

  -- Check each night in the bid
  FOR night_record IN 
    SELECT * FROM jsonb_array_elements(bid_record.nights) AS n
  LOOP
    -- Get highest bid for this night excluding current bid
    WITH night_bids AS (
      SELECT 
        (jsonb_array_elements(b.nights)->>'bid_price')::numeric as bid_price
      FROM bids b
      WHERE b.property_id = bid_record.property_id
        AND b.id != bid_record.id
        AND b.status IN ('active', 'over_bid', 'won')
        AND b.nights @> format('[{"date": %s}]', night_record->>'date')::jsonb
    )
    SELECT MAX(bid_price) INTO highest_bid
    FROM night_bids;

    -- If any night is outbid, the bid is cancelable
    IF highest_bid IS NOT NULL AND highest_bid > (night_record->>'bid_price')::numeric THEN
      RETURN TRUE;
    END IF;
  END LOOP;

  -- No nights were outbid
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;