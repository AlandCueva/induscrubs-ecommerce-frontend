import React from 'react';
import { Heart } from 'lucide-react';
import { useFavoriteIds, toggleFavorite } from '../lib/favorites';

interface FavoriteButtonProps {
  productId: string;
  size?: 'sm' | 'md';
  className?: string;
}

// Square (not pill) icon toggle, reused everywhere a product is shown:
// card grids, PDP, and the ScrollScrubSection static card.
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  productId,
  size = 'sm',
  className = '',
}) => {
  const favoriteIds = useFavoriteIds();
  const isFav = favoriteIds.includes(productId);
  const dims = size === 'md' ? 'w-10 h-10' : 'w-8 h-8 sm:w-9 sm:h-9';
  const iconDims = size === 'md' ? 'w-5 h-5' : 'w-4 h-4 sm:w-[18px] sm:h-[18px]';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      className={`flex items-center justify-center rounded-[4px] transition-colors shrink-0 cursor-pointer ${dims} ${
        isFav
          ? 'bg-[#16232F] text-[#FFFFFF]'
          : 'bg-[#FFFFFF]/90 text-[#16232F] border border-[#DDE3EA]/60 hover:bg-[#FFFFFF]'
      } ${className}`}
      aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={isFav}
    >
      <Heart className={iconDims} fill={isFav ? 'currentColor' : 'none'} strokeWidth={2} />
    </button>
  );
};
