import { useState } from 'react';
import { logEvent } from '../lib/events';
import {
  chooseEnergy, chooseGoal, clearSensoryE, reopenEnergy, skipEnergy, toggleQuietDim, toggleSensoryE,
  useEnergy, type Energy,
} from '../lib/energy';
import { SENSORY } from '../lib/filters';
import { SensorySheet } from './ClassFilters';
import { Icon } from './Icon';

/**
 * Energy Match check-in (PRD v4 A + C). Optional: "Skip" is always visible, and the
 * list works the same without it. Nothing here is saved after the session.
 */
const OPTIONS: { id: Energy; label: string; icon: string }[] = [
  { id: 'drained', label: 'Drained', icon: 'dim' },
  { id: 'stressed', label: 'Stressed', icon: 'calm' },
  { id: 'normal', label: 'Normal', icon: 'minus' },
  { id: 'energized', label: 'Energized', icon: 'flash' },
];

const EXPLAIN: Record<string, string> = {
  drained: 'Low intensity, quiet and small classes first.',
  'stressed-': 'Do you want to burn it off or calm down?',
  'stressed-calm': 'Quiet, low intensity and small classes first. Quiet & dim is on.',
  'stressed-burn': 'High intensity classes first.',
  normal: 'Classes in time order, as usual.',
  energized: 'High intensity classes first.',
};

export function EnergyCheckIn() {
  const s = useEnergy();
  const key = s.energy === 'stressed' ? `stressed-${s.goal ?? ''}` : s.energy ?? '';

  if (s.skipped) {
    return (
      <div className="em-off">
        <span className="em-off__text"><Icon name="sparkle" size={16} /> Energy Match is off.</span>
        <button type="button" className="em-off__btn" onClick={() => { reopenEnergy(); logEvent('energy_selected', { data: { energy: 'reopened' } }); }}>
          Set my energy
        </button>
      </div>
    );
  }

  return (
    <section className="em" aria-labelledby="energy-q">
      <div className="em__head">
        <p className="em__name">
          <span className="em__badge"><Icon name="sparkle" size={14} /></span>
          Energy Match
        </p>
        <button
          type="button"
          className="em__skip"
          onClick={() => { skipEnergy(); logEvent('energy_selected', { data: { energy: 'skipped' } }); }}
        >
          Skip
        </button>
      </div>

      <h2 className="em__q" id="energy-q">How much energy do you have today?</h2>

      <div className="em__grid" role="group" aria-labelledby="energy-q">
        {OPTIONS.map((o) => {
          const on = s.energy === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={on ? 'em-tile em-tile--on' : 'em-tile'}
              aria-pressed={on}
              onClick={() => { chooseEnergy(o.id); logEvent('energy_selected', { data: { energy: on ? 'cleared' : o.id } }); }}
            >
              <span className="em-tile__icon"><Icon name={o.icon} size={20} /></span>
              <span className="em-tile__label">{o.label}</span>
              {on && <Icon name="check" size={18} className="em-tile__check" />}
            </button>
          );
        })}
      </div>

      {s.energy === 'stressed' && (
        <div className="em__follow" role="group" aria-labelledby="goal-q">
          <p className="em__followq" id="goal-q">{EXPLAIN['stressed-']}</p>
          <div className="em__seg">
            {([['burn', 'Burn it off', 'flash'], ['calm', 'Calm down', 'wind']] as const).map(([g, label, icon]) => (
              <button
                key={g}
                type="button"
                className={s.goal === g ? 'em-seg em-seg--on' : 'em-seg'}
                aria-pressed={s.goal === g}
                onClick={() => { chooseGoal(g); logEvent('energy_selected', { data: { energy: 'stressed', goal: g } }); }}
              >
                <Icon name={icon} size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {key && key !== 'stressed-' && (
        <p className="em__explain" role="status">
          <Icon name="sparkle" size={16} />
          {EXPLAIN[key]}
        </p>
      )}
    </section>
  );
}

/**
 * Sensory filters in Version E (PRD v4.1): the same 7 filters as Version B in the same
 * sheet, with Quiet & dim as the first switch. They re-sort (matching classes first)
 * instead of hiding; only Quiet & dim leaves classes out. Filters are remembered,
 * Quiet & dim is for this session (it follows the energy check-in).
 */
export function SensoryFiltersE({ shown, hidden, matchAll }: { shown: number; hidden: number; matchAll: number }) {
  const s = useEnergy();
  const [open, setOpen] = useState(false);
  const active = s.sensory.length + (s.quietDim ? 1 : 0);

  const toggle = (id: (typeof SENSORY)[number]['id']) => {
    logEvent('preference_set', { data: { preference: id, on: !s.sensory.includes(id) } });
    toggleSensoryE(id);
  };
  const toggleQD = () => {
    logEvent('preference_set', { data: { preference: 'quietDim', on: !s.quietDim } });
    toggleQuietDim();
  };
  const clearAll = () => {
    clearSensoryE();
    if (s.quietDim) toggleQuietDim();
    logEvent('preference_set', { data: { preference: 'all', on: false } });
  };

  return (
    <div className="sfe">
      <div className="filters__row sfe__row">
        <button
          type="button"
          className={active ? 'pill pill--outline pill--on' : 'pill pill--outline'}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          <Icon name="sliders" size={18} />
          Sensory filters{active ? ` · ${active}` : ''}
        </button>
        {s.quietDim && (
          <button type="button" className="chip chip--remove" onClick={toggleQD} aria-label="Turn off Quiet & dim">
            Quiet &amp; dim
            <Icon name="x" size={14} />
          </button>
        )}
        {SENSORY.filter((f) => s.sensory.includes(f.id)).map((f) => (
          <button key={f.id} type="button" className="chip chip--remove" onClick={() => toggle(f.id)} aria-label={`Remove filter: ${f.label}`}>
            {f.label}
            <Icon name="x" size={14} />
          </button>
        ))}
      </div>

      {active > 0 && (
        <p className="filter-count" role="status">
          <span>
            {s.sensory.length > 0 && <>{matchAll} {matchAll === 1 ? 'class matches' : 'classes match'} all your filters, shown first. </>}
            {s.quietDim && <>Quiet &amp; dim leaves out {hidden}.</>}
          </span>
          <button type="button" className="linkbtn" onClick={clearAll}>Clear all</button>
        </p>
      )}

      {open && (
        <SensorySheet
          prefs={s.sensory}
          count={shown}
          canClear={active > 0}
          subtitle="Classes that fit move to the top. We'll remember these for next time."
          footLabel={`Show ${shown} ${shown === 1 ? 'class' : 'classes'}`}
          onToggle={toggle}
          onClear={clearAll}
          onClose={() => setOpen(false)}
          top={
            <fieldset className="sgroup">
              <legend>Quick switch</legend>
              <label className="toggle">
                <span className="toggle__icon"><Icon name="dim" size={20} /></span>
                <span className="toggle__text">
                  <span className="toggle__label">Quiet &amp; dim</span>
                  <span className="toggle__hint">Leaves out classes members rate loud or bright. Turns on with Stressed → Calm down.</span>
                </span>
                <input type="checkbox" role="switch" checked={s.quietDim} onChange={toggleQD} />
                <span className="toggle__switch" aria-hidden="true" />
              </label>
            </fieldset>
          }
        />
      )}
    </div>
  );
}
