/*
  # Create client profiles table

  1. New Tables
    - `client_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - Various profile fields (title, preferred_name, date_of_birth, etc.)
      - Medical and emergency contact information
      - Wellness metrics
  2. Security
    - Enable RLS on `client_profiles` table
    - Add policy for users to read their own profile
    - Add policy for practitioners to read client profiles
    - Add policy for users to update their own profile
*/

CREATE TABLE IF NOT EXISTS client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  preferred_name text,
  date_of_birth date,
  gender text,
  id_passport_number text,
  physical_address text,
  postal_address text,
  preferred_contact_method text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  medical_aid_scheme text,
  medical_aid_plan text,
  medical_aid_number text,
  main_member_name text,
  main_member_id text,
  medical_history text[],
  wellness_score integer DEFAULT 70,
  last_scan_date timestamptz,
  status text DEFAULT 'active',
  join_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Foreign key to users table
ALTER TABLE client_profiles ADD CONSTRAINT client_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index on user_id for faster lookups
CREATE INDEX client_profiles_user_id_idx ON client_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own profile"
  ON client_profiles
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Practitioners can read client profiles"
  ON client_profiles
  FOR SELECT
  TO public
  USING ((SELECT users.role FROM users WHERE users.id = auth.uid()) = 'practitioner');

CREATE POLICY "Users can update their own profile"
  ON client_profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id);