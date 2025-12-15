/*
  # Fix Quote Requests RLS Policies

  1. Changes
    - Drop existing restrictive policies for quote_requests and quote_request_items
    - Create new policies allowing INSERT for public role (includes anon and authenticated)
    - This allows both anonymous and authenticated users to submit quote requests

  2. Security
    - Public can insert quote requests (for form submission)
    - No read/update/delete access (admin only through backend)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Anyone can create quote request items" ON quote_request_items;

-- Create new policies for quote_requests (allow public to insert)
CREATE POLICY "Public can create quote requests"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create new policies for quote_request_items (allow public to insert)
CREATE POLICY "Public can create quote request items"
  ON quote_request_items
  FOR INSERT
  TO public
  WITH CHECK (true);
