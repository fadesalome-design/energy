import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getClass } from '../data/classes';
import { StampDone } from './FeedbackModal';
import { useFeedbackState } from '../lib/feedback';
import { lastStamp } from '../lib/navBack';

/**
 * "Stamp collected" as its own screen (#/stamp), the same screen the rating ends on. It exists so
 * "‹ Back" (and the browser back button) from "See your rewards" returns here instead of to the
 * class list. "Done" goes to the class list, as on the rating screen.
 */
export function StampScreen() {
  const navigate = useNavigate();
  const { stamps } = useFeedbackState();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const last = lastStamp();
  const c = last ? getClass(last.classId) : undefined;

  useEffect(() => {
    if (!c) { navigate('/', { replace: true }); return; }
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    headingRef.current?.focus();
    return () => { root?.removeAttribute('inert'); document.body.style.overflow = prev; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!c) return null;
  return createPortal(
    <div className="fb fb--d" role="dialog" aria-modal="true" aria-labelledby="fb-title">
      <div className="fb__inner">
        <StampDone
          stamps={stamps}
          className={c.name}
          headingRef={headingRef}
          onClose={() => navigate('/', { replace: true })}
          onSeeRewards={() => navigate('/profile', { state: { to: 'rewards' } })}
        />
      </div>
    </div>,
    document.body,
  );
}
