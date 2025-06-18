/*
  # Create appointments table

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to users)
      - `practitioner_id` (uuid, foreign key to users)
      - `client_name` (text)
      - `client_email` (text)
      - `client_phone` (text)
      - `practitioner_name` (text)
      - `date` (date)
      - `start_time` (text)
      - `end_time` (text)
      - `duration` (integer)
      - `service_type` (text)
      - `service_description` (text)
      - `status` (text)
      - `location` (text)
      - `meeting_link` (text)
      - `centre_id` (uuid)
      - `centre_name` (text)
      - `notes` (text)
      - `practitioner_notes` (text)
      - `price` (numeric)
      - `payment_status` (text)
      - `reminder_sent` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `appointments` table
    - Add policy for users to read their own appointments
    - Add policy for practitioners to manage appointments
*/

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practitioner_id uuid NOT NULL REFERENCES users(id),
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  client_avatar text,
  practitioner_name text NOT NULL,
  date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  duration integer NOT NULL,
  service_type text NOT NULL,
  service_description text,
  status text NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')),
  location text NOT NULL CHECK (location IN ('in-person', 'virtual')),
  meeting_link text,
  centre_id uuid REFERENCES treatment_centres(id),
  centre_name text,
  notes text,
  practitioner_notes text,
  price numeric NOT NULL,
  payment_status text NOT NULL CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX appointments_client_id_idx ON appointments(client_id);
CREATE INDEX appointments_practitioner_id_idx ON appointments(practitioner_id);
CREATE INDEX appointments_date_idx ON appointments(date);
CREATE INDEX appointments_status_idx ON appointments(status);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own appointments"
  ON appointments
  FOR SELECT
  USING (
    auth.uid() = client_id
  );

CREATE POLICY "Practitioners can manage all appointments"
  ON appointments
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'practitioner'
  );

CREATE POLICY "Users can update their own appointments"
  ON appointments
  FOR UPDATE
  USING (
    auth.uid() = client_id AND
    status IN ('scheduled', 'confirmed')
  );