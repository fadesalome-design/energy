import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { classes } from '../data/classes';
import { ClassRow } from '../components/ClassRow';
import { Icon } from '../components/Icon';

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

  const sorted = [...classes].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <main className="page" id="main">
      <header className="list-head">
        <p className="eyebrow">Berlin · {todayLabel()}</p>
        <h1>Classes today</h1>
        {/* Playful copy on the app name. Research: F-UNSURE (tell people the clue is one tap away) */}
        <p className="list-hint">
          <Icon name="clue" size={18} /> Tap a class to read the room before you go.
        </p>
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
