import React, { useRef, useState } from 'react';
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
  Sparkles,
  Banknote,
  Home,
  MapPin,
  Truck,
  Upload,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { CartItem } from '../types';
import { getTurnstileToken } from '../lib/turnstile';
import { STORE_INFO } from '../data/products';
import {
  submitPublicOrder,
  uploadPaymentReceipt,
  validateReceiptFile,
  OrderSubmissionError,
  CreatePublicOrderPayload,
  CreatePublicOrderResult,
} from '../lib/orders';
import { VIP_DISCOUNT_PERCENT, computeVipDiscount, useVipEligibility } from '../lib/vip';

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

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
// Accepts formatting characters (spaces, dashes, parens, leading +) but requires
// a plausible number of actual digits, so a stray character can't pass as a phone number.
const MIN_PHONE_DIGITS = 7;

type PaymentMethod = 'Transferencia' | 'PayPhone' | 'Efectivo';
type DeliveryType = 'Domicilio' | 'Retiro en tienda' | 'Envío nacional';
type ShippingScope = 'Loja' | 'Nacional';
const NATIONAL_SHIPPING_FEE = 7;

interface CheckoutPageProps {
  items: CartItem[];
  onNavigate: (view: any, extra?: any) => void;
  onClearCart: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ items, onNavigate, onClearCart }) => {
  // Contact + delivery
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingScope, setShippingScope] = useState<ShippingScope>('Loja');
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState<boolean>(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileError, setReceiptFileError] = useState<string | null>(null);

  // Submission
  // isSubmitting (state) drives the UI lock; isSubmittingRef is the synchronous
  // guard — state updates are batched/async, so a second click fired in the same
  // tick as the first could still read a stale `isSubmitting === false` and slip
  // through before React re-renders with the fieldset disabled.
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<CreatePublicOrderResult | null>(null);

  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);

  // VIP preview. verify-and-create-order checks the order's email, so only
  // preview the discount while the typed email is empty or matches the stored
  // VIP email. This is an estimate; the confirmed total comes from the response.
  const { email: vipEmail, eligible: vipEligible } = useVipEligibility();
  const typedEmail = customerEmail.trim().toLowerCase();
  const showVipPreview =
    !orderResult && vipEligible && (typedEmail === '' || typedEmail === vipEmail);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const payphoneFee = paymentMethod === 'PayPhone' ? subtotal * 0.05 : 0;
  const shippingFee = shippingScope === 'Nacional' ? NATIONAL_SHIPPING_FEE : 0;
  const vipDiscount = showVipPreview ? computeVipDiscount(subtotal) : 0;
  const total = subtotal + payphoneFee + shippingFee - vipDiscount;

  const selectedBank = BANKS.find((b) => b.id === selectedBankId) || null;

  const isContactValid =
    customerName.trim().length > 0 &&
    (customerPhone.match(/\d/g)?.length ?? 0) >= MIN_PHONE_DIGITS &&
    EMAIL_RE.test(customerEmail.trim());

  const isDeliveryValid =
    shippingScope === 'Nacional'
      ? deliveryAddress.trim().length > 0
      : deliveryType === 'Retiro en tienda' ||
        (deliveryType === 'Domicilio' && deliveryAddress.trim().length > 0);

  const isDetailsValid = isContactValid && isDeliveryValid;

  const handleSelectShippingScope = (scope: ShippingScope) => {
    setShippingScope(scope);
    if (scope === 'Nacional') {
      setDeliveryType('Envío nacional');
    } else if (deliveryType === 'Envío nacional') {
      setDeliveryType(null);
    }
  };

  const nationalWhatsappMessage = encodeURIComponent(
    'Hola Induscrubs, quiero gestionar mi pedido de envío nacional.'
  );
  const nationalWhatsappUrl = `https://wa.me/${STORE_INFO.whatsapp}?text=${nationalWhatsappMessage}`;

  const handleNationalOrderWhatsApp = (method: 'Transferencia' | 'Efectivo') => {
    if (isSubmittingRef.current) return;
    window.open(nationalWhatsappUrl, '_blank', 'noopener,noreferrer');
    void handleSubmitOrder(method);
  };

  const handleCopyAccountNumber = () => {
    if (!selectedBank) return;
    navigator.clipboard.writeText(selectedBank.accountNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // After the order is registered the cart is cleared (so `total` drops to 0);
  // the server-confirmed total is the one to quote from then on.
  const whatsappTotal = orderResult ? orderResult.total : total;
  const whatsappMessage = encodeURIComponent(
    `Hola Induscrubs, adjunto mi comprobante de transferencia bancaria por un total de $${whatsappTotal.toFixed(
      2
    )}${selectedBank ? ` (${selectedBank.name})` : ''} para mi pedido de uniformes.`
  );
  const whatsappUrl = `https://wa.me/593988223950?text=${whatsappMessage}`;

  const handleWhatsAppClick = () => {
    setHasOpenedWhatsApp(true);
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setReceiptFile(null);
      setReceiptFileError(null);
      return;
    }
    const error = validateReceiptFile(file);
    if (error) {
      setReceiptFileError(error);
      setReceiptFile(null);
      e.target.value = '';
      return;
    }
    setReceiptFileError(null);
    setReceiptFile(file);
  };

  const handleSubmitOrder = async (method: 'Transferencia' | 'Efectivo') => {
    if (!isDetailsValid || isSubmittingRef.current) return;

    // Freeze everything that defines the order into a single snapshot, taken
    // synchronously before any await. The RPC call below is only ever built
    // from this snapshot — never from live state — so if the customer changes
    // their delivery scope, address, or contact info while this submission is
    // still in flight (awaiting the receipt upload / Turnstile / network),
    // that later change cannot leak into the order already being created.
    const snapshot = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      deliveryType: deliveryType as DeliveryType,
      deliveryAddress: deliveryAddress.trim(),
      items: items.map((item) => ({
        product_id: item.productId,
        size_code: item.size,
        color_id: item.colorId ?? '',
        quantity: item.qty,
      })),
    };

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    setUploadWarning(null);

    try {
      let proofPath: string | null = null;

      if (method === 'Transferencia' && receiptFile) {
        try {
          proofPath = await uploadPaymentReceipt(receiptFile);
        } catch {
          setUploadWarning(
            'No se pudo subir el comprobante, pero tu pedido se registrará igual. Puedes enviarlo por WhatsApp.'
          );
        }
      }

      const turnstileToken = await getTurnstileToken();

      const payload: CreatePublicOrderPayload = {
        p_customer_name: snapshot.customerName,
        p_customer_phone: snapshot.customerPhone,
        p_customer_email: snapshot.customerEmail,
        p_payment_method: method,
        p_delivery_type: snapshot.deliveryType,
        p_delivery_address:
          snapshot.deliveryType === 'Domicilio' || snapshot.deliveryType === 'Envío nacional'
            ? snapshot.deliveryAddress
            : null,
        p_notes: null,
        p_payment_proof_url: proofPath,
        p_items: snapshot.items,
      };

      const result = await submitPublicOrder(payload, turnstileToken);
      setOrderResult(result);
      onClearCart();
    } catch (err) {
      if (err instanceof OrderSubmissionError) {
        setSubmitError(err.message);
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('No pudimos procesar tu pedido. Inténtalo de nuevo.');
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderResult) {
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
            {orderResult ? (
              /* Order Confirmation Card */
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
                  Tu orden <strong className="text-[#16232F]">{orderResult.orderNumber}</strong> ha
                  sido registrada con el estado{' '}
                  <strong className="text-[#16232F]">Pendiente de verificación</strong>. En breve la
                  revisaremos y te confirmaremos por WhatsApp.
                </p>

                <div className="bg-[#F7F9FB] rounded-[6px] p-4 border border-[#EAEFF4] space-y-2">
                  <div className="flex justify-between text-xs text-[#5A6E85]">
                    <span>Número de pedido:</span>
                    <span className="font-semibold text-[#16232F]">{orderResult.orderNumber}</span>
                  </div>
                  {orderResult.discount.applied && (
                    <>
                      <div className="flex justify-between text-xs text-[#5A6E85]">
                        <span>Total sin descuento:</span>
                        <span className="font-semibold text-[#16232F]">
                          ${orderResult.originalTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-[#2C63AE]">
                        <span className="font-semibold">Descuento VIP -{VIP_DISCOUNT_PERCENT}%:</span>
                        <span className="font-semibold">-${orderResult.discount.amount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-xs text-[#5A6E85]">
                    <span>Total del pedido:</span>
                    <span className="font-bold text-[#2C63AE]">${orderResult.total.toFixed(2)}</span>
                  </div>
                </div>

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
                    onClick={() => onNavigate('catalog')}
                    className="h-12 px-6 border border-[#DDE3EA] hover:bg-[#F2F7FF] text-[#16232F] text-xs font-semibold rounded-[6px] transition-colors cursor-pointer min-h-[48px]"
                  >
                    Seguir comprando
                  </button>
                </div>
              </div>
            ) : (
              <fieldset
                disabled={isSubmitting}
                className="border-0 p-0 m-0 min-w-0 space-y-8 disabled:opacity-70"
              >
                {/* STEP 1 — "Tus datos de contacto" */}
                <div id="checkout-step-1" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                      1
                    </div>
                    <h2
                      className="text-lg font-bold text-[#16232F]"
                      style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                    >
                      Tus datos de contacto
                    </h2>
                  </div>

                  <div className="pl-11 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#16232F] mb-1.5" htmlFor="customer-name">
                        Nombre completo
                      </label>
                      <input
                        id="customer-name"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Tu nombre y apellido"
                        className="w-full h-11 px-3.5 rounded-[6px] border border-[#DDE3EA] text-sm text-[#16232F] focus:outline-none focus:border-[#2C63AE] focus:ring-1 focus:ring-[#2C63AE]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#16232F] mb-1.5" htmlFor="customer-email">
                        Correo electrónico
                      </label>
                      <input
                        id="customer-email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="tucorreo@ejemplo.com"
                        className="w-full h-11 px-3.5 rounded-[6px] border border-[#DDE3EA] text-sm text-[#16232F] focus:outline-none focus:border-[#2C63AE] focus:ring-1 focus:ring-[#2C63AE]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#16232F] mb-1.5" htmlFor="customer-phone">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        id="customer-phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="09XXXXXXXX"
                        className="w-full h-11 px-3.5 rounded-[6px] border border-[#DDE3EA] text-sm text-[#16232F] focus:outline-none focus:border-[#2C63AE] focus:ring-1 focus:ring-[#2C63AE]"
                      />
                    </div>
                  </div>
                </div>

                {/* STEP 2 — "Alcance del envío" */}
                <div id="checkout-step-2-scope" className="space-y-4 pt-4 border-t border-[#EAEFF4]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                      2
                    </div>
                    <h2
                      className="text-lg font-bold text-[#16232F]"
                      style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                    >
                      ¿A dónde enviamos tu pedido?
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-11">
                    <button
                      type="button"
                      onClick={() => handleSelectShippingScope('Loja')}
                      className={`relative flex items-start gap-3.5 p-4 rounded-[6px] border-2 text-left transition-all cursor-pointer ${
                        shippingScope === 'Loja'
                          ? 'border-[#2C63AE] bg-[#2C63AE]/5 shadow-xs'
                          : 'border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/40'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div
                          className={`w-4 h-4 rounded-[3px] border flex items-center justify-center ${
                            shippingScope === 'Loja'
                              ? 'border-[#2C63AE] bg-[#2C63AE]'
                              : 'border-[#DDE3EA] bg-white'
                          }`}
                        >
                          {shippingScope === 'Loja' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-[#2C63AE]" />
                          <span className="text-sm font-bold text-[#16232F]">Envíos gratis en Loja</span>
                        </div>
                        <p className="text-xs text-[#5A6E85] mt-1 leading-snug">
                          Domicilio o retiro en tienda, sin costo adicional
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectShippingScope('Nacional')}
                      className={`relative flex items-start gap-3.5 p-4 rounded-[6px] border-2 text-left transition-all cursor-pointer ${
                        shippingScope === 'Nacional'
                          ? 'border-[#2C63AE] bg-[#2C63AE]/5 shadow-xs'
                          : 'border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/40'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div
                          className={`w-4 h-4 rounded-[3px] border flex items-center justify-center ${
                            shippingScope === 'Nacional'
                              ? 'border-[#2C63AE] bg-[#2C63AE]'
                              : 'border-[#DDE3EA] bg-white'
                          }`}
                        >
                          {shippingScope === 'Nacional' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#2C63AE]" />
                          <span className="text-sm font-bold text-[#16232F]">Envío Nacional (+$7)</span>
                        </div>
                        <p className="text-xs text-[#5A6E85] mt-1 leading-snug">
                          Entrega a cualquier ciudad del Ecuador vía courier
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* STEP 3 — "Entrega" (Loja: Domicilio/Retiro; Nacional: dirección de envío) */}
                {shippingScope === 'Loja' ? (
                  <div id="checkout-step-3" className="space-y-4 pt-4 border-t border-[#EAEFF4] animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                      3
                    </div>
                    <h2
                      className="text-lg font-bold text-[#16232F]"
                      style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                    >
                      ¿Cómo quieres recibir tu pedido?
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pl-11">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('Domicilio')}
                      className={`relative flex items-start gap-3.5 p-4 rounded-[6px] border-2 text-left transition-all cursor-pointer ${
                        deliveryType === 'Domicilio'
                          ? 'border-[#2C63AE] bg-[#2C63AE]/5 shadow-xs'
                          : 'border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/40'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div
                          className={`w-4 h-4 rounded-[3px] border flex items-center justify-center ${
                            deliveryType === 'Domicilio'
                              ? 'border-[#2C63AE] bg-[#2C63AE]'
                              : 'border-[#DDE3EA] bg-white'
                          }`}
                        >
                          {deliveryType === 'Domicilio' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-[#2C63AE]" />
                          <span className="text-sm font-bold text-[#16232F]">Domicilio</span>
                        </div>
                        <p className="text-xs text-[#5A6E85] mt-1 leading-snug">
                          Envío gratis en todo Loja
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('Retiro en tienda')}
                      className={`relative flex items-start gap-3.5 p-4 rounded-[6px] border-2 text-left transition-all cursor-pointer ${
                        deliveryType === 'Retiro en tienda'
                          ? 'border-[#2C63AE] bg-[#2C63AE]/5 shadow-xs'
                          : 'border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/40'
                      }`}
                    >
                      <div className="mt-0.5">
                        <div
                          className={`w-4 h-4 rounded-[3px] border flex items-center justify-center ${
                            deliveryType === 'Retiro en tienda'
                              ? 'border-[#2C63AE] bg-[#2C63AE]'
                              : 'border-[#DDE3EA] bg-white'
                          }`}
                        >
                          {deliveryType === 'Retiro en tienda' && (
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#2C63AE]" />
                          <span className="text-sm font-bold text-[#16232F]">Retiro en tienda</span>
                        </div>
                        <p className="text-xs text-[#5A6E85] mt-1 leading-snug">
                          Retira tu pedido en nuestro local en Loja
                        </p>
                      </div>
                    </button>
                  </div>

                  {deliveryType === 'Domicilio' && (
                    <div className="pl-11 animate-fade-in">
                      <label
                        className="block text-xs font-semibold text-[#16232F] mb-1.5"
                        htmlFor="delivery-address"
                      >
                        Dirección de entrega
                      </label>
                      <input
                        id="delivery-address"
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Calle principal, referencia, sector..."
                        className="w-full h-11 px-3.5 rounded-[6px] border border-[#DDE3EA] text-sm text-[#16232F] focus:outline-none focus:border-[#2C63AE] focus:ring-1 focus:ring-[#2C63AE]"
                      />
                    </div>
                  )}
                  </div>
                ) : (
                  <div id="checkout-step-3-nacional" className="space-y-4 pt-4 border-t border-[#EAEFF4] animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                        3
                      </div>
                      <h2
                        className="text-lg font-bold text-[#16232F]"
                        style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                      >
                        Dirección de envío nacional
                      </h2>
                    </div>

                    <div className="pl-11">
                      <label
                        className="block text-xs font-semibold text-[#16232F] mb-1.5"
                        htmlFor="delivery-address-nacional"
                      >
                        Dirección completa
                      </label>
                      <input
                        id="delivery-address-nacional"
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Calle, número, ciudad y provincia..."
                        className="w-full h-11 px-3.5 rounded-[6px] border border-[#DDE3EA] text-sm text-[#16232F] focus:outline-none focus:border-[#2C63AE] focus:ring-1 focus:ring-[#2C63AE]"
                      />
                      <p className="text-xs text-[#5A6E85] mt-1.5">
                        Incluye ciudad y provincia para que el courier pueda ubicarte.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4 — "Elegí tu método de pago" (only once contact + delivery are valid) */}
                {isDetailsValid && (
                  <div id="checkout-step-4" className="space-y-4 pt-4 border-t border-[#EAEFF4] animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                        4
                      </div>
                      <h2
                        className="text-lg font-bold text-[#16232F]"
                        style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                      >
                        Elegí tu método de pago
                      </h2>
                    </div>

                    <p className="text-sm text-[#5A6E85] pl-11">
                      Selecciona cómo deseas realizar el pago de tu pedido:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pl-11">
                      {/* Transferencia */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Transferencia')}
                        className={`relative flex items-start gap-3.5 p-4 rounded-[6px] border-2 text-left transition-all cursor-pointer ${
                          paymentMethod === 'Transferencia'
                            ? 'border-[#2C63AE] bg-[#2C63AE]/5 shadow-xs'
                            : 'border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/40'
                        }`}
                      >
                        <div className="mt-0.5">
                          <div
                            className={`w-4 h-4 rounded-[3px] border flex items-center justify-center ${
                              paymentMethod === 'Transferencia'
                                ? 'border-[#2C63AE] bg-[#2C63AE]'
                                : 'border-[#DDE3EA] bg-white'
                            }`}
                          >
                            {paymentMethod === 'Transferencia' && (
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#2C63AE]" />
                            <span className="text-sm font-bold text-[#16232F]">Transferencia</span>
                          </div>
                          <p className="text-xs text-[#5A6E85] mt-1 leading-snug">
                            Depósito directo, sin recargo
                          </p>
                        </div>
                      </button>

                      {/* Efectivo */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Efectivo')}
                        className={`relative flex items-start gap-3.5 p-4 rounded-[6px] border-2 text-left transition-all cursor-pointer ${
                          paymentMethod === 'Efectivo'
                            ? 'border-[#2C63AE] bg-[#2C63AE]/5 shadow-xs'
                            : 'border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/40'
                        }`}
                      >
                        <div className="mt-0.5">
                          <div
                            className={`w-4 h-4 rounded-[3px] border flex items-center justify-center ${
                              paymentMethod === 'Efectivo'
                                ? 'border-[#2C63AE] bg-[#2C63AE]'
                                : 'border-[#DDE3EA] bg-white'
                            }`}
                          >
                            {paymentMethod === 'Efectivo' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-[#2C63AE]" />
                            <span className="text-sm font-bold text-[#16232F]">Efectivo</span>
                          </div>
                          <p className="text-xs text-[#5A6E85] mt-1 leading-snug">
                            Pagas al recibir o al retirar
                          </p>
                        </div>
                      </button>

                      {/* PayPhone (disabled) */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('PayPhone')}
                        className={`relative flex items-start gap-3.5 p-4 rounded-[6px] border-2 text-left transition-all cursor-pointer ${
                          paymentMethod === 'PayPhone'
                            ? 'border-[#2C63AE] bg-[#2C63AE]/5 shadow-xs'
                            : 'border-[#DDE3EA] bg-[#FFFFFF] hover:border-[#16232F]/40'
                        }`}
                      >
                        <div className="mt-0.5">
                          <div
                            className={`w-4 h-4 rounded-[3px] border flex items-center justify-center ${
                              paymentMethod === 'PayPhone'
                                ? 'border-[#2C63AE] bg-[#2C63AE]'
                                : 'border-[#DDE3EA] bg-white'
                            }`}
                          >
                            {paymentMethod === 'PayPhone' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#2C63AE]" />
                            <span className="text-sm font-bold text-[#16232F]">PayPhone (+5%)</span>
                          </div>
                          <p className="text-xs text-[#5A6E85] mt-1 leading-snug">Tarjeta — próximamente</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* IF PAYPHONE IS SELECTED */}
                {isDetailsValid && paymentMethod === 'PayPhone' && (
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
                      te recomendamos seleccionar <strong>Transferencia</strong> o{' '}
                      <strong>Efectivo</strong> para procesar tu pedido de inmediato.
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

                {/* IF EFECTIVO IS SELECTED (Loja scope): immediate submit, no "ya pagué" step */}
                {isDetailsValid && paymentMethod === 'Efectivo' && shippingScope === 'Loja' && (
                  <div id="checkout-step-5-efectivo" className="space-y-4 pt-4 border-t border-[#EAEFF4] animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                        5
                      </div>
                      <h2
                        className="text-lg font-bold text-[#16232F]"
                        style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                      >
                        Confirmar pedido en efectivo
                      </h2>
                    </div>

                    <div className="pl-11 space-y-3">
                      <p className="text-sm text-[#5A6E85]">
                        Pagarás en efectivo{' '}
                        {deliveryType === 'Domicilio' ? 'al recibir tu pedido en tu domicilio' : 'al retirar tu pedido en tienda'}
                        . Al confirmar, tu pedido queda registrado de inmediato.
                      </p>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSubmitOrder('Efectivo')}
                        className="w-full h-14 bg-[#2C63AE] hover:bg-[#245292] disabled:opacity-60 disabled:cursor-not-allowed text-[#FFFFFF] text-sm font-bold uppercase tracking-wider rounded-[6px] transition-colors flex items-center justify-center gap-2 min-h-[56px] shadow-sm cursor-pointer"
                        style={{ fontFamily: "'Inter Variable', Inter, sans-serif", fontWeight: 700 }}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span>{isSubmitting ? 'PROCESANDO...' : 'CONFIRMAR PEDIDO'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* IF NATIONAL SHIPPING + (TRANSFERENCIA OR EFECTIVO): skip the guided flow, single WhatsApp button */}
                {isDetailsValid &&
                  shippingScope === 'Nacional' &&
                  (paymentMethod === 'Transferencia' || paymentMethod === 'Efectivo') && (
                    <div
                      id="checkout-step-5-nacional-whatsapp"
                      className="space-y-4 pt-4 border-t border-[#EAEFF4] animate-fade-in"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                          5
                        </div>
                        <h2
                          className="text-lg font-bold text-[#16232F]"
                          style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                        >
                          Gestioná tu pedido por WhatsApp
                        </h2>
                      </div>

                      <div className="pl-11 space-y-3">
                        <p className="text-sm text-[#5A6E85]">
                          Para envíos a nivel nacional coordinamos el pago y el courier directamente
                          por WhatsApp. Al hacer clic, tu pedido queda registrado y se abrirá el
                          chat para continuar.
                        </p>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleNationalOrderWhatsApp(paymentMethod)}
                          className="w-full h-14 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-60 disabled:cursor-not-allowed text-[#FFFFFF] text-sm font-bold uppercase tracking-wider rounded-[6px] transition-colors flex items-center justify-center gap-2 min-h-[56px] shadow-sm cursor-pointer"
                          style={{ fontFamily: "'Inter Variable', Inter, sans-serif", fontWeight: 700 }}
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <MessageCircle className="w-4 h-4 fill-white" />
                          )}
                          <span>{isSubmitting ? 'PROCESANDO...' : 'Gestionar mi pedido por WhatsApp'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                {/* IF TRANSFERENCIA IS SELECTED (Loja scope): progressive bank steps */}
                {isDetailsValid && paymentMethod === 'Transferencia' && shippingScope === 'Loja' && (
                  <>
                    {/* STEP 5 — "Elegí tu banco" */}
                    <div id="checkout-step-5" className="space-y-4 pt-4 border-t border-[#EAEFF4]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                          5
                        </div>
                        <h2
                          className="text-lg font-bold text-[#16232F]"
                          style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                        >
                          Elegí tu banco
                        </h2>
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
                              onClick={() => setSelectedBankId(bank.id)}
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

                    {selectedBank && (
                      <>
                        {/* STEP 6 — "Datos para tu depósito" */}
                        <div
                          id="checkout-step-6"
                          className="space-y-4 pt-4 border-t border-[#EAEFF4] animate-fade-in"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                              6
                            </div>
                            <h2
                              className="text-lg font-bold text-[#16232F]"
                              style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                            >
                              Datos para tu depósito
                            </h2>
                          </div>

                          <p className="text-sm text-[#5A6E85] pl-11">
                            Usa la siguiente información bancaria para realizar tu transferencia por
                            el monto exacto:
                          </p>

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

                              <div className="pt-3 border-t border-[#EAEFF4] bg-[#F7F9FB] p-3.5 rounded-[6px] border border-[#EAEFF4] space-y-2">
                                {/* This step only renders for Loja + Transferencia (no shipping or
                                    PayPhone fee), so `subtotal` is the full pre-discount price here. */}
                                {showVipPreview && (
                                  <>
                                    <div className="flex justify-between text-xs text-[#5A6E85]">
                                      <span>Precio total:</span>
                                      <span className="font-semibold text-[#16232F]">
                                        ${subtotal.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-[#2C63AE]">
                                      <span className="font-semibold">Descuento VIP -{VIP_DISCOUNT_PERCENT}%:</span>
                                      <span className="font-semibold">-${vipDiscount.toFixed(2)}</span>
                                    </div>
                                  </>
                                )}
                                <div
                                  className={`flex items-center justify-between ${
                                    showVipPreview ? 'pt-2 border-t border-[#EAEFF4]' : ''
                                  }`}
                                >
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
                        </div>

                        {/* STEP 7 — "Enviá tu comprobante de pago" (WhatsApp + optional upload, neither required) */}
                        <div
                          id="checkout-step-7"
                          className="space-y-4 pt-4 border-t border-[#EAEFF4] animate-fade-in"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                              7
                            </div>
                            <h2
                              className="text-lg font-bold text-[#16232F]"
                              style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                            >
                              Enviá tu comprobante de pago
                            </h2>
                          </div>

                          <div className="pl-11 space-y-4">
                            <p className="text-sm sm:text-base text-[#16232F] font-medium leading-relaxed">
                              Una vez realizada la transferencia, envíanos tu comprobante por
                              WhatsApp o súbelo aquí mismo. Cualquiera de las dos opciones es
                              suficiente — ninguna es obligatoria para registrar tu pedido.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleWhatsAppClick}
                                className="flex-1 inline-flex items-center justify-center gap-3 h-14 px-8 bg-[#25D366] hover:bg-[#20bd5a] text-[#FFFFFF] text-sm font-bold uppercase tracking-wider rounded-[6px] transition-all shadow-md cursor-pointer min-h-[56px]"
                              >
                                <MessageCircle className="w-5 h-5 fill-white" />
                                <span>Enviar por WhatsApp</span>
                              </a>

                              <label
                                htmlFor="receipt-upload"
                                className="flex-1 inline-flex items-center justify-center gap-3 h-14 px-8 bg-[#FFFFFF] border-2 border-[#2C63AE] text-[#2C63AE] hover:bg-[#F2F7FF] text-sm font-bold uppercase tracking-wider rounded-[6px] transition-all cursor-pointer min-h-[56px]"
                              >
                                <Upload className="w-5 h-5" />
                                <span>Subir comprobante</span>
                              </label>
                              <input
                                id="receipt-upload"
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                onChange={handleReceiptFileChange}
                                className="hidden"
                              />
                            </div>

                            {hasOpenedWhatsApp && (
                              <p className="text-xs text-[#25D366] font-semibold flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" /> Abriste el chat de WhatsApp.
                              </p>
                            )}

                            {receiptFile && !receiptFileError && (
                              <div className="flex items-center justify-between gap-2 p-3 bg-[#F2F7FF] border border-[#DDE3EA] rounded-[6px]">
                                <span className="text-xs font-semibold text-[#16232F] truncate">
                                  {receiptFile.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReceiptFile(null);
                                    setReceiptFileError(null);
                                  }}
                                  className="text-[#5A6E85] hover:text-[#16232F] cursor-pointer shrink-0"
                                  aria-label="Quitar archivo"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {receiptFileError && (
                              <p className="text-xs text-[#B3261E] font-semibold flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> {receiptFileError}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* STEP 8 — "Ya realicé el pago" */}
                        <div
                          id="checkout-step-8"
                          className="space-y-4 pt-4 border-t border-[#EAEFF4] animate-fade-in"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[6px] bg-[#2C63AE] text-[#FFFFFF] text-sm flex items-center justify-center font-bold shrink-0">
                              8
                            </div>
                            <h2
                              className="text-lg font-bold text-[#16232F]"
                              style={{ fontFamily: "'Inter Variable', Inter, sans-serif" }}
                            >
                              Completar registro de orden
                            </h2>
                          </div>

                          <div className="pl-11 space-y-3">
                            <p className="text-sm text-[#5A6E85]">
                              Haz clic en el botón para asentar tu pedido en el sistema.
                            </p>

                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleSubmitOrder('Transferencia')}
                              className="w-full h-14 bg-[#2C63AE] hover:bg-[#245292] disabled:opacity-60 disabled:cursor-not-allowed text-[#FFFFFF] text-sm font-bold uppercase tracking-wider rounded-[6px] transition-colors flex items-center justify-center gap-2 min-h-[56px] shadow-sm cursor-pointer"
                              style={{ fontFamily: "'Inter Variable', Inter, sans-serif", fontWeight: 700 }}
                            >
                              {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                              <span>{isSubmitting ? 'PROCESANDO...' : 'YA REALICÉ EL PAGO'}</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Submission feedback */}
                {uploadWarning && (
                  <div className="pl-11 flex items-start gap-2 p-3.5 bg-[#FFF8E6] border border-[#FFE082] rounded-[6px] text-xs text-[#B76E00] font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{uploadWarning}</span>
                  </div>
                )}

                {submitError && (
                  <div className="pl-11 flex items-start gap-2 p-3.5 bg-[#FDECEA] border border-[#F5B5AD] rounded-[6px] text-xs text-[#B3261E] font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}
              </fieldset>
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

              <div className="pt-3 border-t border-[#EAEFF4] space-y-2.5 text-xs text-[#5A6E85]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#16232F]">${subtotal.toFixed(2)}</span>
                </div>

                {shippingScope === 'Nacional' ? (
                  <div className="flex justify-between items-center">
                    <span>Envío Nacional</span>
                    <span className="font-semibold text-[#16232F]">${shippingFee.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span>Envío</span>
                    <span className="font-semibold text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded-[4px]">
                      Gratis
                    </span>
                  </div>
                )}

                {showVipPreview && (
                  <div className="flex justify-between items-center text-[#2C63AE]">
                    <span className="font-semibold">Descuento VIP -{VIP_DISCOUNT_PERCENT}%</span>
                    <span className="font-semibold">-${vipDiscount.toFixed(2)}</span>
                  </div>
                )}

                {paymentMethod === 'PayPhone' && (
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

                {showVipPreview && (
                  <p className="text-[10px] text-[#5A6E85] leading-snug">
                    Total estimado con tu descuento VIP. El monto final se confirma al registrar el
                    pedido con el mismo correo con el que te suscribiste.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
