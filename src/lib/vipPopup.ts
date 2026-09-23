// Session-scoped flag for the Induscrubs VIP popup. sessionStorage (not
// localStorage) so the popup can come back on a future visit, but never twice
// in the same session once it has been dismissed or the visitor subscribed.
const VIP_POPUP_SEEN_KEY = 'induscrubs_vip_popup_seen';

export const VIP_POPUP_DELAY_MS = 6000;

export function hasSeenVipPopup(): boolean {
  try {
    return sessionStorage.getItem(VIP_POPUP_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function markVipPopupSeen(): void {
  try {
    sessionStorage.setItem(VIP_POPUP_SEEN_KEY, '1');
  } catch {
    // Storage blocked (private mode, disabled site data): the popup may
    // reappear on reload, which is acceptable.
  }
}
