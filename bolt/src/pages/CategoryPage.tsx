import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, Home, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category, FilterOption, ColorOption } from '../lib/supabase';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  created_at: string;
}

interface Filters {
  ambiances: string[];
  colors: string[];
  materials: string[];
}

function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [ambiances, setAmbiances] = useState<FilterOption[]>([]);
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [materials, setMaterials] = useState<FilterOption[]>([]);

  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    ambiances: [],
    colors: [],
    materials: [],
  });

  const [openFilters, setOpenFilters] = useState({
    ambiance: false,
    color: false,
    material: false,
  });

  useEffect(() => {
    if (slug) {
      loadCategoryData();
      loadFilterOptions();
    }
  }, [slug]);

  useEffect(() => {
    applyFilters();
  }, [selectedFilters, products]);

  const loadCategoryData = async () => {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (categoryData) {
      setCategory(categoryData);

      const { data: subcategoriesData } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('name');

      setSubcategories(subcategoriesData || []);

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('available', true)
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
      setFilteredProducts(productsData || []);
    }
  };

  const loadFilterOptions = async () => {
    const [ambiancesRes, colorsRes, materialsRes] = await Promise.all([
      supabase.from('ambiances').select('*').order('name'),
      supabase.from('colors').select('*').order('name'),
      supabase.from('materials').select('*').order('name'),
    ]);

    setAmbiances(ambiancesRes.data || []);
    setColors(colorsRes.data || []);
    setMaterials(materialsRes.data || []);
  };

  const applyFilters = () => {
    if (!products) return;

    let filtered = [...products];

    if (selectedFilters.ambiances.length > 0) {
      filtered = filtered.filter((p) => p.ambiance && selectedFilters.ambiances.includes(p.ambiance));
    }

    if (selectedFilters.colors.length > 0) {
      filtered = filtered.filter((p) => p.color && selectedFilters.colors.includes(p.color));
    }

    if (selectedFilters.materials.length > 0) {
      filtered = filtered.filter((p) => p.materials && selectedFilters.materials.includes(p.materials));
    }

    setFilteredProducts(filtered);
  };

  const toggleFilter = (type: keyof Filters, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const clearFilters = () => {
    setSelectedFilters({
      ambiances: [],
      colors: [],
      materials: [],
    });
  };

  const hasActiveFilters = () => {
    return Object.values(selectedFilters).some((arr) => arr.length > 0);
  };

  const toggleFilterSection = (section: keyof typeof openFilters) => {
    setOpenFilters((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!category) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-500">Chargement...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24">
        {category.hero_image && (
          <div className="relative h-96 overflow-hidden mb-8">
            <img
              src={category.hero_image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-6xl md:text-7xl font-light tracking-tight mb-4">
                  {category.name}
                </h1>
                <p className="text-xl">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-12">
            <Link to="/" className="hover:text-gray-900 transition-colors flex items-center">
              <Home size={16} className="mr-1" />
              Accueil
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900">{category.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
          {subcategories.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Sous-catégories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    to={`/categories/${category.slug}/${subcategory.slug}`}
                    className="group p-4 border-2 border-gray-200 hover:border-gray-900 transition-all text-center"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {subcategory.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-32">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium text-gray-900">Filtres</h2>
                  {hasActiveFilters() && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <button
                      onClick={() => toggleFilterSection('ambiance')}
                      className="flex items-center justify-between w-full text-left mb-4"
                    >
                      <span className="font-medium text-gray-900">Ambiance</span>
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${openFilters.ambiance ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openFilters.ambiance && (
                      <div className="space-y-3">
                        {ambiances.map((ambiance) => (
                          <label key={ambiance.id} className="flex items-center cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedFilters.ambiances.includes(ambiance.name)}
                              onChange={() => toggleFilter('ambiances', ambiance.name)}
                              className="w-4 h-4 border-2 border-gray-300 checked:bg-gray-900 checked:border-gray-900 transition-colors"
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                              {ambiance.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <button
                      onClick={() => toggleFilterSection('color')}
                      className="flex items-center justify-between w-full text-left mb-4"
                    >
                      <span className="font-medium text-gray-900">Couleur</span>
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${openFilters.color ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openFilters.color && (
                      <div className="space-y-3">
                        {colors.map((color) => (
                          <label key={color.id} className="flex items-center cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedFilters.colors.includes(color.name)}
                              onChange={() => toggleFilter('colors', color.name)}
                              className="w-4 h-4 border-2 border-gray-300 checked:bg-gray-900 checked:border-gray-900 transition-colors"
                            />
                            <div className="ml-3 flex items-center">
                              <div
                                className="w-5 h-5 border border-gray-300 mr-2"
                                style={{ backgroundColor: color.hex_code }}
                              />
                              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                {color.name}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pb-6">
                    <button
                      onClick={() => toggleFilterSection('material')}
                      className="flex items-center justify-between w-full text-left mb-4"
                    >
                      <span className="font-medium text-gray-900">Matière</span>
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${openFilters.material ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openFilters.material && (
                      <div className="space-y-3">
                        {materials.map((material) => (
                          <label key={material.id} className="flex items-center cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedFilters.materials.includes(material.name)}
                              onChange={() => toggleFilter('materials', material.name)}
                              className="w-4 h-4 border-2 border-gray-300 checked:bg-gray-900 checked:border-gray-900 transition-colors"
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                              {material.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500">Aucun produit ne correspond à vos critères</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <Link key={product.id} to={`/products/${product.id}`} className="group">
                      <div className="aspect-[3/4] overflow-hidden bg-gray-100 mb-4 shadow-md group-hover:shadow-xl transition-all duration-500">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {product.ambiance && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700">
                              {product.ambiance}
                            </span>
                          )}
                          {product.color && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700">
                              {product.color}
                            </span>
                          )}
                          {product.materials && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700">
                              {product.materials}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CategoryPage;
