import { useEffect, useState } from 'react';

// Favorites are frontend-only: no account, no cross-device sync. We store
// just the list of product ids under one localStorage key, which is enough
// to re-render the favorited cards from live product data on each visit.
const STORAGE_KEY = 'induscrubs:favorites';
const CHANGE_EVENT = 'induscrubs:favorites-changed';

function readFavoriteIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeFavoriteIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Private browsing / storage quota / disabled storage: favorites just won't persist.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function isFavorite(productId: string): boolean {
  return readFavoriteIds().includes(productId);
}

export function toggleFavorite(productId: string): void {
  const ids = readFavoriteIds();
  const next = ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId];
  writeFavoriteIds(next);
}

// Reactive hook: re-reads localStorage whenever a favorite is toggled
// anywhere in the app (same-tab, via the custom event) or in another tab
// (via the native `storage` event), so every button/badge stays in sync
// without prop drilling or a global store.
export function useFavoriteIds(): string[] {
  const [ids, setIds] = useState<string[]>(() => readFavoriteIds());

  useEffect(() => {
    const sync = () => setIds(readFavoriteIds());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return ids;
}
