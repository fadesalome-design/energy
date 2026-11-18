/**
 * SANDBOX D: desktop layout switch. At 1024 px and wider D shows two columns (Energy Match
 * card + class grid) and opens a class as a side panel. Below that, nothing changes.
 */
import { useSyncExternalStore } from 'react';

export const DESKTOP_QUERY = '(min-width: 1024px)';

const mql = typeof window !== 'undefined' ? window.matchMedia(DESKTOP_QUERY) : null;
const subscribe = (cb: () => void) => {
  mql?.addEventListener('change', cb);
  return () => mql?.removeEventListener('change', cb);
};

export function useDesktop(): boolean {
  return useSyncExternalStore(subscribe, () => !!mql?.matches, () => false);
}
