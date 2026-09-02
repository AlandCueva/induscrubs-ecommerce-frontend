import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Section } from './Section';
import { Brand, fetchBrands } from '../lib/products';

interface BrandsSectionProps {
  onNavigate?: (view: any, extra?: any) => void;
}

export const BrandsSection: React.FC<BrandsSectionProps> = ({ onNavigate }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetchBrands()
      .then(setBrands)
      .catch(() => setBrands([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Skip brands with no logo — nothing to render a broken <img> from.
  const brandsWithLogo = brands.filter((b) => b.logoUrl);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  // Re-measure once the live brand list actually renders (layout width changes after async load).
  useEffect(() => {
    checkScroll();
  }, [brandsWithLogo.length, checkScroll]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = Math.max(container.clientWidth * 0.75, 240);
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!isLoading && brandsWithLogo.length === 0) {
    return null;
  }

  return (
    <Section
      id="nuestras-marcas"
      density="default"
      bg="white"
      title="Nuestras Marcas"
    >
      <div className="relative w-full group">
        {/* Left Arrow Navigation Button */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          className={`absolute left-0 sm:-left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-[#84B8FF] hover:bg-[#6FA5ED] text-[#FFFFFF] shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-[#2C63AE]`}
          aria-label="Ver marcas anteriores"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Carousel Scroll Track */}
        <div
          ref={scrollRef}
          className="w-full flex items-center overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 px-6 sm:px-10 gap-6 sm:gap-10 md:gap-14 lg:gap-16 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden justify-start md:justify-center"
        >
          {isLoading
            ? [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 h-14 sm:h-18 md:h-22 lg:h-26 w-[160px] sm:w-[200px] bg-[#F7F9FB] rounded-[6px] animate-pulse"
                />
              ))
            : brandsWithLogo.map((brand) => (
                <div
                  key={brand.id}
                  onClick={() => onNavigate?.('catalog', { filterType: 'brand', value: brand.id })}
                  className="flex-shrink-0 snap-center flex items-center justify-center p-3 sm:p-4 min-w-[200px] sm:min-w-[240px] md:min-w-0 select-none cursor-pointer hover:scale-105 transition-transform bg-[#FFFFFF] rounded-[6px]"
                  role="button"
                  tabIndex={0}
                  aria-label={`Filtrar por marca ${brand.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onNavigate?.('catalog', { filterType: 'brand', value: brand.id });
                    }
                  }}
                >
                  <img
                    src={brand.logoUrl!}
                    alt={brand.name}
                    className="h-14 sm:h-18 md:h-22 lg:h-26 w-auto max-w-[190px] sm:max-w-[240px] md:max-w-[300px] object-contain grayscale hover:grayscale-0 transition-all duration-300 ease-out"
                    loading="lazy"
                  />
                </div>
              ))}
        </div>

        {/* Right Arrow Navigation Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          className={`absolute right-0 sm:-right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-[#84B8FF] hover:bg-[#6FA5ED] text-[#FFFFFF] shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-0 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-[#2C63AE]`}
          aria-label="Ver siguientes marcas"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </Section>
  );
};
