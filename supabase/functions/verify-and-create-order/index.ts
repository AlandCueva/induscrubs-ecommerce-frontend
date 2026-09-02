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

  return jsonResponse(
    {
      orderNumber: row?.order_number ?? null,
      total: row?.total ?? null,
    },
    200,
    origin,
  );
});
