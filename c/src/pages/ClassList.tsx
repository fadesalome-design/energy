import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { byStart, classes } from '../data/classes';
import { ClassRow } from '../components/ClassRow';
import { Icon } from '../components/Icon';
import { ClassFilters } from '../components/ClassFilters';
import { SimulateVisit, useOpenBooking } from '../components/SimulateVisit';
import { orderD, useFilters } from '../lib/filters';
import { useVariant } from '../lib/variant';
import { byDistance, usePlace } from '../lib/location';

/** Today's date in English, e.g. "Sunday, 15 November" */
function todayLabel() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function ClassList() {
  const location = useLocation();
  const skipped = (location.state as { skipped?: string } | null)?.skipped;
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    document.title = 'Classes today · Urban Sports Clue';
    if (skipped) statusRef.current?.focus();
  }, [skipped]);

  const variant = useVariant();
  const openBooking = useOpenBooking();
  const { mood, goal, prefs, sort: sortB } = useFilters();
  usePlace(); // D: Nearest follows the chosen place
  const byTime = [...classes].sort(byStart); // real times, earliest first
  // Version B: "Nearest" sorts by distance (ties keep time order). Sorting never hides.
  const sorted = variant === 'b' && sortB === 'nearest' ? byDistance(byTime) : byTime;
  const withLocation = true; // D: distances always shown
  // D: mood + filters re-sort (best match first, then the rest; each group in time or
  // distance order). Nothing is hidden.
  const sorting = mood !== null || prefs.length > 0;
  const groups = orderD(sorted, mood, goal, prefs);
  const shown = sorted;

  return (
    <main className="page" id="main">
      <header className={withLocation ? 'list-head list-head--plain' : 'list-head'}>
        <p className="eyebrow">Berlin · {todayLabel()}</p>
        <h1>Classes today</h1>
        {/* D: place, sort and filters all live in the Energy Match card below */}
      </header>

      {/* Research: F-NOT-TODAY ("not for me today" is about today, so we confirm kindly without judging) */}
      {skipped && (
        <p className="notice" role="status" tabIndex={-1} ref={statusRef}>
          Okay, {skipped} isn't for today. Good to know what suits you.
        </p>
      )}

      {/* Tester link: a booked class waiting for its "visit" */}
      {openBooking && <SimulateVisit booking={openBooking} compact />}

      {/* D desktop: two columns (card left, sticky; class grid right). On mobile these
          wrappers are display: contents, so the page is exactly the same as before. */}
      <div className="dl">
      <aside className="dl__side" aria-label="Energy Match">
      {variant === 'b' && <ClassFilters />}

      {/* Results row (from Version B), only while a mood or a sensory filter is on.
          "Clear all" now lives in the Energy Match card. D never hides classes: X are the
          classes that fit, the rest follow under "Other classes". */}
      {sorting && (
        <p className="filter-count filter-count--d" role="status">
          Showing {groups.best.length} of {sorted.length} classes
        </p>
      )}

      </aside>
      <section className="dl__main" aria-label="Classes today">
      {variant === 'b' && sorting ? (
        <>
          {/* D: shown while Energy Match or a filter is on. Nothing is hidden. */}
          <p className="bestfirst" role="status">
            <Icon name="sparkle" size={16} />
            {mood ? 'Best match first' : 'Matching your filters first'}
          </p>
          {groups.best.length > 0 && (
            <ul className="rows" aria-label="Best match">
              {groups.best.map((c) => <ClassRow key={c.id} c={c} distance={withLocation} />)}
            </ul>
          )}
          {groups.other.length > 0 && (
            <>
              <p className="rows__divider" id="other-title">Other classes</p>
              <ul className="rows" aria-labelledby="other-title">
                {groups.other.map((c) => <ClassRow key={c.id} c={c} distance={withLocation} />)}
              </ul>
            </>
          )}
        </>
      ) : shown.length > 0 ? (
        <ul className="rows" aria-label="Classes">
          {shown.map((c) => (
            <ClassRow key={c.id} c={c} distance={withLocation} />
          ))}
        </ul>
      ) : (
        <div className="empty">
          <p><strong>No classes fit all of these today.</strong></p>
          <p className="muted">Try turning off one filter. Every class still has a "What to expect" card.</p>
        </div>
      )}
      </section>
      </div>
    </main>
  );
}
