/*
  # Uniformize RLS Policies to Public Role

  1. Changes
    - Drop existing policies for ambiances, colors, styles, textures
    - Recreate all policies with 'public' role instead of 'anon'
    - This ensures consistency and allows both anonymous and authenticated users to read

  2. Security
    - All content remains read-only for public
    - Only SELECT operations are allowed
*/

-- Drop old anon-only policies
DROP POLICY IF EXISTS "Ambiances are viewable by everyone" ON ambiances;
DROP POLICY IF EXISTS "Colors are viewable by everyone" ON colors;
DROP POLICY IF EXISTS "Styles are viewable by everyone" ON styles;
DROP POLICY IF EXISTS "Textures are viewable by everyone" ON textures;

-- Create new public policies
CREATE POLICY "Public can view ambiances"
  ON ambiances
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view colors"
  ON colors
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view styles"
  ON styles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view textures"
  ON textures
  FOR SELECT
  TO public
  USING (true);
