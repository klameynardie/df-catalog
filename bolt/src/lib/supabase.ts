import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web',
    },
  },
});

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category_id: string;
  style: string | null;
  ambiance: string | null;
  color: string | null;
  texture: string | null;
  available: boolean;
  created_at: string;
}

export interface FilterOption {
  id: string;
  name: string;
}

export interface ColorOption extends FilterOption {
  hex_code: string;
}
