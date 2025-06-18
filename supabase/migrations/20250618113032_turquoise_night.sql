/*
  # Treatment Centres Table Creation

  1. New Tables
    - `treatment_centres` - Stores information about wellness treatment locations
      - Basic information (name, code, description)
      - Location details (country, city, address, coordinates)
      - Contact information (phone, email, website)
      - Operational details (timezone, working hours, services)
      - Capacity information (rooms, appointment limits)
      - Status and features

  2. Security
    - Enables Row Level Security
    - Note: Policies are not created in this migration as they already exist
*/

CREATE TABLE IF NOT EXISTS treatment_centres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  country_code text NOT NULL,
  country_name text NOT NULL,
  city text NOT NULL,
  address jsonb NOT NULL,
  coordinates jsonb,
  phone text NOT NULL,
  email text NOT NULL,
  website text,
  timezone text NOT NULL,
  working_hours jsonb NOT NULL,
  services uuid[] DEFAULT '{}'::uuid[],
  capacity jsonb NOT NULL,
  status text NOT NULL,
  is_headquarters boolean DEFAULT false,
  features text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  CONSTRAINT treatment_centres_status_check CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'maintenance'::text]))
);

-- Enable Row Level Security if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'treatment_centres' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE treatment_centres ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;