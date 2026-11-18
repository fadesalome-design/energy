/**
 * Tester mode: a public link that lets a participant go through the whole loop
 * without the moderator's test bar:
 *   class list → book → "I went to this class" (simulated QR check-in + class end)
 *   → app reopens on home → rate the class → stamp → home.
 *
 *   ?tester=1  start a clean participant session (bookings, stamps, ratings cleared;
 *              older events kept for export) and remember tester mode
 *   ?tester=0  turn tester mode off
 * The parameter is removed from the address bar right away, so reloading
 * mid-test never wipes the participant's progress.
 */
import { readJSON, writeJSON } from './storage';
import { startNewSession, logEvent } from './events';
import { devReopenApp, devResetFeedback, getBookings, simulateAttended } from './feedback';

const TESTER_KEY = 'rtrD.tester';

export function initTesterFromUrl(): void {
  const url = new URL(window.location.href);
  const t = url.searchParams.get('tester');
  if (t === null) return;
  if (t === '1') {
    devResetFeedback();
    startNewSession();
    writeJSON(TESTER_KEY, true);
  } else if (t === '0') {
    writeJSON(TESTER_KEY, false);
  }
  url.searchParams.delete('tester');
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}

export function isTesterMode(): boolean {
  return readJSON<boolean>(TESTER_KEY, false) === true;
}

/** "I went to this class": check in, jump past the class end, then "reopen the app". */
export function attendAndReopen(bookingId: string, goHome: () => void): void {
  const b = getBookings().find((x) => x.id === bookingId);
  if (!b) return;
  simulateAttended(bookingId);
  logEvent('visit_simulated', { classId: b.classId });
  goHome();
  devReopenApp();
}
