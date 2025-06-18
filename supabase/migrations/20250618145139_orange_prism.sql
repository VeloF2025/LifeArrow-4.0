/*
  # Fix RLS Policies

  1. Changes
     - Fix infinite recursion in users table policies
     - Add proper RLS policies for client_profiles table
     - Drop and recreate problematic policies
  
  2. Security
     - Ensure proper access control for all tables
     - Fix policy recursion issues
     - Enable proper authentication flows
*/

-- First, drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Practitioners can read client data" ON public.users;
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;

-- Create new policies for users table that avoid recursion
CREATE POLICY "Users can read their own data" 
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Practitioners can read all users" 
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'practitioner' OR
    auth.uid() = id
  );

-- Fix client_profiles policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.client_profiles;
DROP POLICY IF EXISTS "Practitioners can read client profiles" ON public.client_profiles;

-- Create new policies for client_profiles
CREATE POLICY "Users can manage their own profile"
  ON public.client_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Practitioners can read client profiles"
  ON public.client_profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'practitioner'
  );

-- Fix treatment_centres policies (check if they exist first)
DROP POLICY IF EXISTS "All users can read active treatment centres" ON public.treatment_centres;
DROP POLICY IF EXISTS "Practitioners can manage treatment centres" ON public.treatment_centres;

-- Recreate treatment_centres policies
CREATE POLICY "All users can read active treatment centres"
  ON public.treatment_centres
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Practitioners can manage treatment centres"
  ON public.treatment_centres
  FOR ALL
  TO public
  USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'practitioner'
  );

-- Add policy for inserting into client_profiles during registration
CREATE POLICY "Service role can manage client profiles"
  ON public.client_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);