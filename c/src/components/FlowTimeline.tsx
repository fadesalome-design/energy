import type { FlowStep } from '../data/classes';
import { intensityLabel } from '../lib/labels';
import { DotScale } from './Scale';

/**
 * Mini timeline of the class, with intensity per part.
 * Research: F-FLOW ("how the class goes step by step, and how intense it is")
 * The strip is a visual summary only (aria-hidden); the list carries the meaning.
 */
export function FlowTimeline({ steps }: { steps: FlowStep[] }) {
  const total = steps.reduce((s, x) => s + x.minutes, 0);
  return (
    <div className="flow">
      <div className="flow__strip" aria-hidden="true">
        {steps.map((s, i) => (
          <span
            key={i}
            className="flow__seg"
            style={{ flexGrow: s.minutes, height: `${20 + s.intensity * 8}px` }}
          />
        ))}
      </div>
      <ol className="flow__list">
        {steps.map((s, i) => (
          <li key={i} className="flow__step">
            <span className="flow__min">{s.minutes} min</span>
            <span className="flow__name">{s.name}</span>
            <span className="flow__int">
              <DotScale value={s.intensity} label="Intensity" />
              <span>{intensityLabel[s.intensity]}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="muted small">Total {total} min</p>
    </div>
  );
}
