import { logEvent } from '../lib/events';
import {
  chooseEnergy, chooseGoal, reopenEnergy, skipEnergy, toggleQuietDim, useEnergy, type Energy,
} from '../lib/energy';
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
      <div className="energy energy--skipped">
        <span>Energy Match is off.</span>
        <button type="button" className="linkbtn" onClick={() => { reopenEnergy(); logEvent('energy_selected', { data: { energy: 'reopened' } }); }}>
          Set my energy
        </button>
      </div>
    );
  }

  return (
    <section className="energy" aria-labelledby="energy-q">
      <div className="energy__head">
        <p className="energy__name"><Icon name="sparkle" size={16} /> Energy Match</p>
        <button
          type="button"
          className="linkbtn"
          onClick={() => { skipEnergy(); logEvent('energy_selected', { data: { energy: 'skipped' } }); }}
        >
          Skip
        </button>
      </div>
      <p className="filters__q" id="energy-q">How much energy do you have today?</p>
      <div className="epills" role="group" aria-labelledby="energy-q">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            className={s.energy === o.id ? 'pill pill--on' : 'pill'}
            aria-pressed={s.energy === o.id}
            onClick={() => { chooseEnergy(o.id); logEvent('energy_selected', { data: { energy: s.energy === o.id ? 'cleared' : o.id } }); }}
          >
            <Icon name={o.icon} size={18} />
            {o.label}
          </button>
        ))}
      </div>

      {s.energy === 'stressed' && (
        <div className="egoal" role="group" aria-label="Stressed: what do you want?">
          {([['burn', 'Burn it off'], ['calm', 'Calm down']] as const).map(([g, label]) => (
            <button
              key={g}
              type="button"
              className={s.goal === g ? 'pill pill--outline pill--on' : 'pill pill--outline'}
              aria-pressed={s.goal === g}
              onClick={() => { chooseGoal(g); logEvent('energy_selected', { data: { energy: 'stressed', goal: g } }); }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {key && <p className="filters__explain" role="status">{EXPLAIN[key]}</p>}
    </section>
  );
}

/** One optional chip on the class list. */
export function QuietDimChip({ hidden }: { hidden: number }) {
  const s = useEnergy();
  return (
    <div className="qd">
      <button
        type="button"
        className={s.quietDim ? 'pill pill--outline pill--on' : 'pill pill--outline'}
        aria-pressed={s.quietDim}
        onClick={() => { toggleQuietDim(); logEvent('preference_set', { data: { preference: 'quietDim', on: !s.quietDim } }); }}
      >
        <Icon name={s.quietDim ? 'check' : 'dim'} size={18} />
        Quiet &amp; dim
      </button>
      <span className="qd__note muted small">
        {s.quietDim
          ? `Leaving out ${hidden} ${hidden === 1 ? 'class' : 'classes'} members rate loud or bright.`
          : 'Leave out classes members rate loud or bright.'}
      </span>
    </div>
  );
}
