/*
  # Add Subcategories and Update Categories

  1. New Tables
    - `subcategories`
      - `id` (uuid, primary key)
      - `name` (text, name of subcategory)
      - `slug` (text, URL-friendly identifier)
      - `category_id` (uuid, foreign key to categories)
      - `created_at` (timestamptz)

  2. Changes
    - Add `subcategory_id` column to products table
    - Update categories with new structure based on the document
    - Insert all subcategories from the document

  3. Security
    - Enable RLS on subcategories table
    - Add policy for public read access to subcategories
*/

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subcategories are viewable by everyone"
  ON subcategories FOR SELECT
  TO public
  USING (true);

-- Add subcategory_id to products table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE products ADD COLUMN subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Clear existing categories
DELETE FROM categories;

-- Insert all main categories
INSERT INTO categories (name, slug) VALUES
('Bars, buffets et back bars', 'bars-buffets-back-bars'),
('Chapiteaux', 'chapiteaux'),
('Chauffages', 'chauffages'),
('Costumerie', 'costumerie'),
('Déco Flamme Garden', 'deco-flamme-garden'),
('Décoration', 'decoration'),
('Flammes', 'flammes'),
('Mobiliers', 'mobiliers'),
('Noel', 'noel'),
('Parasols', 'parasols'),
('Pistes de dance', 'pistes-de-dance'),
('Podiums', 'podiums'),
('Son, lumière & vidéo', 'son-lumiere-video'),
('Structures scéniques', 'structures-sceniques'),
('Tente', 'tente'),
('Textile', 'textile')
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Déco Flamme Garden
INSERT INTO subcategories (name, slug, category_id)
SELECT 'Arbres décoratifs et arbres Leds', 'arbres-decoratifs-leds', id FROM categories WHERE slug = 'deco-flamme-garden'
UNION ALL
SELECT 'Compositions fleurs artificielles', 'compositions-fleurs-artificielles', id FROM categories WHERE slug = 'deco-flamme-garden'
UNION ALL
SELECT 'Contenants & Jarres', 'contenants-jarres', id FROM categories WHERE slug = 'deco-flamme-garden'
UNION ALL
SELECT 'Plantes', 'plantes', id FROM categories WHERE slug = 'deco-flamme-garden'
UNION ALL
SELECT 'Plantes artificielles', 'plantes-artificielles', id FROM categories WHERE slug = 'deco-flamme-garden'
UNION ALL
SELECT 'Vases décoratifs', 'vases-decoratifs', id FROM categories WHERE slug = 'deco-flamme-garden';

-- Insert subcategories for Décoration
INSERT INTO subcategories (name, slug, category_id)
SELECT 'Accessoires de table', 'accessoires-de-table', id FROM categories WHERE slug = 'decoration'
UNION ALL
SELECT 'Accessoires et Gonflables', 'accessoires-gonflables', id FROM categories WHERE slug = 'decoration'
UNION ALL
SELECT 'Animaux', 'animaux', id FROM categories WHERE slug = 'decoration'
UNION ALL
SELECT 'Boules à facettes', 'boules-facettes', id FROM categories WHERE slug = 'decoration'
UNION ALL
SELECT 'Cadres & Miroirs', 'cadres-miroirs', id FROM categories WHERE slug = 'decoration'
UNION ALL
SELECT 'Colonnes et stèles', 'colonnes-steles', id FROM categories WHERE slug = 'decoration'
UNION ALL
SELECT 'Grands éléments décoratifs', 'grands-elements-decoratifs', id FROM categories WHERE slug = 'decoration'
UNION ALL
SELECT 'Lampes & Abat-jour', 'lampes-abat-jour', id FROM categories WHERE slug = 'decoration'
UNION ALL
SELECT 'Lanternes / photophores / chandeliers et bougeoirs', 'lanternes-photophores-chandeliers', id FROM categories WHERE slug = 'decoration'
UNION ALL
SELECT 'Lustres et suspensions', 'lustres-suspensions', id FROM categories WHERE slug = 'decoration'
UNION ALL
SELECT 'Potelet de sécurité', 'potelet-securite', id FROM categories WHERE slug = 'decoration'
UNION ALL
SELECT 'Rideaux, Cloisons & Entrées', 'rideaux-cloisons-entrees', id FROM categories WHERE slug = 'decoration'
UNION ALL
SELECT 'Tapis', 'tapis', id FROM categories WHERE slug = 'decoration';

-- Insert subcategories for Flammes
INSERT INTO subcategories (name, slug, category_id)
SELECT 'Bougies Led', 'bougies-led', id FROM categories WHERE slug = 'flammes'
UNION ALL
SELECT 'Bougies naturelles', 'bougies-naturelles', id FROM categories WHERE slug = 'flammes'
UNION ALL
SELECT 'Bougies sur supports', 'bougies-supports', id FROM categories WHERE slug = 'flammes'
UNION ALL
SELECT 'Braseros', 'braseros', id FROM categories WHERE slug = 'flammes';

-- Insert subcategories for Mobiliers
INSERT INTO subcategories (name, slug, category_id)
SELECT 'Banquettes & chauffeuses', 'banquettes-chauffeuses', id FROM categories WHERE slug = 'mobiliers'
UNION ALL
SELECT 'Beds', 'beds', id FROM categories WHERE slug = 'mobiliers'
UNION ALL
SELECT 'Canapés et bancs', 'canapes-bancs', id FROM categories WHERE slug = 'mobiliers'
UNION ALL
SELECT 'Chaises', 'chaises', id FROM categories WHERE slug = 'mobiliers'
UNION ALL
SELECT 'Consoles et étagères', 'consoles-etageres', id FROM categories WHERE slug = 'mobiliers'
UNION ALL
SELECT 'Fauteuil & Trônes', 'fauteuil-trones', id FROM categories WHERE slug = 'mobiliers'
UNION ALL
SELECT 'Loge', 'loge', id FROM categories WHERE slug = 'mobiliers'
UNION ALL
SELECT 'Mange debout & Tabourets', 'mange-debout-tabourets', id FROM categories WHERE slug = 'mobiliers'
UNION ALL
SELECT 'Poufs', 'poufs', id FROM categories WHERE slug = 'mobiliers'
UNION ALL
SELECT 'Tables basses', 'tables-basses', id FROM categories WHERE slug = 'mobiliers'
UNION ALL
SELECT 'Tables et guéridons', 'tables-gueridons', id FROM categories WHERE slug = 'mobiliers';

-- Insert subcategories for Noel
INSERT INTO subcategories (name, slug, category_id)
SELECT 'Décoration', 'decoration-noel', id FROM categories WHERE slug = 'noel'
UNION ALL
SELECT 'Sapin', 'sapin', id FROM categories WHERE slug = 'noel';

-- Insert subcategories for Podiums
INSERT INTO subcategories (name, slug, category_id)
SELECT 'Podiums Artistique', 'podiums-artistique', id FROM categories WHERE slug = 'podiums'
UNION ALL
SELECT 'Podiums DJ', 'podiums-dj', id FROM categories WHERE slug = 'podiums';

-- Insert subcategories for Son, lumière & vidéo
INSERT INTO subcategories (name, slug, category_id)
SELECT 'Accessoires', 'accessoires-son-lumiere', id FROM categories WHERE slug = 'son-lumiere-video'
UNION ALL
SELECT 'Effets spéciaux', 'effets-speciaux', id FROM categories WHERE slug = 'son-lumiere-video'
UNION ALL
SELECT 'Mise en lumière', 'mise-en-lumiere', id FROM categories WHERE slug = 'son-lumiere-video'
UNION ALL
SELECT 'Sonorisations', 'sonorisations', id FROM categories WHERE slug = 'son-lumiere-video'
UNION ALL
SELECT 'Vidéos', 'videos', id FROM categories WHERE slug = 'son-lumiere-video';

-- Insert subcategories for Structures scéniques
INSERT INTO subcategories (name, slug, category_id)
SELECT 'Pieds autoportés', 'pieds-autoportes', id FROM categories WHERE slug = 'structures-sceniques'
UNION ALL
SELECT 'Praticables & scènes', 'praticables-scenes', id FROM categories WHERE slug = 'structures-sceniques'
UNION ALL
SELECT 'Structures de pont', 'structures-pont', id FROM categories WHERE slug = 'structures-sceniques'
UNION ALL
SELECT 'Supports de suspensions décoratives', 'supports-suspensions-decoratives', id FROM categories WHERE slug = 'structures-sceniques';

-- Insert subcategories for Textile
INSERT INTO subcategories (name, slug, category_id)
SELECT 'Coussins', 'coussins', id FROM categories WHERE slug = 'textile'
UNION ALL
SELECT 'Nappe et serviette', 'nappe-serviette', id FROM categories WHERE slug = 'textile'
UNION ALL
SELECT 'Plaid', 'plaid', id FROM categories WHERE slug = 'textile';
