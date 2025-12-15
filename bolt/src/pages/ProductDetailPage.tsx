import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, ShoppingCart, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { AddToCartModal } from '../components/AddToCartModal';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  ambiance: string;
  color: string;
  available: boolean;
  dimensions?: string;
  weight?: string;
  materials?: string;
  additional_info?: string;
  ambient_images?: string[];
  product_image?: string;
  diagrams?: string[];
  category_id: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  image_url: string;
  ambiance: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [currentRelatedIndex, setCurrentRelatedIndex] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState<{ name: string; image: string } | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setProduct(data);
        setSelectedImage(data.product_image || data.image_url);

        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', data.category_id)
          .maybeSingle();

        if (categoryData) {
          setCategory(categoryData);
        }

        const { data: relatedData } = await supabase
          .from('products')
          .select('id, name, image_url, ambiance')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .limit(6);

        if (relatedData) {
          setRelatedProducts(relatedData);
        }
      }

      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light mb-4">Produit non trouvé</h2>
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [
    product.product_image || product.image_url,
    ...(product.ambient_images || []),
  ].filter(Boolean);

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % allImages.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(allImages[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(allImages[prevIndex]);
  };

  const handleThumbnailClick = (img: string, idx: number) => {
    setSelectedImage(img);
    setCurrentImageIndex(idx);
  };

  const handleAddToCart = () => {
    if (product) {
      const imageUrl = product.product_image || product.image_url;
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          image_url: imageUrl,
        });
      }
      setAddedProduct({
        name: product.name,
        image: imageUrl,
      });
      setShowModal(true);
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 5000));
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.min(Math.max(value, 1), 5000));
  };

  const getItemsPerSlide = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 2;
    }
    return 3;
  };

  const nextRelatedProducts = () => {
    const itemsPerSlide = getItemsPerSlide();
    if (currentRelatedIndex < relatedProducts.length - itemsPerSlide) {
      setCurrentRelatedIndex(currentRelatedIndex + 1);
    }
  };

  const prevRelatedProducts = () => {
    if (currentRelatedIndex > 0) {
      setCurrentRelatedIndex(currentRelatedIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900 transition-colors flex items-center">
              <Home size={16} className="mr-1" />
              Accueil
            </Link>
            <ChevronRight size={14} />
            {category && (
              <>
                <Link to={`/categories/${category.slug}`} className="hover:text-gray-900 transition-colors">
                  {category.name}
                </Link>
                <ChevronRight size={14} />
              </>
            )}
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 group">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft size={24} className="text-gray-900" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight size={24} className="text-gray-900" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {allImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleThumbnailClick(allImages[idx], idx)}
                          className={`h-2 rounded-full transition-all ${
                            idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/60 w-2'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleThumbnailClick(img, idx)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden transition-all ${
                        currentImageIndex === idx ? 'ring-2 ring-black' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-light mb-4">{product.name}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {product.ambiance && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Ambiance</h3>
                    <p className="text-gray-900">{product.ambiance}</p>
                  </div>
                )}
                {product.color && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Couleur</h3>
                    <p className="text-gray-900">{product.color}</p>
                  </div>
                )}
                {product.materials && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Matière</h3>
                    <p className="text-gray-900">{product.materials}</p>
                  </div>
                )}
              </div>

              {(product.dimensions || product.weight) && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Techniques</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {product.dimensions && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Dimensions</h4>
                        <p className="text-gray-900">{product.dimensions}</p>
                      </div>
                    )}
                    {product.weight && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Poids</h4>
                        <p className="text-gray-900">{product.weight}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {product.diagrams && product.diagrams.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Schémas Techniques</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {product.diagrams.map((diagram, idx) => (
                      <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={diagram}
                          alt={`Schéma ${idx + 1}`}
                          className="w-full h-full object-contain p-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.additional_info && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Informations Complémentaires</h3>
                  <p className="text-gray-900 leading-relaxed">{product.additional_info}</p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={decreaseQuantity}
                      className="px-4 py-3 hover:bg-gray-100 transition-colors"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus size={18} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="px-6 py-3 w-24 text-center font-medium border-x-2 border-gray-300 focus:outline-none focus:bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={increaseQuantity}
                      className="px-4 py-3 hover:bg-gray-100 transition-colors"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors rounded-lg flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart size={20} />
                    <span>Ajouter au panier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl md:text-4xl font-light text-gray-900">Vous aimerez aussi</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={prevRelatedProducts}
                    disabled={currentRelatedIndex === 0}
                    className="p-2 md:p-3 border-2 border-gray-900 disabled:border-gray-300 disabled:text-gray-300 hover:bg-gray-900 hover:text-white transition-all disabled:hover:bg-transparent disabled:hover:text-gray-300"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={nextRelatedProducts}
                    disabled={currentRelatedIndex >= relatedProducts.length - getItemsPerSlide()}
                    className="p-2 md:p-3 border-2 border-gray-900 disabled:border-gray-300 disabled:text-gray-300 hover:bg-gray-900 hover:text-white transition-all disabled:hover:bg-transparent disabled:hover:text-gray-300"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>
              </div>

              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentRelatedIndex * (100 / getItemsPerSlide())}%)` }}
                >
                  {relatedProducts.map((relatedProduct) => (
                    <div key={relatedProduct.id} className="w-1/2 md:w-1/3 flex-shrink-0 px-3">
                      <Link to={`/products/${relatedProduct.id}`} className="group block">
                        <div className="aspect-[3/4] overflow-hidden bg-gray-100 rounded-lg mb-4 shadow-md group-hover:shadow-xl transition-all duration-500">
                          <img
                            src={relatedProduct.image_url}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        {relatedProduct.ambiance && (
                          <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-medium">
                            {relatedProduct.ambiance}
                          </p>
                        )}
                        <h3 className="text-lg md:text-xl group-hover:text-gray-600 transition-colors">
                          {relatedProduct.name}
                        </h3>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <AddToCartModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        productName={addedProduct?.name || ''}
        productImage={addedProduct?.image || ''}
        quantity={quantity}
      />

      <Footer />
    </div>
  );
}
