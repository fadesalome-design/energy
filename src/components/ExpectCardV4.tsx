import type { ReactNode } from 'react';
import type { ClassInfo, Studio } from '../data/classes';
import { MIN_RATINGS, memberView, profile } from '../lib/energy';
import { partnerLabel, roomSizeLabel, trainerStyleLabel } from '../lib/labels';
import { Icon } from './Icon';

/**
 * "What to expect" card, Energy Match version (PRD v4 D–F).
 * Six sections in a fixed order. Every section names its source:
 * "From the studio" or "From N members". Under 5 member ratings we say
 * "Not enough ratings yet" and never guess.
 */

function Source({ members }: { members?: number }) {
  if (members === undefined) return <p className="src">From the studio</p>;
  if (members < MIN_RATINGS) return <p className="src src--none">Not enough ratings yet</p>;
  return <p className="src">From {members} members</p>;
}

function Section({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <li className="xrow xrow--v4">
      <span className="xrow__icon"><Icon name={icon} /></span>
      <div className="xrow__body">
        <h3 className="xrow__label">{title}</h3>
        {children}
      </div>
    </li>
  );
}

const words = {
  crowd: { small: 'small group', medium: 'medium group', large: 'large group' },
  music: { quiet: 'quiet', medium: 'medium', loud: 'loud' },
  light: { dim: 'dim', normal: 'normal', bright: 'bright' },
};

export function ExpectCardV4({ c, studio }: { c: ClassInfo; studio: Studio }) {
  const x = c.expect;
  const p = profile(c);
  const m = memberView(c);

  // Real level: show a mismatch only with ≥ 5 ratings and ≥ 60% disagreeing (PRD E)
  const lv = m.level;
  const disagree = lv.harder + lv.easier;
  const harder = lv.harder >= lv.easier;
  let levelMembers: ReactNode;
  if (lv.n < MIN_RATINGS) levelMembers = null;
  else if (disagree / lv.n >= 0.6)
    levelMembers = <strong>{harder ? lv.harder : lv.easier} of {lv.n} members: {harder ? 'harder' : 'easier'} than described</strong>;
  else levelMembers = <>{lv.asDescribed} of {lv.n} members: as described</>;

  const soundOk = m.music.n >= MIN_RATINGS;
  const lightOk = m.light.n >= MIN_RATINGS;

  return (
    <section className="card expect" id="what-to-expect" aria-labelledby="expect-title" tabIndex={-1}>
      <header className="expect__head">
        <p className="eyebrow"><Icon name="sparkle" size={16} /> Energy Match</p>
        <h2 id="expect-title">What to expect</h2>
        <p className="muted small">What this class is really like, from the studio and from members.</p>
      </header>

      <ul className="xrows">
        <Section icon="sparkle" title="Cleanliness">
          <p className="xrow__value">{x.clean.lastCleaned}{x.clean.ventilation ? ` · ${x.clean.ventilation}` : ''}</p>
          <Source />
          {m.clean.n >= MIN_RATINGS && m.clean.avg !== null && (
            <p className="xrow__value">Members rate it <strong>{m.clean.avg.toFixed(1)} / 5</strong></p>
          )}
          <Source members={m.clean.n} />
        </Section>

        <Section icon="people" title="Crowd at this time">
          <p className="xrow__value">Usually {x.crowd.typicalMin}–{x.crowd.typicalMax} people · {roomSizeLabel[x.crowd.roomSize]}</p>
          <Source />
          {m.crowd.n >= MIN_RATINGS && <p className="xrow__value">Feels like a <strong>{words.crowd[m.crowd.level]}</strong></p>}
          <Source members={m.crowd.n} />
        </Section>

        <Section icon="level" title="Real level">
          <p className="xrow__value">Studio: <strong>{p.level}</strong></p>
          <Source />
          {levelMembers && <p className="xrow__value">{levelMembers}</p>}
          <Source members={lv.n} />
        </Section>

        <Section icon="trainer" title="Atmosphere & people">
          <p className="xrow__value">{c.vibe}</p>
          <p className="xrow__value">
            Trainer {c.trainer}: {trainerStyleLabel[x.trainer.style].toLowerCase()}
            {x.trainer.handsOn ? (x.trainer.asksBeforeTouch ? ', asks before hands-on help' : ', gives hands-on help') : ''}
            {' · '}{partnerLabel[x.partner.work]}
          </p>
          <p className="xrow__value">{x.leaving.quietExitOk ? 'Fine to leave early' : 'Leaving early is noticeable'}</p>
          <Source />
        </Section>

        <Section icon="volume" title="Sound & light">
          {soundOk || lightOk ? (
            <p className="xrow__value">
              Music: <strong>{soundOk ? words.music[m.music.level] : 'not enough ratings yet'}</strong>
              {' · '}Light: <strong>{lightOk ? words.light[m.light.level] : 'not enough ratings yet'}</strong>
            </p>
          ) : null}
          <Source members={Math.max(soundOk ? m.music.n : 0, lightOk ? m.light.n : 0) || Math.max(m.music.n, m.light.n)} />
          <p className="xrow__value">Studio says: music {words.music[p.music]}, light {words.light[p.light]}</p>
          <Source />
        </Section>

        <Section icon="shower" title="Facilities & what to bring">
          <p className="xrow__value">Showers: <strong>{p.showers ? 'yes' : 'no'}</strong> · Lockers: <strong>{p.lockers ? 'yes' : 'no'}</strong></p>
          <p className="xrow__value">Bring: {p.bring.join(' · ')}</p>
          <Source />
        </Section>
      </ul>
      <p className="expect__studio muted small">{studio.name} · {studio.district}</p>
    </section>
  );
}
