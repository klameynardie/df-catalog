/*
  # Add Missing Tables and Sample Data

  1. New Tables
    - `styles` (lookup table for filter values)
    - `ambiances` (lookup table for filter values)
    - `colors` (lookup table for filter values)
    - `textures` (lookup table for filter values)

  2. Modifications
    - Add `available` and `price` columns to products table

  3. Security
    - Enable RLS on new tables
    - Add policies for public read access

  4. Sample Data
    - Insert filter values
    - Insert sample products
*/

-- Create styles lookup table
CREATE TABLE IF NOT EXISTS styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);

-- Create ambiances lookup table
CREATE TABLE IF NOT EXISTS ambiances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);

-- Create colors lookup table
CREATE TABLE IF NOT EXISTS colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  hex_code text
);

-- Create textures lookup table
CREATE TABLE IF NOT EXISTS textures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);

-- Add missing columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'available'
  ) THEN
    ALTER TABLE products ADD COLUMN available boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price'
  ) THEN
    ALTER TABLE products ADD COLUMN price numeric DEFAULT 0;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambiances ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE textures ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Styles are viewable by everyone"
  ON styles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Ambiances are viewable by everyone"
  ON ambiances FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Colors are viewable by everyone"
  ON colors FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Textures are viewable by everyone"
  ON textures FOR SELECT
  TO anon
  USING (true);

-- Insert styles
INSERT INTO styles (name) VALUES
  ('Moderne'),
  ('Classique'),
  ('Industriel'),
  ('Bohème'),
  ('Scandinave'),
  ('Art Déco'),
  ('Vintage'),
  ('Minimaliste')
ON CONFLICT (name) DO NOTHING;

-- Insert ambiances
INSERT INTO ambiances (name) VALUES
  ('Romantique'),
  ('Élégante'),
  ('Festive'),
  ('Intimiste'),
  ('Chic'),
  ('Champêtre'),
  ('Glamour'),
  ('Contemporaine')
ON CONFLICT (name) DO NOTHING;

-- Insert colors
INSERT INTO colors (name, hex_code) VALUES
  ('Or', '#FFD700'),
  ('Argent', '#C0C0C0'),
  ('Blanc', '#FFFFFF'),
  ('Noir', '#000000'),
  ('Rose Gold', '#B76E79'),
  ('Bleu Marine', '#000080'),
  ('Vert Émeraude', '#50C878'),
  ('Bordeaux', '#800020'),
  ('Ivoire', '#FFFFF0'),
  ('Taupe', '#483C32')
ON CONFLICT (name) DO NOTHING;

-- Insert textures
INSERT INTO textures (name) VALUES
  ('Velours'),
  ('Métal'),
  ('Bois'),
  ('Verre'),
  ('Marbre'),
  ('Cristal'),
  ('Lin'),
  ('Cuir'),
  ('Rotin'),
  ('Laiton')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products for Chaises category
INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Chaise Velours Or',
  'Chaise élégante en velours doré, parfaite pour vos événements de prestige',
  'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Art Déco',
  'Glamour',
  'Or',
  'Velours',
  15.00,
  true
FROM categories c WHERE c.slug = 'chaises';

INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Chaise Transparente Design',
  'Chaise moderne en polycarbonate transparent, design épuré',
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Moderne',
  'Contemporaine',
  'Blanc',
  'Verre',
  12.00,
  true
FROM categories c WHERE c.slug = 'chaises';

INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Chaise Bois Naturel',
  'Chaise scandinave en bois naturel, confortable et élégante',
  'https://images.pexels.com/photos/2762247/pexels-photo-2762247.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Scandinave',
  'Champêtre',
  'Taupe',
  'Bois',
  10.00,
  true
FROM categories c WHERE c.slug = 'chaises';

INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Chaise Napoléon Argent',
  'Chaise classique Napoléon III en finition argentée',
  'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Classique',
  'Élégante',
  'Argent',
  'Métal',
  14.00,
  true
FROM categories c WHERE c.slug = 'chaises';

INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Chaise Velours Bleu',
  'Chaise contemporaine en velours bleu marine, assise confortable',
  'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Moderne',
  'Chic',
  'Bleu Marine',
  'Velours',
  15.00,
  true
FROM categories c WHERE c.slug = 'chaises';

INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Chaise Rotin Bohème',
  'Chaise en rotin tressé pour une ambiance bohème chic',
  'https://images.pexels.com/photos/1742229/pexels-photo-1742229.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Bohème',
  'Champêtre',
  'Taupe',
  'Rotin',
  11.00,
  true
FROM categories c WHERE c.slug = 'chaises';

INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Chaise Cuir Noir',
  'Chaise en cuir noir, style industriel et robuste',
  'https://images.pexels.com/photos/1571452/pexels-photo-1571452.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Industriel',
  'Contemporaine',
  'Noir',
  'Cuir',
  13.00,
  true
FROM categories c WHERE c.slug = 'chaises';

INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Chaise Rose Gold',
  'Chaise élégante avec structure rose gold, parfaite pour mariages',
  'https://images.pexels.com/photos/276534/pexels-photo-276534.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Moderne',
  'Romantique',
  'Rose Gold',
  'Métal',
  16.00,
  true
FROM categories c WHERE c.slug = 'chaises';

INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Chaise Empire Bordeaux',
  'Chaise velours bordeaux style Empire, très élégante',
  'https://images.pexels.com/photos/2290753/pexels-photo-2290753.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Classique',
  'Élégante',
  'Bordeaux',
  'Velours',
  17.00,
  true
FROM categories c WHERE c.slug = 'chaises';

INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Chaise Vintage Ivoire',
  'Chaise vintage avec assise ivoire rembourrée',
  'https://images.pexels.com/photos/2092058/pexels-photo-2092058.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Vintage',
  'Romantique',
  'Ivoire',
  'Lin',
  11.00,
  true
FROM categories c WHERE c.slug = 'chaises';

-- Insert sample products for Tables category
INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Table Ronde Marbre',
  'Table ronde avec plateau en marbre blanc, pieds dorés',
  'https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Art Déco',
  'Élégante',
  'Or',
  'Marbre',
  35.00,
  true
FROM categories c WHERE c.slug = 'tables';

INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Table Bois Massif',
  'Grande table en bois massif pour banquets et événements',
  'https://images.pexels.com/photos/1046630/pexels-photo-1046630.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Classique',
  'Champêtre',
  'Taupe',
  'Bois',
  25.00,
  true
FROM categories c WHERE c.slug = 'tables';

INSERT INTO products (name, description, image_url, category_id, style, ambiance, color, texture, price, available)
SELECT
  'Table Verre Moderne',
  'Table rectangulaire en verre trempé, design minimaliste',
  'https://images.pexels.com/photos/279648/pexels-photo-279648.jpeg?auto=compress&cs=tinysrgb&w=600',
  c.id,
  'Moderne',
  'Contemporaine',
  'Blanc',
  'Verre',
  30.00,
  true
FROM categories c WHERE c.slug = 'tables';