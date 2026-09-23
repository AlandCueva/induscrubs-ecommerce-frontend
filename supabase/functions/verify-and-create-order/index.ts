import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Params create_public_order actually declares (SQL side). orderPayload keys are
// expected to match these exactly, e.g. { p_customer_name, p_customer_phone, ... }.
const REQUIRED_ORDER_KEYS = [
  "p_customer_name",
  "p_customer_phone",
  "p_customer_email",
  "p_payment_method",
  "p_delivery_type",
  "p_delivery_address",
  "p_notes",
  "p_payment_proof_url",
  "p_items",
];

const VIP_DISCOUNT_RATE = 0.1;

function roundCents(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Escapes LIKE wildcards so an email such as "ana_perez@x.com" is matched
// literally (case-insensitively via ilike) instead of "_" matching any char.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

type VipDiscountResult = { applied: boolean; amount: number };

// VIP discount: 10% off the subtotal (items only, not shipping) when the
// order's email has a non-expired, unredeemed row in vip_subscribers.
// The amount is derived from the order row the RPC just created, never from
// anything the client sent. Any failure or unmet condition returns
// { applied: false } so checkout is never blocked by the discount.
async function applyVipDiscount(
  supabaseUrl: string,
  orderNumber: string,
): Promise<VipDiscountResult & { subtotal: number | null }> {
  const none = { applied: false, amount: 0, subtotal: null };

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) {
    console.error("verify-and-create-order: SUPABASE_SERVICE_ROLE_KEY not available; skipping VIP discount.");
    return none;
  }

  try {
    // vip_subscribers and orders reads/writes below need the service role
    // (vip_subscribers has RLS enabled with no policies).
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("id, customer_email, shipping_fee, total")
      .eq("order_number", orderNumber)
      .single();

    if (orderErr || !order) {
      console.error("verify-and-create-order: could not load new order for VIP check.", orderErr);
      return none;
    }

    // orders.total = sum(items) + shipping_fee (enforced by trigger), so the
    // subtotal is derived server-side from the persisted order.
    const subtotal = roundCents(Number(order.total) - Number(order.shipping_fee));
    const email = String(order.customer_email).trim();
    if (!email || subtotal <= 0) return { ...none, subtotal };

    // Atomic check-and-redeem: a single UPDATE whose WHERE clause carries every
    // condition (unredeemed, unexpired). Postgres row-locks the matching row and
    // re-evaluates the WHERE after a concurrent transaction commits, so of N
    // simultaneous requests exactly one gets a row back; the rest get zero rows.
    const nowIso = new Date().toISOString();
    const { data: claimed, error: claimErr } = await admin
      .from("vip_subscribers")
      .update({ redeemed_at: nowIso, redeemed_order_id: order.id })
      .ilike("email", escapeLike(email))
      .is("redeemed_at", null)
      .gt("expires_at", nowIso)
      .select("id");

    if (claimErr) {
      console.error("verify-and-create-order: VIP redeem update failed.", claimErr);
      return { ...none, subtotal };
    }

    if (!claimed || claimed.length === 0) return { ...none, subtotal };

    return { applied: true, amount: roundCents(subtotal * VIP_DISCOUNT_RATE), subtotal };
  } catch (err) {
    console.error("verify-and-create-order: VIP discount check failed unexpectedly.", err);
    return none;
  }
}

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function jsonResponse(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido." }, 405, origin);
  }

  let body: { turnstileToken?: unknown; orderPayload?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Cuerpo de la solicitud inválido: se esperaba JSON." }, 400, origin);
  }

  const { turnstileToken, orderPayload } = body ?? {};

  if (typeof turnstileToken !== "string" || turnstileToken.trim() === "") {
    return jsonResponse({ error: "Falta el token de verificación (Turnstile)." }, 400, origin);
  }

  if (!orderPayload || typeof orderPayload !== "object" || Array.isArray(orderPayload)) {
    return jsonResponse({ error: "Falta el detalle del pedido (orderPayload)." }, 400, origin);
  }

  for (const key of REQUIRED_ORDER_KEYS) {
    if (!(key in orderPayload)) {
      return jsonResponse({ error: `Falta el campo "${key}" en orderPayload.` }, 400, origin);
    }
  }

  // 1. Verify the Turnstile token server-side before touching the database.
  const secretKey = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secretKey) {
    console.error("verify-and-create-order: TURNSTILE_SECRET_KEY is not configured.");
    return jsonResponse({ error: "Verificación no disponible temporalmente. Intenta más tarde." }, 500, origin);
  }

  const remoteIp = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? undefined;

  const verifyForm = new URLSearchParams();
  verifyForm.set("secret", secretKey);
  verifyForm.set("response", turnstileToken);
  if (remoteIp) verifyForm.set("remoteip", remoteIp);

  let turnstileOk = false;
  try {
    const verifyRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyForm,
    });
    const verifyJson = await verifyRes.json();
    turnstileOk = verifyJson?.success === true;

    if (!turnstileOk) {
      return jsonResponse(
        {
          error: "No se pudo verificar que eres una persona real. Recarga la página e inténtalo de nuevo.",
          codes: verifyJson?.["error-codes"] ?? null,
        },
        400,
        origin,
      );
    }
  } catch (err) {
    console.error("verify-and-create-order: Turnstile verification request failed.", err);
    return jsonResponse({ error: "No se pudo contactar el servicio de verificación. Intenta de nuevo." }, 502, origin);
  }

  // 2. Turnstile passed — call create_public_order with the anon key. The RPC
  // does its own validation (payment method whitelist, delivery/address rule,
  // forced status, server-derived pricing, atomic stock deduction).
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("verify-and-create-order: SUPABASE_URL/SUPABASE_ANON_KEY not available in function env.");
    return jsonResponse({ error: "Configuración del servidor incompleta." }, 500, origin);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.rpc("create_public_order", orderPayload as Record<string, unknown>);

  if (error) {
    // Business-rule failures raised by the RPC (bad payment method, missing
    // address, insufficient stock, unknown variant, etc.) surface here.
    return jsonResponse({ error: error.message }, 422, origin);
  }

  const row = Array.isArray(data) ? data[0] : data;

  const orderNumber: string | null = row?.order_number ?? null;
  const orderTotal = row?.total != null ? Number(row.total) : null;

  // 3. VIP discount. Runs after the order exists because vip_subscribers
  // .redeemed_order_id references orders(id). The discount is computed here
  // (server-side) — nothing about it is read from the request.
  let discount: VipDiscountResult = { applied: false, amount: 0 };
  let subtotal: number | null = null;
  if (orderNumber && orderTotal !== null) {
    const vip = await applyVipDiscount(supabaseUrl, orderNumber);
    discount = { applied: vip.applied, amount: vip.amount };
    subtotal = vip.subtotal;
  }

  return jsonResponse(
    {
      orderNumber,
      // Amount the customer actually pays (after any VIP discount).
      total: orderTotal !== null ? roundCents(orderTotal - discount.amount) : null,
      originalTotal: orderTotal,
      subtotal,
      discount: {
        applied: discount.applied,
        amount: discount.amount,
        ...(discount.applied ? { type: "vip", percent: VIP_DISCOUNT_RATE * 100 } : {}),
      },
    },
    200,
    origin,
  );
});
