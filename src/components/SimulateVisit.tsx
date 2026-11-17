import { useNavigate } from 'react-router-dom';
import { getClass } from '../data/classes';
import { useFeedbackState, type Booking } from '../lib/feedback';
import { attendAndReopen, isTesterMode } from '../lib/tester';
import { isDevMode } from '../lib/variant';
import { Icon } from './Icon';

/**
 * Prototype-only step (tester link or test mode): stands in for scanning the QR code
 * at the studio, doing the class, and opening the app again afterwards.
 * Styled as clearly "not part of the app" (dashed frame + label), so testers don't
 * mistake it for a real feature.
 */
export function SimulateVisit({ booking, compact = false }: { booking: Booking; compact?: boolean }) {
  const navigate = useNavigate();
  const c = getClass(booking.classId);
  if (!c) return null;
  return (
    <section className={compact ? 'proto proto--compact' : 'proto'} aria-label="Prototype step">
      <p className="proto__label">Prototype step</p>
      {compact ? (
        <p>You booked <strong>{c.name}</strong> ({c.start}).</p>
      ) : (
        <p>
          In the real app you scan the QR code at the studio, do the class and open the app
          afterwards. Here you can skip ahead.
        </p>
      )}
      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={() => attendAndReopen(booking.id, () => navigate('/', { replace: true }))}
      >
        I went to this class <Icon name="chevronRight" size={20} />
      </button>
    </section>
  );
}

/** The newest booking that hasn't been "attended" yet, if the prototype step should show. */
export function useOpenBooking(classId?: string): Booking | null {
  const { bookings } = useFeedbackState();
  if (!isTesterMode() && !isDevMode()) return null;
  const open = bookings
    .filter((b) => !b.checkedIn && b.feedback === 'open' && (!classId || b.classId === classId))
    .sort((a, b) => b.bookedAt.localeCompare(a.bookedAt));
  return open[0] ?? null;
}
