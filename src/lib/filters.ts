/**
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
    explain: 'Gentle classes. Nothing harder than moderate effort.',
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
    explain: 'Classes with a hard part to push through.',
    test: (c) => peak(c) >= 4,
  },
];

export const GOALS: { id: StressGoal; label: string; icon: string; explain: string; test: (c: ClassInfo) => boolean }[] = [
  {
    id: 'burn',
    label: 'Burn it off',
    icon: 'flash',
    explain: 'Classes with a hard part to push through.',
    test: (c) => peak(c) >= 4,
  },
  {
    id: 'calm',
    label: 'Calm down',
    icon: 'wind',
    // B has no "Quiet & dim" switch; its equivalent is these two sensory filters
    explain: 'Calm rooms: soft music, not crowded, soft light. Quiet music and soft light filters are on.',
    test: (c) =>
      c.expect.sound.volume <= 2 &&
      c.expect.crowd.busyness === 'calm' &&
      (c.expect.light.level === 'dim' || c.expect.light.level === 'natural'),
  },
];

/** Version B's "Quiet & dim": the sensory filters that "Calm down" switches on. */
const QUIET_DIM: SensoryId[] = ['quietMusic', 'softLight'];

// ---------------------------------------------------------------------------
// Sensory filters (remembered)
// ---------------------------------------------------------------------------

export type SensoryId = 'softLight' | 'noFlashing' | 'quietMusic' | 'notCrowded' | 'touchConsent' | 'noPartner' | 'easyExit';

export interface SensoryFilter {
  id: SensoryId;
  group: string;
  label: string;
  hint: string;
  icon: string;
  test: (c: ClassInfo) => boolean;
}

export const SENSORY: SensoryFilter[] = [
  { id: 'softLight', group: 'Light', label: 'Soft or low light', hint: 'Dim or daylight, no bright ceiling lights', icon: 'sun',
    test: (c) => c.expect.light.level === 'dim' || c.expect.light.level === 'natural' },
  { id: 'noFlashing', group: 'Light', label: 'No flashing lights', hint: 'No strobe or flashing effects', icon: 'flash',
    test: (c) => c.expect.light.level !== 'flashing' },
  { id: 'quietMusic', group: 'Sound', label: 'Quiet or soft music', hint: 'Background level, you can easily talk', icon: 'volume',
    test: (c) => c.expect.sound.volume <= 2 },
  { id: 'notCrowded', group: 'Space', label: 'Not crowded', hint: 'Usually calm, with space around you', icon: 'people',
    test: (c) => c.expect.crowd.busyness === 'calm' },
  { id: 'touchConsent', group: 'Touch & people', label: 'Touch only if I agree', hint: 'No hands-on corrections, or the trainer asks first', icon: 'hand',
    test: (c) => !c.expect.trainer.handsOn || c.expect.trainer.asksBeforeTouch === true },
  { id: 'noPartner', group: 'Touch & people', label: 'No required partner work', hint: 'Partner work is none or optional', icon: 'partner',
    test: (c) => c.expect.partner.work !== 'required' },
  { id: 'easyExit', group: 'Leaving early', label: 'Easy to step out', hint: 'Fine to leave quietly during class', icon: 'door',
    test: (c) => c.expect.leaving.quietExitOk },
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const MOOD_KEY = 'rtr.mood';
const PREFS_KEY = 'rtr.sensoryPrefs';

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
  return readJSON<SensoryId[]>(PREFS_KEY, []);
}

export function setPrefs(p: SensoryId[]) {
  writeJSON(PREFS_KEY, p);
  emit();
}

// Version B sort ("Sort: Time · Nearest"), remembered like the other B filters.
export type SortB = 'time' | 'nearest';
const SORT_KEY = 'rtr.sortB';
export function getSortB(): SortB {
  return readJSON<SortB>(SORT_KEY, 'time') === 'nearest' ? 'nearest' : 'time';
}
export function setSortB(v: SortB) {
  writeJSON(SORT_KEY, v);
  emit();
}

export function useFilters() {
  useSyncExternalStore(subscribe, () => version, () => version);
  return { mood: getMood(), goal: getGoal(), prefs: getPrefs(), sort: getSortB() };
}

export function applyFilters(
  list: ClassInfo[], mood: Mood | null, prefs: SensoryId[], goal: StressGoal | null = getGoal(),
): ClassInfo[] {
  const goalTest = mood === 'stressed' ? GOALS.find((g) => g.id === goal)?.test : undefined;
  const moodTest = goalTest ?? MOODS.find((m) => m.id === mood)?.test ?? (() => true);
  const tests = SENSORY.filter((s) => prefs.includes(s.id)).map((s) => s.test);
  return list.filter((c) => moodTest(c) && tests.every((t) => t(c)));
}
