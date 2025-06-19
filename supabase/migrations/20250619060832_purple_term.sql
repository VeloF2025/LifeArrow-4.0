/*
  # Fix client profiles migration

  1. New Tables
    - Ensures `client_profiles` table exists with all required columns
  
  2. Security
    - Enables RLS on `client_profiles` table
    - Adds policies for practitioners and users, with existence checks
  
  3. Changes
    - Added checks to prevent duplicate policy errors
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

-- Create policies with existence checks to prevent duplicates
DO $$
BEGIN
  -- Check if "Practitioners can read client profiles" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'client_profiles' 
    AND policyname = 'Practitioners can read client profiles'
  ) THEN
    CREATE POLICY "Practitioners can read client profiles"
      ON client_profiles
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() AND u.role = 'practitioner'
      ));
  END IF;

  -- Check if "Practitioners can update client profiles" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'client_profiles' 
    AND policyname = 'Practitioners can update client profiles'
  ) THEN
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
  END IF;

  -- Check if "Users can manage their own profile" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'client_profiles' 
    AND policyname = 'Users can manage their own profile'
  ) THEN
    CREATE POLICY "Users can manage their own profile"
      ON client_profiles
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;