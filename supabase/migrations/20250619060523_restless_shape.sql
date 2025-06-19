/*
  # Create users table and RLS policies

  1. New Tables
    - `users` - Stores user profile information
      - `id` (uuid, primary key) - References auth.users.id
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `role` (text) - Either 'practitioner' or 'client'
      - `avatar` (text, nullable)
      - `phone` (text, nullable)
      - `created_at` (timestamptz, default: now())
      - `onboarding_completed` (boolean, default: false)
      - `has_seen_intro_video` (boolean, default: false)
  
  2. Security
    - Enable RLS on `users` table
    - Add policies for:
      - Practitioners can read all users
      - Users can read their own data
      - Users can insert their own data
      - Users can update their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
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
CREATE POLICY "Practitioners can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.role = 'practitioner'
  ));

CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);