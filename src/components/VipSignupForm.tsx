import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { markVipPopupSeen } from '../lib/vipPopup';

const NEWSLETTER_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

interface VipSignupFormProps {
  onSubscribed?: () => void;
}

// Induscrubs VIP signup form shared by the Footer and the VIP popup. Designed
// for the #84B8FF accent background both of them use.
export const VipSignupForm: React.FC<VipSignupFormProps> = ({ onSubscribed }) => {
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
      setNewsletterMessage(
        '¡Bienvenido a Induscrubs VIP! Usa este mismo correo al pagar para recibir tu 10% de descuento.'
      );
      setNewsletterFirstName('');
      setNewsletterLastName('');
      setNewsletterEmail('');
      setNewsletterPhone('');
      setNewsletterGender('');
      setNewsletterBirthDay(null);
      setNewsletterBirthMonth(null);
      // Subscribing anywhere (Footer or popup) means the popup has nothing
      // left to offer this session.
      markVipPopupSeen();
      onSubscribed?.();
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
    <>
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
          <span className="block text-[11px] text-[#FFFFFF]/60 mb-1.5">Género</span>
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
          <span className="block text-[11px] text-[#FFFFFF]/60 mb-1.5">Fecha de nacimiento</span>
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
          Unirme a Induscrubs VIP
        </button>
      </form>
      {newsletterMessage && (
        <p
          role="status"
          className={`mt-2 text-xs ${
            newsletterStatus === 'success' ? 'text-[#FFFFFF] font-semibold' : 'text-[#B3261E]'
          }`}
        >
          {newsletterMessage}
        </p>
      )}
    </>
  );
};
