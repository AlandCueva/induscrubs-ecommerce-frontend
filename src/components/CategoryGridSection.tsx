import React from 'react';

interface CategoryTile {
  id: string;
  title: string;
  imageUrl: string;
  targetId?: string;
}

const CATEGORIES: CategoryTile[] = [
  {
    id: 'nuevos-ingresos',
    title: 'Nuevos Ingresos',
    imageUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/modelingscrubs.jpeg',
  },
  {
    id: 'compra-por-color',
    title: 'Compra por Color',
    imageUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/shopbycolor_2K_202608310924.jpeg',
    targetId: 'compra-por-color',
  },
  {
    id: 'mujer',
    title: 'Mujer',
    imageUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/womenscrubs_2K_202608310924.jpeg',
  },
  {
    id: 'hombre',
    title: 'Hombre',
    imageUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/menscrubs_2K_202608310924.jpeg',
  },
];

interface CategoryGridSectionProps {
  onNavigate?: (view: any, extra?: any) => void;
}

export const CategoryGridSection: React.FC<CategoryGridSectionProps> = ({ onNavigate }) => {
  const handleScrollToSection = (targetId?: string) => {
    if (!targetId) return;
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTileClick = (category: CategoryTile) => {
    if (category.id === 'mujer') {
      onNavigate?.('catalog', { filterType: 'gender', value: 'Mujer' });
    } else if (category.id === 'hombre') {
      onNavigate?.('catalog', { filterType: 'gender', value: 'Hombre' });
    } else if (category.id === 'nuevos-ingresos') {
      onNavigate?.('catalog', { filterType: 'newArrivals', value: true });
    } else if (category.targetId) {
      handleScrollToSection(category.targetId);
    }
  };

  return (
    <section
      id="compra-por-categoria"
      className="relative w-full bg-[#FFFFFF] py-2 sm:py-3"
      aria-label="Compra por Categoría"
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 px-2 sm:px-3">
        {CATEGORIES.map((category) => {
          return (
            <div
              key={category.id}
              onClick={() => handleTileClick(category)}
              className="relative w-full h-[460px] sm:h-[540px] md:h-[70vh] overflow-hidden rounded-[6px] group select-none cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTileClick(category);
                }
              }}
            >
              {/* Full-bleed Photo Background */}
              <img
                src={category.imageUrl}
                alt={category.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Bottom Dark Gradient Overlay for Readability */}
              <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.25) 45%, rgba(0, 0, 0, 0) 75%)',
                }}
              />

              {/* Bottom-left Content */}
              <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-6 sm:left-8 md:left-10 z-20 flex flex-col items-start gap-4 max-w-[85%]">
                <h3
                  className="text-[#FFFFFF] drop-shadow-sm group-hover:underline"
                  style={{
                    fontFamily: "'Inter Variable', Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: '20px',
                    lineHeight: '1.05',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {category.title}
                </h3>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTileClick(category);
                  }}
                  className="h-11 px-7 bg-[#FFFFFF] hover:bg-[#F2F7FF] text-[#16232F] rounded-[6px] transition-colors flex items-center justify-center min-h-[44px] shadow-sm cursor-pointer"
                  style={{
                    fontFamily: "'Inter Variable', Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: '14px',
                    lineHeight: '1.05',
                    letterSpacing: '-0.02em',
                  }}
                  aria-label={`Ver más sobre ${category.title}`}
                >
                  VER MÁS
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
