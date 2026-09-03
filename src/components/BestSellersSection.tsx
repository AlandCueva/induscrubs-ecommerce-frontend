import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Section } from './Section';
import { FavoriteButton } from './FavoriteButton';
import { Product, fetchProducts, getDiscountBadgeLabel } from '../lib/products';

export const ProductCard: React.FC<{ product: Product; onClick?: () => void }> = ({
  product,
  onClick,
}) => {
  const mainImage = product.images[0];
  // Hover-swap target: the second photo within the same color group as the
  // card's main image, in existing product_images sort_order. Groups with
  // only one image simply have no hover target, so hovering is a no-op.
  const hoverImage = product.images.filter((img) => img.colorId === mainImage?.colorId)[1];
  const discountBadge = getDiscountBadgeLabel(product);

  // Title underline is driven by a real mouseenter/mouseleave DOM event into
  // React state, not a CSS `:hover`/`group-hover` variant — this was rebuilt
  // after the CSS-variant approach proved unreliable to verify in practice
  // (see prior investigation), so the effect no longer depends on a specific
  // generated Tailwind utility rule actually being present in the delivered
  // CSS at any given moment.
  const [isTitleHovered, setIsTitleHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsTitleHovered(true)}
      onMouseLeave={() => setIsTitleHovered(false)}
      className={`group flex flex-col w-full select-none ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* 1. Large photo filling most of the card (~3:4 aspect ratio), full-bleed, no border/frame */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#F7F9FB] rounded-[4px]">
        {mainImage && (
          <img
            src={mainImage.url}
            alt={product.name}
            className={`w-full h-full object-cover ${hoverImage ? 'transition-opacity duration-300' : ''}`}
            loading="lazy"
          />
        )}
        {hoverImage && (
          <img
            src={hoverImage.url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
          />
        )}
        {discountBadge && (
          <span className="absolute top-2 left-2 z-10 px-2.5 py-1.5 rounded-[4px] bg-[#16232F] text-[#FFFFFF] text-[13px] sm:text-[15px] font-bold tracking-wide">
            {discountBadge}
          </span>
        )}
        <FavoriteButton productId={product.id} className="absolute top-2 right-2 z-10" />
      </div>

      {/* 2. Bottom row: product name on left, price in bold text on right (responsive for mobile 2-col & desktop) */}
      {/* No truncation: full product name always shows, wrapping to as many lines as it needs. */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-3 mt-2.5 sm:mt-4 text-[#16232F] font-bold leading-[105%] tracking-[-0.02em]">
        <span className={`text-[14px] sm:text-[18px] md:text-[20px] ${isTitleHovered ? 'underline' : ''}`}>
          {product.name}
        </span>
        <span className="flex items-baseline gap-1.5 shrink-0">
          {product.hasDiscount && (
            <span className="text-[12px] sm:text-[14px] font-medium text-[#5A6E85] line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
          <span className="text-[15px] sm:text-[20px] md:text-[24px]">
            ${product.finalPrice.toFixed(2)}
          </span>
        </span>
      </div>

      {/* 3. Color swatch dots reflecting this product's real available colors */}
      {product.colors.length > 0 && (
        <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-2.5" aria-hidden="true">
          {product.colors.slice(0, 3).map((color) => (
            <span
              key={color.id}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full inline-block border border-black/10"
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface BestSellersSectionProps {
  onNavigate?: (view: any, extra?: any) => void;
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  // "Best Sellers" placeholder logic: no sales/order-count data is wired up yet,
  // so this section shows the newest-created products until real bestseller
  // tracking exists. fetchProducts() already orders by created_at desc.
  const totalCount = products.length;
  // 5 clone sets provide an extensive buffer so fast consecutive clicks never run out of room
  const extendedProducts =
    totalCount > 0 ? [...products, ...products, ...products, ...products, ...products] : [];
  const middleSetStart = totalCount * 2; // start of the middle 3rd clone set

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const isAnimatingRef = useRef<boolean>(false);

  // Re-center the carousel once real product count is known (data loads async)
  useEffect(() => {
    setIsTransitioning(false);
    setCurrentIndex(middleSetStart);
  }, [totalCount]);

  // TransitionEnd handles smooth seamless teleporting into the middle clone set
  const handleTransitionEnd = useCallback(() => {
    isAnimatingRef.current = false;

    if (currentIndex >= totalCount * 3 || currentIndex < totalCount) {
      setIsTransitioning(false);
      const normalizedOffset = ((currentIndex % totalCount) + totalCount) % totalCount;
      const targetIndex = middleSetStart + normalizedOffset;
      setCurrentIndex(targetIndex);
    }
  }, [currentIndex, totalCount, middleSetStart]);

  useEffect(() => {
    if (!isTransitioning) {
      const rafId = requestAnimationFrame(() => {
        const rafId2 = requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
        return () => cancelAnimationFrame(rafId2);
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [isTransitioning]);

  const unlockFallback = () => {
    isAnimatingRef.current = false;
  };

  const handleNext = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setTimeout(unlockFallback, 500);
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setTimeout(unlockFallback, 500);
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  if (isLoading) {
    return (
      <Section id="best-sellers" density="default" bg="white" title="Best Sellers">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-[#F7F9FB] rounded-[4px] animate-pulse" />
          ))}
        </div>
      </Section>
    );
  }

  if (totalCount === 0) {
    return null;
  }

  return (
    <Section
      id="best-sellers"
      density="default"
      bg="white"
      title="Best Sellers"
    >
      <div className="relative w-full">
        {/* Desktop Carousel (md: and up) - 4 visible at once with infinite sliding loop */}
        <div className="hidden md:block relative w-full">
          {/* Navigation Arrows positioned cleanly on the sides */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute -left-4 lg:-left-6 top-[38%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-lg border border-[#DDE3EA] flex items-center justify-center text-[#16232F] hover:bg-[#F7F9FB] hover:border-[#16232F]/40 transition-colors cursor-pointer"
            aria-label="Anterior producto"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute -right-4 lg:-right-6 top-[38%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-lg border border-[#DDE3EA] flex items-center justify-center text-[#16232F] hover:bg-[#F7F9FB] hover:border-[#16232F]/40 transition-colors cursor-pointer"
            aria-label="Siguiente producto"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Track Container showing exactly 4 cards at once */}
          <div className="overflow-hidden w-full">
            <div
              className="flex"
              onTransitionEnd={handleTransitionEnd}
              style={{
                transform: `translateX(-${(currentIndex * 100) / extendedProducts.length}%)`,
                transition: isTransitioning
                  ? 'transform 400ms cubic-bezier(0.25, 1, 0.5, 1)'
                  : 'none',
                width: `${(extendedProducts.length / 4) * 100}%`,
              }}
            >
              {extendedProducts.map((product, idx) => (
                <div
                  key={`${product.id}-${idx}`}
                  style={{ width: `${100 / extendedProducts.length}%` }}
                  className="px-3 shrink-0"
                >
                  <ProductCard
                    product={product}
                    onClick={() => onNavigate?.('pdp', product.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Scroll (below md:) - 2 cards per view (side by side) with scroll-snap */}
        <div className="md:hidden flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[calc(50%-6px)] sm:w-[calc(50%-8px)] snap-start shrink-0"
            >
              <ProductCard
                product={product}
                onClick={() => onNavigate?.('pdp', product.id)}
              />
            </div>
          ))}
        </div>

        {/* Centered "Shop All" CTA Button */}
        <div className="mt-8 sm:mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate?.('catalog')}
            className="h-12 px-8 bg-[#84B8FF] hover:bg-[#6FA5ED] text-[#FFFFFF] text-sm font-semibold rounded-[6px] transition-colors flex items-center justify-center min-h-[48px] shadow-sm cursor-pointer"
            style={{
              fontFamily: "'Inter Variable', Inter, sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '105%',
              letterSpacing: '-0.02em',
            }}
            aria-label="Shop All Best Sellers"
          >
            Shop All
          </button>
        </div>
      </div>
    </Section>
  );
};
