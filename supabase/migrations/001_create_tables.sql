-- Create weekly_hours table
CREATE TABLE IF NOT EXISTS weekly_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_closed BOOLEAN NOT NULL DEFAULT false,
  open_time TIME,
  close_time TIME,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create hour_exceptions table
CREATE TABLE IF NOT EXISTS hour_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('closed', 'modified')),
  open_time TIME,
  close_time TIME,
  label TEXT NOT NULL,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hour_exceptions_date ON hour_exceptions(date);
CREATE INDEX IF NOT EXISTS idx_weekly_hours_day ON weekly_hours(day_of_week);

-- Insert default weekly hours
INSERT INTO weekly_hours (day_of_week, is_closed, open_time, close_time) VALUES
  (0, true, NULL, NULL),           -- Sunday: Closed
  (1, false, '09:00:00', '17:00:00'), -- Monday
  (2, false, '09:00:00', '17:00:00'), -- Tuesday
  (3, false, '09:00:00', '17:00:00'), -- Wednesday
  (4, false, '09:00:00', '17:00:00'), -- Thursday
  (5, false, '09:00:00', '17:00:00'), -- Friday
  (6, false, '07:00:00', '12:00:00')  -- Saturday
ON CONFLICT (day_of_week) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE weekly_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE hour_exceptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weekly_hours
-- Allow anyone to read (for public website)
CREATE POLICY "Allow public read access on weekly_hours" ON weekly_hours
  FOR SELECT
  USING (true);

-- Allow authenticated users to update/insert
CREATE POLICY "Allow authenticated insert on weekly_hours" ON weekly_hours
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on weekly_hours" ON weekly_hours
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for hour_exceptions
-- Allow anyone to read (for public website)
CREATE POLICY "Allow public read access on hour_exceptions" ON hour_exceptions
  FOR SELECT
  USING (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated insert on hour_exceptions" ON hour_exceptions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on hour_exceptions" ON hour_exceptions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on hour_exceptions" ON hour_exceptions
  FOR DELETE
  TO authenticated
  USING (true);

