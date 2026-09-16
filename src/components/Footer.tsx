import React, { useState } from 'react';
import { Logo } from './Logo';
import { STORE_INFO } from '../data/products';
import { Instagram, MapPin, Phone, ShieldCheck, ArrowUpRight, Loader2 } from 'lucide-react';
import {
  subscribeToNewsletter,
  validateNewsletterEmail,
  validateNewsletterFirstName,
  validateNewsletterLastName,
  validateNewsletterPhone,
  validateNewsletterGender,
  validateNewsletterBirthDay,
  validateNewsletterBirthMonth,
  NewsletterSubscriptionError,
  NEWSLETTER_GENDERS,
  type NewsletterGender,
} from '../lib/newsletter';

const NEWSLETTER_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

interface FooterProps {
  onNavigate?: (view: 'home' | 'catalog' | 'pdp' | 'cart' | 'b2b', extra?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [newsletterFirstName, setNewsletterFirstName] = useState('');
  const [newsletterLastName, setNewsletterLastName] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterPhone, setNewsletterPhone] = useState('');
  const [newsletterGender, setNewsletterGender] = useState<NewsletterGender | ''>('');
  const [newsletterBirthDay, setNewsletterBirthDay] = useState<number | null>(null);
  const [newsletterBirthMonth, setNewsletterBirthMonth] = useState<number | null>(null);
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const firstError =
      validateNewsletterFirstName(newsletterFirstName) ||
      validateNewsletterLastName(newsletterLastName) ||
      validateNewsletterEmail(newsletterEmail) ||
      validateNewsletterPhone(newsletterPhone) ||
      validateNewsletterGender(newsletterGender) ||
      validateNewsletterBirthDay(newsletterBirthDay) ||
      validateNewsletterBirthMonth(newsletterBirthMonth);

    if (firstError) {
      setNewsletterStatus('error');
      setNewsletterMessage(firstError);
      return;
    }

    setNewsletterStatus('loading');
    setNewsletterMessage(null);

    try {
      await subscribeToNewsletter({
        firstName: newsletterFirstName,
        lastName: newsletterLastName,
        email: newsletterEmail,
        phone: newsletterPhone,
        gender: newsletterGender,
        birthDay: newsletterBirthDay,
        birthMonth: newsletterBirthMonth,
      });
      setNewsletterStatus('success');
      setNewsletterMessage('¡Gracias por suscribirte!');
      setNewsletterFirstName('');
      setNewsletterLastName('');
      setNewsletterEmail('');
      setNewsletterPhone('');
      setNewsletterGender('');
      setNewsletterBirthDay(null);
      setNewsletterBirthMonth(null);
    } catch (err) {
      setNewsletterStatus('error');
      setNewsletterMessage(
        err instanceof NewsletterSubscriptionError
          ? err.message
          : 'No se pudo completar la suscripción. Intenta de nuevo.'
      );
    }
  };

  return (
    <footer className="w-full bg-[#FFFFFF] text-[#16232F] border-t border-[#DDE3EA] pt-12 pb-8">
      <div className="max-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-[#DDE3EA]">
          {/* Brand Col (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Logo size="md" />
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

        {/* Newsletter Signup */}
        <div className="py-8 border-b border-[#DDE3EA]">
          <div className="max-w-2xl">
            <h4 className="type-micro text-[#16232F] font-bold tracking-widest uppercase mb-2">
              Newsletter
            </h4>
            <p className="text-xs text-[#16232F]/80 mb-4">
              Suscríbete a nuestro newsletter.
            </p>
            <form onSubmit={handleNewsletterSubmit} noValidate className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newsletterFirstName}
                  onChange={(e) => setNewsletterFirstName(e.target.value)}
                  placeholder="Nombre"
                  aria-label="Nombre"
                  required
                  className="h-10 px-3 text-xs text-[#16232F] bg-[#FFFFFF] border border-[#DDE3EA] rounded-[4px] focus:outline-none focus:border-[#2C63AE] focus:ring-1 focus:ring-[#2C63AE]"
                />
                <input
                  type="text"
                  value={newsletterLastName}
                  onChange={(e) => setNewsletterLastName(e.target.value)}
                  placeholder="Apellido"
                  aria-label="Apellido"
                  required
                  className="h-10 px-3 text-xs text-[#16232F] bg-[#FFFFFF] border border-[#DDE3EA] rounded-[4px] focus:outline-none focus:border-[#2C63AE] focus:ring-1 focus:ring-[#2C63AE]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  aria-label="Correo electrónico"
                  required
                  className="h-10 px-3 text-xs text-[#16232F] bg-[#FFFFFF] border border-[#DDE3EA] rounded-[4px] focus:outline-none focus:border-[#2C63AE] focus:ring-1 focus:ring-[#2C63AE]"
                />
                <input
                  type="tel"
                  value={newsletterPhone}
                  onChange={(e) => setNewsletterPhone(e.target.value)}
                  placeholder="Celular (0987654321)"
                  aria-label="Celular"
                  required
                  className="h-10 px-3 text-xs text-[#16232F] bg-[#FFFFFF] border border-[#DDE3EA] rounded-[4px] focus:outline-none focus:border-[#2C63AE] focus:ring-1 focus:ring-[#2C63AE]"
                />
              </div>

              <div>
                <span className="block text-[11px] text-[#16232F]/60 mb-1.5">Género</span>
                <div className="grid grid-cols-3 gap-2">
                  {NEWSLETTER_GENDERS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setNewsletterGender(option)}
                      aria-pressed={newsletterGender === option}
                      className={`h-10 px-2 text-xs font-semibold rounded-[4px] border transition-colors cursor-pointer ${
                        newsletterGender === option
                          ? 'border-[#2C63AE] bg-[#2C63AE]/5 text-[#2C63AE]'
                          : 'border-[#DDE3EA] bg-[#FFFFFF] text-[#16232F] hover:border-[#16232F]/40'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[11px] text-[#16232F]/60 mb-1.5">Fecha de nacimiento</span>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newsletterBirthDay ?? ''}
                    onChange={(e) => setNewsletterBirthDay(e.target.value ? Number(e.target.value) : null)}
                    aria-label="Día de nacimiento"
                    required
                    className="h-10 px-2.5 text-xs text-[#16232F] bg-white border border-[#DDE3EA] rounded-[4px] focus:outline-none focus:border-[#2C63AE] cursor-pointer"
                  >
                    <option value="" disabled>Día</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <select
                    value={newsletterBirthMonth ?? ''}
                    onChange={(e) => setNewsletterBirthMonth(e.target.value ? Number(e.target.value) : null)}
                    aria-label="Mes de nacimiento"
                    required
                    className="h-10 px-2.5 text-xs text-[#16232F] bg-white border border-[#DDE3EA] rounded-[4px] focus:outline-none focus:border-[#2C63AE] cursor-pointer"
                  >
                    <option value="" disabled>Mes</option>
                    {NEWSLETTER_MONTHS.map((month, idx) => (
                      <option key={month} value={idx + 1}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="h-10 px-5 bg-[#2C63AE] hover:bg-[#245292] disabled:opacity-60 disabled:cursor-not-allowed text-[#FFFFFF] text-xs font-bold uppercase tracking-wider rounded-[4px] transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              >
                {newsletterStatus === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Suscribirme
              </button>
            </form>
            {newsletterMessage && (
              <p
                role="status"
                className={`mt-2 text-xs ${
                  newsletterStatus === 'success' ? 'text-[#2C63AE]' : 'text-[#B3261E]'
                }`}
              >
                {newsletterMessage}
              </p>
            )}
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
