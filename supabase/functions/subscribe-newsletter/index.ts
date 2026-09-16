import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BREVO_LISTS_URL = "https://api.brevo.com/v3/contacts/lists?limit=50&offset=0";
const BREVO_ATTRIBUTES_URL = "https://api.brevo.com/v3/contacts/attributes";
const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

function brevoCreateAttributeUrl(attributeName: string): string {
  // "normal" is Brevo's category for plain per-contact attributes (as
  // opposed to "category", "calculated", "global", "transactional").
  return `https://api.brevo.com/v3/contacts/attributes/normal/${encodeURIComponent(attributeName)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_GENDERS = ["Mujer", "Hombre", "Unisex"] as const;

type NewFieldName = "firstName" | "lastName" | "phone" | "gender" | "birthDay" | "birthMonth";

// Preference-ordered candidate attribute names per field. At runtime we only
// ever use one that actually exists in the Brevo account — never invent one
// on top of an ambiguous existing set. If more than one candidate exists we
// refuse (same rule as the list-resolution step below); if none exist we
// create the first (canonical) candidate via the Attributes API.
//
// Reserved/standard Brevo attributes are deliberately EXCLUDED from these
// candidate lists rather than reused, because repurposing them would guess at
// a mapping with real side effects instead of just a naming ambiguity:
//   - "SMS": Brevo's built-in attribute for the SMS marketing channel. Writing
//     the phone number there could implicitly opt the contact into SMS
//     campaigns/consent flows.
//   - "WHATSAPP": Brevo's built-in attribute for its WhatsApp channel.
//     Observed live: an account already had this attribute, our resolver
//     picked it up as a phone candidate by name match alone, and Brevo then
//     rejected the contact write (its WhatsApp attribute enforces strict
//     E.164-with-"+" formatting, which our normalized 593XXXXXXXXX doesn't
//     match). We use a plain custom "PHONE" attribute instead.
//   - "BIRTHDAY": Brevo's built-in attribute is a full date (day+month+year).
//     We only collect day and month (no year), so it cannot be populated
//     without inventing a fake year. We store day/month as two separate
//     custom numeric attributes instead.
const FIELD_SPECS: {
  field: NewFieldName;
  candidates: string[];
  createType: "text" | "float";
}[] = [
  { field: "firstName", candidates: ["FIRSTNAME", "NOMBRE", "NOMBRES"], createType: "text" },
  { field: "lastName", candidates: ["LASTNAME", "APELLIDO", "APELLIDOS"], createType: "text" },
  { field: "phone", candidates: ["PHONE", "TELEFONO"], createType: "text" },
  { field: "gender", candidates: ["GENERO", "GENDER", "SEXO"], createType: "text" },
  { field: "birthDay", candidates: ["BIRTH_DAY", "DIA_NACIMIENTO"], createType: "float" },
  { field: "birthMonth", candidates: ["BIRTH_MONTH", "MES_NACIMIENTO"], createType: "float" },
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

function toInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return parseInt(value.trim(), 10);
  return null;
}

// Accepts Ecuadorian mobile numbers as 0987654321, 987654321, or
// +593987654321 (with optional spaces/dashes/parentheses), and normalizes
// them all to 593987654321. Anything that doesn't resolve to a 9-digit
// mobile number (starting with 9) is rejected.
function normalizeEcuadorMobile(raw: string): string | null {
  const cleaned = raw.trim().replace(/[\s\-().]/g, "");

  let subscriberNumber: string;
  if (cleaned.startsWith("+593")) {
    subscriberNumber = cleaned.slice(4);
  } else if (cleaned.startsWith("593")) {
    subscriberNumber = cleaned.slice(3);
  } else if (cleaned.startsWith("0")) {
    subscriberNumber = cleaned.slice(1);
  } else {
    subscriberNumber = cleaned;
  }

  if (!/^9\d{8}$/.test(subscriberNumber)) {
    return null;
  }

  return `593${subscriberNumber}`;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido." }, 405, origin);
  }

  let body: {
    firstName?: unknown;
    lastName?: unknown;
    email?: unknown;
    phone?: unknown;
    gender?: unknown;
    birthDay?: unknown;
    birthMonth?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Cuerpo de la solicitud inválido: se esperaba JSON." }, 400, origin);
  }

  const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phoneRaw = typeof body?.phone === "string" ? body.phone : "";
  const gender = typeof body?.gender === "string" ? body.gender.trim() : "";
  const birthDay = toInt(body?.birthDay);
  const birthMonth = toInt(body?.birthMonth);

  if (!EMAIL_RE.test(email)) {
    return jsonResponse({ error: "Correo electrónico inválido." }, 400, origin);
  }

  if (firstName === "") {
    return jsonResponse({ error: "El nombre es obligatorio." }, 400, origin);
  }

  if (lastName === "") {
    return jsonResponse({ error: "El apellido es obligatorio." }, 400, origin);
  }

  const normalizedPhone = normalizeEcuadorMobile(phoneRaw);
  if (!normalizedPhone) {
    return jsonResponse({ error: "Número de celular inválido." }, 400, origin);
  }

  if (!(VALID_GENDERS as readonly string[]).includes(gender)) {
    return jsonResponse({ error: "Género inválido." }, 400, origin);
  }

  if (birthDay === null || birthDay < 1 || birthDay > 31) {
    return jsonResponse({ error: "Día de nacimiento inválido." }, 400, origin);
  }

  if (birthMonth === null || birthMonth < 1 || birthMonth > 12) {
    return jsonResponse({ error: "Mes de nacimiento inválido." }, 400, origin);
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

  // 2. Resolve which contact attribute holds each new field, creating it if
  // none of its candidates exist yet. If more than one candidate exists for
  // a field we refuse rather than guess which one is authoritative.
  const resolvedAttributes: Partial<Record<NewFieldName, string>> = {};
  const foundAttributes: Record<string, string> = {};
  const createdAttributes: Record<string, string> = {};

  let existingAttributeNames: Set<string>;
  try {
    const attrsRes = await fetch(BREVO_ATTRIBUTES_URL, { headers: brevoHeaders });
    const attrsJson = await attrsRes.json().catch(() => null);

    if (!attrsRes.ok || !attrsJson || !Array.isArray(attrsJson.attributes)) {
      console.error("subscribe-newsletter: Brevo GetAttributes failed.", attrsRes.status);
      return jsonResponse({ error: "No se pudo procesar la suscripción. Intenta más tarde." }, 502, origin);
    }

    existingAttributeNames = new Set(
      attrsJson.attributes.map((a: { name: unknown }) => String(a.name).toUpperCase()),
    );
  } catch (err) {
    console.error("subscribe-newsletter: Brevo GetAttributes request failed.", err);
    return jsonResponse({ error: "No se pudo contactar el servicio de suscripción. Intenta de nuevo." }, 502, origin);
  }

  for (const spec of FIELD_SPECS) {
    const matches = spec.candidates.filter((candidate) => existingAttributeNames.has(candidate));

    if (matches.length > 1) {
      console.error(
        `subscribe-newsletter: ambiguous Brevo attribute mapping for "${spec.field}"; ` +
          "more than one candidate exists in this account. Pin the correct one explicitly instead of guessing. " +
          "Candidates found:",
        matches,
      );
      return jsonResponse({ error: "Servicio no disponible temporalmente. Intenta más tarde." }, 500, origin);
    }

    if (matches.length === 1) {
      resolvedAttributes[spec.field] = matches[0];
      foundAttributes[spec.field] = matches[0];
      continue;
    }

    const canonicalName = spec.candidates[0];
    try {
      const createRes = await fetch(brevoCreateAttributeUrl(canonicalName), {
        method: "POST",
        headers: brevoHeaders,
        body: JSON.stringify({ type: spec.createType }),
      });

      if (!createRes.ok) {
        console.error(
          `subscribe-newsletter: failed to create Brevo attribute "${canonicalName}" for "${spec.field}".`,
          createRes.status,
        );
        return jsonResponse({ error: "No se pudo completar la suscripción. Intenta más tarde." }, 502, origin);
      }
    } catch (err) {
      console.error(
        `subscribe-newsletter: request to create Brevo attribute "${canonicalName}" failed.`,
        err,
      );
      return jsonResponse({ error: "No se pudo contactar el servicio de suscripción. Intenta de nuevo." }, 502, origin);
    }

    resolvedAttributes[spec.field] = canonicalName;
    createdAttributes[spec.field] = canonicalName;
    existingAttributeNames.add(canonicalName);
  }

  console.log("subscribe-newsletter: Brevo attribute resolution.", {
    found: foundAttributes,
    created: createdAttributes,
  });

  // 3. Create or update the contact on the resolved list. updateEnabled
  // means a duplicate email updates the existing contact instead of erroring.
  const contactPayload: Record<string, unknown> = {
    email,
    listIds: [listId],
    updateEnabled: true,
    attributes: {
      [resolvedAttributes.firstName!]: firstName,
      [resolvedAttributes.lastName!]: lastName,
      [resolvedAttributes.phone!]: normalizedPhone,
      [resolvedAttributes.gender!]: gender,
      [resolvedAttributes.birthDay!]: birthDay,
      [resolvedAttributes.birthMonth!]: birthMonth,
    },
  };

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
