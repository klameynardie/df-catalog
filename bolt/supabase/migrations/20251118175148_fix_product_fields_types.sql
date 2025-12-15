/*
  # Fix Product Fields Data Types

  1. Modifications
    - Change `weight` column from numeric to text
    - Change `materials` column from array to text

  2. Purpose
    - Weight needs to include units (e.g., "4.5 kg") so text is more appropriate
    - Materials should be a simple text field for easier input
*/

DO $$
BEGIN
  ALTER TABLE products ALTER COLUMN weight TYPE text USING weight::text;
  ALTER TABLE products ALTER COLUMN materials TYPE text USING array_to_string(materials, ', ');
END $$;
