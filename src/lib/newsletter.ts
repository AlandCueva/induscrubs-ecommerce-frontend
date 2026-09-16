const SUBSCRIBE_NEWSLETTER_URL =
  'https://kbyzijtrgzodmxqknsyp.supabase.co/functions/v1/subscribe-newsletter';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NEWSLETTER_GENDERS = ['Mujer', 'Hombre', 'Unisex'] as const;
export type NewsletterGender = (typeof NEWSLETTER_GENDERS)[number];

export class NewsletterSubscriptionError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'NewsletterSubscriptionError';
    this.status = status;
  }
}

export interface NewsletterSubscriptionInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  birthDay: number | null;
  birthMonth: number | null;
}

export function validateNewsletterFirstName(firstName: string): string | null {
  return firstName.trim() === '' ? 'El nombre es obligatorio.' : null;
}

export function validateNewsletterLastName(lastName: string): string | null {
  return lastName.trim() === '' ? 'El apellido es obligatorio.' : null;
}

export function validateNewsletterEmail(email: string): string | null {
  return EMAIL_RE.test(email.trim()) ? null : 'Correo electrónico inválido.';
}

// Mirrors normalizeEcuadorMobile() in supabase/functions/subscribe-newsletter/index.ts.
// Accepts 0987654321, 987654321, or +593987654321 (with optional
// spaces/dashes/parentheses) and normalizes to 593987654321.
export function normalizeEcuadorMobile(raw: string): string | null {
  const cleaned = raw.trim().replace(/[\s\-().]/g, '');

  let subscriberNumber: string;
  if (cleaned.startsWith('+593')) {
    subscriberNumber = cleaned.slice(4);
  } else if (cleaned.startsWith('593')) {
    subscriberNumber = cleaned.slice(3);
  } else if (cleaned.startsWith('0')) {
    subscriberNumber = cleaned.slice(1);
  } else {
    subscriberNumber = cleaned;
  }

  if (!/^9\d{8}$/.test(subscriberNumber)) {
    return null;
  }

  return `593${subscriberNumber}`;
}

export function validateNewsletterPhone(phone: string): string | null {
  return normalizeEcuadorMobile(phone) ? null : 'Número de celular inválido.';
}

export function validateNewsletterGender(gender: string): string | null {
  return (NEWSLETTER_GENDERS as readonly string[]).includes(gender) ? null : 'Género inválido.';
}

export function validateNewsletterBirthDay(birthDay: number | null): string | null {
  return birthDay === null || birthDay < 1 || birthDay > 31 ? 'Día de nacimiento inválido.' : null;
}

export function validateNewsletterBirthMonth(birthMonth: number | null): string | null {
  return birthMonth === null || birthMonth < 1 || birthMonth > 12 ? 'Mes de nacimiento inválido.' : null;
}

export async function subscribeToNewsletter(input: NewsletterSubscriptionInput): Promise<void> {
  const normalizedPhone = normalizeEcuadorMobile(input.phone);

  const res = await fetch(SUBSCRIBE_NEWSLETTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim(),
      phone: normalizedPhone ?? input.phone.trim(),
      gender: input.gender,
      birthDay: input.birthDay,
      birthMonth: input.birthMonth,
    }),
  });

  let json: { error?: string; success?: boolean } | null = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || !json?.success) {
    const message = json?.error || 'No se pudo completar la suscripción. Intenta de nuevo.';
    throw new NewsletterSubscriptionError(message, res.status);
  }
}
