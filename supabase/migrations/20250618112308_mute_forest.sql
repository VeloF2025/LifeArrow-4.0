/*
  # Create services table

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `duration` (integer)
      - `price` (numeric)
      - `category` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid)
  2. Security
    - Enable RLS on `services` table
    - Add policy for practitioners to manage services
    - Add policy for all users to read active services
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  duration integer NOT NULL,
  price numeric NOT NULL,
  category text NOT NULL CHECK (category IN ('consultation', 'scan', 'therapy', 'assessment')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Practitioners can manage services"
  ON services
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'practitioner'
  );

CREATE POLICY "All users can read active services"
  ON services
  FOR SELECT
  USING (
    is_active = true
  );