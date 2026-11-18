/**
 * Version C: the soft blurred aura of the rating flow. Two stacked blurred layers (base + glow)
 * with no visible edge, breathing (scale), slowly turning and stretching (the "morph"), with
 * blurred halos that radiate out and fade. Each answer moves it one level up: stronger and a
 * new colour (peach → pink → lavender → warm mix). Never stronger than level 3, no flashing.
 *
 * Only transform, opacity and the three colour variables animate (blur is static). The colours
 * are registered with @property in global.css so they fade; without @property they switch
 * instantly. Under prefers-reduced-motion nothing moves and every change is instant.
 *
 * label: 'shown' = "✦ Energy Match AI" visible in the centre; 'gone' = it dissolves into the aura;
 * 'none' = no label at all (e.g. behind the medal on Stamp collected).
 */
export type AuraLevel = 0 | 1 | 2 | 3;

export function Aura({ level, label = 'gone', size = 'lg' }: { level: AuraLevel; label?: 'shown' | 'gone' | 'none'; size?: 'lg' | 'md' | 'sm' }) {
  return (
    <div className={`aura aura--l${level} aura--${size}`} aria-hidden="true">
      <div className="aura__breath">
        <span className="aura__halo aura__halo--1" />
        <span className="aura__halo aura__halo--2" />
        <span className="aura__halo aura__halo--3" />
        <span className="aura__base" />
        <span className="aura__glow" />
      </div>
      {label !== 'none' && (
        <span className={label === 'shown' ? 'aura-label aura-label--shown' : 'aura-label aura-label--gone'}>
          <span className="aura-label__sharp">✦ Energy Match AI</span>
          <span className="aura-label__ghost">✦ Energy Match AI</span>
        </span>
      )}
    </div>
  );
}
