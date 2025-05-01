/*
  # Add sample property data for demo host account

  1. Changes
    - Insert sample property data for host@bnbidder.com
    - Set up initial available dates
    - Add sample images

  2. Notes
    - Property will be linked to the demo host account
    - Uses realistic pricing and availability data
*/

-- Get the host user's ID
DO $$ 
DECLARE
  host_id uuid;
BEGIN
  SELECT id INTO host_id FROM users WHERE email = 'host@bnbidder.com' LIMIT 1;

  IF host_id IS NOT NULL THEN
    -- Insert the sample property
    INSERT INTO properties (
      user_id,
      title,
      description,
      location,
      property_type,
      minimum_bid_price,
      deposit,
      bidding_cutoff,
      num_beds,
      num_bedrooms,
      min_nights,
      images,
      available_dates,
      total_earnings,
      active_bids
    ) VALUES (
      host_id,
      'Luxury Beach Villa',
      'Experience luxury living in this stunning beachfront villa. Featuring panoramic ocean views, a private infinity pool, and direct beach access. Perfect for families or groups seeking an unforgettable coastal getaway.',
      'Malibu, California',
      'villa',
      120,
      200,
      3,
      4,
      3,
      2,
      ARRAY[
        'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        'https://images.pexels.com/photos/2351649/pexels-photo-2351649.jpeg',
        'https://images.pexels.com/photos/2119713/pexels-photo-2119713.jpeg'
      ],
      json_build_array(
        json_build_object(
          'date', '2025-07-01',
          'price', 120
        ),
        json_build_object(
          'date', '2025-07-02',
          'price', 120
        ),
        json_build_object(
          'date', '2025-07-03',
          'price', 120
        ),
        json_build_object(
          'date', '2025-07-04',
          'price', 140
        ),
        json_build_object(
          'date', '2025-07-05',
          'price', 140
        ),
        json_build_object(
          'date', '2025-07-06',
          'price', 120
        ),
        json_build_object(
          'date', '2025-07-07',
          'price', 110
        ),
        json_build_object(
          'date', '2025-07-08',
          'price', 110
        ),
        json_build_object(
          'date', '2025-07-09',
          'price', 110
        ),
        json_build_object(
          'date', '2025-07-10',
          'price', 110
        ),
        json_build_object(
          'date', '2025-07-11',
          'price', 130
        ),
        json_build_object(
          'date', '2025-07-12',
          'price', 130
        ),
        json_build_object(
          'date', '2025-07-13',
          'price', 120
        ),
        json_build_object(
          'date', '2025-07-14',
          'price', 120
        ),
        json_build_object(
          'date', '2025-07-15',
          'price', 120
        )
      ),
      0,
      0
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;