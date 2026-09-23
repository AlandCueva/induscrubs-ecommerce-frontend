import { supabase } from './supabaseClient';

const VERIFY_AND_CREATE_ORDER_URL =
  'https://kbyzijtrgzodmxqknsyp.supabase.co/functions/v1/verify-and-create-order';

const MAX_RECEIPT_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_RECEIPT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export interface CreatePublicOrderItem {
  product_id: string;
  size_code: string;
  color_id: string;
  quantity: number;
}

export interface CreatePublicOrderPayload {
  p_customer_name: string;
  p_customer_phone: string;
  p_customer_email: string;
  p_payment_method: 'Transferencia' | 'Efectivo';
  p_delivery_type: 'Domicilio' | 'Retiro en tienda' | 'Envío nacional';
  p_delivery_address: string | null;
  p_notes: string | null;
  p_payment_proof_url: string | null;
  p_items: CreatePublicOrderItem[];
}

export interface OrderDiscount {
  applied: boolean;
  amount: number;
}

// Everything here comes from verify-and-create-order, which computes the VIP
// discount server-side. `total` is what the customer actually pays.
export interface CreatePublicOrderResult {
  orderNumber: string;
  total: number;
  originalTotal: number;
  discount: OrderDiscount;
}

export class OrderSubmissionError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'OrderSubmissionError';
    this.status = status;
  }
}

export function validateReceiptFile(file: File): string | null {
  if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
    return 'El comprobante debe ser una imagen (PNG, JPG, WEBP o GIF).';
  }
  if (file.size > MAX_RECEIPT_SIZE_BYTES) {
    return 'El comprobante no puede superar los 8MB.';
  }
  return null;
}

// Uploads to a write-only, anon-insert-only path. The bucket is private and
// anon has no read/list policy, so the resulting path is intentionally never
// read back or previewed here — only the admin (authenticated) can view it.
export async function uploadPaymentReceipt(file: File): Promise<string> {
  const extFromName = file.name.split('.').pop()?.toLowerCase();
  const ext = extFromName && /^[a-z0-9]+$/.test(extFromName) ? extFromName : 'jpg';
  const path = `public-uploads/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from('payment-receipts').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error('No se pudo subir el comprobante.');
  }

  return path;
}

export async function submitPublicOrder(
  orderPayload: CreatePublicOrderPayload,
  turnstileToken: string
): Promise<CreatePublicOrderResult> {
  const res = await fetch(VERIFY_AND_CREATE_ORDER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ turnstileToken, orderPayload }),
  });

  let json: {
    error?: string;
    orderNumber?: string;
    total?: number;
    originalTotal?: number;
    discount?: { applied?: boolean; amount?: number };
  } | null = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message = json?.error || 'No se pudo procesar tu pedido. Inténtalo de nuevo.';
    throw new OrderSubmissionError(message, res.status);
  }

  if (!json?.orderNumber) {
    throw new OrderSubmissionError('Respuesta inesperada del servidor.', 500);
  }

  const total = json.total ?? 0;
  const discountApplied = json.discount?.applied === true;

  return {
    orderNumber: json.orderNumber,
    total,
    originalTotal: json.originalTotal ?? total,
    discount: {
      applied: discountApplied,
      amount: discountApplied ? json.discount?.amount ?? 0 : 0,
    },
  };
}
