import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (data) {
        setCategories(data);
      }
    }
    fetchCategories();
  }, []);

  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <img
            src="/logo-df-white.png"
            alt="Deco Flamme"
            style={{ height: '65px', imageRendering: 'crisp-edges' }}
          />

          <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
            Location, décoration et création d'espaces éphémères
          </p>

          {categories.length > 0 && (
            <div className="pt-6 w-full max-w-4xl">
              <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-6 font-medium">
                Nos Catégories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/categories/${category.slug}`}
                    className="text-gray-300 hover:text-white transition-colors text-sm text-center py-1"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6">
            <a
              href="https://www.deco-flamme.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors text-sm underline underline-offset-4"
            >
              Visitez deco-flamme.com
            </a>
          </div>

          <div className="flex items-center space-x-6 pt-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram size={22} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook size={22} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Youtube size={22} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin size={22} />
            </a>
          </div>

          <div className="pt-8 border-t border-gray-700 w-full">
            <p className="text-gray-500 text-xs">
              2025 Deco Flamme. Tous droits reserves.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
