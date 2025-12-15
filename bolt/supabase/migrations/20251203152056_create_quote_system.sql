/*
  # Create Quote Request System

  1. New Tables
    - `quote_requests`
      - `id` (uuid, primary key)
      - `customer_name` (text, required) - Name of the customer
      - `customer_email` (text, required) - Email of the customer
      - `customer_phone` (text, optional) - Phone number
      - `customer_message` (text, optional) - Additional message from customer
      - `status` (text, default 'pending') - Status: pending, processing, completed, cancelled
      - `created_at` (timestamptz) - When the quote was requested
      - `updated_at` (timestamptz) - Last update time
      
    - `quote_request_items`
      - `id` (uuid, primary key)
      - `quote_request_id` (uuid, foreign key) - Reference to quote_requests
      - `product_id` (uuid, foreign key) - Reference to products
      - `quantity` (integer, default 1) - Quantity of the product
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public can insert quote requests (for form submission)
    - No public read access (admin only through dashboard)
*/

-- Create quote_requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quote_request_items table
CREATE TABLE IF NOT EXISTS quote_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id uuid NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_request_items ENABLE ROW LEVEL SECURITY;

-- Policies for quote_requests (allow anyone to insert for form submissions)
CREATE POLICY "Anyone can create quote requests"
  ON quote_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policies for quote_request_items (allow insertion with quote request)
CREATE POLICY "Anyone can create quote request items"
  ON quote_request_items
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_quote_request_items_quote_id ON quote_request_items(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at DESC);