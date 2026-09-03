import React, { useEffect, useState } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { Product, fetchProducts } from '../lib/products';
import { useFavoriteIds } from '../lib/favorites';
import { ProductCard } from './BestSellersSection';

interface FavoritesPageProps {
  onNavigate?: (view: any, extra?: any) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigate }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const favoriteIds = useFavoriteIds();

  useEffect(() => {
    fetchProducts()
      .then(setAllProducts)
      .catch(() => setAllProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Stale favorite ids (product deleted/no longer exists) are simply absent
  // from allProducts, so filtering against it skips them silently.
  const favoriteProducts = allProducts.filter((p) => favoriteIds.includes(p.id));

  return (
    <main id="favorites-content" className="w-full bg-[#FFFFFF] py-6 sm:py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate?.('home')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5A6E85] hover:text-[#16232F] transition-colors mb-6 sm:mb-8 cursor-pointer group"
          aria-label="Volver al Inicio"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver al Inicio</span>
        </button>

        <h1
          className="text-[#16232F] mb-8"
          style={{
            fontFamily: "'Inter Variable', Inter, sans-serif",
            fontWeight: 700,
            fontSize: '28px',
            lineHeight: '1.05',
            letterSpacing: '-0.025em',
          }}
        >
          Favoritos
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[3/4] bg-[#F7F9FB] rounded-[4px] animate-pulse" />
            ))}
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24">
            <Heart className="w-10 h-10 text-[#DDE3EA] mb-4" />
            <p className="text-sm font-semibold text-[#16232F] mb-1">Aún no tienes favoritos.</p>
            <p className="text-xs text-[#5A6E85] mb-6">
              Toca el corazón en cualquier producto para guardarlo aquí.
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.('catalog')}
              className="h-11 px-6 bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-sm font-semibold rounded-[6px] transition-colors flex items-center justify-center min-h-[44px] shadow-sm cursor-pointer"
              aria-label="Ir al Catálogo"
            >
              Ver Colección
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
            {favoriteProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onNavigate?.('pdp', product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
