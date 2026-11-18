import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { endTime, getClass, getStudio } from '../data/classes';
import { typeLabel } from '../lib/labels';
import { logEvent } from '../lib/events';
import { addBooking } from '../lib/feedback';
import { ExpectCard } from '../components/ExpectCard';
import { ExpectCardV4 } from '../components/ExpectCardV4';
import { useVariant } from '../lib/variant';
import { km, placeName, studioKm, studioMin } from '../lib/location';
import { Icon } from '../components/Icon';
import { Photo } from '../components/Photo';
import { BringList } from '../components/BringList';

type Outcome = 'book' | 'not_for_me' | 'left';

/** `panel`: D desktop side panel (no back link, no page scroll, actions inside the panel). */
export function ClassDetail({ panel = false }: { panel?: boolean }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const c = getClass(id);
  const outcome = useRef<Outcome>('left');
  const variant = useVariant();
  const titleRef = useRef<HTMLHeadingElement>(null);
  // Side panel: move focus to the class name so screen readers start there
  useEffect(() => { if (panel) titleRef.current?.focus(); }, [panel, id]);

  // Research: F-CARD (metrics: booking rate after a card view, time to decide)
  useEffect(() => {
    if (!c) return;
    document.title = `${c.name} · Urban Sports Clue`;
    if (!panel) window.scrollTo(0, 0);
    outcome.current = 'left';
    const started = performance.now();
    let sent = false;
    logEvent('class_viewed', { classId: c.id, classType: c.type });

    const sendTime = () => {
      if (sent) return;
      sent = true;
      logEvent('time_on_detail', {
        classId: c.id,
        classType: c.type,
        data: { ms: Math.round(performance.now() - started), outcome: outcome.current },
      });
    };
    window.addEventListener('pagehide', sendTime);
    return () => {
      window.removeEventListener('pagehide', sendTime);
      sendTime();
    };
  }, [c]);

  if (!c) {
    return (
      <main className="page" id="main">
        <h1>Class not found</h1>
        <Link to="/">Back to classes</Link>
      </main>
    );
  }

  const studio = getStudio(c.studioId);

  const book = () => {
    outcome.current = 'book';
    logEvent('book_clicked', { classId: c.id, classType: c.type });
    addBooking(c);
    navigate(`/class/${c.id}/booked`);
  };

  // Research: F-NOT-TODAY / F-ENERGY ("not for me *today*": no judgement, the decision is about today)
  const notForMe = () => {
    outcome.current = 'not_for_me';
    logEvent('not_for_me_clicked', { classId: c.id, classType: c.type });
    navigate('/', { state: { skipped: c.name } });
  };

  return (
    <>
      <main className={panel ? 'page page--detail page--panel' : 'page page--detail'} id={panel ? undefined : 'main'}>
        {!panel && (
          <Link to="/" className="back">
            <Icon name="arrowLeft" size={20} /> Classes
          </Link>
        )}

        {/* D: photo header (stock photo of the room; gradient + icon if it doesn't load) */}
        <Photo src={studio.photo} icon={c.type} className="detail-photo" />

        <header className="detail-head">
          <span className="chip">
            <Icon name={c.type} size={16} />
            {typeLabel[c.type]}
          </span>
          <h1 tabIndex={-1} ref={titleRef}>{c.name}</h1>
          <ul className="meta">
            <li>
              <Icon name="clock" size={18} />
              Today {c.start}–{endTime(c)} · {c.durationMin} min
            </li>
            <li>
              <Icon name="pin" size={18} />
              {studio.name}, {studio.address} · {studio.district}
            </li>
            {/* Versions B and E: distance from the demo location (Research: F-LOCATION) */}
            {(variant === 'b' || variant === 'e') && (
              <li>
                <Icon name="pin" size={18} />
                {km(studioKm(studio.id))} from {placeName()} · about {studioMin(studio.id)} min
              </li>
            )}
            <li>
              <Icon name="trainer" size={18} />
              With {c.trainer}
            </li>
          </ul>
        </header>

        {/* D: what the class is (what you do, for whom, how it feels) */}
        <p className="detail-desc">{c.description}</p>

        {/* Research: F-PROBLEM (info must come before "Book", on the detail screen) */}
        {variant === 'e' ? <ExpectCardV4 c={c} studio={studio} /> : <ExpectCard c={c} studio={studio} />}

        {/* D: the studio, clearly separate from the class */}
        <section className="detail-sec" aria-labelledby="about-studio">
          <h2 id="about-studio" className="detail-sec__title">About the studio</h2>
          <p>{studio.description}</p>
        </section>

        {/* D: "What to bring" once, as the LAST section (just above the Book bar); information only */}
        <section className="detail-sec" aria-labelledby="bring-detail">
          <h2 id="bring-detail" className="detail-sec__title">What to bring</h2>
          <BringList items={c.expect.bring} />
          <p className="arrival">
            <Icon name="clock" size={18} /> <span><strong>Best arrival:</strong> {c.expect.arrival}</span>
          </p>
        </section>
      </main>

      <div className={panel ? 'actions actions--panel' : 'actions'}>
        <div className="actions__inner">
          <button type="button" className="btn btn--primary" onClick={book}>
            Book
          </button>
          <button type="button" className="btn btn--quiet" onClick={notForMe}>
            Not for me today
          </button>
        </div>
      </div>
    </>
  );
}
