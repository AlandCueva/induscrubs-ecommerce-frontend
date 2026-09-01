import React from 'react';
import { Logo } from './Logo';
import { STORE_INFO } from '../data/products';
import { Instagram, MapPin, Phone, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate?: (view: 'home' | 'catalog' | 'pdp' | 'cart' | 'b2b', extra?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#FFFFFF] text-[#16232F] border-t border-[#DDE3EA] pt-12 pb-8">
      <div className="max-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-[#DDE3EA]">
          {/* Brand Col (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Logo variant="dark" size="md" />
            <p className="text-xs text-[#16232F]/80 leading-relaxed max-w-[320px]">
              Indumentaria médica ecuatoriana diseñada y confeccionada en Loja desde 2013.
              Tecnología antifluido, elasticidad de cuatro vías y durabilidad hospitalaria probada.
            </p>
            <div className="pt-2">
              {/* Instagram ONLY - No email, No Facebook */}
              <a
                href={`https://instagram.com/${STORE_INFO.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[6px] bg-[#FFFFFF] hover:bg-[#DDE3EA]/30 text-[#16232F] text-xs font-semibold border border-[#DDE3EA] hover:border-[#84B8FF] transition-colors"
                aria-label="Instagram oficial de INDUSCRUBS"
              >
                <Instagram className="w-4 h-4 text-[#84B8FF]" />
                <span>@{STORE_INFO.instagram}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#16232F]/60" />
              </a>
            </div>
          </div>

          {/* Quick Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="type-micro text-[#16232F] font-bold tracking-widest uppercase">
              Colecciones
            </h4>
            <ul className="space-y-2 text-xs text-[#16232F]/80">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('catalog')}
                  className="hover:text-[#84B8FF] transition-colors text-left cursor-pointer"
                >
                  Nuestra Colección
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('catalog', { filterType: 'gender', value: 'Mujer' })}
                  className="hover:text-[#84B8FF] transition-colors text-left cursor-pointer"
                >
                  Mujer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('catalog', { filterType: 'gender', value: 'Hombre' })}
                  className="hover:text-[#84B8FF] transition-colors text-left cursor-pointer"
                >
                  Hombre
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate?.('catalog', { filterType: 'newArrivals', value: true })}
                  className="hover:text-[#84B8FF] transition-colors text-left cursor-pointer"
                >
                  Nuevos Ingresos
                </button>
              </li>
            </ul>
          </div>

          {/* Store Location & Hours (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="type-micro text-[#16232F] font-bold tracking-widest uppercase">
              Tienda Matriz & Taller Loja
            </h4>
            <div className="space-y-2 text-xs text-[#16232F]/80">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#84B8FF] shrink-0 mt-0.5" />
                <span>{STORE_INFO.address}</span>
              </p>
              <p className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#84B8FF] shrink-0 mt-0.5" />
                <span>WhatsApp Atención: {STORE_INFO.whatsappDisplay}</span>
              </p>
              <p className="text-[11px] text-[#16232F]/60 pl-6">
                {STORE_INFO.hoursWeekday} · {STORE_INFO.hoursSaturday}
              </p>
            </div>

            <div className="mt-4 p-3 bg-[#DDE3EA]/20 rounded-[4px] border border-[#DDE3EA] flex items-center gap-2 text-xs text-[#16232F]">
              <ShieldCheck className="w-4 h-4 text-[#84B8FF] shrink-0" />
              <span>¡Envíos gratis en todo el cantón Loja sin mínimo de compra!</span>
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#16232F]/60">
          <p>
            © 2013–2026 INDUSCRUBS Cía. Ltda. Confección médica artesanal en Loja, Ecuador.
          </p>
        </div>
      </div>
    </footer>
  );
};
