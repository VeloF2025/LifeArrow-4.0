/*
  # Create treatment centres table

  1. New Tables
    - `treatment_centres`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - Location and contact details
      - Operating information
      - Capacity and status fields
  2. Security
    - Enable RLS on `treatment_centres` table
    - Add policy for all users to read active centres
    - Add policy for practitioners to manage centres
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

-- Foreign key to users table for created_by
ALTER TABLE treatment_centres ADD CONSTRAINT treatment_centres_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES users(id);

-- Enable Row Level Security
ALTER TABLE treatment_centres ENABLE ROW LEVEL SECURITY;

-- Policies
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