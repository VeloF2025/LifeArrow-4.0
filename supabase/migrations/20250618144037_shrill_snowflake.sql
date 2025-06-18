/*
  # Fix RLS Policy Issues

  This migration fixes the infinite recursion error in the users table policy
  and the INSERT policy violation for the client_profiles table.

  ## Changes Made

  1. **Users Table Policies**
     - Remove problematic policies that cause infinite recursion
     - Create simplified, safe policies for authenticated users
     - Ensure practitioners can read client data without circular references

  2. **Client Profiles Table Policies**
     - Fix INSERT policy to allow users to create their own profiles
     - Ensure proper permissions for profile creation

  ## Security
     - All policies maintain proper security boundaries
     - Users can only access their own data or data they're authorized to see
     - Practitioners maintain appropriate access to client information
*/

-- First, drop all existing policies for users table to avoid conflicts
DROP POLICY IF EXISTS "Practitioners can read client data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create new, simplified policies for users table
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

-- Create a separate policy for practitioners to read client data
-- This avoids the infinite recursion by not referencing the users table within the policy
CREATE POLICY "Practitioners can read client data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if user is reading their own data
    auth.uid() = id 
    OR 
    -- Allow if the authenticated user is a practitioner and the target user is a client
    (
      EXISTS (
        SELECT 1 FROM auth.users au 
        WHERE au.id = auth.uid() 
        AND au.raw_user_meta_data->>'role' = 'practitioner'
      )
      AND role = 'client'
    )
  );

-- Fix client_profiles policies
DROP POLICY IF EXISTS "Practitioners can read client profiles" ON client_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON client_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON client_profiles;

-- Create new policies for client_profiles
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
    -- Allow if user owns the profile
    auth.uid() = user_id
    OR
    -- Allow if authenticated user is a practitioner
    EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.raw_user_meta_data->>'role' = 'practitioner'
    )
  );

CREATE POLICY "Practitioners can update client profiles"
  ON client_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow if user owns the profile
    auth.uid() = user_id
    OR
    -- Allow if authenticated user is a practitioner
    EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.raw_user_meta_data->>'role' = 'practitioner'
    )
  )
  WITH CHECK (
    -- Allow if user owns the profile
    auth.uid() = user_id
    OR
    -- Allow if authenticated user is a practitioner
    EXISTS (
      SELECT 1 FROM auth.users au 
      WHERE au.id = auth.uid() 
      AND au.raw_user_meta_data->>'role' = 'practitioner'
    )
  );