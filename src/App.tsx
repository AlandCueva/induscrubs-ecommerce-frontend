import React, { useState } from 'react';
import { Header } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { BrandsSection } from './components/BrandsSection';
import { ColorPaletteSection } from './components/ColorPaletteSection';
import { MarqueeSection } from './components/MarqueeSection';
import { ScrollScrubSection } from './components/ScrollScrubSection';
import { BestSellersSection } from './components/BestSellersSection';
import { CategoryGridSection } from './components/CategoryGridSection';
import { LocationSection } from './components/LocationSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CtaBannerSection } from './components/CtaBannerSection';
import { CatalogPage } from './components/CatalogPage';
import { PDPPage } from './components/PDPPage';
import { CheckoutPage } from './components/CheckoutPage';
import { CartDrawer } from './components/CartDrawer';
import { CartItem } from './types';

type AppView = 'home' | 'catalog' | 'pdp' | 'cart' | 'b2b';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [initialFilter, setInitialFilter] = useState<any>(undefined);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Cart actions
  const handleAddToCart = (item: {
    productId: string;
    name: string;
    size: string;
    price: number;
    image?: string;
  }) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.size === item.size
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + 1,
        };
        return updated;
      }
      const newItem: CartItem = {
        id: `${item.productId}-${item.size}`,
        productId: item.productId,
        name: item.name,
        size: item.size,
        price: item.price,
        qty: 1,
        image: item.image,
      };
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Navigation handlers
  const handleNavigate = (view: AppView, extra?: any) => {
    setCurrentView(view);
    if (typeof extra === 'string') {
      setSelectedProductId(extra);
      setInitialFilter(undefined);
    } else if (extra && typeof extra === 'object') {
      setInitialFilter(extra);
      setSelectedProductId(undefined);
    } else {
      setInitialFilter(undefined);
      setSelectedProductId(undefined);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#16232F] selection:bg-[#84B8FF] selection:text-[#16232F]">
      {/* Global Header with Announcement Bar */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen((prev) => !prev)}
        onOpenSearch={() => {}}
      />

      {/* Main Content View Switcher with top padding compensation for non-home views (compact fixed navbar height) */}
      <div className={`flex-1 ${currentView !== 'home' ? 'pt-16 sm:pt-18 md:pt-22' : ''}`}>
        {currentView === 'home' && (
          <main id="main-content">
            {/* 1. Hero Section */}
            <HeroSection
              onNavigate={handleNavigate}
              onNavigateToCatalog={() => handleNavigate('catalog')}
            />

            {/* 2. Nuestras Marcas */}
            <BrandsSection onNavigate={handleNavigate} />

            {/* Marquee Section */}
            <MarqueeSection />

            {/* 3. Compra por Color */}
            <ColorPaletteSection
              onNavigate={handleNavigate}
              onSelectProduct={() => {}}
              onNavigateToCatalogWithColor={(colorName) => handleNavigate('catalog', { filterType: 'color', value: colorName })}
              onNavigateToCatalog={() => handleNavigate('catalog')}
            />

            {/* 4. Best Sellers Section */}
            <BestSellersSection onNavigate={handleNavigate} />

            {/* 5. Marquee Section */}
            <MarqueeSection />

            {/* 6. Scroll Scrub (Negro) Interactive Animation */}
            <ScrollScrubSection onAddToCart={handleAddToCart} />

            {/* 7. Compra por Categoría (2x2 Grid) */}
            <CategoryGridSection onNavigate={handleNavigate} />

            {/* 8. Ubicación (Location) Section with Google Map */}
            <LocationSection />

            {/* 9. Testimonios (Infinite Scrolling Marquee) */}
            <TestimonialsSection />

            {/* 10. CTA Banner Section (immediately before Footer) */}
            <CtaBannerSection />
          </main>
        )}

        {currentView === 'catalog' && (
          <CatalogPage
            onNavigate={handleNavigate}
            initialFilter={initialFilter}
          />
        )}

        {currentView === 'pdp' && (
          <PDPPage
            productId={selectedProductId}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentView === 'cart' && (
          <CheckoutPage
            items={cart}
            onNavigate={handleNavigate}
          />
        )}
      </div>

      {/* Global Footer (Instagram ONLY — no email, no Facebook) */}
      <Footer onNavigate={handleNavigate} />

      {/* Slide-In Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onNavigateToCatalog={() => handleNavigate('catalog')}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
