import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { classes } from '../data/classes';
import { logEvent } from '../lib/events';
import {
  applyFilters, GOALS, MOODS, SENSORY, setGoal, setMood, setPrefs, setSortB, useFilters,
  type Mood, type SensoryId, type StressGoal,
} from '../lib/filters';
import { PLACES, placeInfo, setPlace, usePlace, type PlaceId } from '../lib/location';
import { Icon } from './Icon';

/**
 * SANDBOX D: ONE Energy Match card, where the member sets everything in one place.
 * White card with a soft shadow and the round sparkle badge; buttons from D.
 *
 * Top:    "How are you today?" Tired / Stressed / Energetic in one row (nothing selected by
 *         default; tap the selected one again to clear it), Stressed → Burn it off / Calm down,
 *         and a one-line explanation for the choice.
 * Bottom: after a thin divider, one row of 3 compact controls: place ("Near me"), sort
 *         ("Time" / "Nearest") and "Sensory filters", which opens Version B's ORIGINAL
 *         bottom sheet (groups, icons, descriptions, toggles, Clear all, Show N classes). The place list and the filters open
 *         inside the card, one at a time; no pop-ups. Active filters show as mint chips with ×.
 * No Skip: the card is optional by design, and the list below is always all classes.
 */
type Panel = 'place' | 'filters' | null; // 'filters' = Version B's original bottom sheet

export function ClassFilters() {
  const { mood, goal, prefs, sort } = useFilters();
  const place = usePlace();
  const [panel, setPanel] = useState<Panel>(null);
  const moodInfo = MOODS.find((m) => m.id === mood);
  const goalInfo = GOALS.find((g) => g.id === goal);

  const pickMood = (m: Mood) => {
    const next = mood === m ? null : m;
    setMood(next);
    logEvent('energy_selected', { data: { mood: next ?? 'cleared' } });
  };
  const pickGoal = (g: StressGoal) => {
    setGoal(g);
    logEvent('energy_selected', { data: { mood: 'stressed', goal: goal === g ? 'cleared' : g } });
  };
  const togglePref = (id: SensoryId) => {
    const on = !prefs.includes(id);
    setPrefs(on ? [...prefs, id] : prefs.filter((p) => p !== id));
    logEvent('preference_set', { data: { preference: id, on } });
  };
  const toggleSort = () => {
    const next = sort === 'time' ? 'nearest' : 'time';
    setSortB(next);
    logEvent('sort_changed', { data: { sort: next } });
  };
  const pickPlace = (p: PlaceId) => {
    setPlace(p);
    setPanel(null);
    logEvent('preference_set', { data: { preference: 'place', value: p } });
  };
  const openPanel = (p: Exclude<Panel, null>) => setPanel(panel === p ? null : p);

  return (
    <section className="emd" aria-labelledby="emd-name">
      <p className="emd__name" id="emd-name">
        <span className="emd__badge"><Icon name="sparkle" size={14} /></span>
        Energy Match
      </p>

      {/* ---------- Energy ---------- */}
      <p className="filters__q" id="mood-q">How are you today?</p>
      <div className="pills" role="group" aria-labelledby="mood-q">
        {MOODS.map((m) => {
          const on = mood === m.id;
          return (
            <button
              key={m.id}
              type="button"
              className={on ? 'pill pill--on' : 'pill'}
              aria-pressed={on}
              onClick={() => pickMood(m.id)}
            >
              {/* Selected: a tick replaces the icon, so it's never colour alone */}
              <Icon name={on ? 'check' : m.icon} size={18} />
              {m.label}
            </button>
          );
        })}
      </div>

      {mood === 'stressed' && (
        <div className="stressfu" role="group" aria-labelledby="goal-q">
          <p className="stressfu__q" id="goal-q">{moodInfo?.explain}</p>
          <div className="stressfu__opts">
            {GOALS.map((g) => {
              const on = goal === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  className={on ? 'pill pill--sub pill--on' : 'pill pill--sub'}
                  aria-pressed={on}
                  onClick={() => pickGoal(g.id)}
                >
                  <Icon name={on ? 'check' : g.icon} size={16} />
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {mood && mood !== 'stressed' && <p className="filters__explain" role="status">{moodInfo?.explain}</p>}
      {mood === 'stressed' && goalInfo && <p className="filters__explain" role="status">{goalInfo.explain}</p>}

      {/* ---------- Settings ---------- */}
      <div className="emd__divider" />
      <div className="emd__row">
        <button
          type="button"
          className={panel === 'place' ? 'emd-set emd-set--open' : 'emd-set'}
          aria-expanded={panel === 'place'}
          aria-controls="emd-place"
          onClick={() => openPanel('place')}
        >
          <Icon name="pin" size={16} />
          {placeInfo(place).chip}
        </button>
        <button
          type="button"
          className="emd-set"
          onClick={toggleSort}
          aria-label={`Sort: ${sort === 'time' ? 'Time' : 'Nearest'}. Tap to sort by ${sort === 'time' ? 'nearest' : 'time'}`}
        >
          <Icon name="sort" size={16} />
          {sort === 'time' ? 'Time' : 'Nearest'}
        </button>
        <button
          type="button"
          className={panel === 'filters' ? 'emd-set emd-set--open' : prefs.length ? 'emd-set emd-set--on' : 'emd-set'}
          aria-haspopup="dialog"
          onClick={() => openPanel('filters')}
        >
          <Icon name="sliders" size={16} />
          Sensory filters{prefs.length ? ` · ${prefs.length}` : ''}
        </button>
      </div>

      {panel === 'place' && (
        <div className="emd__panel" id="emd-place" role="group" aria-label="Where are you?">
          {PLACES.map((p) => {
            const on = place === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={on ? 'emd-opt emd-opt--on' : 'emd-opt'}
                aria-pressed={on}
                onClick={() => pickPlace(p.id)}
              >
                <Icon name="pin" size={16} />
                <span>{p.label}</span>
                {on && <Icon name="check" size={16} className="emd-opt__check" />}
              </button>
            );
          })}
        </div>
      )}

      {/* D: the ORIGINAL Version B sheet (same component as B), opened from the chip */}
      {panel === 'filters' && (
        <SensorySheet
          prefs={prefs}
          mood={mood}
          onToggle={togglePref}
          onClear={() => {
            setPrefs([]);
            logEvent('preference_set', { data: { preference: 'all', on: false } });
          }}
          onClose={() => setPanel(null)}
        />
      )}

      {prefs.length > 0 && (
        <div className="emd__active">
          {SENSORY.filter((f) => prefs.includes(f.id)).map((f) => (
            <button
              key={f.id}
              type="button"
              className="chip chip--remove"
              onClick={() => togglePref(f.id)}
              aria-label={`Remove filter: ${f.label}`}
            >
              {f.label}
              <Icon name="x" size={14} />
            </button>
          ))}
        </div>
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
