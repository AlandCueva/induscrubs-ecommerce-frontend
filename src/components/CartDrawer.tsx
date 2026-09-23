import React, { useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Truck } from 'lucide-react';
import { CartItem } from '../types';
import { VIP_DISCOUNT_PERCENT, computeVipDiscount, useVipEligibility } from '../lib/vip';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onNavigateToCatalog?: () => void;
  onNavigate?: (view: any, extra?: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onNavigateToCatalog,
  onNavigate,
}) => {
  // Lock body scroll and listen for Escape key when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  const totalItemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const { eligible: vipEligible } = useVipEligibility();
  const vipDiscount = vipEligible ? computeVipDiscount(subtotal) : 0;

  return (
    <div
      id="cart-drawer-container"
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
      }`}
      aria-hidden={!isOpen}
    >
      {/* 1. Dark semi-transparent overlay backdrop */}
      <div
        className={`fixed inset-0 bg-[#000000]/50 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-label="Cerrar carrito de compras"
      />

      {/* 2. Slide-in Panel from the right edge */}
      <aside
        id="cart-drawer-panel"
        aria-label="Carrito de compras"
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[440px] md:w-[480px] bg-[#FFFFFF] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#EAEFF4] shrink-0 bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#2C63AE]" />
            <h2
              className="text-lg font-bold text-[#16232F]"
              style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
            >
              Tu Carrito
            </h2>
            <span className="text-xs font-semibold text-[#5A6E85] px-2 py-0.5 bg-[#F2F7FF] rounded-[4px] border border-[#DDE3EA]">
              {totalItemCount} {totalItemCount === 1 ? 'prenda' : 'prendas'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-[6px] border border-[#DDE3EA] flex items-center justify-center text-[#16232F] hover:bg-[#F2F7FF] hover:text-[#2C63AE] transition-colors cursor-pointer min-h-[44px]"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Item List */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 divide-y divide-[#EAEFF4]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F2F7FF] border border-[#DDE3EA] flex items-center justify-center text-[#2C63AE] mb-4">
                <ShoppingBag className="w-8 h-8 opacity-70" />
              </div>
              <p
                className="text-base font-semibold text-[#16232F] mb-1.5"
                style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
              >
                Tu carrito está vacío.
              </p>
              <p className="text-xs text-[#5A6E85] max-w-[240px] mb-6">
                Descubre nuestra colección de uniformes médicos premium diseñados para tu día a día.
              </p>
              {onNavigateToCatalog && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToCatalog();
                  }}
                  className="h-11 px-6 bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider rounded-[6px] transition-colors flex items-center justify-center min-h-[44px] shadow-sm cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              )}
            </div>
          ) : (
            items.map((item) => {
              const lineTotal = item.price * item.qty;
              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-3.5 sm:gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 sm:w-22 sm:h-28 rounded-[4px] overflow-hidden bg-[#F7F9FB] border border-[#DDE3EA] shrink-0">
                    <img
                      src={
                        item.image ||
                        'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/sketchersblack.webp'
                      }
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className="text-sm font-bold text-[#16232F] leading-snug truncate"
                          title={item.name}
                          style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                        >
                          {item.name}
                        </h3>
                        <span className="text-sm font-bold text-[#2C63AE] shrink-0">
                          ${lineTotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#5A6E85] mb-2">
                        <span>
                          Talla: <span className="font-semibold text-[#16232F]">{item.size}</span>
                        </span>
                        <span className="text-[#DDE3EA]">•</span>
                        <span>${item.price.toFixed(2)} c/u</span>
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove Button */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#DDE3EA] rounded-[4px] bg-[#FFFFFF] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-[#16232F] hover:bg-[#F2F7FF] transition-colors cursor-pointer min-h-[32px]"
                          aria-label={`Disminuir cantidad de ${item.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-bold text-[#16232F] select-none">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#16232F] hover:bg-[#F2F7FF] transition-colors cursor-pointer min-h-[32px]"
                          aria-label={`Aumentar cantidad de ${item.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#5A6E85] hover:text-[#581825] hover:underline transition-colors cursor-pointer py-1 px-1.5"
                        aria-label={`Eliminar ${item.name} del carrito`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Fixed Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#EAEFF4] p-5 sm:p-6 bg-[#FFFFFF] shrink-0 space-y-4 shadow-lg">
            {/* Free Shipping Line */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F2F7FF] rounded-[4px] border border-[#84B8FF]/40 text-[#2C63AE]">
              <Truck className="w-4 h-4 shrink-0 text-[#2C63AE]" />
              <span className="text-xs font-semibold">
                ¡Envíos gratis en todo Loja!
              </span>
            </div>

            {/* VIP preview (client-side estimate; the order response has the real total) */}
            {vipEligible && (
              <div className="space-y-1.5 text-xs text-[#5A6E85]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#16232F]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#2C63AE]">
                  <span className="font-semibold">Descuento VIP -{VIP_DISCOUNT_PERCENT}%</span>
                  <span className="font-semibold">-${vipDiscount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Subtotal Row */}
            <div className="flex items-baseline justify-between pt-1">
              <span
                className="text-sm font-semibold text-[#16232F]"
                style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
              >
                {vipEligible ? 'Total estimado' : 'Subtotal'}
              </span>
              <div className="text-right">
                <span
                  className="text-2xl font-bold text-[#2C63AE] tracking-tight"
                  style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                >
                  ${(subtotal - vipDiscount).toFixed(2)}
                </span>
                <span className="block text-[11px] text-[#5A6E85] mt-0.5">
                  {vipEligible ? 'IVA incluido · se confirma al registrar el pedido' : 'IVA incluido'}
                </span>
              </div>
            </div>

            {/* Finalizar Compra Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate?.('cart');
              }}
              className="w-full h-12 bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider rounded-[6px] transition-colors flex items-center justify-center min-h-[48px] shadow-sm cursor-pointer"
              style={{
                fontFamily: "'Inter Variable', Inter, sans-serif",
                fontWeight: 700,
              }}
              aria-label="Finalizar compra"
            >
              FINALIZAR COMPRA
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
