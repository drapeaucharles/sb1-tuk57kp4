/*
  # Add sample properties

  1. Changes
    - Insert 6 different properties with unique details
    - Link all properties to the host account
    - Include high-quality Pexels images
    - Set up available dates and pricing
*/

-- Get the host user's ID
DO $$ 
DECLARE
  host_id uuid;
BEGIN
  SELECT id INTO host_id FROM users WHERE email = 'host@bnbidder.com' LIMIT 1;

  IF host_id IS NOT NULL THEN
    -- Insert sample properties
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
    ) VALUES 
    -- Luxury Beach Villa
    (
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
        'https://images.pexels.com/photos/2476632/pexels-photo-2476632.jpeg',
        'https://images.pexels.com/photos/2476633/pexels-photo-2476633.jpeg',
        'https://images.pexels.com/photos/2476634/pexels-photo-2476634.jpeg'
      ],
      json_build_array(
        json_build_object('date', '2025-07-01', 'price', 120),
        json_build_object('date', '2025-07-02', 'price', 120),
        json_build_object('date', '2025-07-03', 'price', 120)
      ),
      0,
      0
    ),
    -- Modern Downtown Loft
    (
      host_id,
      'Modern Downtown Loft',
      'Sleek and sophisticated loft in the heart of the city. Floor-to-ceiling windows offer stunning skyline views. Features modern amenities, designer furnishings, and a gourmet kitchen.',
      'New York City, NY',
      'apartment',
      85,
      150,
      2,
      2,
      1,
      1,
      ARRAY[
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg',
        'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg',
        'https://images.pexels.com/photos/1571457/pexels-photo-1571457.jpeg'
      ],
      json_build_array(
        json_build_object('date', '2025-07-05', 'price', 85),
        json_build_object('date', '2025-07-06', 'price', 85),
        json_build_object('date', '2025-07-07', 'price', 85)
      ),
      0,
      0
    ),
    -- Mountain Retreat Cabin
    (
      host_id,
      'Mountain Retreat Cabin',
      'Cozy mountain cabin surrounded by pristine wilderness. Perfect for outdoor enthusiasts with hiking trails nearby. Features a wood-burning fireplace, hot tub, and wraparound deck.',
      'Aspen, Colorado',
      'cabin',
      95,
      180,
      3,
      3,
      2,
      2,
      ARRAY[
        'https://images.pexels.com/photos/2351649/pexels-photo-2351649.jpeg',
        'https://images.pexels.com/photos/2351648/pexels-photo-2351648.jpeg',
        'https://images.pexels.com/photos/2351647/pexels-photo-2351647.jpeg',
        'https://images.pexels.com/photos/2351646/pexels-photo-2351646.jpeg'
      ],
      json_build_array(
        json_build_object('date', '2025-07-10', 'price', 95),
        json_build_object('date', '2025-07-11', 'price', 95),
        json_build_object('date', '2025-07-12', 'price', 95)
      ),
      0,
      0
    ),
    -- Scenic Lakefront Cottage
    (
      host_id,
      'Scenic Lakefront Cottage',
      'Charming cottage with private lake access and stunning water views. Perfect for a peaceful getaway. Includes a private dock, kayaks, and outdoor fire pit.',
      'Lake Tahoe, Nevada',
      'house',
      110,
      200,
      3,
      2,
      2,
      2,
      ARRAY[
        'https://images.pexels.com/photos/2119713/pexels-photo-2119713.jpeg',
        'https://images.pexels.com/photos/2119714/pexels-photo-2119714.jpeg',
        'https://images.pexels.com/photos/2119715/pexels-photo-2119715.jpeg',
        'https://images.pexels.com/photos/2119716/pexels-photo-2119716.jpeg'
      ],
      json_build_array(
        json_build_object('date', '2025-07-15', 'price', 110),
        json_build_object('date', '2025-07-16', 'price', 110),
        json_build_object('date', '2025-07-17', 'price', 110)
      ),
      0,
      0
    ),
    -- Urban Penthouse Suite
    (
      host_id,
      'Urban Penthouse Suite',
      'Luxurious penthouse with panoramic city views. Features high-end finishes, a private terrace, and state-of-the-art amenities. Walking distance to premier shopping and dining.',
      'Chicago, Illinois',
      'apartment',
      150,
      250,
      3,
      3,
      2,
      2,
      ARRAY[
        'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg',
        'https://images.pexels.com/photos/1918292/pexels-photo-1918292.jpeg',
        'https://images.pexels.com/photos/1918293/pexels-photo-1918293.jpeg',
        'https://images.pexels.com/photos/1918294/pexels-photo-1918294.jpeg'
      ],
      json_build_array(
        json_build_object('date', '2025-07-20', 'price', 150),
        json_build_object('date', '2025-07-21', 'price', 150),
        json_build_object('date', '2025-07-22', 'price', 150)
      ),
      0,
      0
    ),
    -- Tropical Island Bungalow
    (
      host_id,
      'Tropical Island Bungalow',
      'Paradise found in this beachfront bungalow. Features traditional island architecture with modern comforts. Includes private beach access, outdoor shower, and hammock deck.',
      'Maui, Hawaii',
      'house',
      180,
      300,
      3,
      2,
      1,
      3,
      ARRAY[
        'https://images.pexels.com/photos/53610/large-home-residential-house-architecture-53610.jpeg',
        'https://images.pexels.com/photos/53611/pexels-photo-53611.jpeg',
        'https://images.pexels.com/photos/53612/pexels-photo-53612.jpeg',
        'https://images.pexels.com/photos/53613/pexels-photo-53613.jpeg'
      ],
      json_build_array(
        json_build_object('date', '2025-07-25', 'price', 180),
        json_build_object('date', '2025-07-26', 'price', 180),
        json_build_object('date', '2025-07-27', 'price', 180)
      ),
      0,
      0
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;