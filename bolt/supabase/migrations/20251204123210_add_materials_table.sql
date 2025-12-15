/*
  # Ajout de la table materials

  1. Nouvelles tables
    - `materials` - Table pour les matières utilisées comme filtre
      - `id` (uuid, clé primaire)
      - `name` (text, nom de la matière)
      - `created_at` (timestamp)

  2. Sécurité
    - Activation de RLS sur la table `materials`
    - Politique permettant la lecture publique
*/

CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Materials are publicly readable"
  ON materials
  FOR SELECT
  TO public
  USING (true);
