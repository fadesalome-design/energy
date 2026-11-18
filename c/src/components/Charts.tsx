/**
 * Small hand-built charts for the studio report (no chart library).
 * Mark specs: thin bars, 2px surface gap between segments, 4px rounded outer ends,
 * selective direct labels, legend for 2+ series, hover/focus tooltip on every mark,
 * and a table view for every chart (colour is never the only channel).
 */
import type { ReactNode } from 'react';

export interface Segment {
  key: string;
  label: string;
  value: number;
  color: string;
  /** Text colour for the direct label inside the segment */
  ink?: string;
}

export function StackedBar({
  segments, label, height = 24, showLabels = true,
}: { segments: Segment[]; label: string; height?: number; showLabels?: boolean }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const visible = segments.filter((s) => s.value > 0);
  return (
    <div className="sbar" role="img" aria-label={`${label}: ${segments.map((s) => `${s.label} ${Math.round((s.value / total) * 100)}%`).join(', ')}`} style={{ height }}>
      {visible.map((s, i) => {
        const pct = (s.value / total) * 100;
        return (
          <span
            key={s.key}
            className={`sbar__seg${i === 0 ? ' sbar__seg--first' : ''}${i === visible.length - 1 ? ' sbar__seg--last' : ''}`}
            style={{ flexGrow: s.value, background: s.color, color: s.ink ?? 'var(--on-primary)' }}
            data-tip={`${s.label}: ${s.value} (${Math.round(pct)}%)`}
            tabIndex={0}
          >
            {showLabels && pct >= 14 && <span className="sbar__lbl" aria-hidden="true">{Math.round(pct)}%</span>}
          </span>
        );
      })}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="legend">
      {items.map((i) => (
        <li key={i.label}>
          <span className="legend__sw" style={{ background: i.color }} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

/** Horizontal bars, one series: no legend (the title names it), value at the bar end. */
export function HBars({ rows, unit }: { rows: { label: string; value: number }[]; unit: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="hbars">
      {rows.map((r) => (
        <li key={r.label} className="hbars__row">
          <span className="hbars__label">{r.label}</span>
          <span className="hbars__track">
            <span
              className="hbars__bar"
              style={{ width: `${(r.value / max) * 100}%` }}
              data-tip={`${r.label}: ${r.value} ${unit}`}
              tabIndex={0}
            />
            <span className="hbars__val">{r.value}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TableView({ caption, head, rows }: { caption: string; head: string[]; rows: ReactNode[][] }) {
  return (
    <details className="tview">
      <summary>Show as table</summary>
      <table className="table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

export function StatTile({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="stat">
      <p className="stat__label">{label}</p>
      <p className="stat__value">{value}</p>
      {note && <p className="stat__note">{note}</p>}
    </div>
  );
}
