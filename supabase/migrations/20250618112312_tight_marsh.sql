/*
  # Create treatment centres table

  1. New Tables
    - `treatment_centres`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text)
      - `description` (text)
      - `country_code` (text)
      - `country_name` (text)
      - `city` (text)
      - `address` (jsonb)
      - `coordinates` (jsonb)
      - `phone` (text)
      - `email` (text)
      - `website` (text)
      - `timezone` (text)
      - `working_hours` (jsonb)
      - `services` (uuid[])
      - `capacity` (jsonb)
      - `status` (text)
      - `is_headquarters` (boolean)
      - `features` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid)
  2. Security
    - Enable RLS on `treatment_centres` table
    - Add policy for practitioners to manage centres
    - Add policy for all users to read active centres
*/

-- Create treatment centres table
CREATE TABLE IF NOT EXISTS treatment_centres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
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
  services uuid[] DEFAULT '{}',
  capacity jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'maintenance')),
  is_headquarters boolean DEFAULT false,
  features text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

-- Enable Row Level Security
ALTER TABLE treatment_centres ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Practitioners can manage treatment centres"
  ON treatment_centres
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'practitioner'
  );

CREATE POLICY "All users can read active treatment centres"
  ON treatment_centres
  FOR SELECT
  USING (
    status = 'active'
  );