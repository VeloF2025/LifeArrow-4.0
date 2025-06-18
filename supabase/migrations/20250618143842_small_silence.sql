/*
  # Treatment Centres Table and Policies

  1. New Tables
    - `treatment_centres` - Stores information about treatment locations
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - And many other fields for contact, location, and operational details
  
  2. Security
    - Enable RLS on `treatment_centres` table
    - Add policies for reading active centres and practitioner management
*/

-- Create treatment centres table if it doesn't exist
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

-- Enable Row Level Security
ALTER TABLE treatment_centres ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DO $$ 
BEGIN
  -- Check and drop the first policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'treatment_centres' 
    AND policyname = 'All users can read active treatment centres'
  ) THEN
    DROP POLICY "All users can read active treatment centres" ON treatment_centres;
  END IF;
  
  -- Check and drop the second policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'treatment_centres' 
    AND policyname = 'Practitioners can manage treatment centres'
  ) THEN
    DROP POLICY "Practitioners can manage treatment centres" ON treatment_centres;
  END IF;
END $$;

-- Create policies
CREATE POLICY "All users can read active treatment centres"
  ON treatment_centres
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Practitioners can manage treatment centres"
  ON treatment_centres
  FOR ALL
  TO public
  USING ((SELECT users.role FROM users WHERE users.id = auth.uid()) = 'practitioner');