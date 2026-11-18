/**
 * SANDBOX D (built on Version B). D: mood and filters re-sort the list (best match first,
 * nothing hidden); 4 filters only; "Calm down" turns on Quiet & dim.
 *
 * Version B: "How are you today?" + sensory filters on the class list.
 *
 * Research: F-ENERGY (18/22 "it depends on my day"; tired/stressed changes the choice for 19/22)
 * Research: F-SENSORY (a sensory-sensitive group exists; 6 prefer calm, 6 enjoy busy places)
 *
 * Every rule below reads only the class's "What to expect" data, so a filter never
 * hides a class for a reason the card can't show. Mood is for today only; sensory
 * filters are remembered (they describe the person, not the day).
 */
import { useSyncExternalStore } from 'react';
import type { ClassInfo } from '../data/classes';
import { readJSON, writeJSON } from './storage';

// ---------------------------------------------------------------------------
// Mood (today)
// ---------------------------------------------------------------------------

export type Mood = 'tired' | 'stressed' | 'energetic';
/** Follow-up to "Stressed", the same as Version E: "Burn it off" or "Calm down". */
export type StressGoal = 'burn' | 'calm';

const peak = (c: ClassInfo) => Math.max(...c.expect.flow.map((f) => f.intensity));

export const MOODS: { id: Mood; label: string; icon: string; explain: string; test: (c: ClassInfo) => boolean }[] = [
  {
    id: 'tired',
    label: 'Tired',
    icon: 'dim',
    // Copy never shames low energy (F-ENERGY)
    explain: 'Gentle classes first: nothing harder than moderate effort.',
    test: (c) => peak(c) <= 3,
  },
  {
    id: 'stressed',
    label: 'Stressed',
    icon: 'calm',
    explain: 'Do you want to burn it off or calm down?',
    // The filter depends on the follow-up (see GOALS); until it is answered, nothing is hidden
    test: () => true,
  },
  {
    id: 'energetic',
    label: 'Energetic',
    icon: 'flash',
    explain: 'Classes with a hard part to push through come first.',
    test: (c) => peak(c) >= 4,
  },
];

export const GOALS: { id: StressGoal; label: string; icon: string; explain: string; test: (c: ClassInfo) => boolean }[] = [
  {
    id: 'burn',
    label: 'Burn it off',
    icon: 'flash',
    explain: 'Classes with a hard part to push through come first.',
    test: (c) => peak(c) >= 4,
  },
  {
    id: 'calm',
    label: 'Calm down',
    icon: 'wind',
    // B has no "Quiet & dim" switch; its equivalent is these two sensory filters
    explain: 'Calm rooms first: soft music, not crowded, soft light. Quiet & dim is on.',
    test: (c) =>
      c.expect.sound.volume <= 2 &&
      c.expect.crowd.busyness === 'calm' &&
      (c.expect.light.level === 'dim' || c.expect.light.level === 'natural'),
  },
];

/** D: "Calm down" switches on the Quiet & dim filter. */
const QUIET_DIM: SensoryId[] = ['quietDim'];

// ---------------------------------------------------------------------------
// Sensory filters (remembered)
// ---------------------------------------------------------------------------

// D: four filters only, shown right under the Energy Match card (no sheet).
export type SensoryId = 'quietDim' | 'notCrowded' | 'noFlashing' | 'noPartner';

export interface SensoryFilter {
  id: SensoryId;
  group: string;
  label: string;
  hint: string;
  icon: string;
  test: (c: ClassInfo) => boolean;
}

export const SENSORY: SensoryFilter[] = [
  // D data separates soft light from normal light, so Quiet & dim means a quiet room AND soft light
  { id: 'quietDim', group: 'Sound & light', label: 'Quiet & dim', hint: 'Quiet room and soft light', icon: 'dim',
    test: (c) => c.expect.sound.volume <= 2 && c.expect.light.level === 'dim' },
  { id: 'notCrowded', group: 'Space', label: 'Not crowded', hint: 'Usually calm, with space around you', icon: 'people',
    test: (c) => c.expect.crowd.busyness === 'calm' },
  { id: 'noFlashing', group: 'Light', label: 'No flashing lights', hint: 'No strobe or flashing effects', icon: 'flash',
    test: (c) => c.expect.light.level !== 'flashing' },
  { id: 'noPartner', group: 'People', label: 'No partner work', hint: 'Partner work is none or optional', icon: 'partner',
    test: (c) => c.expect.partner.work !== 'required' },
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const MOOD_KEY = 'rtrD.mood';
const PREFS_KEY = 'rtrD.sensoryPrefs';

let version = 0;
const listeners = new Set<() => void>();
const emit = () => {
  version++;
  listeners.forEach((l) => l());
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const today = () => new Date().toDateString();

interface MoodState { value: Mood; date: string; goal?: StressGoal | null; auto?: SensoryId[] }

function readMood(): MoodState | null {
  const m = readJSON<MoodState | null>(MOOD_KEY, null);
  return m && m.date === today() ? m : null; // resets every day
}

export function getMood(): Mood | null {
  return readMood()?.value ?? null;
}

export function getGoal(): StressGoal | null {
  const m = readMood();
  return m?.value === 'stressed' ? m.goal ?? null : null;
}

/** Turn off the filters "Calm down" switched on (only those it added itself). */
function undoQuietDim(m: MoodState | null) {
  if (m?.goal === 'calm' && m.auto?.length) setPrefs(getPrefs().filter((p) => !m.auto!.includes(p)));
}

export function setMood(m: Mood | null) {
  undoQuietDim(readMood());
  writeJSON(MOOD_KEY, m ? { value: m, date: today(), goal: null } : null);
  emit();
}

/** "Burn it off" / "Calm down" (tap again to clear). "Calm down" turns on Quiet & dim, like E. */
export function setGoal(g: StressGoal) {
  const m = readMood();
  if (!m || m.value !== 'stressed') return;
  const goal = m.goal === g ? null : g;
  undoQuietDim(m);
  let auto: SensoryId[] = [];
  if (goal === 'calm') {
    const prefs = getPrefs();
    auto = QUIET_DIM.filter((p) => !prefs.includes(p));
    setPrefs([...prefs, ...auto]);
  }
  writeJSON(MOOD_KEY, { ...m, goal, auto });
  emit();
}

export function getPrefs(): SensoryId[] {
  const ids = SENSORY.map((f) => f.id);
  return readJSON<SensoryId[]>(PREFS_KEY, []).filter((p) => ids.includes(p));
}

export function setPrefs(p: SensoryId[]) {
  writeJSON(PREFS_KEY, p);
  emit();
}

// Version B sort ("Sort: Time · Nearest"). "Time" is selected every time the page opens,
// so it is kept in memory only.
export type SortB = 'time' | 'nearest';
let sortB: SortB = 'time';
export function getSortB(): SortB {
  return sortB;
}
export function setSortB(v: SortB) {
  sortB = v;
  emit();
}

// "Skip" (same as Version E): clears the mood and folds the question away for this session.
const SKIP_KEY = 'rtrD.moodSkipped';
export function getMoodSkipped(): boolean {
  try { return sessionStorage.getItem(SKIP_KEY) === '1'; } catch { return false; }
}
function writeSkipped(on: boolean) {
  try { if (on) sessionStorage.setItem(SKIP_KEY, '1'); else sessionStorage.removeItem(SKIP_KEY); } catch { /* ignore */ }
}
export function skipMood() {
  writeSkipped(true);
  setMood(null); // also turns off filters that "Calm down" added
}
export function reopenMood() {
  writeSkipped(false);
  emit();
}

export function useFilters() {
  useSyncExternalStore(subscribe, () => version, () => version);
  return { mood: getMood(), goal: getGoal(), prefs: getPrefs(), sort: getSortB(), skipped: getMoodSkipped() };
}

export function applyFilters(
  list: ClassInfo[], mood: Mood | null, prefs: SensoryId[], goal: StressGoal | null = getGoal(),
): ClassInfo[] {
  const goalTest = mood === 'stressed' ? GOALS.find((g) => g.id === goal)?.test : undefined;
  const moodTest = goalTest ?? MOODS.find((m) => m.id === mood)?.test ?? (() => true);
  const tests = SENSORY.filter((s) => prefs.includes(s.id)).map((s) => s.test);
  return list.filter((c) => moodTest(c) && tests.every((t) => t(c)));
}

// ---------------------------------------------------------------------------
// D: best match first, nothing hidden
// ---------------------------------------------------------------------------

/** Does the class fit today's mood (and the Stressed follow-up)? Stressed alone: all fit. */
export function fitsMood(c: ClassInfo, mood: Mood | null, goal: StressGoal | null): boolean {
  if (!mood) return true;
  if (mood === 'stressed') return GOALS.find((g) => g.id === goal)?.test(c) ?? true;
  return MOODS.find((m) => m.id === mood)!.test(c);
}

/**
 * Splits the (already time- or distance-ordered) list into classes that fit the mood and
 * meet every active filter, and the rest. Both keep the incoming order; nothing is hidden.
 */
export function orderD(list: ClassInfo[], mood: Mood | null, goal: StressGoal | null, prefs: SensoryId[]) {
  const tests = SENSORY.filter((s) => prefs.includes(s.id)).map((s) => s.test);
  const fits = (c: ClassInfo) => fitsMood(c, mood, goal) && tests.every((t) => t(c));
  return { best: list.filter(fits), other: list.filter((c) => !fits(c)) };
}
