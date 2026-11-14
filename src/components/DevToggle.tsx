import { Link } from 'react-router-dom';
import { isDevMode, setVariant, useVariant } from '../lib/variant';

/**
 * Thin test-mode bar, only visible with ?dev=1 (remembered until ?dev=0).
 * Lets the moderator switch A/B during a usability test.
 */
export function DevToggle() {
  const variant = useVariant();
  if (!isDevMode()) return null;
  return (
    <div className="devbar" role="region" aria-label="Test mode">
      <span>Test mode</span>
      <div className="devbar__seg" role="group" aria-label="Variant">
        {(['a', 'b'] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={variant === v}
            onClick={() => setVariant(v)}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>
      <Link to="/debug">Debug</Link>
    </div>
  );
}
