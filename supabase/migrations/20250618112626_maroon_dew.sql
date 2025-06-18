/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `role` (text, either 'practitioner' or 'client')
      - `avatar` (text, nullable)
      - `phone` (text, nullable)
      - `created_at` (timestamp with time zone)
      - `onboarding_completed` (boolean)
      - `has_seen_intro_video` (boolean)
  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for practitioners to read client data
    - Add policy for users to update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL,
  avatar text,
  phone text,
  created_at timestamptz DEFAULT now(),
  onboarding_completed boolean DEFAULT false,
  has_seen_intro_video boolean DEFAULT false,
  CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['practitioner'::text, 'client'::text]))
);

-- Link to auth.users
ALTER TABLE users ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Practitioners can read client data"
  ON users
  FOR SELECT
  TO public
  USING (((SELECT users_1.role FROM users users_1 WHERE (users_1.id = auth.uid())) = 'practitioner') AND (role = 'client'));

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO public
  USING (auth.uid() = id);