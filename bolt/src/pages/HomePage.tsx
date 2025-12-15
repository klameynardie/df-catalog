import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
  productId?: string;
  categorySlug?: string;
}

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentNewItem, setCurrentNewItem] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);

  const heroSlides = [
    '/banniere-home-mariage.jpg',
    '/banniere-home-prive.jpg'
  ];

  const categoryImages: Record<string, string> = {
    'bars-buffets-back-bars': '/YACHT-SILVER-WAVE-ILTM-CANNES-2017-57.jpg',
    'mobiliers': '/alban_pichon_1438-VNZ_3213.jpg',
    'decoration': '/Belieu-107.jpg',
    'deco-flamme-garden': '/camilledufosse-909.jpg',
    'flammes': '/flammes.jpg',
    'textile': '/deco-143.jpg',
    'chapiteaux': '/Carl-Mand-13.jpg',
    'son-lumiere-video': '/91.jpg',
    'chauffages': '/PAL176133.jpg',
    'costumerie': '/costumes.jpg',
    'noel': '/noel.jpg',
    'parasols': '/PAL167905.jpg',
    'pistes-de-dance': '/piste-danse.jpg',
    'podiums': '/PAL168721.jpg',
    'structures-sceniques': '/IMG-20221222-WA0010.jpg',
    'tente': '/tentes.jpg'
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    setCategories(categoriesData || []);

    const { data: productsData } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .order('created_at', { ascending: false })
      .limit(6);

    if (productsData) {
      const productsForDisplay: Product[] = productsData.map((product: any, index) => ({
        id: index + 1,
        name: product.name,
        image: product.product_image || product.image_url || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: product.categories?.name || 'Produit',
        productId: product.id,
        categorySlug: product.categories?.slug
      }));
      setNewProducts(productsForDisplay);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const getNewItemsPerSlide = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 2;
    }
    return 3;
  };

  const nextNewItem = () => {
    const itemsPerSlide = getNewItemsPerSlide();
    setCurrentNewItem((prev) => Math.min(prev + 1, newProducts.length - itemsPerSlide));
  };

  const prevNewItem = () => {
    setCurrentNewItem((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-24">
        <section className="relative h-[70vh] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
            </div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div className="max-w-4xl">
              <h1 className="text-6xl md:text-8xl text-white mb-4 tracking-tight leading-tight">
                Le catalogue
              </h1>
              <p className="text-base md:text-lg text-white/95 tracking-wider uppercase font-light">
                Location, décoration et création d'espaces éphémères
              </p>
            </div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-12' : 'bg-white/60 w-2'
                }`}
              />
            ))}
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <h2 className="text-5xl md:text-6xl text-center mb-20 tracking-tight text-gray-900">
              NOS CATÉGORIES
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className="group relative overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-500"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={categoryImages[category.slug] || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-85 group-hover:opacity-95 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-3xl text-white tracking-tight">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between mb-16">
              <h2 className="text-3xl md:text-5xl lg:text-6xl tracking-tight text-gray-900">
                NOUVEAUTÉS
              </h2>

              <div className="flex space-x-2 md:space-x-3">
                <button
                  onClick={prevNewItem}
                  disabled={currentNewItem === 0}
                  className="p-2 md:p-3 border-2 border-gray-900 disabled:border-gray-300 disabled:text-gray-300 hover:bg-gray-900 hover:text-white transition-all disabled:hover:bg-transparent disabled:hover:text-gray-300"
                >
                  <ChevronLeft size={20} className="md:w-[22px] md:h-[22px]" />
                </button>
                <button
                  onClick={nextNewItem}
                  disabled={currentNewItem >= newProducts.length - getNewItemsPerSlide()}
                  className="p-2 md:p-3 border-2 border-gray-900 disabled:border-gray-300 disabled:text-gray-300 hover:bg-gray-900 hover:text-white transition-all disabled:hover:bg-transparent disabled:hover:text-gray-300"
                >
                  <ChevronRight size={20} className="md:w-[22px] md:h-[22px]" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentNewItem * (100 / getNewItemsPerSlide())}%)` }}
              >
                {newProducts.map((product, index) => {
                  const productLink = product.productId && product.categorySlug
                    ? `/categories/${product.categorySlug}/products/${product.productId}`
                    : '#';
                  return (
                    <div
                      key={product.id}
                      className="w-1/2 md:w-1/3 flex-shrink-0 px-3"
                    >
                      <Link to={productLink} className="group block">
                        <div className="aspect-[3/4] overflow-hidden bg-white shadow-md group-hover:shadow-xl transition-all duration-500 mb-5">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-medium">
                          {product.category}
                        </p>
                        <h3 className="text-lg md:text-xl group-hover:text-gray-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;
