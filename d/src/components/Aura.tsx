/**
 * Version D: the three-dot aura above the rating questions (adapted from Version C, D's own copy
 * and D's own colours: light mint → very light lavender; the aura is the only place lavender
 * appears in D).
 *
 * level: 0 = question 1 (bottom dot lit) · 1 = question 2 (two dots, a little stronger) ·
 *        2 = question 3 and "Anything else?" (all three dots, strongest).
 * Very slow breathing and a few rising white specks; calm, never flashing. Only transform,
 * opacity and the two colour variables animate (blur is static). Under prefers-reduced-motion
 * nothing moves; only the dots and the strength change.
 *
 * label: "✦ Energy Match AI" just above the aura; 'shown' at the start, then 'gone' (dissolves).
 */
export type AuraLevel = 0 | 1 | 2;

export function Aura({ level, label = 'gone', size = 'lg' }: { level: AuraLevel; label?: 'shown' | 'gone'; size?: 'lg' | 'md' }) {
  return (
    <div className={`daura daura--l${level} daura--${size}`} aria-hidden="true">
      <span className={label === 'shown' ? 'daura-label daura-label--shown' : 'daura-label daura-label--gone'}>
        <span className="daura-label__sharp">✦ Energy Match AI</span>
        <span className="daura-label__ghost">✦ Energy Match AI</span>
      </span>
      <div className="daura__stage">
        <div className="daura__breath">
          <span className="daura__halo" />
          <span className="daura__body" />
        </div>
        <div className="daura__specks">
          {Array.from({ length: 4 }, (_, i) => <span key={i} className={`daura__speck daura__speck--${i + 1}`} />)}
        </div>
        <div className="daura__dots">
          <span className="daura__line" />
          {[3, 2, 1].map((n) => <span key={n} className={n <= level + 1 ? 'daura__dot daura__dot--on' : 'daura__dot'} />)}
        </div>
      </div>
    </div>
  );
}
