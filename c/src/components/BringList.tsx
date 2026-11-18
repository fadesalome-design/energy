/**
 * "What to bring" as information only (Versions B and E): a small icon + the item.
 * No tick boxes, nothing to tap, so it doesn't read as a checklist to fill in.
 * The emoji are decorative (aria-hidden); the text carries the meaning.
 */
const ICONS: [RegExp, string][] = [
  [/mat|yoga/i, '🧘'],
  [/towel/i, '🧺'],
  [/water|bottle/i, '💧'],
  [/padlock|lock/i, '🔒'],
  [/sock|bare feet/i, '🧦'],
  [/trainer|shoe/i, '👟'],
  [/swimwear|swim cap|goggles/i, '🏊'],
  [/flip-flop/i, '🩴'],
  [/hand wrap/i, '🥊'],
  [/layer|clothes/i, '👕'],
];

export const bringIcon = (item: string) => ICONS.find(([re]) => re.test(item))?.[1] ?? '•';

export function BringList({ items }: { items: string[] }) {
  return (
    <ul className="bringlist">
      {items.map((item) => (
        <li key={item}>
          <span className="bringlist__icon" aria-hidden="true">{bringIcon(item)}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
