import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { classes } from '../data/classes';
import { logEvent } from '../lib/events';
import {
  applyFilters, MOODS, SENSORY, setMood, setPrefs, useFilters, type Mood, type SensoryId,
} from '../lib/filters';
import { Icon } from './Icon';

/**
 * Version B filters above the class list:
 * 1. "How are you today?" — one tap: Tired / Stressed / Energetic (tap again to clear).
 * 2. "Sensory filters" pill — opens a sheet with on/off settings (low light, quiet music…).
 * Active sensory filters show as removable chips, so nothing is hidden silently.
 */
export function ClassFilters() {
  const { mood, prefs } = useFilters();
  const [open, setOpen] = useState(false);
  const moodInfo = MOODS.find((m) => m.id === mood);

  const pickMood = (m: Mood) => {
    const next = mood === m ? null : m;
    setMood(next);
    logEvent('energy_selected', { data: { mood: next ?? 'cleared' } });
  };

  const togglePref = (id: SensoryId) => {
    const on = !prefs.includes(id);
    setPrefs(on ? [...prefs, id] : prefs.filter((p) => p !== id));
    logEvent('preference_set', { data: { preference: id, on } });
  };

  return (
    <section className="filters" aria-label="Filter classes">
      <p className="eyebrow">Energy Match · optional</p>
      <p className="filters__q" id="mood-q">How are you today?</p>
      <div className="pills" role="group" aria-labelledby="mood-q">
        {MOODS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={mood === m.id ? 'pill pill--on' : 'pill'}
            aria-pressed={mood === m.id}
            onClick={() => pickMood(m.id)}
          >
            <Icon name={m.icon} size={18} />
            {m.label}
          </button>
        ))}
      </div>
      {moodInfo && <p className="filters__explain">{moodInfo.explain}</p>}

      <div className="filters__row">
        <button
          type="button"
          className={prefs.length ? 'pill pill--outline pill--on' : 'pill pill--outline'}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          <Icon name="sliders" size={18} />
          Sensory filters{prefs.length ? ` · ${prefs.length}` : ''}
        </button>
        {SENSORY.filter((s) => prefs.includes(s.id)).map((s) => (
          <button
            key={s.id}
            type="button"
            className="chip chip--remove"
            onClick={() => togglePref(s.id)}
            aria-label={`Remove filter: ${s.label}`}
          >
            {s.label}
            <Icon name="x" size={14} />
          </button>
        ))}
      </div>

      {open && (
        <SensorySheet
          prefs={prefs}
          mood={mood}
          onToggle={togglePref}
          onClear={() => {
            setPrefs([]);
            logEvent('preference_set', { data: { preference: 'all', on: false } });
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}

/**
 * The sensory filters sheet. Version B uses it as is; Version E passes its own
 * count, wording and an extra group on top (Quiet & dim), because in E the
 * filters re-sort the list instead of hiding classes.
 */
export function SensorySheet({
  prefs, mood = null, count: countOverride, subtitle, footLabel, top, canClear, onToggle, onClear, onClose,
}: {
  prefs: SensoryId[];
  mood?: Mood | null;
  count?: number;
  subtitle?: string;
  footLabel?: string;
  top?: ReactNode;
  canClear?: boolean;
  onToggle: (id: SensoryId) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const count = countOverride ?? applyFilters(classes, mood, prefs).length;
  const groups = [...new Set(SENSORY.map((s) => s.group))];
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    headingRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    return () => {
      root?.removeAttribute('inert');
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, []); // once per opening, so toggling doesn't move focus back to the title

  return createPortal(
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <button type="button" className="sheet__backdrop" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <div className="sheet__panel">
        <div className="sheet__head">
          <h2 id="sheet-title" tabIndex={-1} ref={headingRef}>Sensory filters</h2>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Close">
            <Icon name="x" size={22} />
          </button>
        </div>
        <p className="muted small">{subtitle ?? "Only show classes that fit. We'll remember these for next time."}</p>

        <div className="sheet__body">
          {top}
          {groups.map((g) => (
            <fieldset key={g} className="sgroup">
              <legend>{g}</legend>
              {SENSORY.filter((s) => s.group === g).map((s) => (
                <label key={s.id} className="toggle">
                  <span className="toggle__icon"><Icon name={s.icon} size={20} /></span>
                  <span className="toggle__text">
                    <span className="toggle__label">{s.label}</span>
                    <span className="toggle__hint">{s.hint}</span>
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={prefs.includes(s.id)}
                    onChange={() => onToggle(s.id)}
                  />
                  <span className="toggle__switch" aria-hidden="true" />
                </label>
              ))}
            </fieldset>
          ))}
        </div>

        <div className="sheet__foot">
          {(canClear ?? prefs.length > 0) && (
            <button type="button" className="btn btn--quiet" onClick={onClear}>
              Clear all
            </button>
          )}
          <button type="button" className="btn btn--primary" onClick={onClose} disabled={count === 0}>
            {footLabel ?? (count === 0 ? 'No classes match' : `Show ${count} ${count === 1 ? 'class' : 'classes'}`)}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
