/**
 * Energy Match (PRD v4) — Version E of the prototype.
 *
 * Optional by design: the member can skip the check-in, the normal list and card
 * work without it, and nothing about energy is kept after the session
 * (sessionStorage only). No mood, emotion or health data.
 *
 * Everything here is derived from the existing sample data, so the classes,
 * studios and copy stay the same as in Versions A and B.
 */
import { useSyncExternalStore } from 'react';
import { classes, getStudio, type ClassInfo } from '../data/classes';
import { readJSON, writeJSON } from './storage';

// ---------------------------------------------------------------------------
// Class profile (the simple fields from the PRD, derived from sample data)
// ---------------------------------------------------------------------------

export type Intensity = 'low' | 'medium' | 'high';
export type Music = 'quiet' | 'medium' | 'loud';
export type Light = 'dim' | 'normal' | 'bright';
export type Crowd = 'small' | 'medium' | 'large';

export interface Profile {
  intensity: Intensity;
  music: Music;
  light: Light;
  crowd: Crowd;
  level: string;
  showers: boolean;
  lockers: boolean;
  bring: string[];
}

export function profile(c: ClassInfo): Profile {
  const x = c.expect;
  const peak = Math.max(...x.flow.map((f) => f.intensity));
  const f = getStudio(c.studioId).facilities;
  return {
    intensity: peak <= 2 ? 'low' : peak === 3 ? 'medium' : 'high',
    music: x.sound.volume <= 2 ? 'quiet' : x.sound.volume === 3 ? 'medium' : 'loud',
    light: x.light.level === 'dim' ? 'dim' : x.light.level === 'natural' ? 'normal' : 'bright',
    crowd: x.crowd.typicalMax <= 10 ? 'small' : x.crowd.typicalMax <= 20 ? 'medium' : 'large',
    level: x.level.official,
    showers: f.showers !== 'none',
    lockers: f.lockers !== 'none',
    bring: x.bring,
  };
}

const RANK = { low: 0, medium: 1, high: 2, quiet: 0, loud: 2, small: 0, large: 2 } as const;
const rank = (v: string) => (RANK as Record<string, number>)[v] ?? 1;

// ---------------------------------------------------------------------------
// Member ratings: sample counts + ratings given in this prototype (feeds card + filter)
// ---------------------------------------------------------------------------

export const MIN_RATINGS = 5;

export type Category = 'clean' | 'crowd' | 'atmosphere' | 'senses' | 'trainer' | 'level';

export const CATEGORY_LABEL: Record<Category, string> = {
  clean: 'Cleanliness & hygiene',
  crowd: 'Crowd & space',
  atmosphere: 'Atmosphere & people',
  senses: 'Sound, light & air',
  trainer: 'Trainer',
  level: 'Level & intensity',
};

/** Share of a class's answers that touch each category in the sample data. */
const SAMPLE_SHARE: Record<Category, number> = { clean: 0.3, crowd: 0.3, atmosphere: 0.2, senses: 0.28, trainer: 0.22, level: 0.25 };

export interface RatingV4 {
  classId: string;
  at: string;
  expected: 'yes' | 'partly' | 'no' | null;
  /** question id → answer index 0 (too little) / 1 (just right) / 2 (too much) */
  answers: Record<string, 0 | 1 | 2>;
}

const RATINGS_KEY = 'rtr.ratingsV4';
export function getRatingsV4(): RatingV4[] {
  return readJSON<RatingV4[]>(RATINGS_KEY, []);
}
export function addRatingV4(r: RatingV4) {
  writeJSON(RATINGS_KEY, [...getRatingsV4(), r]);
  emit();
}

export interface MemberView {
  /** number of member ratings per category */
  n: Record<Category, number>;
  clean: { avg: number | null; n: number };
  crowd: { level: Crowd; n: number };
  music: { level: Music; n: number };
  light: { level: Light; n: number };
  level: { harder: number; easier: number; asDescribed: number; n: number };
}

function sampleCount(c: ClassInfo, cat: Category) {
  return Math.round(c.reports * SAMPLE_SHARE[cat]);
}

function majority<T extends string>(votes: Record<T, number>, fallback: T): T {
  let best = fallback; let bestN = -1;
  for (const [k, v] of Object.entries(votes) as [T, number][]) if (v > bestN) { best = k; bestN = v; }
  return best;
}

export function memberView(c: ClassInfo): MemberView {
  const p = profile(c);
  const mine = getRatingsV4().filter((r) => r.classId === c.id);
  const n = Object.fromEntries((Object.keys(SAMPLE_SHARE) as Category[]).map((k) => [k, sampleCount(c, k)])) as Record<Category, number>;
  for (const r of mine) for (const q of Object.keys(r.answers)) n[QUESTIONS.find((x) => x.id === q)!.category]++;

  // Sound & light: samples agree with the studio; "too loud"/"too quiet" etc. vote a level, "just right" confirms the studio's.
  const soundN = Math.round(c.reports * 0.16);
  const lightN = Math.round(c.reports * 0.12);
  const music: Record<Music, number> = { quiet: 0, medium: 0, loud: 0 }; music[p.music] += soundN;
  const light: Record<Light, number> = { dim: 0, normal: 0, bright: 0 }; light[p.light] += lightN;
  const crowd: Record<Crowd, number> = { small: 0, medium: 0, large: 0 }; crowd[p.crowd] += n.crowd;
  let mN = soundN, lN = lightN;
  for (const r of mine) {
    const a = r.answers;
    if (a.music !== undefined) { music[(['quiet', p.music, 'loud'] as Music[])[a.music]]++; mN++; }
    if (a.light !== undefined) { light[(['dim', p.light, 'bright'] as Light[])[a.light]]++; lN++; }
    if (a.space !== undefined) crowd[(['small', p.crowd, 'large'] as Crowd[])[a.space]]++;
  }

  // Level: sample split from the existing "first-timers said the level matched" figure
  const ln = sampleCount(c, 'level');
  const disagree = Math.round(ln * (1 - c.expect.level.firstTimerMatchPct / 100));
  const lvl = { harder: disagree, easier: 0, asDescribed: ln - disagree, n: ln };
  for (const r of mine) if (r.answers.level !== undefined) {
    lvl.n++;
    if (r.answers.level === 0) lvl.easier++; else if (r.answers.level === 2) lvl.harder++; else lvl.asDescribed++;
  }

  // Cleanliness: sample average + prototype answers (Not great = 2, OK = 4, Very clean = 5)
  let cleanN = c.expect.clean.rating == null ? 0 : sampleCount(c, 'clean');
  let cleanSum = (c.expect.clean.rating ?? 0) * cleanN;
  for (const r of mine) if (r.answers.clean !== undefined) { cleanSum += [2, 4, 5][r.answers.clean]; cleanN++; }

  return {
    n,
    clean: { avg: cleanN ? cleanSum / cleanN : null, n: cleanN },
    crowd: { level: majority(crowd, p.crowd), n: n.crowd },
    music: { level: majority(music, p.music), n: mN },
    light: { level: majority(light, p.light), n: lN },
    level: lvl,
  };
}

// ---------------------------------------------------------------------------
// Rating questions (PRD G): 3 tap questions from 3 different categories
// ---------------------------------------------------------------------------

export interface QuestionV4 { id: string; category: Category; prompt: string; options: [string, string, string] }

export const QUESTIONS: QuestionV4[] = [
  { id: 'clean', category: 'clean', prompt: 'The space was:', options: ['Not clean enough', 'Clean', 'Very clean'] },
  { id: 'space', category: 'crowd', prompt: 'The room was:', options: ['Too empty', 'Just right', 'Too crowded'] },
  { id: 'vibe', category: 'atmosphere', prompt: 'The atmosphere was:', options: ['Too sleepy', 'Just right', 'Too intense'] },
  { id: 'music', category: 'senses', prompt: 'Music was:', options: ['Too quiet', 'Just right', 'Too loud'] },
  { id: 'light', category: 'senses', prompt: 'Light was:', options: ['Too dim', 'Just right', 'Too bright'] },
  { id: 'air', category: 'senses', prompt: 'The air was:', options: ['Too cold', 'Just right', 'Too warm'] },
  { id: 'trainer', category: 'trainer', prompt: 'The trainer was:', options: ['Too relaxed', 'Just right', 'Too strict'] },
  { id: 'level', category: 'level', prompt: 'The class felt:', options: ['Easier than described', 'As described', 'Harder than described'] },
];

/** Prefer the 3 categories with the fewest ratings for this class; one question each. */
export function pickQuestionsV4(c: ClassInfo): QuestionV4[] {
  const v = memberView(c);
  const cats = (Object.keys(CATEGORY_LABEL) as Category[]).sort((a, b) => v.n[a] - v.n[b]).slice(0, 3);
  return cats.map((cat) => {
    const qs = QUESTIONS.filter((q) => q.category === cat);
    if (qs.length === 1) return qs[0];
    // Sound, light & air: ask about whichever has the fewest ratings
    return v.music.n <= v.light.n ? qs.find((q) => q.id === 'music')! : qs.find((q) => q.id === 'light')!;
  });
}

// ---------------------------------------------------------------------------
// Session state: energy + Quiet & dim (never saved after the session)
// ---------------------------------------------------------------------------

export type Energy = 'drained' | 'stressed' | 'normal' | 'energized';
export type StressGoal = 'burn' | 'calm';

export interface EnergyState { energy: Energy | null; goal: StressGoal | null; skipped: boolean; quietDim: boolean }

const SESSION_KEY = 'rtr.energySession';
const EMPTY: EnergyState = { energy: null, goal: null, skipped: false, quietDim: false };

function readSession(): EnergyState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}
let state: EnergyState = readSession();
let version = 0;
const listeners = new Set<() => void>();
function emit() { version++; listeners.forEach((l) => l()); }
function setState(next: EnergyState) {
  state = next;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  emit();
}

export function useEnergy() {
  useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => version, () => version);
  return state;
}

export function chooseEnergy(e: Energy | null) {
  // Tapping the chosen option again clears it
  const energy = state.energy === e ? null : e;
  // If Quiet & dim was switched on by "Calm down", changing the energy switches it off again
  setState({ ...state, energy, goal: null, skipped: false, quietDim: state.goal === 'calm' ? false : state.quietDim });
}
export function chooseGoal(g: StressGoal) {
  const goal = state.goal === g ? null : g;
  // Quiet & dim switches on with "Calm down" (and off again if Calm down is undone)
  setState({ ...state, goal, quietDim: goal === 'calm' ? true : state.goal === 'calm' ? false : state.quietDim });
}
export function skipEnergy() { setState({ ...state, energy: null, goal: null, skipped: true }); }
export function reopenEnergy() { setState({ ...state, skipped: false }); }
export function toggleQuietDim() { setState({ ...state, quietDim: !state.quietDim }); }
export function clearEnergySession() { setState(EMPTY); }

// ---------------------------------------------------------------------------
// Sorting + reason line (PRD B) and Quiet & dim (PRD C)
// ---------------------------------------------------------------------------

type Mode = 'gentle' | 'calm' | 'high' | 'default';
export function sortMode(s: EnergyState): Mode {
  if (s.energy === 'drained') return 'gentle';
  if (s.energy === 'stressed' && s.goal === 'calm') return 'calm';
  if (s.energy === 'stressed' && s.goal === 'burn') return 'high';
  if (s.energy === 'energized') return 'high';
  return 'default';
}

const byTime = (a: ClassInfo, b: ClassInfo) => a.start.localeCompare(b.start);

export function sortClasses(list: ClassInfo[], s: EnergyState): ClassInfo[] {
  const mode = sortMode(s);
  const key = (c: ClassInfo): number[] => {
    const p = profile(c);
    if (mode === 'gentle') return [rank(p.intensity), rank(p.music), rank(p.crowd)];
    if (mode === 'calm') return [rank(p.music), rank(p.intensity), rank(p.crowd)];
    if (mode === 'high') return [-rank(p.intensity)];
    return [];
  };
  return [...list].sort((a, b) => {
    const ka = key(a), kb = key(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
    return byTime(a, b);
  });
}

const WORD = {
  intensity: { low: 'low intensity', medium: 'medium intensity', high: 'high intensity' },
  music: { quiet: 'quiet', medium: 'medium music', loud: 'loud music' },
  crowd: { small: 'small group', medium: 'medium group', large: 'large group' },
} as const;

/** One short reason line per class (plain words, never "safe"). */
export function reasonLine(c: ClassInfo, s: EnergyState): string {
  const p = profile(c);
  const mode = sortMode(s);
  const traits = (want: { intensity?: Intensity[]; music?: Music[]; crowd?: Crowd[] }) => {
    const fits: string[] = [];
    if (want.intensity?.includes(p.intensity)) fits.push(WORD.intensity[p.intensity]);
    if (want.music?.includes(p.music)) fits.push(p.music === 'quiet' ? 'calm' : WORD.music[p.music]);
    if (want.crowd?.includes(p.crowd)) fits.push(WORD.crowd[p.crowd]);
    return fits;
  };
  let fits: string[] = [];
  if (mode === 'gentle') fits = traits({ intensity: ['low'], music: ['quiet'], crowd: ['small'] });
  if (mode === 'calm') fits = traits({ music: ['quiet'], intensity: ['low'], crowd: ['small'] });
  if (mode === 'high') fits = traits({ intensity: ['high'] });
  if (mode === 'default') return `${cap(WORD.intensity[p.intensity])} · ${WORD.music[p.music]} · ${WORD.crowd[p.crowd]}`;
  if (fits.length) return `Fits: ${fits.slice(0, 2).join(', ')}`;
  return `Less of a match: ${WORD.intensity[p.intensity]}, ${WORD.music[p.music]}`;
}
const cap = (t: string) => t[0].toUpperCase() + t.slice(1);

/** Quiet & dim: leave out classes members rate loud or bright; "not enough ratings" stay. */
export function quietDimHides(c: ClassInfo): boolean {
  const v = memberView(c);
  const loud = v.music.n >= MIN_RATINGS && v.music.level === 'loud';
  const bright = v.light.n >= MIN_RATINGS && v.light.level === 'bright';
  return loud || bright;
}

export function energyList(s: EnergyState) {
  const sorted = sortClasses(classes, s);
  const shown = s.quietDim ? sorted.filter((c) => !quietDimHides(c)) : sorted;
  return { shown, hidden: sorted.length - shown.length };
}
