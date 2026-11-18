import { level } from '../lib/rewards';

/**
 * Version D (copied 1:1 from Version C): the 10-circle stamp grid of the current level (1–10, 11–20, 21–30), shared by
 * "Stamp collected" and the profile. Collected = a small "mini aura" (no border); empty = white
 * with a dashed border and the number. `pending` keeps the newest stamp empty until it "lands".
 */
export function StampGrid({ stamps, pending = false, landing = false }: { stamps: number; pending?: boolean; landing?: boolean }) {
  const lvl = level(stamps);
  const onCard = Math.min(Math.max(stamps - lvl.from + 1, 0), 10);
  return (
    <div className="sgrid" role="img" aria-label={`${onCard} of 10 stamps on this card (${lvl.from}–${lvl.to})`}>
      {Array.from({ length: 10 }, (_, i) => {
        const n = lvl.from + i;
        const isNew = n === stamps;
        const filled = n <= stamps && !(isNew && pending);
        return (
          <span
            key={n}
            data-stamp={n}
            className={`sgrid__slot${filled ? ' sgrid__slot--on' : ''}${isNew && landing ? ' sgrid__slot--land' : ''}`}
          >
            {!filled && n}
          </span>
        );
      })}
    </div>
  );
}
