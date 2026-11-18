/**
 * A/B switch. One codebase, two variants.
 *   ?variant=a | ?variant=b  → sets and remembers the variant
 *   ?dev=1 / ?dev=0           → shows / hides the small test toggle
 *   ?test=r7k2 / ?test=m4q9   → new test links for Version B / Version E (same code as ?variant=b / e)
 * Version A: "What to expect" card, same for everyone.
 * Version B: card + "How are you today?" mood pills + sensory filters.
 * Version E: Energy Match (PRD v4): energy check-in that re-sorts, Quiet & dim chip,
 *            six-section card with sources, "Rate your class".
 */
import { useSyncExternalStore } from 'react';
import { readJSON, writeJSON } from './storage';

export type Variant = 'a' | 'b' | 'e';

const VARIANT_KEY = 'rtr.variant';

/**
 * ONE switch for the old test links. true: ?variant=b and ?variant=e show only the
 * "This test has ended" screen (no app, nothing saved). false: they work again as before.
 * No Version B or E code is removed either way.
 */
export const OLD_LINKS_CLOSED = true;

/**
 * ONE switch for the round-2 test links. true: ?test=r7k2 and ?test=m4q9 show only the
 * "This test has ended" screen (no app, nothing saved). false: they open Version B / E again.
 * The ?test= mapping below stays in place either way.
 */
export const ROUND2_LINKS_CLOSED = true;

/** New test links for a new group of testers. Same Version B / E code as the old links. */
const TEST_LINKS: Record<string, Variant> = {
  r7k2: 'b',
  m4q9: 'e',
};

/**
 * True when this page was opened with a closed test link:
 * round 1 (?variant=b, ?variant=e) while OLD_LINKS_CLOSED, or
 * round 2 (?test=r7k2, ?test=m4q9) while ROUND2_LINKS_CLOSED.
 */
export function isClosedTestLink(): boolean {
  const params = new URLSearchParams(window.location.search);
  const v = params.get('variant')?.toLowerCase();
  const test = params.get('test')?.toLowerCase() ?? '';
  if (OLD_LINKS_CLOSED && (v === 'b' || v === 'e')) return true;
  if (ROUND2_LINKS_CLOSED && test in TEST_LINKS) return true;
  return false;
}
const DEV_KEY = 'rtr.dev';
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Read URL params once on startup. */
export function initVariantFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  // New test links: map the code to Version B or E
  const test = TEST_LINKS[params.get('test')?.toLowerCase() ?? ''];
  if (test) writeJSON(VARIANT_KEY, test);
  const v = params.get('variant')?.toLowerCase();
  if (!test && !isClosedTestLink() && (v === 'a' || v === 'b' || v === 'e')) writeJSON(VARIANT_KEY, v);
  const dev = params.get('dev');
  if (dev === '1') writeJSON(DEV_KEY, true);
  if (dev === '0') writeJSON(DEV_KEY, false);
}

export function getVariant(): Variant {
  const v = readJSON<string>(VARIANT_KEY, 'a');
  return v === 'b' || v === 'e' ? v : 'a';
}

export function setVariant(v: Variant): void {
  writeJSON(VARIANT_KEY, v);
  emit();
}

export function isDevMode(): boolean {
  return readJSON<boolean>(DEV_KEY, false) === true;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useVariant(): Variant {
  return useSyncExternalStore(subscribe, getVariant, getVariant);
}
