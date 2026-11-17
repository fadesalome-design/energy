import { Link } from 'react-router-dom';
import { getClass } from '../data/classes';
import {
  devCheckIn, devEndClass, devReopenApp, devResetFeedback, devSetStamps, latestBooking, now, useFeedbackState,
} from '../lib/feedback';
import { isDevMode, setVariant, useVariant } from '../lib/variant';

/**
 * Thin test-mode bar, only visible with ?dev=1 (remembered until ?dev=0).
 * Lets the moderator switch A/B during a usability test, and simulate the
 * after-class feedback flow: QR check-in, class end, reopening the app.
 */
export function DevToggle() {
  const variant = useVariant();
  useFeedbackState(); // re-render on booking / clock changes
  if (!isDevMode()) return null;

  const b = latestBooking();
  const ended = b ? Date.parse(b.endsAt) <= now() : false;
  const status = !b
    ? 'No booking yet. Book a class first.'
    : `${getClass(b.classId)?.name ?? b.classId} · ${b.checkedIn ? 'checked in' : 'not checked in'} · ${
        ended ? 'ended' : 'not ended'
      }${b.feedback === 'submitted' ? ' · answered' : ''}`;

  return (
    <div className="devbar" role="region" aria-label="Test mode">
      <div className="devbar__row">
        <span>Test mode</span>
        <div className="devbar__seg" role="group" aria-label="Variant">
          {(['a', 'b'] as const).map((v) => (
            <button key={v} type="button" aria-pressed={variant === v} onClick={() => setVariant(v)}>
              {v.toUpperCase()}
            </button>
          ))}
        </div>
        <Link to="/debug">Debug</Link>
      </div>
      <div className="devbar__row devbar__row--fb">
        <span className="devbar__status">Feedback: {status}</span>
        <div className="devbar__btns">
          <button type="button" disabled={!b || b.checkedIn} onClick={devCheckIn}>Scan QR</button>
          <button type="button" disabled={!b || ended} onClick={devEndClass}>End class</button>
          <button type="button" onClick={devReopenApp}>Reopen app</button>
          <button type="button" onClick={() => devSetStamps(9)}>Stamps = 9</button>
          <button type="button" onClick={() => confirm('Reset bookings, stamps and clock?') && devResetFeedback()}>Reset</button>
        </div>
      </div>
    </div>
  );
}
