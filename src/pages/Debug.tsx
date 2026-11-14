/**
 * Hidden /debug page for the moderator. Not linked anywhere except the test-mode bar.
 * Shows the success metrics per variant and exports raw events as JSON.
 * Research: F-CARD (booking rate after card, "not for me" rate, new class types booked, time to decide)
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ClassType } from '../data/classes';
import { clearEvents, getEvents, getSession, startNewSession, type LoggedEvent } from '../lib/events';
import { typeLabel } from '../lib/labels';
import { readJSON, writeJSON } from '../lib/storage';

const FAMILIAR_KEY = 'rtr.familiarTypes';

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function pct(n: number, d: number) {
  return d ? `${Math.round((n / d) * 100)}%` : '–';
}

function metrics(events: LoggedEvent[], familiar: string[]) {
  const views = events.filter((e) => e.event === 'class_viewed').length;
  const books = events.filter((e) => e.event === 'book_clicked');
  const nfm = events.filter((e) => e.event === 'not_for_me_clicked').length;
  // "New" class type = booked type the participant isn't familiar with, counted once per session
  const newTypes = new Set(
    books
      .filter((e) => e.classType && !familiar.includes(e.classType))
      .map((e) => `${e.session}:${e.classType}`),
  ).size;
  const decide = events
    .filter((e) => e.event === 'time_on_detail' && e.data?.outcome !== 'left')
    .map((e) => Number(e.data?.ms) / 1000);
  const med = median(decide);
  return {
    views,
    books: books.length,
    bookingRate: pct(books.length, views),
    nfm,
    nfmRate: pct(nfm, views),
    newTypes,
    decideMedian: med == null ? '–' : `${med.toFixed(1)} s`,
    sessions: new Set(events.map((e) => e.session)).size,
  };
}

export function Debug() {
  const [events, setEvents] = useState(getEvents);
  const [session, setSession] = useState(getSession);
  const [familiar, setFamiliar] = useState<string[]>(() => readJSON<string[]>(FAMILIAR_KEY, []));

  useEffect(() => {
    document.title = 'Debug · Klassly';
  }, []);

  const byVariant = useMemo(
    () => ({
      a: metrics(events.filter((e) => e.variant === 'a'), familiar),
      b: metrics(events.filter((e) => e.variant === 'b'), familiar),
    }),
    [events, familiar],
  );

  const exportJson = () => {
    const payload = { exportedAt: new Date().toISOString(), familiarTypes: familiar, events };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `read-the-room-events-${new Date().toISOString().slice(0, 16).replace(':', '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFamiliar = (t: string) => {
    const next = familiar.includes(t) ? familiar.filter((x) => x !== t) : [...familiar, t];
    setFamiliar(next);
    writeJSON(FAMILIAR_KEY, next);
  };

  const rows: [string, keyof ReturnType<typeof metrics>][] = [
    ['Sessions', 'sessions'],
    ['Class views', 'views'],
    ['Book clicks', 'books'],
    ['Booking rate after viewing a card', 'bookingRate'],
    ['"Not for me" clicks', 'nfm'],
    ['"Not for me" rate', 'nfmRate'],
    ['New class types booked', 'newTypes'],
    ['Median time to decide', 'decideMedian'],
  ];

  return (
    <main className="page debug" id="main">
      <Link to="/" className="back">← Classes</Link>
      <h1>Debug & results</h1>
      <p className="muted small">Current session: <code>{session}</code> · {events.length} events stored</p>

      <div className="debug__actions">
        <button type="button" className="btn btn--primary" onClick={exportJson}>Export results (JSON)</button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => setSession(startNewSession())}
        >
          New participant session
        </button>
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => {
            if (confirm('Delete all stored events?')) {
              clearEvents();
              setEvents([]);
            }
          }}
        >
          Clear all events
        </button>
      </div>

      <section className="card">
        <h2>Metrics by variant</h2>
        <table className="table">
          <thead>
            <tr><th scope="col">Metric</th><th scope="col">A</th><th scope="col">B</th></tr>
          </thead>
          <tbody>
            {rows.map(([label, key]) => (
              <tr key={key}>
                <th scope="row">{label}</th>
                <td>{byVariant.a[key]}</td>
                <td>{byVariant.b[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted small">
          Time to decide = time on the detail screen before "Book" or "Not for me today".
        </p>
      </section>

      <section className="card">
        <h2>Types the participant already knows</h2>
        <p className="muted small">Tick these before the session. Bookings of other types count as "new".</p>
        <div className="chips">
          {(Object.keys(typeLabel) as ClassType[]).map((t) => (
            <label key={t} className="chip chip--check">
              <input type="checkbox" checked={familiar.includes(t)} onChange={() => toggleFamiliar(t)} />
              {typeLabel[t]}
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Latest events</h2>
        <ol className="eventlog">
          {[...events].reverse().slice(0, 50).map((e, i) => (
            <li key={i}>
              <code>{new Date(e.timestamp).toLocaleTimeString("en-GB")}</code> <strong>{e.event}</strong> [{e.variant}]{' '}
              {e.classId ?? ''} {e.data ? JSON.stringify(e.data) : ''}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
