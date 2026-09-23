import { useEffect, useState } from 'react';

const CHECK_VIP_ELIGIBILITY_URL =
  'https://kbyzijtrgzodmxqknsyp.supabase.co/functions/v1/check-vip-eligibility';

// UI hint only. The stored email just decides whether to *preview* the VIP
// discount; the real discount is re-verified server-side by
// verify-and-create-order against the order's email, and the confirmed total
// is always the one that function returns.
const STORAGE_KEY = 'induscrubs_vip_email';
const CHANGE_EVENT = 'induscrubs:vip-email-changed';

// Mirrors VIP_DISCOUNT_RATE in verify-and-create-order: 10% of the items
// subtotal only (never shipping or fees), rounded to cents.
export const VIP_DISCOUNT_PERCENT = 10;

export function computeVipDiscount(itemsSubtotal: number): number {
  return Math.round(itemsSubtotal * (VIP_DISCOUNT_PERCENT / 100) * 100) / 100;
}

export function readVipEmail(): string | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value && value.trim() !== '' ? value : null;
  } catch {
    return null;
  }
}

export function saveVipEmail(email: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, email.trim().toLowerCase());
  } catch {
    // Private browsing / disabled storage: the preview just won't show.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// One request per email per page load, shared by the cart drawer and checkout.
const eligibilityCache = new Map<string, Promise<boolean>>();

// Any failure (network, non-2xx, function not deployed) resolves to false, so a
// broken check only hides the preview and never affects checkout.
export function checkVipEligibility(email: string): Promise<boolean> {
  const cached = eligibilityCache.get(email);
  if (cached) return cached;

  const request = fetch(CHECK_VIP_ELIGIBILITY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email }),
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const json: { eligible?: unknown } | null = await res.json().catch(() => null);
      return json?.eligible === true;
    })
    .catch(() => false)
    .then((eligible) => {
      // Don't pin a failed/negative result for the whole session; a later
      // mount (e.g. after re-subscribing) can check again.
      if (!eligible) eligibilityCache.delete(email);
      return eligible;
    });

  eligibilityCache.set(email, request);
  return request;
}

export interface VipEligibility {
  email: string | null;
  eligible: boolean;
}

// Reactive: re-checks when the stored VIP email changes in this tab (newsletter
// signup) or another tab (native `storage` event).
export function useVipEligibility(): VipEligibility {
  const [email, setEmail] = useState<string | null>(() => readVipEmail());
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const sync = () => setEmail(readVipEmail());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    setEligible(false);
    if (!email) return;
    let cancelled = false;
    checkVipEligibility(email).then((result) => {
      if (!cancelled) setEligible(result);
    });
    return () => {
      cancelled = true;
    };
  }, [email]);

  return { email, eligible };
}
