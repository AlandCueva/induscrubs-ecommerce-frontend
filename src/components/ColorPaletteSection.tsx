import React, { useState, useRef, useEffect } from 'react';
import { Section } from './Section';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchColorPaletteTiles, ColorPaletteTile } from '../lib/products';

interface ColorPaletteSectionProps {
  onNavigateToCatalogWithColor?: (colorId: string) => void;
  onNavigateToCatalog?: () => void;
  onNavigate?: (view: any, extra?: any) => void;
}

interface ExtendedTile {
  tile: ColorPaletteTile;
  realIdx: number;
}

// Builds a filmstrip with `cloneCount` clones mirrored on each side of the
// real tiles, so the carousel can loop seamlessly regardless of how many
// live color tiles actually exist.
function buildExtendedTiles(tiles: ColorPaletteTile[], cloneCount: number): ExtendedTile[] {
  const n = tiles.length;
  if (n === 0) return [];
  const extended: ExtendedTile[] = [];
  for (let i = n - cloneCount; i < n; i++) {
    const idx = ((i % n) + n) % n;
    extended.push({ tile: tiles[idx], realIdx: idx });
  }
  for (let i = 0; i < n; i++) {
    extended.push({ tile: tiles[i], realIdx: i });
  }
  for (let i = 0; i < cloneCount; i++) {
    extended.push({ tile: tiles[i % n], realIdx: i % n });
  }
  return extended;
}

export const ColorPaletteSection: React.FC<ColorPaletteSectionProps> = ({ onNavigate }) => {
  const [activeGenderTab, setActiveGenderTab] = useState<'women' | 'men'>('women');
  const [tiles, setTiles] = useState<ColorPaletteTile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Desktop display index starts at 2 (which corresponds to real tile index 0)
  const [desktopDisplayIndex, setDesktopDisplayIndex] = useState<number>(2);
  const [isDesktopTransitioning, setIsDesktopTransitioning] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isJumpingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchColorPaletteTiles()
      .then(setTiles)
      .catch(() => setTiles([]))
      .finally(() => setIsLoading(false));
  }, []);

  const n = tiles.length;
  const DESKTOP_EXTENDED_TILES = buildExtendedTiles(tiles, 2);
  const MOBILE_EXTENDED_TILES = buildExtendedTiles(tiles, 1);

  // Derive real active index (0 to n-1)
  const selectedIndex = n > 0 ? ((desktopDisplayIndex - 2) % n + n) % n : 0;

  const handleColorClick = (idx: number) => {
    const tile = tiles[idx];
    if (tile && onNavigate) {
      onNavigate('catalog', { filterType: 'color', value: tile.id });
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
    if (n === 0) return;
    // If reached right clones, jump back to the matching real slide
    if (desktopDisplayIndex >= n + 2) {
      setIsDesktopTransitioning(false);
      setDesktopDisplayIndex(desktopDisplayIndex - n);
    }
    // If reached left clones, jump forward to the matching real slide
    else if (desktopDisplayIndex <= 1) {
      setIsDesktopTransitioning(false);
      setDesktopDisplayIndex(desktopDisplayIndex + n);
    }
  };

  // Set initial scroll position for mobile strip (to real first tile at index 1)
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const firstChild = container.firstElementChild as HTMLElement | null;
      if (firstChild) {
        const itemWidth = firstChild.offsetWidth + 16;
        container.scrollLeft = 1 * itemWidth;
      }
    }
  }, [n]);

  const handleMobileScroll = () => {
    if (!scrollContainerRef.current || isJumpingRef.current || n === 0) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const firstChild = container.firstElementChild as HTMLElement | null;
    if (!firstChild) return;

    const itemWidth = firstChild.offsetWidth + 16;
    const currentIdx = Math.round(scrollLeft / itemWidth);
    const realIndex = ((currentIdx - 1) % n + n) % n;
    if (realIndex >= 0 && realIndex < n && realIndex !== selectedIndex) {
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
        // Landed on clone of last tile at start -> silently jump to real last tile
        isJumpingRef.current = true;
        scrollContainerRef.current.scrollLeft = n * itemWidth;
        setTimeout(() => {
          isJumpingRef.current = false;
        }, 50);
      } else if (endIdx === n + 1) {
        // Landed on clone of first tile at end -> silently jump to real first tile
        isJumpingRef.current = true;
        scrollContainerRef.current.scrollLeft = 1 * itemWidth;
        setTimeout(() => {
          isJumpingRef.current = false;
        }, 50);
      }
    }, 100);
  };

  if (!isLoading && n === 0) {
    return null;
  }

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
      {isLoading ? (
        <div className="hidden md:flex flex-row items-start gap-8 lg:gap-10">
          <div className="flex-1 min-w-0 h-[460px] lg:h-[520px] rounded-[8px] bg-[#F7F9FB] animate-pulse" />
          <div className="w-[320px] lg:w-[350px] shrink-0 flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[86px] rounded-[8px] bg-[#F7F9FB] animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
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
                  {DESKTOP_EXTENDED_TILES.map((extended, idx) => {
                    const isActive = desktopDisplayIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="h-full aspect-[3/4] shrink-0 relative rounded-[6px] overflow-hidden bg-[#FFFFFF]"
                      >
                        <img
                          src={extended.tile.imageUrl}
                          alt={`Uniformes médicos en color ${extended.tile.name}`}
                          className="w-full h-full object-cover object-center"
                          loading={idx >= 2 && idx <= n + 1 ? 'eager' : 'lazy'}
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
                              {extended.tile.name}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {n > 1 && (
                  <>
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
                  </>
                )}
              </div>

              {/* Position Indicator Dots below large photo */}
              {n > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  {tiles.map((tile, idx) => (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => handleColorClick(idx)}
                      className={`transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#2C63AE] ${
                        selectedIndex === idx
                          ? 'w-7 h-2 rounded-full bg-[#2C63AE]'
                          : 'w-2 h-2 rounded-full bg-[#DDE3EA] hover:bg-[#5B6B7A]'
                      }`}
                      aria-label={`Seleccionar color ${tile.name}`}
                      aria-current={selectedIndex === idx ? 'true' : undefined}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Pane (Fixed width ~340px): Vertical list of all colors with matching portrait thumbnails */}
            <div className="w-[320px] lg:w-[350px] shrink-0 flex flex-col gap-3">
              {tiles.map((tile, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={tile.id}
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
                        alt={tile.name}
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
                        {tile.name}
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
              {MOBILE_EXTENDED_TILES.map((extended, idx) => (
                <div
                  key={idx}
                  onClick={() => handleColorClick(extended.realIdx)}
                  className="group relative shrink-0 w-[78vw] sm:w-[50vw] aspect-[3/4] snap-start overflow-hidden rounded-[8px] bg-[#FFFFFF] text-left cursor-pointer select-none"
                >
                  <img
                    src={extended.tile.imageUrl}
                    alt={`Uniformes médicos en color ${extended.tile.name}`}
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
                      {extended.tile.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile position indicator dots synced to real colors */}
            {n > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {tiles.map((tile, idx) => (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => handleColorClick(idx)}
                    className={`transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#2C63AE] ${
                      selectedIndex === idx
                        ? 'w-7 h-2 rounded-full bg-[#2C63AE]'
                        : 'w-2 h-2 rounded-full bg-[#DDE3EA]'
                    }`}
                    aria-label={`Ir al color ${tile.name}`}
                    aria-current={selectedIndex === idx ? 'true' : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Section>
  );
};
