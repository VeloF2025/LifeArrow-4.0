/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `role` (text)
      - `avatar` (text)
      - `phone` (text)
      - `created_at` (timestamp)
      - `onboarding_completed` (boolean)
      - `has_seen_intro_video` (boolean)
  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read/update their own data
    - Add policy for practitioners to read client data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('practitioner', 'client')),
  avatar text,
  phone text,
  created_at timestamptz DEFAULT now(),
  onboarding_completed boolean DEFAULT false,
  has_seen_intro_video boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Practitioners can read client data"
  ON users
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'practitioner'
    AND role = 'client'
  );