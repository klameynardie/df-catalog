/*
  # Mise à jour des catégories et sous-catégories

  1. Modifications des catégories
    - Renommage de "Bars, buffets et back bars" en "Bars"
    - Renommage de "Déco Flamme Garden" en "Déco Flamme Gardens"
    - Renommage de "Décoration" en "Décorations"
    - Renommage de "Tente" en "Tentes"
    - Renommage de "Textile" en "Textiles"

  2. Modifications des sous-catégories
    - Bars: Création de sous-catégories "Bars" et "Buffets & back bar"
    - Structures scéniques: Ajout de "Potelets de sécurité"
    - Textiles: Mise à jour des sous-catégories pour correspondre au document
    - Suppression de "Potelet de sécurité" de la catégorie Décorations
    - Mise à jour de "Podiums Artistique" en "Podiums artistiques"
    - Autres ajustements mineurs de nommage
*/

-- Mise à jour des noms de catégories
UPDATE categories SET name = 'Bars' WHERE slug = 'bars-buffets-back-bars';
UPDATE categories SET name = 'Déco Flamme Gardens' WHERE slug = 'deco-flamme-garden';
UPDATE categories SET name = 'Décorations' WHERE slug = 'decoration';
UPDATE categories SET name = 'Tentes' WHERE slug = 'tente';
UPDATE categories SET name = 'Textiles' WHERE slug = 'textile';

-- Récupérer les IDs des catégories
DO $$
DECLARE
  bars_id uuid;
  structures_id uuid;
  textiles_id uuid;
  decorations_id uuid;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO bars_id FROM categories WHERE slug = 'bars-buffets-back-bars';
  SELECT id INTO structures_id FROM categories WHERE slug = 'structures-sceniques';
  SELECT id INTO textiles_id FROM categories WHERE slug = 'textile';
  SELECT id INTO decorations_id FROM categories WHERE slug = 'decoration';

  -- Ajouter les sous-catégories pour Bars
  INSERT INTO subcategories (category_id, name, slug)
  VALUES 
    (bars_id, 'Bars', 'bars'),
    (bars_id, 'Buffets & back bar', 'buffets-back-bar')
  ON CONFLICT (slug) DO NOTHING;

  -- Ajouter "Potelets de sécurité" dans Structures scéniques
  INSERT INTO subcategories (category_id, name, slug)
  VALUES 
    (structures_id, 'Potelets de sécurité', 'potelets-securite')
  ON CONFLICT (slug) DO NOTHING;

  -- Supprimer "Potelet de sécurité" de Décorations
  DELETE FROM subcategories 
  WHERE slug = 'potelet-securite' AND category_id = decorations_id;

END $$;

-- Mise à jour des sous-catégories de Textiles
UPDATE subcategories SET name = 'Coussins & plaids' WHERE slug = 'coussins';
UPDATE subcategories SET name = 'Nappes & serviettes' WHERE slug = 'nappe-serviette';

-- Supprimer la sous-catégorie "Plaid" car elle est maintenant fusionnée avec "Coussins & plaids"
DELETE FROM subcategories WHERE slug = 'plaid';

-- Mise à jour des autres sous-catégories pour correspondre exactement au document
UPDATE subcategories SET name = 'Podiums artistiques' WHERE slug = 'podiums-artistique';
UPDATE subcategories SET name = 'Sapins' WHERE slug = 'sapin';
UPDATE subcategories SET name = 'Canapés & bancs' WHERE slug = 'canapes-bancs';
UPDATE subcategories SET name = 'Consoles & étagères' WHERE slug = 'consoles-etageres';
UPDATE subcategories SET name = 'Fauteuils & trônes' WHERE slug = 'fauteuil-trones';
UPDATE subcategories SET name = 'Loges' WHERE slug = 'loge';
UPDATE subcategories SET name = 'Mange debout & tabourets' WHERE slug = 'mange-debout-tabourets';
UPDATE subcategories SET name = 'Tables & guéridons' WHERE slug = 'tables-gueridons';
UPDATE subcategories SET name = 'Arbres décoratifs & arbres Leds' WHERE slug = 'arbres-decoratifs-leds';
UPDATE subcategories SET name = 'Accessoires & gonflables' WHERE slug = 'accessoires-gonflables';
UPDATE subcategories SET name = 'Lanternes, photophores, chandeliers & bougeoirs' WHERE slug = 'lanternes-photophores-chandeliers';
UPDATE subcategories SET name = 'Lustres & suspensions' WHERE slug = 'lustres-suspensions';
UPDATE subcategories SET name = 'Rideaux, cloisons & entrées' WHERE slug = 'rideaux-cloisons-entrees';
