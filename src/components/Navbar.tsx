import React, { useState, useEffect, useRef } from 'react';
import { STORE_INFO } from '../data/products';
import { ShoppingBag, Search, Menu, X, MessageCircle, MapPin, Heart } from 'lucide-react';
import { useFavoriteIds } from '../lib/favorites';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: 'home' | 'catalog' | 'pdp' | 'cart' | 'b2b' | 'favorites', extra?: any) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
}

type NavLink = {
  label: string;
  targetId?: string;
  action?: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isScrubSectionVisible, setIsScrubSectionVisible] = useState(false);
  const [isBarHovered, setIsBarHovered] = useState(false);
  const [announcementHeight, setAnnouncementHeight] = useState(37);
  const announcementRef = useRef<HTMLDivElement>(null);

  const [scrollY, setScrollY] = useState(0);
  const favoritesCount = useFavoriteIds().length;

  const handleNavLinkClick = (link: NavLink) => {
    if (link.action) {
      link.action();
      return;
    }
    if (link.targetId) {
      if (currentView !== 'home') {
        onNavigate('home');
        setTimeout(() => {
          const el = document.getElementById(link.targetId!);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const el = document.getElementById(link.targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Nav links: Mujer, Hombre, Scrubs, Marcas, Colección, Locaciones
  const navLinks: NavLink[] = [
    { label: 'Mujer', action: () => onNavigate('catalog', { filterType: 'gender', value: 'Mujer' }) },
    { label: 'Hombre', action: () => onNavigate('catalog', { filterType: 'gender', value: 'Hombre' }) },
    { label: 'Scrubs', targetId: 'best-sellers' },
    { label: 'Marcas', targetId: 'nuestras-marcas' },
    { label: 'Colección', action: () => onNavigate('catalog') },
    { label: 'Locaciones', targetId: 'ubicacion' },
  ];

  // Measure announcement bar height dynamically to ensure structural 0px gap
  useEffect(() => {
    const updateHeight = () => {
      if (announcementRef.current) {
        setAnnouncementHeight(announcementRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Track scroll position to determine whether navbar is over Hero and calculate exact top position
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      setScrollY(currentScrollY);

      if (currentView !== 'home') {
        setIsHeroVisible(false);
        setIsScrubSectionVisible(false);
        ticking = false;
        return;
      }

      // Check hero visibility
      const heroElement = document.getElementById('hero');
      if (heroElement) {
        const rect = heroElement.getBoundingClientRect();
        // Hero is active while its bottom is still below the navbar height (~80px)
        setIsHeroVisible(rect.bottom > 80);
      } else {
        setIsHeroVisible(false);
      }

      // Check scrub section visibility (sticky pinning zone)
      const scrubElement = document.getElementById('scroll-scrub-section');
      if (scrubElement) {
        const rect = scrubElement.getBoundingClientRect();
        const isPinned = rect.top <= 0 && rect.bottom > 0;
        setIsScrubSectionVisible(isPinned);
      } else {
        setIsScrubSectionVisible(false);
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    };

    // Run initial check
    onScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [currentView]);

  const isOverHero = currentView === 'home' && isHeroVisible;
  const isSolid = !isOverHero || isBarHovered;

  // Header top offset: sits right below announcement bar at page top, and stays pinned at top: 0 once announcement scrolls away
  const headerTop = Math.max(0, announcementHeight - scrollY);

  const handleNavHome = () => {
    setMobileMenuOpen(false);
    onNavigate('home');
  };

  return (
    <div className="relative z-40 w-full m-0 p-0">
      {/* 1. Static Announcement Bar in Normal Document Flow (Not Fixed, Not Sticky — Scrolls Away Naturally) */}
      <div
        id="announcement-bar"
        ref={announcementRef}
        className="w-full bg-[#16232F] text-[#FFFFFF] py-2 px-4 text-center border-b border-[#DDE3EA]/20 relative z-20 m-0"
      >
        <div className="max-container flex items-center justify-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#84B8FF] shrink-0" aria-hidden="true" />
          <span className="type-micro tracking-widest font-semibold text-[#84B8FF]">
            ¡ENVÍOS GRATIS EN TODO LOJA!
          </span>
          <span className="hidden sm:inline text-[#DDE3EA]/60 text-xs">|</span>
          <span className="hidden sm:inline text-xs text-[#DDE3EA]">
            Envíos a todo el Ecuador por Servientrega
          </span>
        </div>
      </div>

      {/* 2. Main Navbar — Fixed at headerTop (floats right beneath announcement bar then pins to top: 0 once announcement bar scrolls out); Transparent over Hero, Solid on other sections */}
      <header
        className={`fixed left-0 right-0 z-40 w-full m-0 p-0 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
          isScrubSectionVisible
            ? 'md:opacity-0 md:-translate-y-full md:pointer-events-none'
            : 'md:opacity-100 md:translate-y-0'
        }`}
        style={{ top: `${headerTop}px` }}
      >
        {/* Skip Link for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 bg-[#2C63AE] text-[#FFFFFF] px-4 py-2 rounded-[4px] type-micro font-bold shadow-lg"
        >
          Saltar al contenido principal
        </a>

        {/* Main Header Bar Container */}
        <div
          onMouseEnter={() => setIsBarHovered(true)}
          onMouseLeave={() => setIsBarHovered(false)}
          className={`relative w-full m-0 p-0 transition-colors duration-[250ms] ease-out motion-reduce:transition-none ${
            isSolid
              ? 'bg-[#84B8FF] border-b border-[#84B8FF] shadow-xs'
              : 'bg-transparent border-b border-transparent'
          }`}
        >
          {/* Inner container flush against screen edges (0px padding) */}
          <div className="w-full px-0 py-0 m-0 relative z-10">
            {/* 3-Zone True Centering Layout */}
            <div
              className={`flex items-center justify-between m-0 p-0 transition-all duration-300 ease-out motion-reduce:transition-none ${
                isOverHero ? 'h-20 sm:h-24 md:h-28' : 'h-16 sm:h-20 md:h-24'
              }`}
            >
              {/* Zone 1: LEFT (flex-1) — Mobile Logo flush on left; Desktop 5 Nav Links sitting flush left */}
              <div className="flex-1 flex items-center justify-start pl-2 sm:pl-3 md:pl-0">
                {/* Mobile Logo: positioned on the left edge on mobile only (150px x 40px) */}
                <button
                  type="button"
                  onClick={handleNavHome}
                  className="md:hidden flex items-center justify-start text-left focus-visible:ring-2 focus-visible:ring-[#FFFFFF] rounded-[4px] shrink-0"
                  aria-label="INDUSCRUBS — Ir al Inicio"
                >
                  <div className="relative w-[150px] h-[40px]">
                    <img
                      src="https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/fondo169blancotransparente.webp"
                      alt="INDUSCRUBS — Uniformes Médicos"
                      className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-[250ms] ease-out motion-reduce:transition-none ${
                        isSolid ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                    <img
                      src="https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/letrasblancas.webp"
                      alt="INDUSCRUBS — Uniformes Médicos"
                      className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-[250ms] ease-out motion-reduce:transition-none ${
                        isSolid ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </div>
                </button>

                {/* Desktop Navigation Links flush against the left viewport edge */}
                <nav className="hidden md:flex items-center gap-0 lg:gap-1 pl-0" aria-label="Navegación principal">
                  {navLinks.map((link, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleNavLinkClick(link)}
                      className={`transition-all duration-[250ms] min-h-[44px] inline-flex items-center hover:underline hover:font-bold text-[#FFFFFF] ${
                        idx === 0 ? 'pl-2 sm:pl-3 pr-2 lg:pr-2.5' : 'px-2 lg:px-2.5'
                      } py-1.5 ${
                        isOverHero
                          ? 'text-sm lg:text-base font-medium'
                          : 'text-sm font-medium'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Zone 2: CENTER (shrink-0) — True Horizontally Centered Logo on Desktop (250px x 80px) */}
              <div className="hidden md:flex items-center justify-center shrink-0">
                <button
                  type="button"
                  onClick={handleNavHome}
                  className="flex items-center justify-center text-left focus-visible:ring-2 focus-visible:ring-[#FFFFFF] rounded-[4px] shrink-0"
                  aria-label="INDUSCRUBS — Ir al Inicio"
                >
                  <div className="relative w-[250px] h-[80px]">
                    <img
                      src="https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/fondo169blancotransparente.webp"
                      alt="INDUSCRUBS — Uniformes Médicos"
                      className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-[250ms] ease-out motion-reduce:transition-none ${
                        isSolid ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                    <img
                      src="https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/letrasblancas.webp"
                      alt="INDUSCRUBS — Uniformes Médicos"
                      className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-[250ms] ease-out motion-reduce:transition-none ${
                        isSolid ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* Zone 3: RIGHT (flex-1) — Action Tools & Mobile Hamburger sitting on the right edge */}
              <div className="flex-1 flex items-center justify-end pr-1 sm:pr-2">
                {/* Search Trigger — Clean icon, no box/border */}
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="flex items-center justify-center w-11 h-11 min-h-[44px] text-[#FFFFFF] hover:opacity-80 transition-opacity duration-[250ms]"
                  aria-label="Buscar uniformes y colores"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Icon-Only WhatsApp Link — Clean icon, no box/border */}
                <a
                  href="https://wa.me/593988223950"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-11 h-11 min-h-[44px] text-[#FFFFFF] hover:opacity-80 transition-opacity duration-[250ms]"
                  aria-label="Asesoría directa por WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>

                {/* Favoritos Trigger — Clean icon with notification counter, no box/border */}
                <button
                  type="button"
                  onClick={() => onNavigate('favorites')}
                  className="relative flex items-center justify-center w-11 h-11 min-h-[44px] text-[#FFFFFF] hover:opacity-80 transition-opacity duration-[250ms]"
                  aria-label={`Favoritos (${favoritesCount} productos)`}
                >
                  <Heart className="w-5 h-5" />
                  {favoritesCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#2C63AE] text-[#FFFFFF] text-[10px] font-bold rounded-full pointer-events-none">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                {/* Cart Trigger — Clean icon with notification counter, no box/border */}
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="relative flex items-center justify-center w-11 h-11 min-h-[44px] mr-1 sm:mr-2 text-[#FFFFFF] hover:opacity-80 transition-opacity duration-[250ms]"
                  aria-label={`Bolsa de compras con ${cartCount} prendas`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#2C63AE] text-[#FFFFFF] text-[10px] font-bold rounded-full pointer-events-none">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Mobile Menu Button — Placed on the right of the navbar on mobile */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden flex items-center justify-center w-11 h-11 min-h-[44px] text-[#FFFFFF] hover:opacity-80 transition-opacity duration-[250ms]"
                  aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú principal'}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Drawer Menu (Always Solid White) */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#DDE3EA] bg-[#FFFFFF] px-4 py-6 shadow-lg">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavLinkClick(link);
                    }}
                    className="w-full text-left px-4 py-3 text-base font-medium text-[#16232F] hover:bg-[#F2F7FF] hover:text-[#2C63AE] hover:underline hover:font-bold rounded-[6px] border border-transparent hover:border-[#DDE3EA] min-h-[44px] flex items-center"
                  >
                    {link.label}
                  </button>
                ))}

                <div className="pt-4 mt-2 border-t border-[#DDE3EA] flex flex-col items-center gap-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold text-[#16232F]">Asesoría directa</span>
                    <a
                      href="https://wa.me/593988223950"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-11 h-11 min-h-[44px] text-[#0B7A6E] bg-[#F2F7FF] hover:bg-[#0B7A6E]/10 rounded-[6px] border border-[#DDE3EA] transition-colors"
                      aria-label="Asesoría directa por WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5 text-[#0B7A6E]" />
                    </a>
                  </div>
                  <div className="text-center text-xs text-[#5B6B7A]">
                    Local: {STORE_INFO.address}
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export const Navbar = Header;
