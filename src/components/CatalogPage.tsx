import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Check, SlidersHorizontal, X } from 'lucide-react';
import {
  Product,
  Category,
  ProductColorOption,
  Size,
  Brand,
  fetchProducts,
  fetchCategories,
  fetchColors,
  fetchSizes,
  fetchBrands,
  isNewArrival,
} from '../lib/products';
import { ProductCard } from './BestSellersSection';

const GENDERS = ['Mujer', 'Hombre'];
const SORT_OPTIONS = [
  'Relevancia',
  'Precio menor a mayor',
  'Precio mayor a menor',
  'Más vendidos',
  'Más nuevos',
];

interface CatalogPageProps {
  onNavigate?: (view: any, extra?: any) => void;
  initialFilter?: {
    filterType: 'brand' | 'gender' | 'newArrivals' | 'color' | 'category';
    value: any;
  };
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onNavigate, initialFilter }) => {
  // Live catalog data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<ProductColorOption[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories(), fetchColors(), fetchSizes(), fetchBrands()])
      .then(([productsData, categoriesData, colorsData, sizesData, brandsData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
        setColors(colorsData);
        setSizes(sizesData);
        setBrands(brandsData);
      })
      .catch(() => {
        setProducts([]);
        setCategories([]);
        setColors([]);
        setSizes([]);
        setBrands([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Visual filter selection state — categories/colors/brands are stored by id
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Relevancia');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Lock body scroll when mobile overlay is open
  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFiltersOpen]);

  // Pre-select filters based on initialFilter prop — re-runs once the matching
  // live list (categories/colors/brands) has finished loading, since navigation
  // can arrive before the fetch that resolves names/ids to filter against.
  // Each distinct initialFilter reference represents a fresh navigation intent
  // (e.g. clicking "Hombre" in the navbar while already on the catalog page),
  // so it clears any previously/manually selected filters first instead of
  // merging into them — otherwise leftover filters from an earlier visit could
  // silently combine with the new one and hide products the user expects to see.
  const prevInitialFilterRef = useRef<CatalogPageProps['initialFilter']>(undefined);

  useEffect(() => {
    const isNewNavigation = prevInitialFilterRef.current !== initialFilter;
    prevInitialFilterRef.current = initialFilter;

    if (isNewNavigation) {
      setSelectedCategories([]);
      setSelectedColors([]);
      setSelectedSizes([]);
      setSelectedBrands([]);
      setSelectedGenders([]);
      setPriceMin('');
      setPriceMax('');
      setSortBy('Relevancia');
      setOnlyNewArrivals(false);
    }

    if (!initialFilter) return;

    if (initialFilter.filterType === 'brand' && initialFilter.value) {
      const match = brands.find(
        (b) => b.name.toLowerCase() === String(initialFilter.value).toLowerCase() || b.id === initialFilter.value
      );
      if (match) setSelectedBrands([match.id]);
    } else if (initialFilter.filterType === 'gender' && initialFilter.value) {
      setSelectedGenders([initialFilter.value]);
    } else if (initialFilter.filterType === 'newArrivals') {
      setOnlyNewArrivals(Boolean(initialFilter.value));
    } else if (initialFilter.filterType === 'color' && initialFilter.value) {
      const match = colors.find(
        (c) => c.name.toLowerCase() === String(initialFilter.value).toLowerCase() || c.id === initialFilter.value
      );
      if (match) setSelectedColors([match.id]);
    } else if (initialFilter.filterType === 'category' && initialFilter.value) {
      const match = categories.find(
        (c) => c.name.toLowerCase() === String(initialFilter.value).toLowerCase() || c.id === initialFilter.value
      );
      if (match) setSelectedCategories([match.id]);
    }
  }, [initialFilter, brands, colors, categories]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const toggleColor = (colorId: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorId) ? prev.filter((c) => c !== colorId) : [...prev, colorId]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleBrand = (brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((b) => b !== brandId) : [...prev, brandId]
    );
  };

  const toggleGender = (gender: string) => {
    setSelectedGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    setPriceMin('');
    setPriceMax('');
    setSortBy('Relevancia');
    setSelectedGenders([]);
    setOnlyNewArrivals(false);
  };

  const permanentColors = colors.filter((c) => c.colorGroup === 'Permanentes');
  const limitedColors = colors.filter((c) => c.colorGroup !== 'Permanentes');

  const filteredProducts = useMemo(() => {
    const minPrice = priceMin ? parseFloat(priceMin) : undefined;
    const maxPrice = priceMax ? parseFloat(priceMax) : undefined;

    let result = products.filter((p) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.categoryId)) return false;
      if (selectedColors.length > 0 && !p.colors.some((c) => selectedColors.includes(c.id))) return false;
      if (selectedSizes.length > 0 && !p.sizeCodes.some((s) => selectedSizes.includes(s))) return false;
      if (selectedBrands.length > 0 && (!p.brandId || !selectedBrands.includes(p.brandId))) return false;
      if (selectedGenders.length > 0 && !selectedGenders.includes(p.gender)) return false;
      if (minPrice !== undefined && p.finalPrice < minPrice) return false;
      if (maxPrice !== undefined && p.finalPrice > maxPrice) return false;
      if (onlyNewArrivals && !isNewArrival(p.createdAt)) return false;
      return true;
    });

    if (sortBy === 'Precio menor a mayor') {
      result = [...result].sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (sortBy === 'Precio mayor a menor') {
      result = [...result].sort((a, b) => b.finalPrice - a.finalPrice);
    } else if (sortBy === 'Más nuevos') {
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'Más vendidos') {
      // Placeholder: no sales/order-count data is wired up yet, so this falls
      // back to newest-created (same placeholder rule as the homepage Best Sellers section).
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // 'Relevancia' keeps the order returned by fetchProducts (created_at desc)

    return result;
  }, [
    products,
    selectedCategories,
    selectedColors,
    selectedSizes,
    selectedBrands,
    selectedGenders,
    priceMin,
    priceMax,
    sortBy,
    onlyNewArrivals,
  ]);

  const selectedFilterCount =
    selectedCategories.length +
    selectedColors.length +
    selectedSizes.length +
    selectedBrands.length +
    selectedGenders.length +
    (onlyNewArrivals ? 1 : 0);

  // Reusable Filter Content
  const renderFilterContent = (isMobile: boolean = false) => (
    <>
      {/* 1. Header: "Filtros" label + "Limpiar todo" link */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EAEFF4]">
        <span
          className="text-base font-bold text-[#16232F]"
          style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
        >
          Filtros
        </span>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-xs font-medium text-[#2C63AE] hover:underline cursor-pointer"
        >
          Limpiar todo
        </button>
      </div>

      {/* 2. Categoría — checkbox list, fully dynamic from product_categories */}
      <div className="pb-4 mb-4 border-b border-[#EAEFF4]">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#16232F] mb-3">
          Categoría
        </span>
        <div className="space-y-2.5">
          {categories.map((cat) => {
            const isChecked = selectedCategories.includes(cat.id);
            return (
              <label
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className="flex items-start gap-2.5 text-xs text-[#16232F] hover:text-[#2C63AE] cursor-pointer select-none"
              >
                <div
                  className={`w-4 h-4 mt-0.5 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-[#2C63AE] border-[#2C63AE] text-white'
                      : 'border-[#DDE3EA] bg-white hover:border-[#16232F]/50'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="leading-tight">{cat.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Color — swatch grid split into "Permanentes" and "Edición limitada" */}
      <div className="pb-4 mb-4 border-b border-[#EAEFF4]">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#16232F] mb-3">
          Color
        </span>

        {/* Permanentes Sub-group */}
        <div className="mb-3">
          <span className="block text-[11px] font-medium text-[#5A6E85] mb-2">
            Permanentes
          </span>
          <div className="grid grid-cols-6 gap-2">
            {permanentColors.map((color) => {
              const isSelected = selectedColors.includes(color.id);
              return (
                <button
                  key={color.id}
                  type="button"
                  title={color.name}
                  onClick={() => toggleColor(color.id)}
                  className={`w-7 h-7 rounded-[4px] border border-black/10 transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-[#16232F] ring-offset-2' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                />
              );
            })}
          </div>
        </div>

        {/* Edición limitada Sub-group */}
        <div>
          <span className="block text-[11px] font-medium text-[#5A6E85] mb-2">
            Edición limitada
          </span>
          <div className="grid grid-cols-6 gap-2">
            {limitedColors.map((color) => {
              const isSelected = selectedColors.includes(color.id);
              return (
                <button
                  key={color.id}
                  type="button"
                  title={color.name}
                  onClick={() => toggleColor(color.id)}
                  className={`w-7 h-7 rounded-[4px] border border-black/10 transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-[#16232F] ring-offset-2' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Talla — wrapped chip buttons, fully dynamic from sizes table */}
      <div className="pb-4 mb-4 border-b border-[#EAEFF4]">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#16232F] mb-3">
          Talla
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((size) => {
            const isSelected = selectedSizes.includes(size.code);
            return (
              <button
                key={size.code}
                type="button"
                onClick={() => toggleSize(size.code)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-[4px] border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#2C63AE] text-[#FFFFFF] border-[#2C63AE]'
                    : 'bg-[#FFFFFF] text-[#16232F] border-[#DDE3EA] hover:border-[#16232F]/50'
                }`}
              >
                {size.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Marca — wrapped chip buttons, fully dynamic from brands table */}
      <div className="pb-4 mb-4 border-b border-[#EAEFF4]">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#16232F] mb-3">
          Marca
        </span>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((brand) => {
            const isSelected = selectedBrands.includes(brand.id);
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => toggleBrand(brand.id)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-[4px] border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#2C63AE] text-[#FFFFFF] border-[#2C63AE]'
                    : 'bg-[#FFFFFF] text-[#16232F] border-[#DDE3EA] hover:border-[#16232F]/50'
                }`}
              >
                {brand.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Rango de precio */}
      <div className="pb-4 mb-4 border-b border-[#EAEFF4]">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#16232F] mb-3">
          Rango de precio
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={isMobile ? 'm-price-min' : 'price-min'} className="block text-[11px] font-medium text-[#5A6E85] mb-1">
              Desde ($)
            </label>
            <input
              id={isMobile ? 'm-price-min' : 'price-min'}
              type="number"
              min="0"
              placeholder="0"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full h-8 px-2.5 text-xs text-[#16232F] bg-white border border-[#DDE3EA] rounded-[4px] focus:outline-none focus:border-[#2C63AE]"
            />
          </div>
          <div>
            <label htmlFor={isMobile ? 'm-price-max' : 'price-max'} className="block text-[11px] font-medium text-[#5A6E85] mb-1">
              Hasta ($)
            </label>
            <input
              id={isMobile ? 'm-price-max' : 'price-max'}
              type="number"
              min="0"
              placeholder="100"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full h-8 px-2.5 text-xs text-[#16232F] bg-white border border-[#DDE3EA] rounded-[4px] focus:outline-none focus:border-[#2C63AE]"
            />
          </div>
        </div>
      </div>

      {/* 7. Ordenar por */}
      <div className="pb-4 mb-4 border-b border-[#EAEFF4]">
        <label htmlFor={isMobile ? 'm-sort-by-select' : 'sort-by-select'} className="block text-xs font-bold uppercase tracking-wider text-[#16232F] mb-3">
          Ordenar por
        </label>
        <select
          id={isMobile ? 'm-sort-by-select' : 'sort-by-select'}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full h-9 px-2.5 text-xs text-[#16232F] bg-white border border-[#DDE3EA] rounded-[4px] focus:outline-none focus:border-[#2C63AE] cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* 8. Género */}
      <div className="pb-4 mb-4 border-b border-[#EAEFF4]">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#16232F] mb-3">
          Género
        </span>
        <div className="flex flex-wrap gap-1.5">
          {GENDERS.map((gender) => {
            const isSelected = selectedGenders.includes(gender);
            return (
              <button
                key={gender}
                type="button"
                onClick={() => toggleGender(gender)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#2C63AE] text-[#FFFFFF] border-[#2C63AE]'
                    : 'bg-[#FFFFFF] text-[#16232F] border-[#DDE3EA] hover:border-[#16232F]/50'
                }`}
              >
                {gender}
              </button>
            );
          })}
        </div>
      </div>

      {/* 9. Toggle switch: "Solo nuevos ingresos" */}
      <div className="pb-4 mb-5 border-b border-[#EAEFF4]">
        <label
          onClick={() => setOnlyNewArrivals(!onlyNewArrivals)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <span className="text-xs font-medium text-[#16232F]">
            Solo nuevos ingresos
          </span>
          <div
            role="switch"
            aria-checked={onlyNewArrivals}
            className={`w-10 h-5 p-0.5 rounded-[4px] transition-colors flex items-center ${
              onlyNewArrivals ? 'bg-[#2C63AE]' : 'bg-[#DDE3EA]'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-[3px] shadow-sm transition-transform ${
                onlyNewArrivals ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </label>
      </div>

      {/* 10. "Aplicar filtros" button */}
      <button
        type="button"
        onClick={() => {
          if (isMobile) {
            setMobileFiltersOpen(false);
          }
        }}
        className="w-full h-11 bg-[#84B8FF] hover:bg-[#6FA5ED] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider rounded-[6px] transition-colors flex items-center justify-center min-h-[44px] shadow-sm cursor-pointer"
        style={{
          fontFamily: "'Inter Variable', Inter, sans-serif",
          fontWeight: 700,
        }}
      >
        Aplicar filtros
      </button>
    </>
  );

  return (
    <main id="catalog-content" className="w-full min-h-[60vh] bg-[#FFFFFF] py-6 sm:py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link to Home */}
        <button
          type="button"
          onClick={() => onNavigate?.('home')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5A6E85] hover:text-[#16232F] transition-colors mb-6 sm:mb-8 cursor-pointer group"
          aria-label="Volver al Inicio"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver al Inicio</span>
        </button>

        {/* Page Header */}
        <div className="mb-6 sm:mb-10">
          <span className="block text-xs font-semibold uppercase tracking-wider text-[#2C63AE] mb-1.5">
            Explorar
          </span>
          <h1
            className="text-[#16232F]"
            style={{
              fontFamily: "'Inter Variable', Inter, sans-serif",
              fontWeight: 700,
              fontSize: '32px',
              lineHeight: '1.05',
              letterSpacing: '-0.02em',
            }}
          >
            Nuestra Colección
          </h1>
        </div>

        {/* Mobile Filter Button placed above the product grid */}
        <div className="md:hidden mb-6">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full h-11 px-4 rounded-[6px] border border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/50 text-[#16232F] flex items-center justify-between text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#2C63AE]" />
              <span>Filtros</span>
            </span>
            <span className="text-xs text-[#5A6E85] font-normal">
              {selectedFilterCount > 0 ? `${selectedFilterCount} seleccionado(s)` : 'Ver todos'}
            </span>
          </button>
        </div>

        {/* Two-Column Layout: Persistent Left Sidebar on Desktop (~270px) + Product Grid */}
        <div className="flex flex-col md:flex-row items-start gap-8 lg:gap-10">
          {/* 1. Left Sidebar Filter Panel (Hidden on mobile, block on md+) */}
          <aside
            id="catalog-filters-sidebar"
            aria-label="Filtros del catálogo"
            className="hidden md:block md:w-[270px] shrink-0 bg-[#FFFFFF] rounded-[6px] border border-[#EAEFF4] p-5"
          >
            {renderFilterContent(false)}
          </aside>

          {/* 2. Right Column: Product Grid */}
          <div className="flex-1 min-w-0 w-full">
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-[#F7F9FB] rounded-[4px] animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24">
                <p className="text-sm font-semibold text-[#16232F] mb-1">
                  No hay productos que coincidan con estos filtros.
                </p>
                <p className="text-xs text-[#5A6E85]">
                  Intenta ajustar o limpiar los filtros seleccionados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onNavigate?.('pdp', product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Full-Screen Filter Overlay */}
      {mobileFiltersOpen && (
        <div
          id="mobile-filters-overlay"
          className="fixed inset-0 z-50 bg-[#000000]/60 backdrop-blur-xs flex justify-end md:hidden animate-fade-in"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className="w-full h-full bg-[#FFFFFF] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar of Mobile Overlay */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEFF4] shrink-0">
              <span
                className="text-lg font-bold text-[#16232F]"
                style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
              >
                Filtros
              </span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-9 h-9 rounded-[4px] border border-[#DDE3EA] flex items-center justify-center text-[#16232F] hover:bg-[#F2F7FF] transition-colors cursor-pointer"
                aria-label="Cerrar filtros"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {renderFilterContent(true)}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
