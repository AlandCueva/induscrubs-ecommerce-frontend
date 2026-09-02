import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Product, searchProducts } from '../lib/products';
import { ProductCard } from './BestSellersSection';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: any, extra?: any) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = '';
      clearTimeout(focusTimer);
    };
  }, [isOpen]);

  // Debounced search over product name + description
  useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const handle = setTimeout(() => {
      searchProducts(trimmed)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, isOpen]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  const handleSelectProduct = (productId: string) => {
    onNavigate?.('pdp', productId);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="search-overlay"
      className="fixed inset-0 z-[60] bg-[#000000]/60 backdrop-blur-xs flex items-start justify-center animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl mt-0 sm:mt-16 bg-[#FFFFFF] sm:rounded-[8px] shadow-xl flex flex-col max-h-screen sm:max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EAEFF4] shrink-0">
          <Search className="w-5 h-5 text-[#5A6E85] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar uniformes médicos..."
            className="flex-1 text-sm text-[#16232F] placeholder:text-[#5A6E85] focus:outline-none"
            aria-label="Buscar productos"
          />
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 shrink-0 rounded-[4px] flex items-center justify-center text-[#16232F] hover:bg-[#F2F7FF] transition-colors cursor-pointer"
            aria-label="Cerrar búsqueda"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-5">
          {!query.trim() ? (
            <p className="text-xs text-[#5A6E85] text-center py-8">
              Escribe para buscar por nombre o descripción.
            </p>
          ) : isSearching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-[3/4] bg-[#F7F9FB] rounded-[4px] animate-pulse" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="text-xs text-[#5A6E85] text-center py-8">
              No se encontraron productos para &quot;{query}&quot;.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {results.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleSelectProduct(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
