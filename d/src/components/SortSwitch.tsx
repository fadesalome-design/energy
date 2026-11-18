import { DEMO_LOCATION } from '../lib/location';
import { Icon } from './Icon';

/**
 * "Sort: Time · Nearest" segmented control (Versions B and E).
 * Each option is a ≥ 44 px button; the selected one is filled AND marked with a tick,
 * so it never relies on colour alone. Sorting never hides classes.
 */
export function SortSwitch<T extends string>({
  options, value, onChange,
}: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="sortsw">
      <span className="sortsw__label" id="sort-label">Sort:</span>
      <div className="sortsw__seg" role="group" aria-labelledby="sort-label">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            className={value === o.id ? 'sortsw__opt sortsw__opt--on' : 'sortsw__opt'}
            onClick={() => value !== o.id && onChange(o.id)}
          >
            {value === o.id && <Icon name="check" size={16} />}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** "You're near: Kreuzberg" — one fixed demo location. */
export function NearLine() {
  return (
    <p className="near">
      <Icon name="pin" size={16} /> You're near: <strong>{DEMO_LOCATION}</strong>
    </p>
  );
}
