/*
  # Create staff table

  1. New Tables
    - `staff`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `specializations` (text[])
      - `qualifications` (text[])
      - `license_number` (text)
      - `years_of_experience` (integer)
      - `assigned_centres` (uuid[])
      - `primary_centre` (uuid)
      - `available_services` (uuid[])
      - `working_hours` (jsonb)
      - `status` (text)
      - `is_available_for_booking` (boolean)
      - `max_daily_appointments` (integer)
      - `appointment_duration` (integer)
      - `join_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `staff` table
    - Add policy for practitioners to manage staff
    - Add policy for all users to read active staff
*/

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text,
  specializations text[] DEFAULT '{}',
  qualifications text[] DEFAULT '{}',
  license_number text,
  years_of_experience integer DEFAULT 0,
  assigned_centres uuid[] DEFAULT '{}',
  primary_centre uuid REFERENCES treatment_centres(id),
  available_services uuid[] DEFAULT '{}',
  working_hours jsonb DEFAULT '{}',
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'on-leave')),
  is_available_for_booking boolean DEFAULT true,
  max_daily_appointments integer DEFAULT 10,
  appointment_duration integer DEFAULT 60,
  join_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on user_id
CREATE INDEX staff_user_id_idx ON staff(user_id);

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Practitioners can manage staff"
  ON staff
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'practitioner'
  );

CREATE POLICY "All users can read active staff"
  ON staff
  FOR SELECT
  USING (
    status = 'active'
  );

CREATE POLICY "Staff can read/update their own record"
  ON staff
  FOR ALL
  USING (
    auth.uid() = user_id
  );