import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PRODUCTS } from '../data/products';

const SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

interface PDPPageProps {
  productId?: string;
  onNavigate?: (view: any, extra?: any) => void;
  onAddToCart?: (item: { productId: string; name: string; size: string; price: number; image?: string }) => void;
}

export const PDPPage: React.FC<PDPPageProps> = ({ productId, onNavigate, onAddToCart }) => {
  // Find product by productId or default to the first product
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS.find((p) => p.id === 'sketchers-scrub-set-black') || PRODUCTS[0];
  const [selectedSize, setSelectedSize] = useState<string>('M');

  if (!product) {
    return null;
  }

  const handleBuyNow = () => {
    const numericPrice = typeof product.price === 'number'
      ? product.price
      : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 65;

    onAddToCart?.({
      productId: product.id,
      name: product.name,
      size: selectedSize,
      price: numericPrice,
      image: product.image,
    });
  };

  return (
    <main id="pdp-content" className="w-full bg-[#FFFFFF] py-6 sm:py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link to Catalog */}
        <button
          type="button"
          onClick={() => onNavigate?.('catalog')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5A6E85] hover:text-[#16232F] transition-colors mb-6 sm:mb-8 cursor-pointer group"
          aria-label="Volver al Catálogo"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver al Catálogo</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Left Column: Product Main Image */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] bg-[#F7F9FB] rounded-[8px] overflow-hidden border border-[#DDE3EA]/60 shadow-sm">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            </div>
          </div>

          {/* Right Column: Product Information Panel */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center select-none">
            {/* Eyebrow Label (Category) */}
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2C63AE] mb-2">
              {product.category}
            </span>

            {/* Locked Typography Heading */}
            <h1
              className="text-[#16232F] mb-2"
              style={{
                fontFamily: "'Inter Variable', Inter, sans-serif",
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '105%',
                letterSpacing: '-0.02em',
              }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-[#16232F] tracking-tight">
                {product.price}
              </span>
              <span className="text-xs font-medium text-[#5A6E85]">IVA incluido</span>
            </div>

            {/* Description Copy */}
            <p className="text-sm text-[#5A6E85] leading-relaxed mb-6">
              {product.description ||
                'Corte moderno, transpirable de principio a fin de turno. Bolsillos funcionales, tela resistente a manchas y ajuste pensado para moverte sin límites durante guardias largas.'}
            </p>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-semibold text-[#16232F] mb-2.5">
                <span>
                  Talla: <span className="text-[#2C63AE] font-bold">{selectedSize}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`h-9 min-w-[42px] px-2.5 rounded-[4px] border text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer ${
                      selectedSize === size
                        ? 'bg-[#84B8FF] text-[#FFFFFF] border-[#84B8FF]'
                        : 'bg-[#FFFFFF] text-[#16232F] border-[#DDE3EA] hover:border-[#16232F]/60'
                    }`}
                    aria-label={`Seleccionar talla ${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Buy Now CTA Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full h-12 bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-sm font-semibold rounded-[6px] transition-colors flex items-center justify-center min-h-[48px] shadow-sm cursor-pointer mb-6"
              aria-label={`Comprar ${product.name}`}
            >
              COMPRAR AHORA
            </button>

            {/* "Also available in" block (Rendered only if variants array is non-empty) */}
            {product.variants && product.variants.length > 0 && (
              <div className="pt-6 border-t border-[#DDE3EA]">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#16232F] mb-3">
                  También disponible en
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.color}
                      className="flex items-center gap-2.5 p-2.5 rounded-[6px] border border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/40 transition-colors cursor-default"
                    >
                      <div className="w-11 h-13 rounded-[4px] overflow-hidden bg-[#F7F9FB] flex-shrink-0 border border-[#DDE3EA]/60">
                        <img
                          src={variant.image}
                          alt={variant.color}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#16232F] truncate">
                          {variant.color}
                        </span>
                        <span className="text-xs font-medium text-[#5A6E85]">
                          {product.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
