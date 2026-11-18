/**
 * Version C: the THREE-DOT ENERGY AURA of the rating flow.
 * A soft halo plus a slightly tall blurred aura (colour A in the lower centre → colour B →
 * transparent). It breathes (5.5 s), wobbles (~10 s) and sends up a few white specks. Three dots
 * on a vertical line inside it show which question the member is on (bottom dot = question 1).
 *
 * level: 0 = question 1 · 1 = question 2 · 2 = question 3 · 3 = AI moment (strongest, never more).
 * Only transform, opacity and the two colour variables animate (blur is static). The colours are
 * registered with @property so they fade; without it they switch instantly. Under
 * prefers-reduced-motion nothing moves and every change is instant.
 *
 * label: "✦ Energy Match AI" ABOVE the aura. 'shown' / 'gone' (dissolves) / 'none' (no label).
 */
export type AuraLevel = 0 | 1 | 2 | 3;

export function Aura({ level, label = 'gone', size = 'lg' }: { level: AuraLevel; label?: 'shown' | 'gone' | 'none'; size?: 'lg' | 'md' | 'sm' }) {
  const lit = level === 0 ? 1 : level === 1 ? 2 : 3;
  return (
    <div className={`aura aura--l${level} aura--${size}`} aria-hidden="true">
      {label !== 'none' && (
        <span className={label === 'shown' ? 'aura-label aura-label--shown' : 'aura-label aura-label--gone'}>
          <span className="aura-label__sharp">✦ Energy Match AI</span>
          <span className="aura-label__ghost">✦ Energy Match AI</span>
        </span>
      )}
      <div className="aura__stage">
        <div className="aura__breath">
          <span className="aura__halo" />
          <span className="aura__body" />
        </div>
        <div className="aura__specks">
          {Array.from({ length: 8 }, (_, i) => <span key={i} className={`aura__speck aura__speck--${i + 1}`} />)}
        </div>
        {size !== 'sm' && (
          <div className="aura__dots">
            <span className="aura__line" />
            {[3, 2, 1].map((n) => <span key={n} className={n <= lit ? 'aura__dot aura__dot--on' : 'aura__dot'} />)}
          </div>
        )}
      </div>
    </div>
  );
}
