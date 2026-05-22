-- Update beard trim price to $10
UPDATE services
SET price = 10.00, updated_at = now()
WHERE name ILIKE '%beard trim%';
