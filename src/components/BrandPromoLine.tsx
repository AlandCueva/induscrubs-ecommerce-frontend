import React from 'react';
import { Tag } from 'lucide-react';
import { BrandPromoGroup, formatPromoPrice } from '../lib/calcBrandPromo';

interface BrandPromoLineProps {
  group: BrandPromoGroup;
  compact?: boolean;
}

// One grouped line for all matching units of a promo tier, with the savings.
export const BrandPromoLine: React.FC<BrandPromoLineProps> = ({ group, compact = false }) => {
  const breakdown = [
    group.pairs > 0 ? `${group.pairs} x ${formatPromoPrice(group.pairPrice)}` : null,
    group.singles > 0 ? `${group.singles} x ${formatPromoPrice(group.singleItemPrice)}` : null,
  ]
    .filter(Boolean)
    .join(' + ');

  return (
    <div className="px-3 py-2.5 bg-[#F2F7FF] rounded-[4px] border border-[#84B8FF]/40 text-[#2C63AE]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Tag className="w-3.5 h-3.5 shrink-0" />
            <span>Promo combo</span>
          </div>
          <p className={`${compact ? 'text-[11px]' : 'text-xs'} text-[#5A6E85] mt-0.5 leading-snug`}>
            {group.brandNames.join(', ')} · {group.units} {group.units === 1 ? 'prenda' : 'prendas'}: {breakdown} ={' '}
            <span className="font-semibold text-[#16232F]">${group.promoTotal.toFixed(2)}</span>{' '}
            <span className="line-through">${group.regularTotal.toFixed(2)}</span>
          </p>
        </div>
        <span className="text-xs font-bold shrink-0">Ahorras ${group.savings.toFixed(2)}</span>
      </div>
    </div>
  );
};
