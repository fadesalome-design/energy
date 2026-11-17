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
import { SENSORY, type SensoryId } from './filters';

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

export type Category = 'level' | 'crowd' | 'clean' | 'atmosphere' | 'coaching' | 'senses';

/** Names match the card sections the answers feed. */
export const CATEGORY_LABEL: Record<Category, string> = {
  level: 'Real level',
  crowd: 'Crowd at this time',
  clean: 'Cleanliness',
  atmosphere: 'Atmosphere & people',
  coaching: 'Atmosphere & people',
  senses: 'Sound & light',
};

/** Share of a class's answers that touch each category in the sample data. */
const SAMPLE_SHARE: Record<Category, number> = { level: 0.25, crowd: 0.24, clean: 0.3, atmosphere: 0.2, coaching: 0.18, senses: 0.28 };

export interface QuestionV4 {
  id: string;
  category: Category;
  icon: string;
  prompt: string;
  /** Answers describe the class; index 0 / 1 / 2 */
  options: [string, string, string];
}

// PRD v4 question set. Only Sound & light uses "too": it measures fit, and feeds Quiet & dim.
export const QUESTIONS: QuestionV4[] = [
  { id: 'level', category: 'level', icon: 'level', prompt: 'Level compared with the label', options: ['Easier than the label', 'As the label says', 'Harder than the label'] },
  { id: 'crowd', category: 'crowd', icon: 'people', prompt: 'How full was it?', options: ['Quiet, lots of space', 'Comfortable', 'Packed'] },
  { id: 'clean', category: 'clean', icon: 'sparkle', prompt: 'How clean was it?', options: ['Clean', 'Okay', 'Not clean'] },
  { id: 'atmosphere', category: 'atmosphere', icon: 'calm', prompt: 'The atmosphere was', options: ['Calm', 'Balanced', 'High energy'] },
  { id: 'coaching', category: 'coaching', icon: 'trainer', prompt: 'Coaching style', options: ['Gentle guidance', 'Balanced', 'Pushes hard'] },
  { id: 'music', category: 'senses', icon: 'volume', prompt: 'Music was', options: ['Too quiet', 'Just right', 'Too loud'] },
  { id: 'light', category: 'senses', icon: 'sun', prompt: 'Light was', options: ['Too dim', 'Just right', 'Too bright'] },
];

const q = (id: string) => QUESTIONS.find((x) => x.id === id)!;

export interface RatingV4 {
  classId: string;
  at: string;
  expected: 'yes' | 'no' | null;
  /** question id → answer index 0 / 1 / 2 */
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

/** A member-rated topic: the most common answer (as its words) and how many members rated it. */
export interface Rated { answer: 0 | 1 | 2; words: string; n: number }

export interface MemberView {
  /** number of member ratings per category (used to pick the next questions) */
  n: Record<Category, number>;
  clean: Rated;
  crowd: Rated;
  atmosphere: Rated;
  coaching: Rated;
  music: { level: Music; n: number };
  light: { level: Light; n: number };
  level: { harder: number; easier: number; asDescribed: number; n: number };
}

const sampleCount = (c: ClassInfo, cat: Category) => Math.round(c.reports * SAMPLE_SHARE[cat]);

function majority<T extends string | number>(votes: Map<T, number>, fallback: T): T {
  let best = fallback; let bestN = -1;
  for (const [k, v] of votes) if (v > bestN) { best = k; bestN = v; }
  return best;
}

/** Tally a 0/1/2 question: sample votes on the studio's answer + this prototype's answers. */
function rated(id: string, sampleAnswer: 0 | 1 | 2, sampleN: number, mine: RatingV4[]): Rated {
  const votes = new Map<0 | 1 | 2, number>([[0, 0], [1, 0], [2, 0]]);
  votes.set(sampleAnswer, sampleN);
  let n = sampleN;
  for (const r of mine) { const a = r.answers[id]; if (a !== undefined) { votes.set(a, votes.get(a)! + 1); n++; } }
  const answer = majority(votes, sampleAnswer);
  return { answer, words: q(id).options[answer], n };
}

export function memberView(c: ClassInfo): MemberView {
  const p = profile(c);
  const x = c.expect;
  const mine = getRatingsV4().filter((r) => r.classId === c.id);
  const n = Object.fromEntries((Object.keys(SAMPLE_SHARE) as Category[]).map((k) => [k, sampleCount(c, k)])) as Record<Category, number>;
  for (const r of mine) for (const id of Object.keys(r.answers)) { const qq = QUESTIONS.find((x2) => x2.id === id); if (qq) n[qq.category]++; }

  // Sample answers follow the studio's own data, so the card starts consistent with it.
  const cleanSample: 0 | 1 | 2 = x.clean.rating == null ? 1 : x.clean.rating >= 4.3 ? 0 : x.clean.rating >= 3.5 ? 1 : 2;
  const crowdSample: 0 | 1 | 2 = p.crowd === 'small' ? 0 : p.crowd === 'medium' ? 1 : 2;
  const atmoSample: 0 | 1 | 2 = p.intensity === 'low' && p.music === 'quiet' ? 0 : p.intensity === 'high' || p.music === 'loud' ? 2 : 1;
  const coachSample: 0 | 1 | 2 = x.trainer.style <= 2 ? 0 : x.trainer.style === 3 ? 1 : 2;

  // Sound & light: "Too loud" / "Too bright" vote loud / bright; "Just right" confirms the studio's level.
  const soundN = Math.round(c.reports * 0.16);
  const lightN = Math.round(c.reports * 0.12);
  const music = new Map<Music, number>([['quiet', 0], ['medium', 0], ['loud', 0]]); music.set(p.music, soundN);
  const light = new Map<Light, number>([['dim', 0], ['normal', 0], ['bright', 0]]); light.set(p.light, lightN);
  let mN = soundN, lN = lightN;
  for (const r of mine) {
    const a = r.answers;
    if (a.music !== undefined) { const k = (['quiet', p.music, 'loud'] as Music[])[a.music]; music.set(k, music.get(k)! + 1); mN++; }
    if (a.light !== undefined) { const k = (['dim', p.light, 'bright'] as Light[])[a.light]; light.set(k, light.get(k)! + 1); lN++; }
  }

  // Real level: sample split from the existing "first-timers said the level matched" figure
  const ln = sampleCount(c, 'level');
  const disagree = Math.round(ln * (1 - x.level.firstTimerMatchPct / 100));
  const lvl = { harder: disagree, easier: 0, asDescribed: ln - disagree, n: ln };
  for (const r of mine) if (r.answers.level !== undefined) {
    lvl.n++;
    if (r.answers.level === 0) lvl.easier++; else if (r.answers.level === 2) lvl.harder++; else lvl.asDescribed++;
  }

  return {
    n,
    clean: rated('clean', cleanSample, x.clean.rating == null ? 0 : sampleCount(c, 'clean'), mine),
    crowd: rated('crowd', crowdSample, sampleCount(c, 'crowd'), mine),
    atmosphere: rated('atmosphere', atmoSample, sampleCount(c, 'atmosphere'), mine),
    coaching: rated('coaching', coachSample, sampleCount(c, 'coaching'), mine),
    music: { level: majority(music, p.music), n: mN },
    light: { level: majority(light, p.light), n: lN },
    level: lvl,
  };
}

// ---------------------------------------------------------------------------
// Picking the 3 questions (PRD G)
// ---------------------------------------------------------------------------

const LAST_SET_KEY = 'rtr.rateLastCategories';

/**
 * 3 questions from 3 different categories, fewest ratings first, and never the same
 * 3 categories twice in a row in one session. Sound & light asks about music or light,
 * whichever has fewer ratings.
 */
export function pickQuestionsV4(c: ClassInfo): QuestionV4[] {
  const v = memberView(c);
  const ordered = (Object.keys(SAMPLE_SHARE) as Category[]).sort((a, b) => v.n[a] - v.n[b]);
  let cats = ordered.slice(0, 3);
  let last: string | null = null;
  try { last = sessionStorage.getItem(LAST_SET_KEY); } catch { /* ignore */ }
  const key = (cs: Category[]) => [...cs].sort().join(',');
  if (last && key(cats) === last) cats = [ordered[0], ordered[1], ordered[3]];
  try { sessionStorage.setItem(LAST_SET_KEY, key(cats)); } catch { /* ignore */ }
  return cats.map((cat) => {
    if (cat !== 'senses') return QUESTIONS.find((x) => x.category === cat)!;
    return v.music.n <= v.light.n ? q('music') : q('light');
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

// Sensory filters (same 7 as Version B). Unlike energy, these are remembered between visits
// (PRD v4.1). Stored apart from Version B's so the two versions don't affect each other.
const SENSORY_KEY = 'rtr.sensoryPrefsE';
let sensory: SensoryId[] = readJSON<SensoryId[]>(SENSORY_KEY, []);
export function toggleSensoryE(id: SensoryId) {
  sensory = sensory.includes(id) ? sensory.filter((x) => x !== id) : [...sensory, id];
  writeJSON(SENSORY_KEY, sensory);
  emit();
}
export function clearSensoryE() {
  sensory = [];
  writeJSON(SENSORY_KEY, sensory);
  emit();
}

export function useEnergy(): EnergyState & { sensory: SensoryId[] } {
  useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => version, () => version);
  return { ...state, sensory };
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

/** Active sensory filters this class doesn't meet (studio data, like Version B). */
export function sensoryMisses(c: ClassInfo, prefs: SensoryId[]) {
  return SENSORY.filter((f) => prefs.includes(f.id) && !f.test(c));
}

/** One short reason line per class (plain words, never "safe"). */
export function reasonLine(c: ClassInfo, s: EnergyState, prefs: SensoryId[] = []): string {
  // Sensory filters re-sort; a class that misses one says which, so the order is explained.
  const misses = sensoryMisses(c, prefs);
  if (misses.length) return `Misses your filter: ${misses[0].label.toLowerCase()}${misses.length > 1 ? ` +${misses.length - 1}` : ''}`;
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

/**
 * The Version E list: energy order, then sensory filters move classes that meet all
 * of them to the top (fewest misses first; nothing hidden). Quiet & dim still leaves
 * out classes members rate loud or bright (PRD C).
 */
export function energyList(s: EnergyState, prefs: SensoryId[] = []) {
  const byEnergy = sortClasses(classes, s);
  const sorted = prefs.length
    ? [...byEnergy].sort((a, b) => sensoryMisses(a, prefs).length - sensoryMisses(b, prefs).length)
    : byEnergy;
  const shown = s.quietDim ? sorted.filter((c) => !quietDimHides(c)) : sorted;
  const matchAll = shown.filter((c) => sensoryMisses(c, prefs).length === 0).length;
  return { shown, hidden: sorted.length - shown.length, matchAll };
}
