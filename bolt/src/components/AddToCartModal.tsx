import { X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage: string;
  quantity: number;
}

export function AddToCartModal({ isOpen, onClose, productName, productImage, quantity }: AddToCartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>

          <h2 className="text-2xl font-light text-center mb-6">
            Produit ajouté au panier
          </h2>

          <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4 mb-6">
            <img
              src={productImage}
              alt={productName}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{productName}</h3>
              <p className="text-sm text-gray-600">Quantité : {quantity}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors rounded-lg font-medium"
            >
              Continuer
            </button>
            <Link
              to="/cart"
              className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors rounded-lg font-medium text-center"
            >
              Voir le panier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
