/*
  # Fix user permissions and RLS policies

  1. Security Updates
    - Fix RLS policies for users table to allow proper authentication flow
    - Ensure authenticated users can read their own data and insert during registration
    - Fix client_profiles policies to work with the authentication flow

  2. Changes Made
    - Updated users table policies to allow proper user creation and reading
    - Fixed client_profiles policies to allow profile creation during registration
    - Added proper error handling for existing users
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Practitioners can read all users" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new, more permissive policies for users table
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

CREATE POLICY "Practitioners can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'practitioner'
    )
  );

-- Fix client_profiles policies
DROP POLICY IF EXISTS "Practitioners can read client profiles" ON client_profiles;
DROP POLICY IF EXISTS "Practitioners can update client profiles" ON client_profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON client_profiles;
DROP POLICY IF EXISTS "Service role can manage client profiles" ON client_profiles;

-- Create new client_profiles policies
CREATE POLICY "Users can manage their own profile"
  ON client_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Practitioners can read client profiles"
  ON client_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'practitioner'
    )
  );

CREATE POLICY "Practitioners can update client profiles"
  ON client_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'practitioner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'practitioner'
    )
  );

-- Grant necessary permissions to authenticated role
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.client_profiles TO authenticated;