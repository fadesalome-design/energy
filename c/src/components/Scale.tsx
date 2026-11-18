/**
 * Dot scale (e.g. volume 4/5) and spectrum (relaxed ↔ strict).
 * Filled vs outlined dots + a visible word, so meaning never depends on colour.
 */
export function DotScale({ value, max = 5, label }: { value: number; max?: number; label: string }) {
  return (
    <span className="dots" role="img" aria-label={`${label}: ${value} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? 'dot dot--on' : 'dot'} />
      ))}
    </span>
  );
}

export function Spectrum({
  value, max = 5, left, right, label,
}: { value: number; max?: number; left: string; right: string; label: string }) {
  const pct = ((value - 1) / (max - 1)) * 100;
  return (
    <div className="spectrum">
      <div
        className="spectrum__track"
        role="img"
        aria-label={`${label}: ${value} of ${max}, from ${left} to ${right}`}
      >
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className="spectrum__tick" style={{ left: `${(i / (max - 1)) * 100}%` }} />
        ))}
        <span className="spectrum__marker" style={{ left: `${pct}%` }} />
      </div>
      <div className="spectrum__ends" aria-hidden="true">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}
