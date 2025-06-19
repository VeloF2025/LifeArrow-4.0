/*
  # Create client profiles table and RLS policies

  1. New Tables
    - `client_profiles` - Stores detailed client information
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References users.id
      - `title` (text, nullable)
      - `preferred_name` (text, nullable)
      - `date_of_birth` (date, nullable)
      - `gender` (text, nullable)
      - `id_passport_number` (text, nullable)
      - `physical_address` (text, nullable)
      - `postal_address` (text, nullable)
      - `preferred_contact_method` (text, nullable)
      - `emergency_contact_name` (text, nullable)
      - `emergency_contact_phone` (text, nullable)
      - `emergency_contact_relationship` (text, nullable)
      - `medical_aid_scheme` (text, nullable)
      - `medical_aid_plan` (text, nullable)
      - `medical_aid_number` (text, nullable)
      - `main_member_name` (text, nullable)
      - `main_member_id` (text, nullable)
      - `medical_history` (text[], nullable)
      - `wellness_score` (integer, default: 70)
      - `last_scan_date` (timestamptz, nullable)
      - `status` (text, default: 'active')
      - `join_date` (timestamptz, default: now())
      - `created_at` (timestamptz, default: now())
      - `updated_at` (timestamptz, default: now())
  
  2. Security
    - Enable RLS on `client_profiles` table
    - Add policies for:
      - Practitioners can read client profiles
      - Practitioners can update client profiles
      - Users can manage their own profile
*/

-- Create client_profiles table
CREATE TABLE IF NOT EXISTS client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS client_profiles_user_id_idx ON client_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Practitioners can read client profiles"
  ON client_profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.role = 'practitioner'
  ));

CREATE POLICY "Practitioners can update client profiles"
  ON client_profiles
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.role = 'practitioner'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.role = 'practitioner'
  ));

CREATE POLICY "Users can manage their own profile"
  ON client_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);