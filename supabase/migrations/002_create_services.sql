-- Create services table for pricing management
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  icon TEXT NOT NULL DEFAULT 'scissors',
  accent_color TEXT NOT NULL DEFAULT 'red',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_services_order ON services(display_order);

-- Insert default services
INSERT INTO services (name, description, price, icon, accent_color, display_order) VALUES
  ('Haircut', 'Classic haircut tailored to your style. Includes consultation, cut, and styling.', 10.00, 'scissors', 'red', 1),
  ('Beard Trim', 'Professional beard shaping and trimming. Keep your facial hair looking sharp.', 8.00, 'user', 'blue', 2),
  ('Senior Haircut', 'Quality haircut for our valued senior customers (65+). Same great service.', 9.00, 'userCheck', 'red', 3)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services
-- Allow anyone to read (for public website)
CREATE POLICY "Allow public read access on services" ON services
  FOR SELECT
  USING (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated insert on services" ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on services" ON services
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on services" ON services
  FOR DELETE
  TO authenticated
  USING (true);

