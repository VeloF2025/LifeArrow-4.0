/*
  # Create client profiles table

  1. New Tables
    - `client_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `preferred_name` (text)
      - `date_of_birth` (date)
      - `gender` (text)
      - `id_passport_number` (text)
      - `physical_address` (text)
      - `postal_address` (text)
      - `preferred_contact_method` (text)
      - `emergency_contact_name` (text)
      - `emergency_contact_phone` (text)
      - `emergency_contact_relationship` (text)
      - `medical_aid_scheme` (text)
      - `medical_aid_plan` (text)
      - `medical_aid_number` (text)
      - `main_member_name` (text)
      - `main_member_id` (text)
      - `medical_history` (text[])
      - `wellness_score` (integer)
      - `last_scan_date` (timestamptz)
      - `status` (text)
      - `join_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `client_profiles` table
    - Add policy for users to read/update their own profile
    - Add policy for practitioners to read client profiles
*/

-- Create client profiles table
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

-- Create index on user_id
CREATE INDEX client_profiles_user_id_idx ON client_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own profile"
  ON client_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON client_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Practitioners can read client profiles"
  ON client_profiles
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'practitioner'
  );