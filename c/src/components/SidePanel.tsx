import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { useBack } from '../lib/navBack';

/**
 * SANDBOX D, desktop only: ONE right-hand side panel for the class detail and the profile.
 * Same fixed rules for both (see the "DESKTOP CLASS SIDE PANEL" block in global.css):
 * min(520px, 40vw) anchored right, own scroll, dim overlay. Close with ×, Escape or a click
 * on the dimmed page.
 */
export function SidePanel({ label, children }: { label: string; children: ReactNode }) {
  const close = useBack(); // × and Esc: back to the list underneath (real history)
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div className="dpanel" role="dialog" aria-modal="true" aria-label={label}>
      <button type="button" className="dpanel__backdrop" aria-label="Close" tabIndex={-1} onClick={close} />
      <div className="dpanel__panel">
        <button type="button" className="dpanel__close" onClick={close} aria-label={`Close ${label.toLowerCase()}`}>
          <Icon name="x" size={22} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
