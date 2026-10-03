import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { calcPromoAmount, type PromoLine, type PromoResult, type PromoRow } from "./promo.ts";

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

type DiscountOutcome = {
  // Full-price items subtotal (before any discount), null if the order couldn't be loaded.
  subtotal: number | null;
  promo: { applied: boolean; amount: number; units: number; brands: string[] };
  vip: { applied: boolean; amount: number };
  // Persisted orders.total after discounts; only set when something was applied.
  total?: number;
};

const NO_PROMO = { applied: false, amount: 0, units: 0, brands: [] as string[] };
const NO_VIP = { applied: false, amount: 0 };

type AdminClient = ReturnType<typeof createClient>;

// Brand combo promo, derived from the persisted order lines + active
// brand_promotions rows (nothing comes from the request). Any failure returns
// "no promo" so checkout is never blocked by the discount.
async function computeBrandPromo(admin: AdminClient, orderId: string): Promise<PromoResult> {
  const none: PromoResult = { amount: 0, units: 0, brands: [] };
  try {
    const [{ data: items, error: itemsErr }, { data: promoRows, error: promoErr }] = await Promise.all([
      admin
        .from("order_items")
        .select("quantity, unit_price_snapshot, product_variants ( products ( brand_id ) )")
        .eq("order_id", orderId),
      admin.from("brand_promotions").select("brand_id, brand, single_item_price, pair_price").eq("active", true),
    ]);

    if (itemsErr || promoErr) {
      console.error("verify-and-create-order: could not load data for brand promo.", itemsErr ?? promoErr);
      return none;
    }
    if (!items || !promoRows || promoRows.length === 0) return none;

    const promos: PromoRow[] = promoRows.map((r: Record<string, unknown>) => ({
      brandId: String(r.brand_id),
      brand: String(r.brand),
      singleItemPrice: Number(r.single_item_price),
      pairPrice: Number(r.pair_price),
    }));

    // The embedded rows are to-one relations (object), but tolerate an array.
    const first = <T>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? v[0] ?? null : v ?? null);
    const lines: PromoLine[] = items.map((it: Record<string, unknown>) => {
      const variant = first(it.product_variants as Record<string, unknown> | Record<string, unknown>[] | null);
      const product = first(variant?.products as Record<string, unknown> | Record<string, unknown>[] | null);
      return {
        brandId: (product?.brand_id as string | null | undefined) ?? null,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unit_price_snapshot),
      };
    });

    return calcPromoAmount(lines, promos);
  } catch (err) {
    console.error("verify-and-create-order: brand promo calculation failed unexpectedly.", err);
    return none;
  }
}

// Discounts on the items subtotal (never shipping), applied in this order:
//   1. Brand combo promo (brand_promotions).
//   2. VIP 10% on what is left after the promo, when the order's email has a
//      non-expired, unredeemed row in vip_subscribers.
// Both are persisted together in orders.discount_amount; trg_enforce_order_total
// recomputes orders.total as items + shipping - discount_amount. Amounts are
// derived from the order row the RPC just created, never from anything the
// client sent. Any failure or unmet condition returns "not applied" so
// checkout is never blocked by a discount.
async function applyOrderDiscounts(supabaseUrl: string, orderNumber: string): Promise<DiscountOutcome> {
  const none: DiscountOutcome = { subtotal: null, promo: NO_PROMO, vip: NO_VIP };

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) {
    console.error("verify-and-create-order: SUPABASE_SERVICE_ROLE_KEY not available; skipping discounts.");
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
      console.error("verify-and-create-order: could not load new order for discounts.", orderErr);
      return none;
    }

    // orders.total = sum(items) + shipping_fee - discount_amount (enforced by
    // trigger; discount_amount is 0 on a fresh order), so the subtotal is
    // derived server-side from the persisted order.
    const subtotal = roundCents(Number(order.total) - Number(order.shipping_fee));
    if (subtotal <= 0) return { ...none, subtotal };

    const promoResult = await computeBrandPromo(admin, order.id);
    const promoAmount = roundCents(promoResult.amount);
    const subtotalAfterPromo = roundCents(subtotal - promoAmount);

    // VIP: atomic check-and-redeem. A single UPDATE whose WHERE clause carries
    // every condition (unredeemed, unexpired). Postgres row-locks the matching
    // row and re-evaluates the WHERE after a concurrent transaction commits, so
    // of N simultaneous requests exactly one gets a row back; the rest get zero.
    const email = String(order.customer_email).trim();
    let vipClaimed = false;
    if (email && subtotalAfterPromo > 0) {
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
      } else {
        vipClaimed = Boolean(claimed && claimed.length > 0);
      }
    }

    const vipAmount = vipClaimed ? roundCents(subtotalAfterPromo * VIP_DISCOUNT_RATE) : 0;
    const totalDiscount = roundCents(promoAmount + vipAmount);
    if (totalDiscount <= 0) return { ...none, subtotal };

    // Persist. This UPDATE fires trg_enforce_order_total.
    const { data: updated, error: persistErr } = await admin
      .from("orders")
      .update({ discount_amount: totalDiscount })
      .eq("id", order.id)
      .select("total")
      .single();

    if (persistErr || !updated) {
      // The order would stay at full price, so give the VIP coupon back rather
      // than burn it without a discount, and report no discounts.
      console.error("verify-and-create-order: failed to persist discounts; releasing VIP redemption.", persistErr);
      if (vipClaimed) {
        const { error: releaseErr } = await admin
          .from("vip_subscribers")
          .update({ redeemed_at: null, redeemed_order_id: null })
          .eq("redeemed_order_id", order.id);
        if (releaseErr) {
          console.error(
            `verify-and-create-order: could not release VIP redemption for order ${orderNumber}; fix manually.`,
            releaseErr,
          );
        }
      }
      return { ...none, subtotal };
    }

    return {
      subtotal,
      promo: {
        applied: promoAmount > 0,
        amount: promoAmount,
        units: promoAmount > 0 ? promoResult.units : 0,
        brands: promoAmount > 0 ? promoResult.brands : [],
      },
      vip: { applied: vipClaimed, amount: vipAmount },
      total: roundCents(Number(updated.total)),
    };
  } catch (err) {
    console.error("verify-and-create-order: discount calculation failed unexpectedly.", err);
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

  // 2. Turnstile passed — call create_public_order with the service-role key so the
  // RPC can only ever be reached through this CAPTCHA-gated path, never directly by
  // anon/authenticated clients. The RPC does its own validation regardless (payment
  // method whitelist, delivery/address rule, forced status, server-derived pricing,
  // atomic stock deduction).
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("verify-and-create-order: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not available in function env.");
    return jsonResponse({ error: "Configuración del servidor incompleta." }, 500, origin);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data, error } = await supabase.rpc("create_public_order", orderPayload as Record<string, unknown>);

  if (error) {
    // Business-rule failures raised by the RPC (bad payment method, missing
    // address, insufficient stock, unknown variant, etc.) surface here.
    return jsonResponse({ error: error.message }, 422, origin);
  }

  const row = Array.isArray(data) ? data[0] : data;

  const orderNumber: string | null = row?.order_number ?? null;
  const orderTotal = row?.total != null ? Number(row.total) : null;

  // 3. Discounts: brand combo promo, then VIP. Runs after the order exists
  // because vip_subscribers.redeemed_order_id references orders(id). Both are
  // computed here (server-side) — nothing about them is read from the request.
  let outcome: DiscountOutcome = { subtotal: null, promo: NO_PROMO, vip: NO_VIP };
  if (orderNumber && orderTotal !== null) {
    outcome = await applyOrderDiscounts(supabaseUrl, orderNumber);
  }

  return jsonResponse(
    {
      orderNumber,
      // Amount the customer actually pays: the persisted orders.total, which
      // already has the promo and any VIP discount subtracted by
      // trg_enforce_order_total.
      total: outcome.total ?? orderTotal,
      // Order total at full price (before promo and VIP).
      originalTotal: orderTotal,
      subtotal: outcome.subtotal,
      // VIP only (shape unchanged); the promo is reported separately below.
      discount: {
        applied: outcome.vip.applied,
        amount: outcome.vip.amount,
        ...(outcome.vip.applied ? { type: "vip", percent: VIP_DISCOUNT_RATE * 100 } : {}),
      },
      promo: outcome.promo,
    },
    200,
    origin,
  );
});
