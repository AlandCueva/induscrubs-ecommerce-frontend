import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Product, fetchProductById } from '../lib/products';

// Canonical size display order (mirrors the DB "sizes" table sort_order).
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

interface PDPPageProps {
  productId?: string;
  onNavigate?: (view: any, extra?: any) => void;
  onAddToCart?: (item: {
    productId: string;
    name: string;
    size: string;
    price: number;
    image?: string;
    colorId?: string;
  }) => void;
}

export const PDPPage: React.FC<PDPPageProps> = ({ productId, onNavigate, onAddToCart }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetchProductById(productId)
      .then((data) => {
        setProduct(data);
        setSelectedColorId(data?.colors[0]?.id);
        const sortedSizes = data
          ? [...data.sizeCodes].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
          : [];
        setSelectedSize(sortedSizes[0] ?? '');
        setActiveImageIndex(0);
      })
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [productId]);

  const sortedSizeCodes = useMemo(
    () => (product ? [...product.sizeCodes].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)) : []),
    [product]
  );

  // Real color-swap gallery: prefer images tagged for the selected color, fall
  // back to color-agnostic images, then to whatever images exist at all.
  const displayImages = useMemo(() => {
    if (!product) return [];
    const forColor = product.images.filter((img) => img.colorId === selectedColorId);
    if (forColor.length > 0) return forColor;
    const generic = product.images.filter((img) => img.colorId === null);
    if (generic.length > 0) return generic;
    return product.images;
  }, [product, selectedColorId]);

  const activeImage = displayImages[Math.min(activeImageIndex, displayImages.length - 1)];

  const variantFor = (sizeCode: string) =>
    product?.variants.find((v) => v.sizeCode === sizeCode && v.colorId === selectedColorId);

  const activeVariant = variantFor(selectedSize);
  const canBuy = Boolean(activeVariant && activeVariant.stock > 0);

  const handleSelectColor = (colorId: string) => {
    setSelectedColorId(colorId);
    setActiveImageIndex(0);
  };

  const handleBuyNow = () => {
    if (!product || !canBuy || !selectedColorId) return;
    onAddToCart?.({
      productId: product.id,
      name: product.name,
      size: selectedSize,
      price: product.finalPrice,
      image: activeImage?.url,
      colorId: selectedColorId,
    });
  };

  if (isLoading) {
    return (
      <main className="w-full bg-[#FFFFFF] py-6 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">
            <div className="lg:col-span-6 xl:col-span-7 aspect-[3/4] sm:aspect-[4/5] bg-[#F7F9FB] rounded-[8px] animate-pulse" />
            <div className="lg:col-span-6 xl:col-span-5 space-y-4">
              <div className="h-4 w-24 bg-[#F7F9FB] rounded animate-pulse" />
              <div className="h-8 w-2/3 bg-[#F7F9FB] rounded animate-pulse" />
              <div className="h-6 w-24 bg-[#F7F9FB] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main id="pdp-content" className="w-full bg-[#FFFFFF] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <p className="text-sm font-semibold text-[#16232F] mb-2">Producto no encontrado.</p>
          <button
            type="button"
            onClick={() => onNavigate?.('catalog')}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2C63AE] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Catálogo
          </button>
        </div>
      </main>
    );
  }

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
          {/* Left Column: Product Image Gallery */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] bg-[#F7F9FB] rounded-[8px] overflow-hidden border border-[#DDE3EA]/60 shadow-sm">
              {activeImage && (
                <img
                  src={activeImage.url}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              )}
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {displayImages.map((img, idx) => (
                  <button
                    key={`${img.url}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 shrink-0 rounded-[4px] overflow-hidden border-2 transition-colors cursor-pointer ${
                      idx === activeImageIndex ? 'border-[#2C63AE]' : 'border-transparent hover:border-[#DDE3EA]'
                    }`}
                    aria-label={`Ver imagen ${idx + 1}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information Panel */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center select-none">
            {/* Eyebrow Label (Category) */}
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2C63AE] mb-2">
              {product.categoryName}
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
              {product.hasDiscount && (
                <span className="text-base font-medium text-[#5A6E85] line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
              <span className="text-2xl font-bold text-[#16232F] tracking-tight">
                ${product.finalPrice.toFixed(2)}
              </span>
              <span className="text-xs font-medium text-[#5A6E85]">IVA incluido</span>
            </div>

            {/* Description Copy */}
            <p className="text-sm text-[#5A6E85] leading-relaxed mb-6">{product.description}</p>

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-semibold text-[#16232F] mb-2.5">
                  <span>
                    Color:{' '}
                    <span className="text-[#2C63AE] font-bold">
                      {product.colors.find((c) => c.id === selectedColorId)?.name ?? ''}
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleSelectColor(color.id)}
                      title={color.name}
                      className={`w-9 h-9 rounded-[4px] border transition-all cursor-pointer ${
                        selectedColorId === color.id
                          ? 'ring-2 ring-[#2C63AE] ring-offset-2 border-black/10'
                          : 'border-black/10 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Seleccionar color ${color.name}`}
                      aria-pressed={selectedColorId === color.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-semibold text-[#16232F] mb-2.5">
                <span>
                  Talla: <span className="text-[#2C63AE] font-bold">{selectedSize || '—'}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sortedSizeCodes.map((size) => {
                  const variant = variantFor(size);
                  const isOutOfStock = !variant || variant.stock === 0;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`h-9 min-w-[42px] px-2.5 rounded-[4px] border text-xs font-semibold transition-colors flex items-center justify-center ${
                        isOutOfStock
                          ? 'bg-[#F7F9FB] text-[#B8C2CC] border-[#EAEFF4] cursor-not-allowed line-through'
                          : selectedSize === size
                            ? 'bg-[#84B8FF] text-[#FFFFFF] border-[#84B8FF] cursor-pointer'
                            : 'bg-[#FFFFFF] text-[#16232F] border-[#DDE3EA] hover:border-[#16232F]/60 cursor-pointer'
                      }`}
                      aria-label={`Seleccionar talla ${size}${isOutOfStock ? ' (agotada)' : ''}`}
                      aria-disabled={isOutOfStock}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buy Now CTA Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!canBuy}
              className={`w-full h-12 text-[#FFFFFF] text-sm font-semibold rounded-[6px] transition-colors flex items-center justify-center min-h-[48px] shadow-sm mb-6 ${
                canBuy ? 'bg-[#2C63AE] hover:bg-[#245292] cursor-pointer' : 'bg-[#B8C2CC] cursor-not-allowed'
              }`}
              aria-label={`Comprar ${product.name}`}
            >
              {canBuy ? 'COMPRAR AHORA' : 'AGOTADO EN ESTA COMBINACIÓN'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
