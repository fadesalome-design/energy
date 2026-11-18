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

type Outcome = 'book' | 'not_for_me' | 'left';

export function ClassDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const c = getClass(id);
  const outcome = useRef<Outcome>('left');
  const variant = useVariant();

  // Research: F-CARD (metrics: booking rate after a card view, time to decide)
  useEffect(() => {
    if (!c) return;
    document.title = `${c.name} · Urban Sports Clue`;
    window.scrollTo(0, 0);
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
      <main className="page page--detail" id="main">
        <Link to="/" className="back">
          <Icon name="arrowLeft" size={20} /> Classes
        </Link>

        {/* D: photo header (stock photo of the room; gradient + icon if it doesn't load) */}
        <Photo src={studio.photo} icon={c.type} className="detail-photo" />
        <p className="detail-place muted small">{studio.description}</p>

        <header className="detail-head">
          <span className="chip">
            <Icon name={c.type} size={16} />
            {typeLabel[c.type]}
          </span>
          <h1>{c.name}</h1>
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

        {/* Research: F-PROBLEM (info must come before "Book", on the detail screen) */}
        {variant === 'e' ? <ExpectCardV4 c={c} studio={studio} /> : <ExpectCard c={c} studio={studio} />}
      </main>

      <div className="actions">
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
