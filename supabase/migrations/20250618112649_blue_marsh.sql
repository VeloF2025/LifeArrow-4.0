/*
  # Create services table

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `duration` (integer, minutes)
      - `price` (numeric)
      - `category` (text)
      - `is_active` (boolean)
      - Timestamps and created_by fields
  2. Security
    - Enable RLS on `services` table
    - Add policy for all users to read active services
    - Add policy for practitioners to manage services
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  duration integer NOT NULL,
  price numeric NOT NULL,
  category text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  CONSTRAINT services_category_check CHECK (category = ANY (ARRAY['consultation'::text, 'scan'::text, 'therapy'::text, 'assessment'::text]))
);

-- Foreign key to users table for created_by
ALTER TABLE services ADD CONSTRAINT services_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES users(id);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "All users can read active services"
  ON services
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Practitioners can manage services"
  ON services
  FOR ALL
  TO public
  USING ((SELECT users.role FROM users WHERE users.id = auth.uid()) = 'practitioner');