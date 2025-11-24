-- Update an existing event to be a private after
UPDATE events 
SET 
  is_private_after = true,
  public_location_label = 'Private after - Center Belgrade',
  full_address = 'Kneza Miloša 12, Beograd 11000
Apartment 7, 3rd Floor
Buzzer: After Party',
  after_instructions = 'Ring buzzer "After Party" when you arrive. Come to 3rd floor, door on the right. Bring good vibes! 🎉

IMPORTANT: Keep this address private and do not share publicly.'
WHERE id = '1a6f72a4-27bb-4af3-8276-682ee2501fe2';

-- Add a demo review for the current user so they can request access
INSERT INTO event_reviews (user_id, event_id, rating, comment)
VALUES (
  '62eed572-fcba-4005-a760-45c2a2d81aa6',
  '599fc2ae-22d1-4123-98b8-fbc9f80dc544',
  5,
  'Amazing night! Great atmosphere and music. Definitely coming back!'
)
ON CONFLICT DO NOTHING;