import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Check,
  Copy,
  Clock,
  MessageCircle,
  ShoppingBag,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { CartItem } from '../types';

interface BankOption {
  id: string;
  name: string;
  accountType: string;
  accountNumber: string;
  logoUrl: string;
}

const BANKS: BankOption[] = [
  {
    id: 'guayaquil',
    name: 'Banco Guayaquil',
    accountType: 'Cuenta corriente',
    accountNumber: '0021040410',
    logoUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/bancoguayaquil.webp',
  },
  {
    id: 'pichincha',
    name: 'Banco Pichincha',
    accountType: 'Cuenta de ahorro',
    accountNumber: '2208776647',
    logoUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/bancodepichincha.webp',
  },
  {
    id: 'loja',
    name: 'Banco de Loja',
    accountType: 'Cuenta de ahorro',
    accountNumber: '2903057524',
    logoUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/bancodeloja.webp',
  },
  {
    id: 'jep',
    name: 'Cooperativa JEP',
    accountType: 'Cuenta de ahorro',
    accountNumber: '406107479909',
    logoUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/bancojep.webp',
  },
  {
    id: 'austro',
    name: 'Banco del Austro',
    accountType: 'Cuenta de ahorro',
    accountNumber: '0011842003',
    logoUrl: 'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/bancodelaustro.webp',
  },
];

interface CheckoutPageProps {
  items: CartItem[];
  onNavigate: (view: any, extra?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ items, onNavigate }) => {
  // Step-by-step progressive state
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'payphone' | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState<boolean>(false);
  const [proofSentStatus, setProofSentStatus] = useState<'unconfirmed' | 'yes' | 'not_yet'>('unconfirmed');
  const [isOrderSubmitted, setIsOrderSubmitted] = useState<boolean>(false);
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const payphoneFee = paymentMethod === 'payphone' ? subtotal * 0.05 : 0;
  const total = subtotal + payphoneFee;

  const selectedBank = BANKS.find((b) => b.id === selectedBankId) || null;

  const handleCopyAccountNumber = () => {
    if (!selectedBank) return;
    navigator.clipboard.writeText(selectedBank.accountNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hola Induscrubs, adjunto mi comprobante de transferencia bancaria por un total de $${total.toFixed(
      2
    )}${selectedBank ? ` (${selectedBank.name})` : ''} para mi pedido de uniformes.`
  );
  const whatsappUrl = `https://wa.me/593988223950?text=${whatsappMessage}`;

  const handleWhatsAppClick = () => {
    setHasOpenedWhatsApp(true);
  };

  if (items.length === 0 && !isOrderSubmitted) {
    return (
      <main id="checkout-empty" className="w-full min-h-[60vh] bg-[#FFFFFF] py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 rounded-[8px] bg-[#F2F7FF] border border-[#DDE3EA] flex items-center justify-center text-[#2C63AE] mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1
            className="text-2xl font-bold text-[#16232F] mb-2"
            style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
          >
            Tu carrito está vacío
          </h1>
          <p className="text-sm text-[#5A6E85] max-w-md mx-auto mb-8">
            Para proceder al pago, agrega tus uniformes médicos favoritos desde el catálogo.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="h-11 px-8 bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider rounded-[6px] transition-colors inline-flex items-center justify-center min-h-[44px] shadow-sm cursor-pointer"
          >
            Ir al Catálogo
          </button>
        </div>
      </main>
    );
  }

  return (
    <main id="checkout-page" className="w-full min-h-[70vh] bg-[#FFFFFF] py-6 sm:py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => onNavigate('catalog')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5A6E85] hover:text-[#2C63AE] mb-6 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver al catálogo</span>
        </button>

        {/* Page Header */}
        <div className="mb-8 border-b border-[#EAEFF4] pb-6">
          <span className="block text-xs font-semibold uppercase tracking-wider text-[#2C63AE] mb-1.5">
            Proceso de Compra
          </span>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#16232F] tracking-tight"
            style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
          >
            Finalizar Compra
          </h1>
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {/* Left Column: Progressive Step-by-Step Payment Flow */}
          <div className="w-full lg:flex-1 space-y-8">
            {isOrderSubmitted ? (
              /* Order Confirmation Card (Order marked as Pendiente de verificación) */
              <div
                id="order-confirmation-card"
                className="bg-[#FFFFFF] rounded-[8px] border-2 border-[#2C63AE] p-6 sm:p-8 space-y-6 shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-[6px] bg-[#2C63AE]/10 text-[#2C63AE] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#FFF8E6] text-[#B76E00] border border-[#FFE082] text-xs font-bold mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pendiente de verificación</span>
                    </div>
                    <h2
                      className="text-xl sm:text-2xl font-bold text-[#16232F]"
                      style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                    >
                      ¡Pedido registrado con éxito!
                    </h2>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-[#5A6E85] leading-relaxed">
                  Tu orden ha sido registrada con el estado{' '}
                  <strong className="text-[#16232F]">Pendiente de verificación</strong>. En breve
                  revisaremos tu comprobante y confirmaremos tu pedido por WhatsApp para iniciar el
                  empaquetado y despacho inmediato.
                </p>

                {selectedBank && (
                  <div className="bg-[#F7F9FB] rounded-[6px] p-4 border border-[#EAEFF4] space-y-2">
                    <div className="flex justify-between text-xs text-[#5A6E85]">
                      <span>Banco de depósito:</span>
                      <span className="font-semibold text-[#16232F]">{selectedBank.name}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#5A6E85]">
                      <span>Monto transferido:</span>
                      <span className="font-bold text-[#2C63AE]">${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-12 bg-[#25D366] hover:bg-[#20bd5a] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider rounded-[6px] transition-colors flex items-center justify-center gap-2 shadow-sm min-h-[48px]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Abrir chat de WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOrderSubmitted(false);
                      onNavigate('catalog');
                    }}
                    className="h-12 px-6 border border-[#DDE3EA] hover:bg-[#F2F7FF] text-[#16232F] text-xs font-semibold rounded-[6px] transition-colors cursor-pointer min-h-[48px]"
                  >
                    Seguir comprando
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* STEP 1 — "Elegí tu método de pago" */}
                <div id="checkout-step-1" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <h2
                        className="text-lg font-bold text-[#16232F]"
                        style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                      >
                        Elegí tu método de pago
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm text-[#5A6E85] pl-11">
                    Selecciona cómo deseas realizar el pago de tu pedido:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-11">
                    {/* Method 1: Transferencia bancaria */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('transfer');
                      }}
                      className={`relative flex items-start gap-3.5 p-4 rounded-[6px] border-2 text-left transition-all cursor-pointer ${
                        paymentMethod === 'transfer'
                          ? 'border-[#2C63AE] bg-[#2C63AE]/5 shadow-xs'
                          : 'border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/40'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div
                          className={`w-4 h-4 rounded-[3px] border flex items-center justify-center ${
                            paymentMethod === 'transfer'
                              ? 'border-[#2C63AE] bg-[#2C63AE]'
                              : 'border-[#DDE3EA] bg-white'
                          }`}
                        >
                          {paymentMethod === 'transfer' && (
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#2C63AE]" />
                          <span className="text-sm font-bold text-[#16232F]">
                            Transferencia bancaria
                          </span>
                        </div>
                        <p className="text-xs text-[#5A6E85] mt-1 leading-snug">
                          Depósito directo en 5 bancos ecuatorianos sin recargo adicional
                        </p>
                      </div>
                    </button>

                    {/* Method 2: PayPhone */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('payphone');
                      }}
                      className={`relative flex items-start gap-3.5 p-4 rounded-[6px] border-2 text-left transition-all cursor-pointer ${
                        paymentMethod === 'payphone'
                          ? 'border-[#2C63AE] bg-[#2C63AE]/5 shadow-xs'
                          : 'border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/40'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div
                          className={`w-4 h-4 rounded-[3px] border flex items-center justify-center ${
                            paymentMethod === 'payphone'
                              ? 'border-[#2C63AE] bg-[#2C63AE]'
                              : 'border-[#DDE3EA] bg-white'
                          }`}
                        >
                          {paymentMethod === 'payphone' && (
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#2C63AE]" />
                          <span className="text-sm font-bold text-[#16232F]">
                            PayPhone (+5% recargo)
                          </span>
                        </div>
                        <p className="text-xs text-[#5A6E85] mt-1 leading-snug">
                          Pago seguro con tarjeta de crédito o débito nacional e internacional
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* IF PAYPHONE IS SELECTED */}
                {paymentMethod === 'payphone' && (
                  <div
                    id="payphone-coming-soon-card"
                    className="p-6 rounded-[8px] bg-[#F7F9FB] border border-[#DDE3EA] space-y-4 pl-11 ml-0 animate-fade-in"
                  >
                    <div className="flex items-center gap-2 text-[#2C63AE]">
                      <CreditCard className="w-5 h-5" />
                      <h3
                        className="text-base font-bold text-[#16232F]"
                        style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                      >
                        Pago con tarjeta mediante PayPhone
                      </h3>
                    </div>

                    <p className="text-sm text-[#5A6E85] leading-relaxed">
                      El servicio de cobro en línea a través de tarjeta de crédito y débito vía
                      PayPhone estará disponible próximamente en nuestra plataforma. Por el momento,
                      te recomendamos seleccionar <strong>Transferencia bancaria</strong> para
                      procesar y despachar tu pedido de inmediato sin comisiones.
                    </p>

                    <button
                      type="button"
                      disabled
                      className="w-full h-12 bg-[#DDE3EA] text-[#5A6E85] text-xs font-bold uppercase tracking-wider rounded-[6px] flex items-center justify-center min-h-[48px] cursor-not-allowed"
                    >
                      Pagar con PayPhone — próximamente
                    </button>
                  </div>
                )}

                {/* IF TRANSFERENCIA BANCARIA IS SELECTED: PROGRESSIVE STEPS */}
                {paymentMethod === 'transfer' && (
                  <>
                    {/* STEP 2 — "Elegí tu banco" */}
                    <div id="checkout-step-2" className="space-y-4 pt-4 border-t border-[#EAEFF4]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                          2
                        </div>
                        <div>
                          <h2
                            className="text-lg font-bold text-[#16232F]"
                            style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                          >
                            Elegí tu banco
                          </h2>
                        </div>
                      </div>

                      <p className="text-sm text-[#5A6E85] pl-11">
                        Elige la entidad financiera en la que prefieres realizar tu depósito o
                        transferencia:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pl-11">
                        {BANKS.map((bank) => {
                          const isSelected = selectedBankId === bank.id;
                          return (
                            <button
                              key={bank.id}
                              type="button"
                              onClick={() => {
                                setSelectedBankId(bank.id);
                              }}
                              className={`p-3.5 rounded-[6px] border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#2C63AE] bg-[#2C63AE]/10 text-[#16232F] font-bold shadow-xs'
                                  : 'border-[#DDE3EA] bg-[#FFFFFF] text-[#5A6E85] hover:border-[#16232F]/40'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-[4px] bg-[#FFFFFF] border border-[#DDE3EA] p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={bank.logoUrl}
                                    alt={bank.name}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold text-[#16232F] flex items-center justify-between gap-1">
                                    <span className="truncate">{bank.name}</span>
                                    {isSelected && <Check className="w-4 h-4 text-[#2C63AE] shrink-0" />}
                                  </div>
                                  <div className="text-xs text-[#5A6E85] mt-0.5 truncate">
                                    {bank.accountType}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* STEP 3 & STEP 4 (Appears once a bank is selected) */}
                    {selectedBank && (
                      <>
                        {/* STEP 3 — "Datos para tu depósito" */}
                        <div
                          id="checkout-step-3"
                          className="space-y-4 pt-4 border-t border-[#EAEFF4] animate-fade-in"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                              3
                            </div>
                            <div>
                              <h2
                                className="text-lg font-bold text-[#16232F]"
                                style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                              >
                                Datos para tu depósito
                              </h2>
                            </div>
                          </div>

                          <p className="text-sm text-[#5A6E85] pl-11">
                            Usa la siguiente información bancaria para realizar tu transferencia por
                            el monto exacto:
                          </p>

                          {/* Highlighted card with accent-colored border */}
                          <div className="pl-11">
                            <div
                              id="bank-details-highlight-card"
                              className="bg-[#FFFFFF] rounded-[8px] border-2 border-[#2C63AE] p-5 sm:p-6 shadow-sm space-y-4"
                            >
                              <div className="flex items-center justify-between pb-3 border-b border-[#EAEFF4]">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-[4px] bg-[#FFFFFF] border border-[#DDE3EA] p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                    <img
                                      src={selectedBank.logoUrl}
                                      alt={selectedBank.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <span
                                    className="text-base font-bold text-[#16232F]"
                                    style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                                  >
                                    {selectedBank.name}
                                  </span>
                                </div>
                                <span className="text-xs font-semibold text-[#2C63AE] px-2.5 py-1 bg-[#F2F7FF] border border-[#DDE3EA] rounded-[4px]">
                                  {selectedBank.accountType}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                                <div>
                                  <span className="block text-[#5A6E85] mb-0.5 text-xs">
                                    Titular de la cuenta:
                                  </span>
                                  <span className="font-bold text-[#16232F]">Andrea Granda</span>
                                </div>
                                <div>
                                  <span className="block text-[#5A6E85] mb-0.5 text-xs">
                                    Cédula de identidad:
                                  </span>
                                  <span className="font-bold text-[#16232F]">1105021024</span>
                                </div>
                                <div>
                                  <span className="block text-[#5A6E85] mb-0.5 text-xs">
                                    Tipo de cuenta:
                                  </span>
                                  <span className="font-semibold text-[#16232F]">
                                    {selectedBank.accountType}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[#5A6E85] mb-0.5 text-xs">
                                    Número de cuenta:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-sm sm:text-base text-[#16232F]">
                                      {selectedBank.accountNumber}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={handleCopyAccountNumber}
                                      className="p-1.5 text-[#2C63AE] hover:bg-[#F2F7FF] rounded-[4px] border border-[#DDE3EA] transition-colors cursor-pointer inline-flex items-center gap-1"
                                      title="Copiar número de cuenta"
                                    >
                                      {copiedNumber ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-[#25D366]" />
                                          <span className="text-[10px] text-[#25D366] font-semibold">
                                            Copiado
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          <span className="text-[10px] text-[#2C63AE] font-semibold">
                                            Copiar
                                          </span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Monto exacto a depositar */}
                              <div className="pt-3 border-t border-[#EAEFF4] flex items-center justify-between bg-[#F7F9FB] p-3.5 rounded-[6px] border border-[#EAEFF4]">
                                <span className="text-xs sm:text-sm font-semibold text-[#16232F]">
                                  Monto exacto a depositar:
                                </span>
                                <span
                                  className="text-xl font-extrabold text-[#2C63AE]"
                                  style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                                >
                                  ${total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* STEP 4 — "Enviá tu comprobante de pago" */}
                        <div
                          id="checkout-step-4"
                          className="space-y-4 pt-4 border-t border-[#EAEFF4] animate-fade-in"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                              4
                            </div>
                            <div>
                              <h2
                                className="text-lg font-bold text-[#16232F]"
                                style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                              >
                                Enviá tu comprobante de pago
                              </h2>
                            </div>
                          </div>

                          <div className="pl-11 space-y-4">
                            <p className="text-sm sm:text-base text-[#16232F] font-medium leading-relaxed">
                              Una vez realizada la transferencia, toma una captura de pantalla o
                              foto legible de tu comprobante y envíala a través de nuestro canal
                              oficial de WhatsApp para validar tu pago:
                            </p>

                            {/* Big Green WhatsApp Button */}
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={handleWhatsAppClick}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 h-14 px-8 bg-[#25D366] hover:bg-[#20bd5a] text-[#FFFFFF] text-sm font-bold uppercase tracking-wider rounded-[6px] transition-all shadow-md cursor-pointer min-h-[56px]"
                            >
                              <MessageCircle className="w-5 h-5 fill-white" />
                              <span>Enviar comprobante por WhatsApp</span>
                            </a>
                          </div>
                        </div>

                        {/* STEP 5 — Double confirmation card (appears after WhatsApp button is clicked) */}
                        {hasOpenedWhatsApp && (
                          <div
                            id="checkout-step-5"
                            className="space-y-4 pt-4 border-t border-[#EAEFF4] animate-fade-in"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                                5
                              </div>
                              <div>
                                <h2
                                  className="text-lg font-bold text-[#16232F]"
                                  style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                                >
                                  ¿Ya enviaste tu comprobante de pago?
                                </h2>
                              </div>
                            </div>

                            <div className="pl-11">
                              {/* Accent-tinted background double confirmation card */}
                              <div className="p-5 sm:p-6 rounded-[8px] bg-[#F2F7FF] border-2 border-[#2C63AE]/30 space-y-4">
                                <p className="text-sm sm:text-base text-[#16232F] font-semibold">
                                  ¿Pudiste enviar la foto de tu comprobante por WhatsApp?
                                </p>

                                <div className="flex flex-wrap gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setProofSentStatus('yes')}
                                    className={`h-11 px-6 text-xs font-bold uppercase tracking-wider rounded-[6px] transition-colors cursor-pointer flex items-center gap-2 ${
                                      proofSentStatus === 'yes'
                                        ? 'bg-[#2C63AE] text-[#FFFFFF] shadow-sm'
                                        : 'bg-[#FFFFFF] border-2 border-[#2C63AE] text-[#2C63AE] hover:bg-[#2C63AE]/10'
                                    }`}
                                  >
                                    <Check className="w-4 h-4" />
                                    <span>Sí, ya lo envié</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setProofSentStatus('not_yet')}
                                    className={`h-11 px-6 text-xs font-bold uppercase tracking-wider rounded-[6px] transition-colors cursor-pointer ${
                                      proofSentStatus === 'not_yet'
                                        ? 'bg-[#5A6E85] text-[#FFFFFF]'
                                        : 'bg-[#FFFFFF] border border-[#DDE3EA] text-[#5A6E85] hover:bg-[#F7F9FB]'
                                    }`}
                                  >
                                    Todavía no
                                  </button>
                                </div>

                                {/* Note if "Todavía no" is clicked */}
                                {proofSentStatus === 'not_yet' && (
                                  <div className="p-3.5 bg-[#FFFFFF] rounded-[6px] border border-[#DDE3EA] text-xs sm:text-sm text-[#5A6E85] space-y-2 animate-fade-in">
                                    <div className="flex items-center gap-2 text-[#16232F] font-semibold">
                                      <HelpCircle className="w-4 h-4 text-[#2C63AE]" />
                                      <span>Envía tu comprobante antes de confirmar:</span>
                                    </div>
                                    <p>
                                      Por favor, utiliza el botón verde de WhatsApp de arriba para
                                      enviarnos la captura del depósito. Una vez enviado el mensaje,
                                      selecciona <strong>&quot;Sí, ya lo envié&quot;</strong> para
                                      habilitar el paso final.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* STEP 6 — "Ya realicé el pago" (appears only after step 5 is confirmed "Sí") */}
                        {proofSentStatus === 'yes' && (
                          <div
                            id="checkout-step-6"
                            className="space-y-4 pt-4 border-t border-[#EAEFF4] animate-fade-in"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                                6
                              </div>
                              <div>
                                <h2
                                  className="text-lg font-bold text-[#16232F]"
                                  style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                                >
                                  Completar registro de orden
                                </h2>
                              </div>
                            </div>

                            <div className="pl-11 space-y-3">
                              <p className="text-sm text-[#5A6E85]">
                                Haz clic en el botón para asentar tu pedido en el sistema.
                              </p>

                              <button
                                type="button"
                                onClick={() => setIsOrderSubmitted(true)}
                                className="w-full h-14 bg-[#2C63AE] hover:bg-[#245292] text-[#FFFFFF] text-sm font-bold uppercase tracking-wider rounded-[6px] transition-colors flex items-center justify-center gap-2 min-h-[56px] shadow-sm cursor-pointer"
                                style={{
                                  fontFamily: "'Inter Variable', Inter, sans-serif",
                                  fontWeight: 700,
                                }}
                              >
                                <Sparkles className="w-4 h-4" />
                                <span>YA REALICÉ EL PAGO</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-28">
            <div
              id="checkout-order-summary"
              className="bg-[#FFFFFF] rounded-[8px] border border-[#DDE3EA] p-5 sm:p-6 shadow-sm space-y-5"
            >
              <h2
                className="text-base font-bold text-[#16232F] pb-3 border-b border-[#EAEFF4] flex items-center justify-between"
                style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
              >
                <span>Resumen del Pedido</span>
                <span className="text-xs font-semibold text-[#5A6E85]">
                  {items.reduce((sum, item) => sum + item.qty, 0)} prenda(s)
                </span>
              </h2>

              {/* Line Items List */}
              <div className="divide-y divide-[#EAEFF4] max-h-[300px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                    <div className="w-14 h-16 rounded-[4px] overflow-hidden bg-[#F7F9FB] border border-[#DDE3EA] shrink-0">
                      <img
                        src={
                          item.image ||
                          'https://ik.imagekit.io/fjlcsp6fz/Induscrubs/InduscrubsImages/sketchersblack.webp'
                        }
                        alt={item.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#16232F] truncate">{item.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#5A6E85] mt-0.5">
                        <span>Talla: {item.size}</span>
                        <span>•</span>
                        <span>Cant: {item.qty}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#2C63AE] mt-1">
                        ${(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="pt-3 border-t border-[#EAEFF4] space-y-2.5 text-xs text-[#5A6E85]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#16232F]">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Envío</span>
                  <span className="font-semibold text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded-[4px]">
                    Gratis
                  </span>
                </div>

                {paymentMethod === 'payphone' && (
                  <div className="flex justify-between items-center text-[#2C63AE]">
                    <span>Recargo PayPhone (5%)</span>
                    <span className="font-semibold">+${payphoneFee.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#EAEFF4] flex items-baseline justify-between">
                  <span
                    className="text-base font-bold text-[#16232F]"
                    style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                  >
                    Total
                  </span>
                  <div className="text-right">
                    <span
                      className="text-2xl font-extrabold text-[#2C63AE]"
                      style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                    >
                      ${total.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-[#5A6E85]">IVA incluido</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
