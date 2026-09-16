import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BREVO_LISTS_URL = "https://api.brevo.com/v3/contacts/lists?limit=50&offset=0";
const BREVO_ATTRIBUTES_URL = "https://api.brevo.com/v3/contacts/attributes";
const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

// Preference order for the contact attribute that holds the subscriber's
// name. We only ever use one that actually exists in the Brevo account —
// never invent one.
const NAME_ATTRIBUTE_CANDIDATES = ["NOMBRE", "FIRSTNAME", "NAME"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  let body: { email?: unknown; name?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Cuerpo de la solicitud inválido: se esperaba JSON." }, 400, origin);
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return jsonResponse({ error: "Correo electrónico inválido." }, 400, origin);
  }

  if (name === "") {
    return jsonResponse({ error: "El nombre es obligatorio." }, 400, origin);
  }

  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) {
    console.error("subscribe-newsletter: BREVO_API_KEY is not configured.");
    return jsonResponse({ error: "Servicio no disponible temporalmente. Intenta más tarde." }, 500, origin);
  }

  const brevoHeaders = {
    "api-key": apiKey,
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  // 1. Resolve the target list. We refuse to guess: if the account has more
  // than one list, this must be pinned to a specific listId by whoever
  // manages this function (see the logged list ids/names) rather than
  // picked automatically.
  let listId: number;
  try {
    const listsRes = await fetch(BREVO_LISTS_URL, { headers: brevoHeaders });
    const listsJson = await listsRes.json().catch(() => null);

    if (!listsRes.ok || !listsJson) {
      console.error("subscribe-newsletter: Brevo GetLists failed.", listsRes.status);
      return jsonResponse({ error: "No se pudo procesar la suscripción. Intenta más tarde." }, 502, origin);
    }

    const lists = Array.isArray(listsJson.lists) ? listsJson.lists : [];

    if (lists.length === 0) {
      console.error("subscribe-newsletter: Brevo account has no contact lists configured.");
      return jsonResponse({ error: "Servicio no disponible temporalmente. Intenta más tarde." }, 500, origin);
    }

    if (lists.length > 1) {
      console.error(
        "subscribe-newsletter: Brevo account has multiple lists; refusing to guess which one to use. " +
          "Pin a specific listId in this function instead. Lists found:",
        lists.map((l: { id: unknown; name: unknown }) => ({ id: l.id, name: l.name })),
      );
      return jsonResponse({ error: "Servicio no disponible temporalmente. Intenta más tarde." }, 500, origin);
    }

    listId = lists[0].id;
  } catch (err) {
    console.error("subscribe-newsletter: Brevo GetLists request failed.", err);
    return jsonResponse({ error: "No se pudo contactar el servicio de suscripción. Intenta de nuevo." }, 502, origin);
  }

  // 2. Resolve which contact attribute holds the given name, if any of the
  // known candidates exist in this Brevo account.
  let nameAttribute: string | null = null;
  try {
    const attrsRes = await fetch(BREVO_ATTRIBUTES_URL, { headers: brevoHeaders });
    const attrsJson = await attrsRes.json().catch(() => null);

    if (attrsRes.ok && attrsJson && Array.isArray(attrsJson.attributes)) {
      const existing = new Set(
        attrsJson.attributes.map((a: { name: unknown }) => String(a.name).toUpperCase()),
      );
      nameAttribute = NAME_ATTRIBUTE_CANDIDATES.find((candidate) => existing.has(candidate)) ?? null;
    } else {
      console.error("subscribe-newsletter: Brevo GetAttributes failed.", attrsRes.status);
    }
  } catch (err) {
    console.error("subscribe-newsletter: Brevo GetAttributes request failed.", err);
  }

  if (!nameAttribute) {
    console.error(
      "subscribe-newsletter: no known name attribute (NOMBRE/FIRSTNAME/NAME) found in Brevo account; " +
        "creating/updating the contact without a name attribute.",
    );
  }

  // 3. Create or update the contact on the resolved list. updateEnabled
  // means a duplicate email updates the existing contact instead of erroring.
  const contactPayload: Record<string, unknown> = {
    email,
    listIds: [listId],
    updateEnabled: true,
  };
  if (nameAttribute) {
    contactPayload.attributes = { [nameAttribute]: name };
  }

  try {
    const createRes = await fetch(BREVO_CONTACTS_URL, {
      method: "POST",
      headers: brevoHeaders,
      body: JSON.stringify(contactPayload),
    });

    if (!createRes.ok) {
      console.error("subscribe-newsletter: Brevo contact create/update failed.", createRes.status);
      return jsonResponse({ error: "No se pudo completar la suscripción. Intenta más tarde." }, 502, origin);
    }
  } catch (err) {
    console.error("subscribe-newsletter: Brevo contact create/update request failed.", err);
    return jsonResponse({ error: "No se pudo contactar el servicio de suscripción. Intenta de nuevo." }, 502, origin);
  }

  return jsonResponse({ success: true }, 200, origin);
});
