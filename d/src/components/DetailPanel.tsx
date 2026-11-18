import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ClassDetail } from '../pages/ClassDetail';
import { Icon } from './Icon';

/**
 * SANDBOX D, desktop only: the "What to expect" detail as a side panel on the right,
 * over the class grid. Close with ×, Escape or a click on the dimmed list.
 */
export function DetailPanel() {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const close = () => navigate('/');
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
    <div className="dpanel" role="dialog" aria-modal="true" aria-label="Class details">
      <button type="button" className="dpanel__backdrop" aria-label="Close" tabIndex={-1} onClick={close} />
      <div className="dpanel__panel" ref={panelRef}>
        <button type="button" className="dpanel__close" onClick={close} aria-label="Close class details">
          <Icon name="x" size={22} />
        </button>
        <ClassDetail panel />
      </div>
    </div>,
    document.body,
  );
}
