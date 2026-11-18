/**
 * After-class feedback ("How was the room?") + stamps.
 *
 * Flow: member books → scans the studio's QR code on arrival (check-in) → class ends →
 * next time they open the app, a full-screen modal asks 3 questions about the ROOM.
 * Answering earns a stamp. D's rewards (lib/rewards.ts): 10 socks · 20 guest pass or massage · 30 hoodie.
 *
 * Rules (agreed with product):
 * - Only the most recent attended class is asked about. Older ones are never asked.
 * - Attendance comes from the QR check-in, so we never ask "did you go?".
 * - The modal can be dismissed. It comes back every time the app is opened, until answered.
 * - We stop asking 7 days after the class ended (memory fades, answers get less reliable).
 * - Questions ask about the room, never about the person or their health (PRD: no health info).
 * - The prototype has no backend: everything lives in localStorage, and "time" can be
 *   fast-forwarded from the test-mode bar.
 */
import { useSyncExternalStore } from 'react';
import { readJSON, remove, writeJSON } from './storage';
import { endTime, getClass, type ClassInfo } from '../data/classes';

// ---------------------------------------------------------------------------
// Question pool
// ---------------------------------------------------------------------------

export type Level = 'low' | 'medium' | 'high';

export interface Question {
  id: string;
  /** Which row of the "What to expect" card this answer feeds */
  cardRow: string;
  icon: string;
  prompt: string;
  /** Plain words for low / medium / high. Neutral: "high" is information, not a warning. */
  options: Record<Level, string>;
}

// Research: F-SENSORY ("loud" or "busy" describe, they don't warn; some people love it)
export const QUESTION_POOL: Question[] = [
  { id: 'crowd', cardRow: 'Crowd', icon: 'people', prompt: 'How full did the room feel?',
    options: { low: 'Lots of space', medium: 'Some space', high: 'Packed' } },
  { id: 'music', cardRow: 'Sound', icon: 'volume', prompt: 'How loud was the music?',
    options: { low: 'Quiet', medium: 'Medium', high: 'Very loud' } },
  { id: 'voice', cardRow: 'Sound', icon: 'mic', prompt: 'How loud was the instructor (mic, shouting)?',
    options: { low: 'Soft', medium: 'Medium', high: 'Very loud' } },
  { id: 'light', cardRow: 'Light', icon: 'sun', prompt: 'How bright or changing were the lights?',
    options: { low: 'Soft', medium: 'Normal', high: 'Bright or flashing' } },
  { id: 'air', cardRow: 'Clean & air', icon: 'wind', prompt: 'How did the air feel?',
    options: { low: 'Fresh', medium: 'Okay', high: 'Hot or stuffy' } },
  { id: 'smell', cardRow: 'Clean & air', icon: 'scent', prompt: 'How strong were smells (scents, sweat, cleaning products)?',
    options: { low: 'None', medium: 'Some', high: 'Strong' } },
  { id: 'touch', cardRow: 'Trainer & touch', icon: 'hand', prompt: 'How much hands-on correction or partner contact was there?',
    options: { low: 'None', medium: 'A little', high: 'A lot' } },
  { id: 'pace', cardRow: 'Class flow', icon: 'flow', prompt: 'How predictable was the class?',
    options: { low: 'Easy to follow', medium: 'Some surprises', high: 'Hard to follow' } },
  { id: 'break', cardRow: 'Leaving early', icon: 'door', prompt: 'How easy was it to take a break or step out?',
    options: { low: 'Easy', medium: 'Possible', high: 'Hard' } },
  { id: 'changing', cardRow: 'Facilities', icon: 'changing', prompt: 'How busy was the changing room?',
    options: { low: 'Quiet', medium: 'Some people', high: 'Crowded' } },
];

export const QUESTIONS_PER_FEEDBACK = 3;

/**
 * Weights: questions about things the card can't describe yet ("Not described yet")
 * are more likely to be picked, so each answer fills a real gap.
 */
function weightFor(q: Question, c: ClassInfo): number {
  const x = c.expect;
  switch (q.id) {
    case 'voice': return x.sound.mic === null ? 3 : 1;
    case 'air': return x.clean.ventilation === null || x.clean.temperature === null ? 3 : 1;
    case 'smell': return 2; // never on the card yet
    case 'touch': return x.trainer.handsOn && x.trainer.asksBeforeTouch === null ? 3 : 1;
    case 'break': return x.quietSpace === null ? 3 : 1;
    case 'music': return c.recentReport?.toLowerCase().includes('loud') ? 3 : 1;
    case 'crowd': return c.recentReport?.toLowerCase().match(/busy|crowd|full/) ? 3 : 1;
    default: return 1;
  }
}

/** Small seeded RNG so a booking always gets the same 3 questions, even after "Not now". */
function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function pickQuestions(c: ClassInfo, seed: string): Question[] {
  const rand = seededRandom(seed);
  const pool = QUESTION_POOL.map((q) => ({ q, w: weightFor(q, c) }));
  const picked: Question[] = [];
  while (picked.length < QUESTIONS_PER_FEEDBACK && pool.length) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = rand() * total;
    const i = pool.findIndex((p) => (r -= p.w) < 0);
    picked.push(pool.splice(i === -1 ? pool.length - 1 : i, 1)[0].q);
  }
  return picked;
}

// ---------------------------------------------------------------------------
// State: bookings, simulated clock, stamps
// ---------------------------------------------------------------------------

export interface Booking {
  id: string;
  classId: string;
  bookedAt: string;
  /** ISO time the class ends (classes are "today" in the prototype) */
  endsAt: string;
  /** From the studio's QR scan */
  checkedIn: boolean;
  feedback: 'open' | 'submitted' | 'skipped';
}

export type MatchAnswer = 'yes' | 'partly' | 'no';

export interface Submission {
  bookingId: string;
  classId: string;
  submittedAt: string;
  answers: Record<string, Level>;
  match: MatchAnswer | null;
  message: { kind: 'none' } | { kind: 'text'; text: string } | { kind: 'voice'; seconds: number };
  /**
   * D: the 3 rating questions (PRD v4 categories) with their descriptive answers, saved in the
   * SAME record as the card answer and the message, so the AI feature can read one record.
   */
  questions?: { id: string; category: string; cardSection: string; prompt: string; answer: string; answerIndex: 0 | 1 | 2 }[];
}

const BOOKINGS_KEY = 'c_rtr.bookings';
const STAMPS_KEY = 'c_rtr.stamps';
const OFFSET_KEY = 'c_rtr.clockOffsetMs';
const SUBMISSIONS_KEY = 'c_rtr.feedback';

export const STAMPS_FOR_REWARD = 10;
const ASK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** In memory only: "Not now" lasts until the app is opened again. */
let dismissedThisLaunch = false;
/** Bumps on every (simulated) app open. The modal is only checked for at launch, never mid-session. */
let launchId = 1;
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version++;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** The prototype's clock (real time + the test-mode fast-forward). */
export function now(): number {
  return Date.now() + readJSON<number>(OFFSET_KEY, 0);
}

export function getBookings(): Booking[] {
  return readJSON<Booking[]>(BOOKINGS_KEY, []);
}

function saveBookings(b: Booking[]) {
  writeJSON(BOOKINGS_KEY, b);
  emit();
}

export function getStamps(): number {
  return readJSON<number>(STAMPS_KEY, 0);
}

export function getSubmissions(): Submission[] {
  return readJSON<Submission[]>(SUBMISSIONS_KEY, []);
}

function endsAtToday(c: ClassInfo): string {
  const [h, m] = endTime(c).split(':').map(Number);
  const d = new Date(now());
  d.setHours(h, m, 0, 0);
  // Classes that end after midnight (none today, but be safe)
  if (endTime(c) < c.start) d.setDate(d.getDate() + 1);
  return d.toISOString();
}

export function addBooking(c: ClassInfo): Booking {
  const b: Booking = {
    id: `b-${Date.now().toString(36)}`,
    classId: c.id,
    bookedAt: new Date(now()).toISOString(),
    endsAt: endsAtToday(c),
    checkedIn: false,
    feedback: 'open',
  };
  saveBookings([...getBookings(), b]);
  return b;
}

/** Newest booking first, by when the class ends. */
function latest(bookings: Booking[], filter: (b: Booking) => boolean = () => true) {
  return [...bookings].filter(filter).sort((a, b) => b.endsAt.localeCompare(a.endsAt))[0];
}

/**
 * The one booking we may ask about right now, or null.
 * Only the most recent attended + finished class counts; if that one is answered
 * or too old, we don't fall back to older classes.
 */
export function pendingFeedback(): Booking | null {
  const t = now();
  const b = latest(getBookings(), (x) => x.checkedIn && Date.parse(x.endsAt) <= t);
  if (!b || b.feedback !== 'open') return null;
  if (t - Date.parse(b.endsAt) > ASK_WINDOW_MS) return null;
  if (!getClass(b.classId)) return null;
  return b;
}

export function shouldShowFeedback(): boolean {
  return !dismissedThisLaunch && pendingFeedback() !== null;
}

export function getLaunchId(): number {
  return launchId;
}

export function dismissFeedback() {
  dismissedThisLaunch = true;
  emit();
}

export function submitFeedback(s: Submission): number {
  writeJSON(SUBMISSIONS_KEY, [...getSubmissions(), s]);
  saveBookings(getBookings().map((b) => (b.id === s.bookingId ? { ...b, feedback: 'submitted' } : b)));
  const stamps = getStamps() + 1;
  writeJSON(STAMPS_KEY, stamps);
  emit();
  return stamps;
}

/**
 * Energy Match (Version E): "Skip" means don't ask about this class again (no reminders),
 * and a finished rating earns a stamp like in the other versions.
 */
export function closeBooking(bookingId: string, status: 'submitted' | 'skipped'): number {
  saveBookings(getBookings().map((b) => (b.id === bookingId ? { ...b, feedback: status } : b)));
  if (status === 'skipped') return getStamps();
  const stamps = getStamps() + 1;
  writeJSON(STAMPS_KEY, stamps);
  emit();
  return stamps;
}

/** Re-renders when bookings, stamps, clock or dismissal change. */
export function useFeedbackState() {
  useSyncExternalStore(subscribe, () => version, () => version);
  return {
    show: shouldShowFeedback(),
    pending: pendingFeedback(),
    stamps: getStamps(),
    bookings: getBookings(),
    launchId,
  };
}

// ---------------------------------------------------------------------------
// Test-mode controls (dev bar)
// ---------------------------------------------------------------------------

export function latestBooking(): Booking | undefined {
  return latest(getBookings());
}

/** Simulates scanning the studio's QR code for the latest booking. */
export function devCheckIn() {
  const b = latestBooking();
  if (!b) return;
  saveBookings(getBookings().map((x) => (x.id === b.id ? { ...x, checkedIn: true } : x)));
}

/**
 * Tester mode: mark one specific booking as attended (QR check-in) and move the
 * clock to just after it ends, so it becomes the class we ask about.
 */
export function simulateAttended(bookingId: string) {
  const b = getBookings().find((x) => x.id === bookingId);
  if (!b) return;
  const needed = Date.parse(b.endsAt) + 60_000 - Date.now();
  writeJSON(OFFSET_KEY, Math.max(needed, readJSON<number>(OFFSET_KEY, 0)));
  // The simulated visit "just ended", so it is always the most recent class we ask about,
  // even if an earlier-in-the-day class was booked after a later one.
  const endedAt = new Date(now() - 60_000).toISOString();
  saveBookings(getBookings().map((x) => (x.id === bookingId ? { ...x, checkedIn: true, endsAt: endedAt } : x)));
}

/** The newest booking for a class (by when it was made). */
export function latestBookingFor(classId: string): Booking | undefined {
  return [...getBookings()].filter((b) => b.classId === classId).sort((a, b) => b.bookedAt.localeCompare(a.bookedAt))[0];
}

/** Fast-forwards the clock to 1 minute after the latest booked class ends. */
export function devEndClass() {
  const b = latestBooking();
  if (!b) return;
  const needed = Date.parse(b.endsAt) + 60_000 - Date.now();
  writeJSON(OFFSET_KEY, Math.max(needed, readJSON<number>(OFFSET_KEY, 0)));
  emit();
}

/** Same as closing and opening the app again: "Not now" is forgotten. */
export function devReopenApp() {
  dismissedThisLaunch = false;
  launchId++;
  emit();
}

export function devSetStamps(n: number) {
  writeJSON(STAMPS_KEY, n);
  emit();
}

export function devResetFeedback() {
  // D: reward claims ('c_rtr.rewards') reset together with the stamps
  [BOOKINGS_KEY, STAMPS_KEY, OFFSET_KEY, SUBMISSIONS_KEY, 'c_rtr.rewards'].forEach(remove);
  dismissedThisLaunch = false;
  emit();
}
