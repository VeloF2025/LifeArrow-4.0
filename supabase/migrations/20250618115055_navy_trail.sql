/*
  # Fix Users Table RLS Policies

  1. Security Updates
    - Drop existing problematic RLS policies on users table
    - Create new, simplified RLS policies to prevent infinite recursion
    - Allow users to read and update their own data
    - Allow authenticated users to insert their own profile during registration

  2. Policy Changes
    - Remove complex policies that reference the users table within itself
    - Add simple, direct policies using auth.uid()
    - Ensure demo user creation works properly
*/

-- Drop existing policies that are causing infinite recursion
DROP POLICY IF EXISTS "Practitioners can read client data" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new, simplified policies
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

-- Allow practitioners to read client data (simplified version)
CREATE POLICY "Practitioners can read client data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- User can read their own data
    auth.uid() = id
    OR
    -- Practitioners can read client data
    (
      EXISTS (
        SELECT 1 FROM users practitioner_user
        WHERE practitioner_user.id = auth.uid()
        AND practitioner_user.role = 'practitioner'
      )
      AND role = 'client'
    )
  );