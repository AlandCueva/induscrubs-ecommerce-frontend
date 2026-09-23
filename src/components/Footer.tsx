import React from 'react';
import { Logo } from './Logo';
import { STORE_INFO } from '../data/products';
import { Instagram, MapPin, Phone, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { VipSignupForm } from './VipSignupForm';

interface FooterProps {
  onNavigate?: (view: 'home' | 'catalog' | 'pdp' | 'cart' | 'b2b', extra?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const policyLinks = [
    'Términos y Condiciones de Venta',
    'Política de Devoluciones y Reembolsos',
    'Política de Privacidad',
    'Política de Cookies',
    'Aviso Legal',
    'Políticas de Envío y Entrega',
  ];

  return (
    <footer className="w-full bg-[#84B8FF] text-[#FFFFFF] border-t border-[#DDE3EA] pt-12 pb-8">
      <div className="max-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 pb-12 border-b border-[#DDE3EA]">
          {/* LEFT COLUMN: Brand, Colecciones, Locations, Legal (stacks first on mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 space-y-4">
              <Logo size="md" variant="white" />
              <p className="text-xs text-[#FFFFFF]/80 leading-relaxed max-w-[320px]">
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

            {/* Quick Navigation */}
            <div className="space-y-3">
              <h4 className="type-micro text-[#FFFFFF] font-bold tracking-widest uppercase">
                Colecciones
              </h4>
              <ul className="space-y-2 text-xs text-[#FFFFFF]/80">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('catalog')}
                    className="hover:text-[#FFFFFF] hover:underline transition-colors text-left cursor-pointer"
                  >
                    Nuestra Colección
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('catalog', { filterType: 'gender', value: 'Mujer' })}
                    className="hover:text-[#FFFFFF] hover:underline transition-colors text-left cursor-pointer"
                  >
                    Mujer
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('catalog', { filterType: 'gender', value: 'Hombre' })}
                    className="hover:text-[#FFFFFF] hover:underline transition-colors text-left cursor-pointer"
                  >
                    Hombre
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('catalog', { filterType: 'newArrivals', value: true })}
                    className="hover:text-[#FFFFFF] hover:underline transition-colors text-left cursor-pointer"
                  >
                    Nuevos Ingresos
                  </button>
                </li>
              </ul>
            </div>

            {/* Store Location & Hours */}
            <div className="space-y-3">
              <h4 className="type-micro text-[#FFFFFF] font-bold tracking-widest uppercase">
                Tienda Matriz en Loja
              </h4>
              <div className="space-y-2 text-xs text-[#FFFFFF]/80">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#FFFFFF] shrink-0 mt-0.5" />
                  <span>{STORE_INFO.address}</span>
                </p>
                <p className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-[#FFFFFF] shrink-0 mt-0.5" />
                  <span>WhatsApp Atención: {STORE_INFO.whatsappDisplay}</span>
                </p>
                <p className="text-[11px] text-[#FFFFFF]/60 pl-6">
                  {STORE_INFO.hoursWeekday} · {STORE_INFO.hoursSaturday}
                </p>
              </div>

              <h4 className="type-micro text-[#FFFFFF] font-bold tracking-widest uppercase mt-4">
                Induscrubs - Sucursal Annexa
              </h4>
              <div className="space-y-2 text-xs text-[#FFFFFF]/80">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#FFFFFF] shrink-0 mt-0.5" />
                  <span>18 de Noviembre y Azuay, Edificio Annexa, Loja, Ecuador</span>
                </p>
                <p className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-[#FFFFFF] shrink-0 mt-0.5" />
                  <span>WhatsApp Atención: {STORE_INFO.whatsappDisplay}</span>
                </p>
                <p className="text-[11px] text-[#FFFFFF]/60 pl-6">
                  Lunes a Viernes 09:30 – 19:00 · Sábados 09:30 – 15:00
                </p>
              </div>

              <div className="mt-4 p-3 bg-[#FFFFFF]/10 rounded-[4px] border border-[#FFFFFF]/30 flex items-center gap-2 text-xs text-[#FFFFFF]">
                <ShieldCheck className="w-4 h-4 text-[#FFFFFF] shrink-0" />
                <span>¡Envíos gratis en toda la ciudad de Loja sin mínimo de compra!</span>
              </div>
            </div>

            {/* Legal (placeholder links, no routes yet) */}
            <div className="sm:col-span-2 space-y-3 pt-2">
              <h4 className="type-micro text-[#FFFFFF] font-bold tracking-widest uppercase">
                Legal
              </h4>
              <ul className="space-y-2 text-xs text-[#FFFFFF]/80">
                {policyLinks.map((label) => (
                  <li key={label}>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="hover:text-[#FFFFFF] hover:underline transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Induscrubs VIP Signup (stacks second on mobile) */}
          <div>
            <h4 className="type-micro text-[#FFFFFF] font-bold tracking-widest uppercase mb-2">
              Induscrubs VIP
            </h4>
            <p className="text-xs text-[#FFFFFF]/80 mb-4">
              Únete a Induscrubs VIP y obtén 10% de descuento en tu carrito, además de novedades antes que nadie.
            </p>
            <VipSignupForm />
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFFFFF]/60">
          <p>
            © 2013–2026 INDUSCRUBS Cía. Ltda. Confección médica artesanal en Loja, Ecuador.
          </p>
        </div>
      </div>
    </footer>
  );
};
