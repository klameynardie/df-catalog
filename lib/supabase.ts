import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const storage = Platform.OS === 'web' 
  ? {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    }
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  hero_image?: string;
  created_at: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  product_image?: string;
  ambient_images?: string[];
  diagrams?: string[];
  category_id: string;
  subcategory_id?: string;
  ambiance?: string;
  color?: string;
  materials?: string;
  dimensions?: string;
  weight?: string;
  additional_info?: string;
  related_products?: string[];
  available: boolean;
  created_at: string;
  categories?: Category;
  subcategories?: Subcategory;
}

export interface Ambiance { id: string; name: string; }
export interface Color { id: string; name: string; hex_code: string; }
export interface Material { id: string; name: string; }

// Helper functions
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) { console.error('Error fetching categories:', error); return []; }
  return data || [];
}

export async function fetchSubcategories(categoryId: string): Promise<Subcategory[]> {
  const { data, error } = await supabase.from('subcategories').select('*').eq('category_id', categoryId).order('name');
  if (error) { console.error('Error fetching subcategories:', error); return []; }
  return data || [];
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
  if (error) { console.error('Error fetching category:', error); return null; }
  return data;
}

export async function fetchProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*, categories(name, slug)').eq('category_id', categoryId).eq('available', true).order('created_at', { ascending: false });
  if (error) { console.error('Error fetching products:', error); return []; }
  return data || [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*, categories(name, slug), subcategories(name, slug)').eq('id', id).maybeSingle();
  if (error) { console.error('Error fetching product:', error); return null; }
  return data;
}

export async function fetchNewProducts(limit: number = 6): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*, categories(name, slug)').eq('available', true).order('created_at', { ascending: false }).limit(limit);
  if (error) { console.error('Error fetching new products:', error); return []; }
  return data || [];
}

export async function fetchRelatedProducts(
  categoryId: string, 
  excludeId: string, 
  limit: number = 6,
  relatedProductIds?: string[]
): Promise<Product[]> {
  // Si des produits sont sélectionnés manuellement, les récupérer
  if (relatedProductIds && relatedProductIds.length > 0) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .in('id', relatedProductIds)
      .eq('available', true);
    
    if (error) { 
      console.error('Error fetching selected related products:', error); 
      // Fallback sur les produits de la catégorie
    } else if (data && data.length > 0) {
      // Garder l'ordre des IDs sélectionnés
      const orderedProducts = relatedProductIds
        .map(id => data.find(p => p.id === id))
        .filter(Boolean) as Product[];
      return orderedProducts;
    }
  }
  
  // Sinon, récupérer les derniers produits de la même catégorie
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .eq('available', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) { console.error('Error fetching related products:', error); return []; }
  return data || [];
}

export async function fetchFilterOptions() {
  const [ambiances, colors, materials] = await Promise.all([
    supabase.from('ambiances').select('*').order('name'),
    supabase.from('colors').select('*').order('name'),
    supabase.from('materials').select('*').order('name'),
  ]);
  return {
    ambiances: ambiances.data || [],
    colors: colors.data || [],
    materials: materials.data || [],
  };
}

export async function submitQuoteRequest(data: {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  message?: string;
  items: { product_id: string; product_name: string; quantity: number }[];
  status?: string;
}) {
  // 1. Insérer la demande de devis
  const { data: quoteRequest, error: quoteError } = await supabase
    .from('quote_requests')
    .insert({
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone || null,
      customer_message: data.message || null,
      status: data.status || 'pending',
    })
    .select('id')
    .single();

  if (quoteError) throw quoteError;

  // 2. Insérer les items de la demande
  if (data.items && data.items.length > 0) {
    const itemsToInsert = data.items.map((item) => ({
      quote_request_id: quoteRequest.id,
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('quote_request_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;
  }

  return quoteRequest;
}

