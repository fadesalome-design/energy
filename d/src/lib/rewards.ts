/**
 * SANDBOX D: stamp rewards. One stamp per class rating (see lib/feedback.ts).
 *   10 stamps: socks · 20 stamps: guest pass OR massage (a free class for a friend, or a free massage)
 *   30 stamps: an Urban Sports Clue hoodie (the app's own name, no real logo)
 * The header counter, the profile and "Stamp collected" all read the same total and these rules.
 * Claiming is a demo only (stored in D's browser storage; the tester link resets it).
 */
import { useSyncExternalStore } from 'react';
import { readJSON, writeJSON } from './storage';

export type RewardId = 'socks' | 'choice' | 'hoodie';
export type Choice = 'friend' | 'massage';

export interface Reward { id: RewardId; at: number; title: string; short: string; icon: string }

export const REWARDS: Reward[] = [
  { id: 'socks', at: 10, title: 'Socks', short: 'your socks', icon: 'sock' },
  { id: 'choice', at: 20, title: 'Guest pass or massage', short: 'a guest pass or massage', icon: 'gift' },
  { id: 'hoodie', at: 30, title: 'Urban Sports Clue hoodie', short: 'your hoodie', icon: 'hoodie' },
];
export const MAX_STAMPS = 30;
export const PER_LEVEL = 10;

export const CHOICE_LABEL: Record<Choice, string> = { friend: 'Free class for a friend', massage: 'Free massage' };
/** Short description of the 20-stamp reward (shown where reward descriptions are shown) */
export const CHOICE_DESCRIPTION = 'Bring a friend to a class, or enjoy a free massage.';

/** The 10-stamp level the member is on: 1–10, 11–20 or 21–30 (stays on 21–30 after 30). */
export function level(stamps: number) {
  const index = Math.min(Math.max(Math.ceil(stamps / PER_LEVEL), 1), 3) - 1;
  return { from: index * PER_LEVEL + 1, to: (index + 1) * PER_LEVEL, reward: REWARDS[index] };
}

/** The next milestone not reached yet (or null after 30). */
export function nextReward(stamps: number): Reward | null {
  return REWARDS.find((r) => stamps < r.at) ?? null;
}

/** The milestone this exact stamp reached, if any (10, 20 or 30). */
export function rewardReachedAt(stamps: number): Reward | null {
  return REWARDS.find((r) => r.at === stamps) ?? null;
}

/** "4 of 10. 6 more for your socks." (the same line everywhere) */
export function progressLine(stamps: number): { count: string; rest: string } {
  const next = nextReward(stamps);
  if (!next) return { count: `${stamps} stamps.`, rest: 'You have unlocked every reward.' };
  const left = next.at - stamps;
  return { count: `${stamps} of ${next.at}.`, rest: `${left} more for ${next.short}.` };
}

/** Short label for the header counter: "4/10", "14/20", "24/30", or "30" after the last one. */
export function counterLabel(stamps: number) {
  const next = nextReward(stamps);
  return next ? `${stamps}/${next.at}` : `${stamps}`;
}

// ---------- claims (demo) ----------

const CLAIMS_KEY = 'rtrD.rewards';
interface Claims { socks?: boolean; choice?: Choice; choiceClaimed?: boolean; hoodie?: boolean }

let version = 0;
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };
const emit = () => { version++; listeners.forEach((l) => l()); };

export function getClaims(): Claims { return readJSON<Claims>(CLAIMS_KEY, {}); }
export function useClaims(): Claims {
  useSyncExternalStore(subscribe, () => version, () => version);
  return getClaims();
}
export function claim(id: RewardId, choice?: Choice) {
  const c = getClaims();
  if (id === 'socks') c.socks = true;
  if (id === 'hoodie') c.hoodie = true;
  if (id === 'choice' && choice) { c.choice = choice; c.choiceClaimed = true; }
  writeJSON(CLAIMS_KEY, c);
  emit();
}
export function isClaimed(c: Claims, id: RewardId) {
  return id === 'socks' ? !!c.socks : id === 'hoodie' ? !!c.hoodie : !!c.choiceClaimed;
}
export const CLAIMS_STORAGE_KEY = CLAIMS_KEY;
