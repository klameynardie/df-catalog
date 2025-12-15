import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Menu, X, Instagram, Facebook, Youtube, Linkedin, Search } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  image: string;
}

interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
}

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentNewItem, setCurrentNewItem] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const heroSlides = [
    '/banniere-home-mariage.jpg',
    '/banniere-home-prive.jpg'
  ];

  const categories: Category[] = [
    { id: 1, name: 'Tables', image: 'https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 2, name: 'Chaises', image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 3, name: 'Luminaires', image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 4, name: 'Décoration', image: 'https://images.pexels.com/photos/1702340/pexels-photo-1702340.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 5, name: 'Bar & Buffet', image: 'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 6, name: 'Lounge', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800' }
  ];

  const newProducts: Product[] = [
    { id: 1, name: 'Chaise Velours Or', image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Chaises' },
    { id: 2, name: 'Table Ronde Marbre', image: 'https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Tables' },
    { id: 3, name: 'Suspension Design', image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Luminaires' },
    { id: 4, name: 'Vase Élégance', image: 'https://images.pexels.com/photos/1702340/pexels-photo-1702340.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Décoration' },
    { id: 5, name: 'Canapé Premium', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Lounge' },
    { id: 6, name: 'Bar Mobile Luxe', image: 'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Bar & Buffet' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextNewItem = () => {
    setCurrentNewItem((prev) => Math.min(prev + 1, newProducts.length - 3));
  };

  const prevNewItem = () => {
    setCurrentNewItem((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-24">
            <a href="https://deco-flamme.com/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 group">
              <img src="/image.png" alt="Deco Flamme" className="w-auto object-contain" style={{ height: '60px', imageRendering: '-webkit-optimize-contrast' }} />
            </a>

            <nav className="hidden lg:flex items-center space-x-10">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href="#"
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {cat.name}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-4">
                {searchOpen ? (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      autoFocus
                      className="pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900 transition-all text-sm w-64"
                      onBlur={() => setSearchOpen(false)}
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <Search size={20} />
                  </button>
                )}
              </div>

              <button className="hidden md:block p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <User size={20} />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-900"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="max-w-7xl mx-auto px-6 py-6 space-y-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors text-sm"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href="#"
                  className="block text-sm text-gray-700"
                >
                  {cat.name}
                </a>
              ))}
              <button className="flex items-center justify-center p-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all w-full mt-4">
                <User size={20} />
              </button>
            </nav>
          </div>
        )}
      </header>

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
              <h1 className="text-6xl md:text-8xl italic text-white mb-4 tracking-tight leading-tight">
                Le catalogue
              </h1>
              <p className="text-base md:text-lg text-white/95 tracking-wider uppercase font-light">
                Mobilier & Décoration Événementielle Haut de Gamme
              </p>
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/25 backdrop-blur-md transition-all border border-white/30"
          >
            <ChevronLeft className="text-white" size={28} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/25 backdrop-blur-md transition-all border border-white/30"
          >
            <ChevronRight className="text-white" size={28} />
          </button>

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href="#"
                  className="group relative overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-500"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-3xl text-white tracking-tight">
                      {category.name}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between mb-16">
              <h2 className="text-5xl md:text-6xl tracking-tight text-gray-900">
                NOUVEAUTÉS
              </h2>

              <div className="flex space-x-3">
                <button
                  onClick={prevNewItem}
                  disabled={currentNewItem === 0}
                  className="p-3 border-2 border-gray-900 disabled:border-gray-300 disabled:text-gray-300 hover:bg-gray-900 hover:text-white transition-all disabled:hover:bg-transparent disabled:hover:text-gray-300"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={nextNewItem}
                  disabled={currentNewItem >= newProducts.length - 3}
                  className="p-3 border-2 border-gray-900 disabled:border-gray-300 disabled:text-gray-300 hover:bg-gray-900 hover:text-white transition-all disabled:hover:bg-transparent disabled:hover:text-gray-300"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentNewItem * (100 / 3)}%)` }}
              >
                {newProducts.map((product) => (
                  <div
                    key={product.id}
                    className="w-1/3 flex-shrink-0 px-3"
                  >
                    <a href="#" className="group block">
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
                      <h3 className="text-xl group-hover:text-gray-600 transition-colors">
                        {product.name}
                      </h3>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center text-center space-y-6">
            <img src="/image.png" alt="Deco Flamme" className="w-auto brightness-0 invert object-contain" style={{ height: '80px', imageRendering: '-webkit-optimize-contrast' }} />

            <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
              Location Mobilier & Décoration Événementielle Haut de Gamme
            </p>

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
    </div>
  );
}

export default App;
