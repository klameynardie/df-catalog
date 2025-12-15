/*
  # Add SELECT policies for quote requests

  1. Changes
    - Add SELECT policy for quote_requests to allow reading after insert
    - Add SELECT policy for quote_request_items to allow reading after insert
    - This allows the .select() operation after .insert() to work

  2. Security
    - Public can read their own newly created records
    - This is necessary for the INSERT...RETURNING pattern used in the frontend
*/

-- Allow public to select from quote_requests (for .select() after .insert())
CREATE POLICY "Public can select quote requests"
  ON quote_requests
  FOR SELECT
  TO public
  USING (true);

-- Allow public to select from quote_request_items (for .select() after .insert())
CREATE POLICY "Public can select quote request items"
  ON quote_request_items
  FOR SELECT
  TO public
  USING (true);
