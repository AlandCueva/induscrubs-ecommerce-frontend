import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Logo } from './Logo';
import { VipSignupForm } from './VipSignupForm';
import { VIP_POPUP_DELAY_MS, hasSeenVipPopup, markVipPopupSeen } from '../lib/vipPopup';

// Induscrubs VIP signup popup: opens VIP_POPUP_DELAY_MS after page load, at most
// once per browser session (see lib/vipPopup).
export const VipPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (hasSeenVipPopup()) return;
    const timer = setTimeout(() => {
      // Re-check: the visitor may have subscribed via the Footer meanwhile.
      if (!hasSeenVipPopup()) setIsOpen(true);
    }, VIP_POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    markVipPopupSeen();
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#000000]/60 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vip-popup-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] max-h-[calc(100dvh-2rem)] overflow-y-auto bg-[#84B8FF] text-[#FFFFFF] rounded-[6px] shadow-2xl p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-[4px] text-[#FFFFFF] hover:bg-[#FFFFFF]/15 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <Logo size="md" variant="white" />
        <h2
          id="vip-popup-title"
          className="mt-4 text-xl sm:text-2xl font-bold tracking-tight"
        >
          Únete a Induscrubs VIP
        </h2>
        <p className="mt-2 mb-5 text-sm text-[#FFFFFF]/90 leading-relaxed">
          Obtén <strong className="font-bold text-[#FFFFFF]">10% de descuento en tu carrito</strong>{' '}
          y entérate primero de nuevos ingresos y colores.
        </p>

        <VipSignupForm />
      </div>
    </div>
  );
};
