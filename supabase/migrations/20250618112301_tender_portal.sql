/*
  # Create client goals table

  1. New Tables
    - `client_goals`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to client_profiles)
      - `title` (text)
      - `description` (text)
      - `target_value` (numeric)
      - `current_value` (numeric)
      - `unit` (text)
      - `category` (text)
      - `deadline` (date)
      - `completed` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `client_goals` table
    - Add policy for users to read/update their own goals
    - Add policy for practitioners to read/update client goals
*/

-- Create client goals table
CREATE TABLE IF NOT EXISTS client_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_value numeric,
  current_value numeric DEFAULT 0,
  unit text,
  category text CHECK (category IN ('exercise', 'nutrition', 'lifestyle', 'body-composition')),
  deadline date,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on client_id
CREATE INDEX client_goals_client_id_idx ON client_goals(client_id);

-- Enable Row Level Security
ALTER TABLE client_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own goals"
  ON client_goals
  FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM client_profiles WHERE id = client_id)
  );

CREATE POLICY "Users can update their own goals"
  ON client_goals
  FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM client_profiles WHERE id = client_id)
  );

CREATE POLICY "Practitioners can read client goals"
  ON client_goals
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'practitioner'
  );

CREATE POLICY "Practitioners can update client goals"
  ON client_goals
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'practitioner'
  );