/*
  # Create currencies table

  1. New Tables
    - `currencies`
      - `code` (text, primary key)
      - `name` (text)
      - `symbol` (text)
      - `symbol_position` (text)
      - `decimal_places` (integer)
      - `thousands_separator` (text)
      - `decimal_separator` (text)
      - `exchange_rate` (numeric)
      - `is_active` (boolean)
      - `is_default` (boolean)
  2. Security
    - Enable RLS on `currencies` table
    - Add policy for practitioners to manage currencies
    - Add policy for all users to read currencies
*/

-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
  code text PRIMARY KEY,
  name text NOT NULL,
  symbol text NOT NULL,
  symbol_position text NOT NULL CHECK (symbol_position IN ('before', 'after')),
  decimal_places integer NOT NULL,
  thousands_separator text NOT NULL,
  decimal_separator text NOT NULL,
  exchange_rate numeric NOT NULL,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Practitioners can manage currencies"
  ON currencies
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'practitioner'
  );

CREATE POLICY "All users can read currencies"
  ON currencies
  FOR SELECT
  USING (true);

-- Insert default currencies
INSERT INTO currencies (code, name, symbol, symbol_position, decimal_places, thousands_separator, decimal_separator, exchange_rate, is_active, is_default)
VALUES 
  ('ZAR', 'South African Rand', 'R', 'before', 2, ' ', '.', 1.0, true, true),
  ('USD', 'US Dollar', '$', 'before', 2, ',', '.', 0.054, true, false),
  ('EUR', 'Euro', '€', 'before', 2, ' ', ',', 0.049, true, false),
  ('GBP', 'British Pound', '£', 'before', 2, ',', '.', 0.043, true, false)
ON CONFLICT (code) DO NOTHING;