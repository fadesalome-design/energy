import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { classes } from '../data/classes';
import { ClassRow } from '../components/ClassRow';

/** Today's date in English, e.g. "Sunday, 15 November" */
function todayLabel() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function ClassList() {
  const location = useLocation();
  const skipped = (location.state as { skipped?: string } | null)?.skipped;
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    document.title = 'Classes today · Klassly';
    if (skipped) statusRef.current?.focus();
  }, [skipped]);

  const sorted = [...classes].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <main className="page" id="main">
      <header className="list-head">
        <p className="eyebrow">Berlin · {todayLabel()}</p>
        <h1>Classes today</h1>
      </header>

      {/* Research: F-NOT-TODAY ("not for me today" is about today, so we confirm kindly without judging) */}
      {skipped && (
        <p className="notice" role="status" tabIndex={-1} ref={statusRef}>
          Okay, {skipped} isn't for today. Good to know what suits you.
        </p>
      )}

      <ul className="rows" aria-label="Classes">
        {sorted.map((c) => (
          <ClassRow key={c.id} c={c} />
        ))}
      </ul>
    </main>
  );
}
