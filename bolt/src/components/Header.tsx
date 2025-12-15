import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Menu, X, Search, ChevronDown, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const { totalItems } = useCart();

  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    const { data: subcategoriesData } = await supabase
      .from('subcategories')
      .select('*')
      .order('name');

    setCategories(categoriesData || []);
    setSubcategories(subcategoriesData || []);
  };

  const getCategorySubcategories = (categoryId: string) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-24">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-900"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img src="/logo-df.png" alt="Deco Flamme" className="h-12 md:h-16 w-auto object-contain" />
          </Link>

          <div className="flex items-center space-x-2 md:space-x-4">
            {searchOpen ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  autoFocus
                  className="pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900 transition-all text-sm w-48 md:w-64"
                  onBlur={() => setSearchOpen(false)}
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-700 hover:text-gray-900 transition-colors hidden md:block"
              >
                <Search size={20} />
              </button>
            )}

            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Link>

            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <User size={20} />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white max-h-[calc(100vh-6rem)] overflow-y-auto">
          <nav className="max-w-7xl mx-auto px-6 py-6">
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors text-sm"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="space-y-1">
              {categories.map((cat) => {
                const catSubcategories = getCategorySubcategories(cat.id);
                const hasSubcategories = catSubcategories.length > 0;

                return (
                  <div key={cat.id} className="border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/categories/${cat.slug}`}
                        className="flex-1 py-3 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                      {hasSubcategories && (
                        <button
                          onClick={() => toggleCategory(cat.id)}
                          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <ChevronDown
                            size={20}
                            className={`transition-transform ${openCategory === cat.id ? 'rotate-180' : ''}`}
                          />
                        </button>
                      )}
                    </div>

                    {hasSubcategories && openCategory === cat.id && (
                      <div className="pl-4 pb-3 space-y-2">
                        {catSubcategories.map((subcat) => (
                          <Link
                            key={subcat.id}
                            to={`/categories/${cat.slug}/${subcat.slug}`}
                            className="block py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subcat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
