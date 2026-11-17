import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { classes } from '../data/classes';
import { ClassRow } from '../components/ClassRow';
import { Icon } from '../components/Icon';
import { ClassFilters } from '../components/ClassFilters';
import { SimulateVisit, useOpenBooking } from '../components/SimulateVisit';
import { applyFilters, setMood, setPrefs, useFilters } from '../lib/filters';
import { useVariant } from '../lib/variant';
import { EnergyCheckIn, QuietDimChip } from '../components/EnergyCheckIn';
import { energyList, reasonLine, useEnergy } from '../lib/energy';

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
  const { mood, prefs } = useFilters();
  const sorted = [...classes].sort((a, b) => a.start.localeCompare(b.start));
  // Version B: mood + sensory filters. Version A shows every class.
  const filtering = variant === 'b' && (mood !== null || prefs.length > 0);
  // Version E (Energy Match): the check-in re-sorts (never hides); only Quiet & dim leaves classes out.
  const energy = useEnergy();
  const e = variant === 'e' ? energyList(energy) : null;
  const shown = e ? e.shown : variant === 'b' ? applyFilters(sorted, mood, prefs) : sorted;

  return (
    <main className="page" id="main">
      <header className="list-head">
        <p className="eyebrow">Berlin · {todayLabel()}</p>
        <h1>Classes today</h1>
        {/* Playful copy on the app name. Research: F-UNSURE (tell people the clue is one tap away) */}
        {/* Version E: a hand, not a magnifier (testers read the magnifier as search and tapped it) */}
        <p className="list-hint">
          <Icon name={variant === 'e' ? 'hand' : 'clue'} size={18} /> Tap a class to read the room before you go.
        </p>
      </header>

      {/* Research: F-NOT-TODAY ("not for me today" is about today, so we confirm kindly without judging) */}
      {skipped && (
        <p className="notice" role="status" tabIndex={-1} ref={statusRef}>
          Okay, {skipped} isn't for today. Good to know what suits you.
        </p>
      )}

      {/* Tester link: a booked class waiting for its "visit" */}
      {openBooking && <SimulateVisit booking={openBooking} compact />}

      {variant === 'b' && <ClassFilters />}
      {variant === 'e' && (
        <>
          <EnergyCheckIn />
          <QuietDimChip hidden={e!.hidden} />
        </>
      )}

      {filtering && (
        <p className="filter-count" role="status">
          Showing {shown.length} of {sorted.length} classes
          <button
            type="button"
            className="linkbtn"
            onClick={() => {
              setMood(null);
              setPrefs([]);
            }}
          >
            Clear all
          </button>
        </p>
      )}

      {shown.length > 0 ? (
        <ul className="rows" aria-label="Classes">
          {shown.map((c) => (
            <ClassRow key={c.id} c={c} reason={e ? reasonLine(c, energy) : undefined} />
          ))}
        </ul>
      ) : (
        <div className="empty">
          <p><strong>No classes fit all of these today.</strong></p>
          <p className="muted">Try turning off one filter. Every class still has a "What to expect" card.</p>
        </div>
      )}
    </main>
  );
}
