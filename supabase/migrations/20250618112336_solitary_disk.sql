/*
  # Create scans table

  1. New Tables
    - `scans`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to users)
      - `client_name` (text)
      - `scan_date` (timestamptz)
      - `centre_name` (text)
      - `consultant_name` (text)
      - `body_wellness_score` (integer)
      - `scan_type` (text)
      - `file_path` (text)
      - `file_format` (text)
      - `file_url` (text)
      - `metadata` (jsonb)
      - `detailed_results` (jsonb)
      - `recommendations` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `scans` table
    - Add policy for users to read their own scans
    - Add policy for practitioners to manage scans
*/

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  scan_date timestamptz NOT NULL,
  centre_name text NOT NULL,
  consultant_name text NOT NULL,
  body_wellness_score integer NOT NULL,
  scan_type text NOT NULL,
  file_path text,
  file_format text,
  file_url text,
  metadata jsonb DEFAULT '{}',
  detailed_results jsonb DEFAULT '{}',
  recommendations text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX scans_client_id_idx ON scans(client_id);
CREATE INDEX scans_scan_date_idx ON scans(scan_date);
CREATE INDEX scans_scan_type_idx ON scans(scan_type);

-- Enable Row Level Security
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own scans"
  ON scans
  FOR SELECT
  USING (
    auth.uid() = client_id
  );

CREATE POLICY "Practitioners can manage all scans"
  ON scans
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'practitioner'
  );