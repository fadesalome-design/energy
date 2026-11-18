import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { endTime, getClass } from '../data/classes';
import { counterLabel } from '../lib/rewards';
import { Icon } from './Icon';
import { dayLabel, StampDone } from './FeedbackModal';
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
        <div className="aura-head">
          <p className="aura-head__class">
            <span className="aura-head__name">{c.name}</span>
            <span className="aura-head__time">{dayLabel(last!.endsAt)} {c.start}–{endTime(c)}</span>
          </p>
          <span className="aura-stamps" aria-label={`${stamps} stamps`}>
            <Icon name="stamp" size={16} />{counterLabel(stamps)}
          </span>
        </div>
        <StampDone
          stamps={stamps}
          className={c.name}
          headingRef={headingRef}
          onClose={() => navigate('/', { replace: true })}
          onSeeRewards={() => navigate('/profile', { state: { to: 'rewards' } })}
          flyFrom={null}
        />
      </div>
    </div>,
    document.body,
  );
}
