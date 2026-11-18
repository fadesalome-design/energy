/**
 * SANDBOX D: location, kept small. The member picks a place in the Energy Match card:
 * "Near me (Kreuzberg)" or one of 4 Berlin districts. Distances are DEMO data by district
 * (no map, no GPS, no address search). Kept for this visit only.
 */
import { useSyncExternalStore } from 'react';
import { getStudio, type ClassInfo } from '../data/classes';

export type PlaceId = 'near' | 'mitte' | 'neukoelln' | 'friedrichshain' | 'prenzlauer';

export const PLACES: { id: PlaceId; label: string; chip: string }[] = [
  { id: 'near', label: 'Near me (Kreuzberg)', chip: 'Near me' },
  { id: 'mitte', label: 'Mitte', chip: 'Mitte' },
  { id: 'neukoelln', label: 'Neukölln', chip: 'Neukölln' },
  { id: 'friedrichshain', label: 'Friedrichshain', chip: 'Friedrichshain' },
  { id: 'prenzlauer', label: 'Prenzlauer Berg', chip: 'Prenzlauer Berg' },
];

/** The district each place stands for. */
const DISTRICT: Record<PlaceId, string> = {
  near: 'Kreuzberg', mitte: 'Mitte', neukoelln: 'Neukölln', friedrichshain: 'Friedrichshain', prenzlauer: 'Prenzlauer Berg',
};

/** Demo distances (km) between district centres. Each studio adds its own small offset. */
const BETWEEN: Record<string, Record<string, number>> = {
  Kreuzberg: { Kreuzberg: 0.6, Neukölln: 2.2, Mitte: 3.0, Friedrichshain: 2.8, 'Prenzlauer Berg': 5.0 },
  Neukölln: { Kreuzberg: 2.2, Neukölln: 0.6, Mitte: 5.0, Friedrichshain: 3.8, 'Prenzlauer Berg': 7.0 },
  Mitte: { Kreuzberg: 3.0, Neukölln: 5.0, Mitte: 0.6, Friedrichshain: 3.2, 'Prenzlauer Berg': 2.5 },
  Friedrichshain: { Kreuzberg: 2.8, Neukölln: 3.8, Mitte: 3.2, Friedrichshain: 0.6, 'Prenzlauer Berg': 3.0 },
  'Prenzlauer Berg': { Kreuzberg: 5.0, Neukölln: 7.0, Mitte: 2.5, Friedrichshain: 3.0, 'Prenzlauer Berg': 0.6 },
};

let place: PlaceId = 'near';
let version = 0;
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };

export function getPlace(): PlaceId { return place; }
export function setPlace(p: PlaceId) { place = p; version++; listeners.forEach((l) => l()); }
export function usePlace(): PlaceId {
  useSyncExternalStore(subscribe, () => version, () => version);
  return place;
}
export const placeInfo = (p: PlaceId = place) => PLACES.find((x) => x.id === p)!;
/** "Kreuzberg" for Near me, otherwise the district name (for "2.1 km from …"). */
export const placeName = (p: PlaceId = place) => (p === 'near' ? 'Kreuzberg' : placeInfo(p).label);

export function studioKm(studioId: string, p: PlaceId = place): number {
  const s = getStudio(studioId);
  return Math.round((BETWEEN[DISTRICT[p]][s.district] + s.offsetKm) * 10) / 10;
}
/** About 4 min per km by public transport, at least 3 min (demo). */
export function studioMin(studioId: string, p: PlaceId = place): number {
  return Math.max(3, Math.round(studioKm(studioId, p) * 4));
}

// Kept for code shared with the copied Version E files.
export const DEMO_LOCATION = 'Kreuzberg';
export const distanceKm = (c: ClassInfo) => studioKm(c.studioId);
export const km = (n: number) => `${n.toFixed(1)} km`;

/** Nearest first (from the chosen place). Stable, so ties keep the order the list already had. */
export function byDistance(list: ClassInfo[]): ClassInfo[] {
  return [...list].sort((a, b) => distanceKm(a) - distanceKm(b));
}
