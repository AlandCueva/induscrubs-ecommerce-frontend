import React, { useState, useRef, useEffect } from 'react';
import { Section } from './Section';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchColors, ProductColorOption } from '../lib/products';

interface ColorPaletteSectionProps {
  onNavigateToCatalogWithColor?: (colorId: string) => void;
  onNavigateToCatalog?: () => void;
  onNavigate?: (view: any, extra?: any) => void;
}

// Maps this section's curated photo tiles to a real color name to look up
// against the live-fetched palette (no live color currently backs "White").
const TILE_TO_COLOR_NAME: Record<string, string | undefined> = {
  Red: 'Vino Borgoña',
  Black: 'Negro Azabache',
  Blue: 'Ceil Blue Médico',
  Green: 'Verde Quirúrgico Clásico',
  White: undefined,
};

const COLOR_TILES = [
  {
    label: 'Red',
    imageUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/scrubcred.webp',
  },
  {
    label: 'Black',
    imageUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/scrubcblack.webp',
  },
  {
    label: 'Blue',
    imageUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/scrubcblue.webp',
  },
  {
    label: 'White',
    imageUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/scrubssetwhite.jpg',
  },
  {
    label: 'Green',
    imageUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/scrubsetgreen.png',
  },
];

// 2 clones on each side for desktop seamless peeking loop
const DESKTOP_EXTENDED_TILES = [
  { ...COLOR_TILES[3], realIdx: 3 },
  { ...COLOR_TILES[4], realIdx: 4 },
  { ...COLOR_TILES[0], realIdx: 0 },
  { ...COLOR_TILES[1], realIdx: 1 },
  { ...COLOR_TILES[2], realIdx: 2 },
  { ...COLOR_TILES[3], realIdx: 3 },
  { ...COLOR_TILES[4], realIdx: 4 },
  { ...COLOR_TILES[0], realIdx: 0 },
  { ...COLOR_TILES[1], realIdx: 1 },
];

// 1 clone on each side for mobile snap swipe loop
const MOBILE_EXTENDED_TILES = [
  { ...COLOR_TILES[4], realIdx: 4 },
  { ...COLOR_TILES[0], realIdx: 0 },
  { ...COLOR_TILES[1], realIdx: 1 },
  { ...COLOR_TILES[2], realIdx: 2 },
  { ...COLOR_TILES[3], realIdx: 3 },
  { ...COLOR_TILES[4], realIdx: 4 },
  { ...COLOR_TILES[0], realIdx: 0 },
];

export const ColorPaletteSection: React.FC<ColorPaletteSectionProps> = ({ onNavigate }) => {
  const [activeGenderTab, setActiveGenderTab] = useState<'women' | 'men'>('women');
  // Desktop display index starts at 2 (which corresponds to real Red / index 0)
  const [desktopDisplayIndex, setDesktopDisplayIndex] = useState<number>(2);
  const [isDesktopTransitioning, setIsDesktopTransitioning] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isJumpingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [liveColors, setLiveColors] = useState<ProductColorOption[]>([]);

  useEffect(() => {
    fetchColors()
      .then(setLiveColors)
      .catch(() => setLiveColors([]));
  }, []);

  // Derive real active index (0 to 4)
  const selectedIndex = (desktopDisplayIndex - 2 + COLOR_TILES.length) % COLOR_TILES.length;

  const handleColorClick = (idx: number) => {
    const tile = COLOR_TILES[idx];
    const mappedName = tile ? TILE_TO_COLOR_NAME[tile.label] : undefined;
    const liveColor = mappedName
      ? liveColors.find((c) => c.name.toLowerCase() === mappedName.toLowerCase())
      : undefined;
    if (liveColor && onNavigate) {
      onNavigate('catalog', { filterType: 'color', value: liveColor.id });
    } else {
      handleSelectRealIndex(idx);
    }
  };

  const handlePrevDesktop = () => {
    setIsDesktopTransitioning(true);
    setDesktopDisplayIndex((prev) => prev - 1);
  };

  const handleNextDesktop = () => {
    setIsDesktopTransitioning(true);
    setDesktopDisplayIndex((prev) => prev + 1);
  };

  const handleSelectRealIndex = (idx: number) => {
    setIsDesktopTransitioning(true);
    setDesktopDisplayIndex(idx + 2);
  };

  const handleDesktopTransitionEnd = () => {
    // If reached right clones (index 7 or 8), jump to real slides (2 or 3)
    if (desktopDisplayIndex >= 7) {
      setIsDesktopTransitioning(false);
      setDesktopDisplayIndex(desktopDisplayIndex - COLOR_TILES.length);
    }
    // If reached left clones (index 0 or 1), jump to real slides (5 or 6)
    else if (desktopDisplayIndex <= 1) {
      setIsDesktopTransitioning(false);
      setDesktopDisplayIndex(desktopDisplayIndex + COLOR_TILES.length);
    }
  };

  // Set initial scroll position for mobile strip (to real Red at index 1)
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const firstChild = container.firstElementChild as HTMLElement | null;
      if (firstChild) {
        const itemWidth = firstChild.offsetWidth + 16;
        container.scrollLeft = 1 * itemWidth;
      }
    }
  }, []);

  const handleMobileScroll = () => {
    if (!scrollContainerRef.current || isJumpingRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const firstChild = container.firstElementChild as HTMLElement | null;
    if (!firstChild) return;

    const itemWidth = firstChild.offsetWidth + 16;
    const currentIdx = Math.round(scrollLeft / itemWidth);
    const realIndex = (currentIdx - 1 + COLOR_TILES.length) % COLOR_TILES.length;
    if (realIndex >= 0 && realIndex < COLOR_TILES.length && realIndex !== selectedIndex) {
      setIsDesktopTransitioning(true);
      setDesktopDisplayIndex(realIndex + 2);
    }

    // Silent wrapping at clone edges when scroll settles
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (!scrollContainerRef.current) return;
      const endScrollLeft = scrollContainerRef.current.scrollLeft;
      const endIdx = Math.round(endScrollLeft / itemWidth);

      if (endIdx === 0) {
        // Landed on clone Green at start -> silently jump to real Green (index 5)
        isJumpingRef.current = true;
        scrollContainerRef.current.scrollLeft = 5 * itemWidth;
        setTimeout(() => {
          isJumpingRef.current = false;
        }, 50);
      } else if (endIdx === 6) {
        // Landed on clone Red at end -> silently jump to real Red (index 1)
        isJumpingRef.current = true;
        scrollContainerRef.current.scrollLeft = 1 * itemWidth;
        setTimeout(() => {
          isJumpingRef.current = false;
        }, 50);
      }
    }, 100);
  };

  const handleSelectDotMobile = (idx: number) => {
    handleSelectRealIndex(idx);
    if (scrollContainerRef.current) {
      const firstChild = scrollContainerRef.current.firstElementChild as HTMLElement | null;
      if (firstChild) {
        const itemWidth = firstChild.offsetWidth + 16;
        scrollContainerRef.current.scrollTo({ left: (idx + 1) * itemWidth, behavior: 'smooth' });
      }
    }
  };

  const activeColor = COLOR_TILES[selectedIndex] || COLOR_TILES[0];

  return (
    <Section
      id="compra-por-color"
      density="default"
      bg="tint-1"
      title="Compra por Color"
      subtitle="El color define tu servicio, tu hospital y tu personalidad médica."
      headerAlign="split"
      headerAction={
        <div className="flex items-center gap-6 border-b border-[#DDE3EA]">
          <button
            type="button"
            onClick={() => setActiveGenderTab('women')}
            className={`pb-2 text-sm sm:text-base font-bold transition-colors min-h-[44px] flex items-center ${
              activeGenderTab === 'women'
                ? 'text-[#2C63AE] border-b-2 border-[#2C63AE]'
                : 'text-[#5B6B7A] hover:text-[#16232F]'
            }`}
            aria-pressed={activeGenderTab === 'women'}
          >
            Women
          </button>
          <button
            type="button"
            onClick={() => setActiveGenderTab('men')}
            className={`pb-2 text-sm sm:text-base font-bold transition-colors min-h-[44px] flex items-center ${
              activeGenderTab === 'men'
                ? 'text-[#2C63AE] border-b-2 border-[#2C63AE]'
                : 'text-[#5B6B7A] hover:text-[#16232F]'
            }`}
            aria-pressed={activeGenderTab === 'men'}
          >
            Men
          </button>
        </div>
      }
    >
      {/* DESKTOP/TABLET LAYOUT (md: and up) — Two-Pane Synced Selector */}
      <div className="hidden md:flex flex-row items-start gap-8 lg:gap-10">
        {/* Left Pane (~60% section width): Large Viewport with Sliding Filmstrip & Overlay Controls */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="relative w-full h-[460px] lg:h-[520px] rounded-[8px] overflow-hidden bg-[#FFFFFF] group/photo select-none [--slide-w:calc((3/4)*460px)] lg:[--slide-w:calc((3/4)*520px)] [--slide-gap:16px]">
            {/* Sliding Filmstrip Track Centered on Active Slide */}
            <div
              onTransitionEnd={handleDesktopTransitionEnd}
              className={`flex h-full items-center gap-[var(--slide-gap)] ${
                isDesktopTransitioning
                  ? 'transition-transform duration-500 ease-out'
                  : 'transition-none'
              } motion-reduce:transition-none`}
              style={{
                transform: `translateX(calc(50% - (${desktopDisplayIndex} * (var(--slide-w) + var(--slide-gap)) + (var(--slide-w) / 2))))`,
              }}
            >
              {DESKTOP_EXTENDED_TILES.map((tile, idx) => {
                const isActive = desktopDisplayIndex === idx;
                return (
                  <div
                    key={idx}
                    className="h-full aspect-[3/4] shrink-0 relative rounded-[6px] overflow-hidden bg-[#FFFFFF]"
                  >
                    <img
                      src={tile.imageUrl}
                      alt={`Uniformes médicos en color ${tile.label}`}
                      className="w-full h-full object-cover object-center"
                      loading={idx >= 2 && idx <= 6 ? 'eager' : 'lazy'}
                    />

                    {/* Subtle Bottom Gradient Scrim - Active Centered Slide Only */}
                    {isActive && (
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-[#16232F]/85 via-[#16232F]/20 to-transparent pointer-events-none transition-opacity duration-300"
                        aria-hidden="true"
                      />
                    )}

                    {/* Bottom-Left Color Name Caption - Active Centered Slide Only */}
                    {isActive && (
                      <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
                        <span className="text-[#FFFFFF] font-bold text-2xl lg:text-3xl tracking-wide block drop-shadow-sm">
                          {tile.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrow Left */}
            <button
              type="button"
              onClick={handlePrevDesktop}
              className="absolute top-1/2 -translate-y-1/2 left-4 z-20 w-11 h-11 min-h-[44px] rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#16232F] shadow-md flex items-center justify-center transition-colors border border-[#DDE3EA] focus-visible:ring-2 focus-visible:ring-[#2C63AE]"
              aria-label="Ver color anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Navigation Arrow Right */}
            <button
              type="button"
              onClick={handleNextDesktop}
              className="absolute top-1/2 -translate-y-1/2 right-4 z-20 w-11 h-11 min-h-[44px] rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#16232F] shadow-md flex items-center justify-center transition-colors border border-[#DDE3EA] focus-visible:ring-2 focus-visible:ring-[#2C63AE]"
              aria-label="Ver siguiente color"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Position Indicator Dots below large photo (5 real colors) */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {COLOR_TILES.map((tile, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleColorClick(idx)}
                className={`transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#2C63AE] ${
                  selectedIndex === idx
                    ? 'w-7 h-2 rounded-full bg-[#2C63AE]'
                    : 'w-2 h-2 rounded-full bg-[#DDE3EA] hover:bg-[#5B6B7A]'
                }`}
                aria-label={`Seleccionar color ${tile.label}`}
                aria-current={selectedIndex === idx ? 'true' : undefined}
              />
            ))}
          </div>
        </div>

        {/* Right Pane (Fixed width ~340px): Vertical list of all 5 colors with matching portrait thumbnails */}
        <div className="w-[320px] lg:w-[350px] shrink-0 flex flex-col gap-3">
          {COLOR_TILES.map((tile, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleColorClick(idx)}
                className={`flex items-center gap-4 p-3 rounded-[8px] text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#2C63AE] cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#2C63AE] bg-[#2C63AE]/10 shadow-xs'
                    : 'border border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#5B6B7A]/40'
                }`}
                aria-pressed={isSelected}
              >
                <div className="w-13 h-[68px] lg:w-15 lg:h-[78px] aspect-[3/4] rounded-[6px] overflow-hidden bg-[#FFFFFF] shrink-0">
                  <img
                    src={tile.imageUrl}
                    alt={tile.label}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`block font-bold text-base lg:text-lg ${
                      isSelected ? 'text-[#2C63AE]' : 'text-[#16232F]'
                    }`}
                  >
                    {tile.label}
                  </span>
                  <span className="text-xs text-[#5B6B7A] block truncate">
                    Colección Médica
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE LAYOUT (below md:) — Infinite Swipeable Strip with Position Indicator */}
      <div className="md:hidden space-y-4">
        <div
          ref={scrollContainerRef}
          onScroll={handleMobileScroll}
          className="flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none"
        >
          {MOBILE_EXTENDED_TILES.map((tile, idx) => (
            <div
              key={idx}
              onClick={() => handleColorClick(tile.realIdx)}
              className="group relative shrink-0 w-[78vw] sm:w-[50vw] aspect-[3/4] snap-start overflow-hidden rounded-[8px] bg-[#FFFFFF] text-left cursor-pointer select-none"
            >
              <img
                src={tile.imageUrl}
                alt={`Uniformes médicos en color ${tile.label}`}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />

              {/* Subtle Bottom Gradient Scrim */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#16232F]/80 via-[#16232F]/20 to-transparent pointer-events-none"
                aria-hidden="true"
              />

              {/* Bottom-Left Color Name Caption */}
              <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                <span className="text-[#FFFFFF] font-bold text-xl tracking-wide block drop-shadow-sm">
                  {tile.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile position indicator dots synced to 5 real colors */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {COLOR_TILES.map((tile, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleColorClick(idx)}
              className={`transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#2C63AE] ${
                selectedIndex === idx
                  ? 'w-7 h-2 rounded-full bg-[#2C63AE]'
                  : 'w-2 h-2 rounded-full bg-[#DDE3EA]'
              }`}
              aria-label={`Ir al color ${tile.label}`}
              aria-current={selectedIndex === idx ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </Section>
  );
};

