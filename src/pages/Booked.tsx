import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { endTime, getClass, getStudio } from '../data/classes';
import { Icon } from '../components/Icon';

/**
 * Simple confirmation with a tickable "What to bring" checklist.
 * Research: F-BRING (towel, shoes, swimwear; best time to arrive)
 */
export function Booked() {
  const { id = '' } = useParams();
  const c = getClass(id);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = 'Booked · Urban Sports Clue';
    window.scrollTo(0, 0);
    headingRef.current?.focus();
  }, []);

  if (!c) {
    return (
      <main className="page" id="main">
        <h1>Class not found</h1>
        <Link to="/">Back to classes</Link>
      </main>
    );
  }
  const studio = getStudio(c.studioId);

  return (
    <main className="page" id="main">
      <div className="booked">
        <span className="booked__icon"><Icon name="check" size={32} /></span>
        <h1 tabIndex={-1} ref={headingRef}>Booked ✓</h1>
        <p className="booked__clue">You've got the clue. See you there.</p>
        <p className="booked__what">
          <strong>{c.name}</strong>
          <br />
          Today {c.start}–{endTime(c)} · {studio.name}, {studio.district}
        </p>
      </div>

      <section className="card" aria-labelledby="bring-title">
        <h2 id="bring-title">What to bring</h2>
        <ul className="checklist">
          {c.expect.bring.map((item) => (
            <li key={item}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={!!checked[item]}
                  onChange={(e) => setChecked({ ...checked, [item]: e.target.checked })}
                />
                <span className="check__box" aria-hidden="true"><Icon name="check" size={16} /></span>
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="arrival">
          <Icon name="clock" size={18} />
          <span><strong>Best arrival:</strong> {c.expect.arrival}</span>
        </p>
      </section>

      {/* Feedback flow: say up front what happens after the class (predictability matters in calm mode) */}
      <p className="after-note">
        <Icon name="stamp" size={22} />
        <span>
          <strong>At the studio:</strong> scan the QR code at reception.{' '}
          <strong>After class:</strong> next time you open the app, we'll ask 3 quick questions about
          the room. Answer them to collect a stamp.
        </span>
      </p>

      <Link to="/" className="btn btn--secondary btn--block">Back to classes</Link>
    </main>
  );
}
