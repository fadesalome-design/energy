/**
 * Location, kept small (Research: F-LOCATION): one fixed DEMO location, distances
 * per studio in the sample data. No map, no GPS, no address search.
 * Used by Versions B and E only; Version A is unchanged.
 */
import { getStudio, type ClassInfo } from '../data/classes';

export const DEMO_LOCATION = 'Kreuzberg';

export const distanceKm = (c: ClassInfo) => getStudio(c.studioId).distanceKm;
export const km = (n: number) => `${n.toFixed(1)} km`;

/** Nearest first. Array.sort is stable, so ties keep the order the list already had. */
export function byDistance(list: ClassInfo[]): ClassInfo[] {
  return [...list].sort((a, b) => distanceKm(a) - distanceKm(b));
}
