/**
 * SANDBOX D: location, kept small. The member picks a place in the Energy Match card:
 * "Near me (Kreuzberg)" or one of 4 Berlin districts. Distances are DEMO data per place
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

/** Demo distances (km) from each place to each studio. "near" uses the studio data (Kreuzberg). */
const KM: Record<Exclude<PlaceId, 'near'>, Record<string, number>> = {
  mitte: { stillwerk: 5.0, hafen: 3.0, eisenhalle: 3.5, pulse: 3.2, tanzraum: 4.0, nordbad: 2.5 },
  neukoelln: { stillwerk: 0.6, hafen: 2.0, eisenhalle: 9.0, pulse: 3.8, tanzraum: 4.2, nordbad: 7.0 },
  friedrichshain: { stillwerk: 3.8, hafen: 2.6, eisenhalle: 6.5, pulse: 0.7, tanzraum: 6.0, nordbad: 3.0 },
  prenzlauer: { stillwerk: 7.0, hafen: 5.0, eisenhalle: 3.2, pulse: 3.0, tanzraum: 6.8, nordbad: 0.9 },
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
  return p === 'near' ? getStudio(studioId).distanceKm : KM[p][studioId];
}
/** About 4 min per km by public transport, at least 3 min (demo). */
export function studioMin(studioId: string, p: PlaceId = place): number {
  return p === 'near' ? getStudio(studioId).travelMin : Math.max(3, Math.round(studioKm(studioId, p) * 4));
}

// Kept for code shared with the copied Version E files.
export const DEMO_LOCATION = 'Kreuzberg';
export const distanceKm = (c: ClassInfo) => studioKm(c.studioId);
export const km = (n: number) => `${n.toFixed(1)} km`;

/** Nearest first (from the chosen place). Stable, so ties keep the order the list already had. */
export function byDistance(list: ClassInfo[]): ClassInfo[] {
  return [...list].sort((a, b) => distanceKm(a) - distanceKm(b));
}
