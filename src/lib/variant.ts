/**
 * A/B switch. One codebase, two variants.
 *   ?variant=a | ?variant=b  → sets and remembers the variant
 *   ?dev=1 / ?dev=0           → shows / hides the small test toggle
 * Version A: "What to expect" card, same for everyone.
 * Version B: card + "How are you today?" mood pills + sensory filters.
 * Version E: Energy Match (PRD v4): energy check-in that re-sorts, Quiet & dim chip,
 *            six-section card with sources, "Rate your class".
 */
import { useSyncExternalStore } from 'react';
import { readJSON, writeJSON } from './storage';

export type Variant = 'a' | 'b' | 'e';

const VARIANT_KEY = 'rtr.variant';
const DEV_KEY = 'rtr.dev';
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Read URL params once on startup. */
export function initVariantFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const v = params.get('variant')?.toLowerCase();
  if (v === 'a' || v === 'b' || v === 'e') writeJSON(VARIANT_KEY, v);
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
