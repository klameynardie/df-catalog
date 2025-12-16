// Script pour ajouter une image d'ambiance
// Exécuter avec: node scripts/add-image.mjs

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables Supabase manquantes dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addAmbientImage() {
  console.log('🔍 Recherche du produit "Bar Classique"...');
  
  // Chercher les produits "bar"
  const { data: products, error: searchError } = await supabase
    .from('products')
    .select('id, name, product_image, ambient_images')
    .or('name.ilike.%bar classique%,name.ilike.%bar%bois%')
    .limit(5);

  if (searchError) {
    console.error('❌ Erreur recherche:', searchError.message);
    return;
  }

  if (!products || products.length === 0) {
    console.log('⚠️ Aucun produit trouvé. Recherche élargie...');
    
    const { data: allBars } = await supabase
      .from('products')
      .select('id, name')
      .ilike('name', '%bar%')
      .limit(10);
    
    console.log('Produits "bar" disponibles:', allBars?.map(p => p.name));
    return;
  }

  const product = products[0];
  console.log(`✅ Produit trouvé: ${product.name}`);
  console.log(`   ID: ${product.id}`);
  console.log(`   Image actuelle: ${product.product_image?.substring(0, 50)}...`);

  // Images d'ambiance à ajouter
  const ambientImages = [
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5490965/pexels-photo-5490965.jpeg?auto=compress&cs=tinysrgb&w=800',
  ];

  console.log('\n📸 Ajout des images d\'ambiance...');
  
  const { error: updateError } = await supabase
    .from('products')
    .update({ ambient_images: ambientImages })
    .eq('id', product.id);

  if (updateError) {
    console.error('❌ Erreur mise à jour:', updateError.message);
  } else {
    console.log('✅ Images d\'ambiance ajoutées avec succès!');
    console.log('   Images ajoutées:', ambientImages.length);
  }
}

addAmbientImage().catch(console.error);

