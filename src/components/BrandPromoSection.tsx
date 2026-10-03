import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Section } from './Section';
import { useBrandPromotions } from '../lib/brandPromotions';
import { formatPromoPrice } from '../lib/calcBrandPromo';

interface BrandPromoSectionProps {
  onNavigate?: (view: any, extra?: any) => void;
}

// Home banner for the brand combo promo. Hidden while loading or when no
// promotion is active, so it never flashes an empty block.
export const BrandPromoSection: React.FC<BrandPromoSectionProps> = ({ onNavigate }) => {
  const { promotions } = useBrandPromotions();

  if (promotions.length === 0) return null;

  // Mechanic comes from the first active row; the cart pools by price tier, so
  // rows with different prices still price correctly there.
  const { singleItemPrice, pairPrice } = promotions[0];

  return (
    <Section id="promo-combo" density="default" bg="tint-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
        <div className="max-w-[640px]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2C63AE] mb-2">Promo combo</p>
          <h2
            className="text-[#16232F] text-3xl sm:text-4xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
          >
            2 x {formatPromoPrice(pairPrice)}
            <span className="text-[#5A6E85] font-semibold text-xl sm:text-2xl">
              {' '}
              · 1 x {formatPromoPrice(singleItemPrice)}
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#5A6E85] leading-relaxed mb-3">
            Combina prendas de estas marcas y paga {formatPromoPrice(pairPrice)} por cada par, o{' '}
            {formatPromoPrice(singleItemPrice)} si llevas una sola. Cualquier talla y color.
          </p>
          <p className="text-sm font-semibold text-[#16232F]">
            {promotions.map((promo, index) => (
              <React.Fragment key={promo.id}>
                {index > 0 && <span className="text-[#B8C2CC] font-normal"> · </span>}
                <button
                  type="button"
                  onClick={() => onNavigate?.('catalog', { filterType: 'brand', value: promo.brandId })}
                  className="hover:text-[#2C63AE] hover:underline cursor-pointer"
                >
                  {promo.brandName}
                </button>
              </React.Fragment>
            ))}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onNavigate?.('catalog', { filterType: 'brand', value: promotions.map((p) => p.brandId) })
          }
          className="w-full md:w-auto shrink-0 h-12 px-6 bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-sm font-semibold rounded-[6px] transition-colors flex items-center justify-center gap-2 min-h-[44px] shadow-sm cursor-pointer"
        >
          <span>Ver prendas en promo</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </Section>
  );
};
