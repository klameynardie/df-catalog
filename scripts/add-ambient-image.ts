// Script pour ajouter une image d'ambiance au produit "Bar Classique en Bois"
// Exécuter avec: npx ts-node scripts/add-ambient-image.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addAmbientImage() {
  // Chercher le produit "Bar Classique" ou similaire
  const { data: products, error: searchError } = await supabase
    .from('products')
    .select('id, name, product_image, ambient_images')
    .ilike('name', '%bar%classique%')
    .limit(5);

  if (searchError) {
    console.error('Erreur recherche:', searchError);
    return;
  }

  console.log('Produits trouvés:', products);

  if (products && products.length > 0) {
    const product = products[0];
    console.log(`\nMise à jour du produit: ${product.name} (ID: ${product.id})`);

    // Ajouter une image d'ambiance (utilisons une image existante ou une image de test)
    const ambientImages = [
      product.product_image || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg',
    ];

    const { error: updateError } = await supabase
      .from('products')
      .update({ ambient_images: ambientImages })
      .eq('id', product.id);

    if (updateError) {
      console.error('Erreur mise à jour:', updateError);
    } else {
      console.log('✅ Images d\'ambiance ajoutées avec succès!');
      console.log('Images:', ambientImages);
    }
  } else {
    console.log('Aucun produit "Bar Classique" trouvé');
  }
}

addAmbientImage();

