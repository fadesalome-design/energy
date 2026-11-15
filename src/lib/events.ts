/**
 * Event log for the usability test. Stored in localStorage only.
 * Export from the hidden /debug page.
 * Research: F-CARD (metrics: booking rate after card, "not for me" rate,
 * new class types booked, time to decide)
 */
import { readJSON, writeJSON, remove } from './storage';
import { getVariant, type Variant } from './variant';

export type EventName =
  | 'class_viewed'
  | 'card_section_expanded'
  | 'time_on_detail'
  | 'book_clicked'
  | 'not_for_me_clicked'
  | 'energy_selected'
  | 'preference_set'
  | 'alternative_clicked'
  | 'mistake_reported'; // extra, from the PRD (not an A/B metric)

export interface LoggedEvent {
  event: EventName;
  variant: Variant;
  timestamp: string; // ISO 8601
  session: string;
  classId?: string;
  classType?: string;
  data?: Record<string, unknown>;
}

const EVENTS_KEY = 'rtr.events';
const SESSION_KEY = 'rtr.session';

function newSessionId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function getSession(): string {
  let s = readJSON<string | null>(SESSION_KEY, null);
  if (!s) {
    s = newSessionId();
    writeJSON(SESSION_KEY, s);
  }
  return s;
}

/** Start a fresh participant session (keeps old events). */
export function startNewSession(): string {
  const s = newSessionId();
  writeJSON(SESSION_KEY, s);
  return s;
}

export function logEvent(
  event: EventName,
  extra: Omit<LoggedEvent, 'event' | 'variant' | 'timestamp' | 'session'> = {},
): void {
  const entry: LoggedEvent = {
    event,
    variant: getVariant(),
    timestamp: new Date().toISOString(),
    session: getSession(),
    ...extra,
  };
  const all = readJSON<LoggedEvent[]>(EVENTS_KEY, []);
  all.push(entry);
  writeJSON(EVENTS_KEY, all);
  if (import.meta.env.DEV) console.debug('[rtr]', entry);
}

export function getEvents(): LoggedEvent[] {
  return readJSON<LoggedEvent[]>(EVENTS_KEY, []);
}

export function clearEvents(): void {
  remove(EVENTS_KEY);
}
