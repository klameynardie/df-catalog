/*
  # Add Product Detail Fields

  1. Modifications
    - Add `dimensions` column to products table (text)
    - Add `weight` column to products table (text)
    - Add `materials` column to products table (text)
    - Add `additional_info` column to products table (text)
    - Add `ambient_images` column to products table (text array)
    - Add `product_image` column to products table (text)
    - Add `diagrams` column to products table (text array)

  2. Purpose
    - These fields enable comprehensive product detail pages with all necessary information
    - Ambient images show the product in real-world settings
    - Product image is a dedicated clean photo or 3D render
    - Diagrams contain technical schematics
    - Dimensions, weight, and materials provide technical specifications
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'dimensions'
  ) THEN
    ALTER TABLE products ADD COLUMN dimensions text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'weight'
  ) THEN
    ALTER TABLE products ADD COLUMN weight text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'materials'
  ) THEN
    ALTER TABLE products ADD COLUMN materials text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'additional_info'
  ) THEN
    ALTER TABLE products ADD COLUMN additional_info text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'ambient_images'
  ) THEN
    ALTER TABLE products ADD COLUMN ambient_images text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'product_image'
  ) THEN
    ALTER TABLE products ADD COLUMN product_image text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'diagrams'
  ) THEN
    ALTER TABLE products ADD COLUMN diagrams text[];
  END IF;
END $$;
