/*
  # Create client goals table

  1. New Tables
    - `client_goals`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to client_profiles)
      - Goal details (title, description, target values, etc.)
      - Progress tracking fields
  2. Security
    - Enable RLS on `client_goals` table
    - Add policies for users to read and update their own goals
    - Add policies for practitioners to read and update client goals
*/

CREATE TABLE IF NOT EXISTS client_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  target_value numeric,
  current_value numeric DEFAULT 0,
  unit text,
  category text,
  deadline date,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT client_goals_category_check CHECK (category = ANY (ARRAY['exercise'::text, 'nutrition'::text, 'lifestyle'::text, 'body-composition'::text]))
);

-- Foreign key to client_profiles table
ALTER TABLE client_goals ADD CONSTRAINT client_goals_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES client_profiles(id) ON DELETE CASCADE;

-- Create index on client_id for faster lookups
CREATE INDEX client_goals_client_id_idx ON client_goals(client_id);

-- Enable Row Level Security
ALTER TABLE client_goals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own goals"
  ON client_goals
  FOR SELECT
  TO public
  USING (auth.uid() = (SELECT client_profiles.user_id FROM client_profiles WHERE client_profiles.id = client_goals.client_id));

CREATE POLICY "Users can update their own goals"
  ON client_goals
  FOR UPDATE
  TO public
  USING (auth.uid() = (SELECT client_profiles.user_id FROM client_profiles WHERE client_profiles.id = client_goals.client_id));

CREATE POLICY "Practitioners can read client goals"
  ON client_goals
  FOR SELECT
  TO public
  USING ((SELECT users.role FROM users WHERE users.id = auth.uid()) = 'practitioner');

CREATE POLICY "Practitioners can update client goals"
  ON client_goals
  FOR UPDATE
  TO public
  USING ((SELECT users.role FROM users WHERE users.id = auth.uid()) = 'practitioner');