import React, { useEffect, useState } from 'react';
import { ArrowLeft, Tag } from 'lucide-react';
import { Product, fetchProducts, getDiscountBadgeLabel } from '../lib/products';
import { ProductCard } from './BestSellersSection';

interface DiscountsPageProps {
  onNavigate?: (view: any, extra?: any) => void;
}

export const DiscountsPage: React.FC<DiscountsPageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setError(null);
    fetchProducts()
      .then((allProducts) => {
        if (isCurrentRequest) setProducts(allProducts.filter((product) => getDiscountBadgeLabel(product) !== null));
      })
      .catch((cause: unknown) => {
        console.error('Error loading discounted products:', cause);
        if (isCurrentRequest) setError('No pudimos cargar los productos con descuento. Inténtalo de nuevo.');
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [retryCount]);

  return (
    <main id="discounts-content" className="w-full bg-[#FFFFFF] py-6 sm:py-10 md:py-12">
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

        <div className="mb-8">
          <h1 className="text-[#16232F] text-[28px] leading-tight tracking-[-0.025em] font-bold">
            Descuentos
          </h1>
          <p className="mt-2 text-sm text-[#5A6E85]">
            Encuentra nuestros productos con descuentos activos.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
            {[0, 1, 2].map((item) => (
              <div key={item} className="aspect-[3/4] bg-[#F7F9FB] rounded-[4px] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="py-12 text-center">
            <p className="text-sm text-[#5A6E85] mb-4">{error}</p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="h-11 px-6 bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-sm font-semibold rounded-[6px] transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24">
            <Tag className="w-10 h-10 text-[#DDE3EA] mb-4" aria-hidden="true" />
            <p className="text-sm font-semibold text-[#16232F] mb-1">No hay descuentos activos por ahora.</p>
            <p className="text-xs text-[#5A6E85] mb-6">Vuelve pronto para descubrir nuevas ofertas.</p>
            <button
              type="button"
              onClick={() => onNavigate?.('catalog')}
              className="h-11 px-6 bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-sm font-semibold rounded-[6px] transition-colors flex items-center justify-center min-h-[44px] shadow-sm cursor-pointer"
            >
              Ver Colección
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
            {products.map((product) => (
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
