/*
  # Remove Price Column from Products

  1. Modifications
    - Remove `price` column from products table
    - This is safe as pricing is not needed for the catalog

  2. Notes
    - No data loss concerns as this is sample data
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price'
  ) THEN
    ALTER TABLE products DROP COLUMN price;
  END IF;
END $$;