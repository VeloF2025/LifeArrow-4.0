/*
  # Create videos table

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `unique_id` (text, unique)
      - `title` (text)
      - `description` (text)
      - `url` (text)
      - `thumbnail_url` (text)
      - `duration` (integer)
      - `category` (text)
      - `tags` (text[])
      - `upload_date` (timestamptz)
      - `uploaded_by` (uuid)
      - `is_public` (boolean)
      - `status` (text)
      - `playback_conditions` (jsonb)
      - `metadata` (jsonb)
  2. Security
    - Enable RLS on `videos` table
    - Add policy for practitioners to manage videos
    - Add policy for all users to read public videos
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  url text NOT NULL,
  thumbnail_url text,
  duration integer,
  category text NOT NULL CHECK (category IN ('tutorial', 'educational', 'exercise', 'nutrition', 'wellness', 'testimonial', 'marketing', 'other')),
  tags text[] DEFAULT '{}',
  upload_date timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users(id),
  is_public boolean DEFAULT true,
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'processing')),
  playback_conditions jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}'
);

-- Create indexes
CREATE INDEX videos_unique_id_idx ON videos(unique_id);
CREATE INDEX videos_category_idx ON videos(category);
CREATE INDEX videos_upload_date_idx ON videos(upload_date);
CREATE INDEX videos_uploaded_by_idx ON videos(uploaded_by);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Practitioners can manage videos"
  ON videos
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'practitioner'
  );

CREATE POLICY "All users can read public videos"
  ON videos
  FOR SELECT
  USING (
    is_public = true AND status = 'active'
  );

CREATE POLICY "Users can read videos they uploaded"
  ON videos
  FOR SELECT
  USING (
    auth.uid() = uploaded_by
  );