'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

/**
 * Keeps <html data-theme> in sync with the persisted theme.
 *
 * The initial theme is set before first paint by the inline script in layout.tsx
 * (reading localStorage). This component only re-applies the theme AFTER the
 * persisted store has finished rehydrating from IndexedDB — otherwise it would
 * briefly write the store's default (light) over the correct value and cause a flash.
 */
export default function ThemeApplier() {
  const theme = useStore((s) => s.theme);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }
    if (persist.hasHydrated()) setHydrated(true);
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute('data-theme', theme);
    // Mirror to localStorage so the next load's pre-paint script is correct.
    try {
      localStorage.setItem('boardback-theme', theme);
    } catch {}
  }, [theme, hydrated]);

  return null;
}
