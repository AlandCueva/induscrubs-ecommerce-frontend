import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const VIP_PERCENT = 10;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;

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

// Escapes LIKE wildcards so ILIKE behaves as a plain case-insensitive equality
// check. "_" is common in real email local parts and would otherwise match any
// character.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// Read-only: this function only ever SELECTs from vip_subscribers. It never
// inserts, updates, or deletes, and the response carries only a boolean and the
// fixed discount percent — never the email or any column of the matched row.
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido." }, 405, origin);
  }

  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Cuerpo de la solicitud inválido: se esperaba JSON." }, 400, origin);
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_RE.test(email)) {
    return jsonResponse({ error: "Correo electrónico inválido." }, 400, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("check-vip-eligibility: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not available in function env.");
    return jsonResponse({ error: "Servicio no disponible temporalmente. Intenta más tarde." }, 500, origin);
  }

  // vip_subscribers has RLS enabled with no policies, so this needs the
  // service-role key. New rows are stored lowercased, but the unique constraint
  // is case-sensitive, so match case-insensitively and accept any eligible row.
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("vip_subscribers")
    .select("id")
    .ilike("email", escapeLike(email))
    .is("redeemed_at", null)
    .gt("expires_at", nowIso)
    .limit(1);

  if (error) {
    console.error("check-vip-eligibility: vip_subscribers query failed.", error);
    return jsonResponse({ error: "No se pudo verificar la elegibilidad. Intenta más tarde." }, 502, origin);
  }

  return jsonResponse({ eligible: (data?.length ?? 0) > 0, percent: VIP_PERCENT }, 200, origin);
});
