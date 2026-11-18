/**
 * The "What to expect" card: answers "what will this feel like?" before booking.
 * Research: F-UNSURE (#1 barrier: not sure what the class is like, 12/22)
 * Research: F-INFO-GAP (info found only 6.2/10, so one standard card, same order every time)
 * Research: F-CARD (usefulness 7.3/10, 16/21 would change behaviour)
 *
 * Section order follows the survey's priorities: crowd and cleanliness are the
 * strongest dealbreakers, so they come first and are always visible.
 * Version A: same card for everyone (no personalisation).
 */
import { useId, useState, type ReactNode } from 'react';
import { type ClassInfo, type Studio } from '../data/classes';
import {
  busynessLabel, changingLabel, lightLabel, lockersLabel, partnerLabel, roomSizeLabel,
  showersLabel, towelsLabel, trainerStyleLabel, volumeLabel, intensityLabel,
} from '../lib/labels';
import { logEvent } from '../lib/events';
import { Icon } from './Icon';
import { BringList } from './BringList';
import { useVariant } from '../lib/variant';
import { DotScale, Spectrum } from './Scale';
import { FlowTimeline } from './FlowTimeline';

// ---------------------------------------------------------------------------
// Row building blocks
// ---------------------------------------------------------------------------

interface RowProps {
  icon: string;
  label: string;
  value: ReactNode;
  children?: ReactNode;
}

/** Always-visible row: icon + short label + plain-language value. */
function Row({ icon, label, value, children }: RowProps) {
  return (
    <li className="xrow">
      <span className="xrow__icon"><Icon name={icon} /></span>
      <div className="xrow__body">
        <h3 className="xrow__label">{label}</h3>
        <div className="xrow__value">{value}</div>
        {children && <div className="xrow__more">{children}</div>}
      </div>
    </li>
  );
}

/** Expandable row: the summary stays scannable, details open on tap. */
function ExpandRow({
  icon, label, value, children, section, classId,
}: RowProps & { section: string; classId: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) logEvent('card_section_expanded', { classId, data: { section } });
  };
  return (
    <li className={open ? 'xrow xrow--expand is-open' : 'xrow xrow--expand'}>
      <h3 className="xrow__heading">
        <button
          type="button"
          className="xrow__toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
        >
          <span className="xrow__icon"><Icon name={icon} /></span>
          <span className="xrow__body">
            <span className="xrow__label">{label}</span>
            <span className="xrow__value">{value}</span>
          </span>
          <Icon name="chevronDown" className="xrow__chev" />
        </button>
      </h3>
      <div id={panelId} className="xrow__panel" hidden={!open}>
        {children}
      </div>
    </li>
  );
}

// PRD: "It never guesses": missing details show as "Not described yet"
const MISSING = 'Not described yet';

function Missing() {
  return <span className="missing">{MISSING}</span>;
}

function YesNo({ yes, label, na }: { yes: boolean | null; label: string; na?: string }) {
  const icon = yes === null ? 'minus' : yes ? 'check' : 'x';
  const word = yes === null ? na ?? MISSING : yes ? 'Yes' : 'No';
  return (
    <li className="fact">
      <Icon name={icon} size={18} />
      <span>{label}: <strong>{word}</strong></span>
    </li>
  );
}

function Fact({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <li className="fact">
      <Icon name={icon} size={18} />
      <span>{children}</span>
    </li>
  );
}

const lightIcon = { dim: 'dim', natural: 'sun', bright: 'sun', flashing: 'flash' } as const;

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export function ExpectCard({ c, studio }: { c: ClassInfo; studio: Studio }) {
  const variant = useVariant();
  const x = c.expect;
  const f = studio.facilities;
  const peak = Math.max(...x.flow.map((s) => s.intensity)) as 1 | 2 | 3 | 4 | 5;

  return (
    <section className="card expect" id="read-the-room" aria-labelledby="expect-title" tabIndex={-1}>
      <header className="expect__head">
        <p className="eyebrow">
          <Icon name="clue" size={16} /> Read the Room
        </p>
        <h2 id="expect-title">What to expect</h2>
        <p className="tagline">Read the room before you go.</p>
        {/* PRD (Responsible AI: transparent): name the sources */}
        <p className="muted small">
          From {c.studioChecklist ? "the studio's checklist and " : ''}
          {c.reports} member answers (last 30 days)
        </p>
      </header>

      {/* PRD: recent feedback differs from the description → say so, in words */}
      {c.recentReport && (
        <p className="report-note">
          <Icon name="info" size={18} />
          <span>{c.recentReport}</span>
        </p>
      )}

      {/* Research: F-VIBE (atmosphere is the #1 factor, 18/22)
          PRD (transparent): the one-line summary is labelled as written by AI */}
      <div className="vibe">
        <span className="ai-tag">AI summary</span>
        <p>{c.vibe}</p>
      </div>

      <ul className="xrows">
        {/* Research: F-CROWD (dealbreaker for 9/22, too crowded = #1 reason to leave) */}
        <Row
          icon="people"
          label="Crowd at this time"
          value={
            <>
              Usually {x.crowd.typicalMin}–{x.crowd.typicalMax} people · {roomSizeLabel[x.crowd.roomSize]}
              <span className={`badge badge--${x.crowd.busyness}`}>
                <Icon name={x.crowd.busyness} size={16} />
                {busynessLabel[x.crowd.busyness]}
              </span>
            </>
          }
        >
          {x.crowd.note && <>{x.crowd.note}. </>}Up to {x.crowd.capacity} spots.
        </Row>

        {/* Research: F-CLEAN (strongest dealbreaker, 10/22; "not clean" made 7 leave) */}
        <Row icon="sparkle" label="Clean & air" value={x.clean.lastCleaned}>
          <ul className="facts">
            <Fact icon="sparkle">
              Member cleanliness rating:{' '}
              {x.clean.rating != null ? <strong>{x.clean.rating.toFixed(1)} / 5</strong> : <Missing />}
            </Fact>
            <Fact icon="calm">Air: {x.clean.ventilation ?? <Missing />}</Fact>
            <Fact icon="sun">Temperature: {x.clean.temperature ?? <Missing />}</Fact>
          </ul>
        </Row>

        {/* Research: F-LEVEL (misleading "open level" / "beginner" labels; not sure about level stops 9/22) */}
        <Row
          icon="level"
          label="Level, honestly"
          value={
            <>
              <span className="tag">Labelled: {x.level.official}</span>
              <span className="block">In practice: {x.level.reality}</span>
            </>
          }
        >
          <p>
            <strong>You need:</strong> {x.level.priorKnowledge}
          </p>
          <div className="match">
            <div
              className="match__bar"
              role="img"
              aria-label={`${x.level.firstTimerMatchPct} percent of first-timers said the level matched`}
            >
              <span style={{ width: `${x.level.firstTimerMatchPct}%` }} />
            </div>
            <span className="small">
              <strong>{x.level.firstTimerMatchPct}%</strong> of first-timers said the level matched
            </span>
          </div>
        </Row>

        {/* Research: F-SOUND (music too loud made 5 leave; mic was a wish) */}
        <Row
          icon="volume"
          label="Sound"
          value={
            <span className="inline">
              <DotScale value={x.sound.volume} label="Music volume" />
              {volumeLabel[x.sound.volume]}
            </span>
          }
        >
          <ul className="facts">
            <YesNo yes={x.sound.mic} label="Trainer uses a mic" />
            {x.sound.note && <Fact icon="info">{x.sound.note}</Fact>}
          </ul>
        </Row>

        {/* Research: F-LIGHT (light too bright made 5 leave; flashing named explicitly) */}
        <Row
          icon={lightIcon[x.light.level]}
          label="Light"
          value={
            x.light.level === 'flashing' ? (
              <strong>{lightLabel[x.light.level]}</strong>
            ) : (
              lightLabel[x.light.level]
            )
          }
        >
          {x.light.note}
        </Row>

        {/* Research: F-TRAINER (didn't like trainer made 8 leave; touch without asking) */}
        <ExpandRow
          icon="trainer"
          label={`Trainer style · ${c.trainer}`}
          section="trainer"
          classId={c.id}
          value={
            <>
              {trainerStyleLabel[x.trainer.style]} ·{' '}
              {x.trainer.handsOn
                ? x.trainer.asksBeforeTouch
                  ? 'hands-on, asks first'
                  : 'hands-on, does not ask first'
                : 'no hands-on corrections'}
            </>
          }
        >
          <Spectrum value={x.trainer.style} left="Relaxed" right="Strict" label="Trainer style" />
          <ul className="facts">
            <YesNo yes={x.trainer.handsOn} label="Corrects you by touch" />
            {x.trainer.handsOn && (
              <YesNo yes={x.trainer.asksBeforeTouch} label="Asks before touching" />
            )}
            {x.trainer.note && <Fact icon="info">{x.trainer.note}</Fact>}
          </ul>
        </ExpandRow>

        {/* Research: F-PARTNER (9/22 very important or dealbreaker) */}
        <ExpandRow
          icon="partner"
          label="Partner or group work"
          section="partner"
          classId={c.id}
          value={partnerLabel[x.partner.work]}
        >
          <p>{x.partner.note ?? 'You work on your own the whole class.'}</p>
        </ExpandRow>

        {/* Research: F-FLOW (step by step + intensity; "too tired" stops 8/22) */}
        <ExpandRow
          icon="flow"
          label="How the class goes"
          section="flow"
          classId={c.id}
          value={`${x.flow.length} parts · hardest part: ${intensityLabel[peak].toLowerCase()}`}
        >
          <FlowTimeline steps={x.flow} />
        </ExpandRow>

        {/* Research: F-FACILITIES (showers incl. private, lockers, safe box, changing room crowding) */}
        <ExpandRow
          icon="shower"
          label="Facilities"
          section="facilities"
          classId={c.id}
          value={`${showersLabel[f.showers]} · ${changingLabel[f.changingRoom.crowding].toLowerCase()}`}
        >
          <ul className="facts">
            <Fact icon="shower">{showersLabel[f.showers]}</Fact>
            <Fact icon="lock">{lockersLabel[f.lockers]}</Fact>
            <YesNo yes={f.safeBox} label="Safe box for valuables" />
            <Fact icon="changing">
              {changingLabel[f.changingRoom.crowding]}
              {f.changingRoom.note && <>: {f.changingRoom.note}</>}
            </Fact>
            <Fact icon="towel">{towelsLabel[f.towels]}</Fact>
          </ul>
        </ExpandRow>

        {/* Research: F-BRING (towel, shoes, swimwear; best time to arrive) */}
        <ExpandRow
          icon="bag"
          label="What to bring"
          section="bring"
          classId={c.id}
          value={`${x.bring.length} things · arrive ${x.arrival.split(',')[0]}`}
        >
          {/* B: information only (icon + text). Version A keeps its original ticks. */}
          {variant === 'b' ? (
            <BringList items={x.bring} />
          ) : (
            <ul className="facts">
              {x.bring.map((b) => (
                <Fact key={b} icon="check">{b}</Fact>
              ))}
            </ul>
          )}
          <p className="arrival">
            <Icon name="clock" size={18} /> <span><strong>Best arrival:</strong> {x.arrival}</span>
          </p>
        </ExpandRow>

        {/* Research: F-SOCIAL (felt out of place made 4 leave; leaving quietly, filming, being stared at) */}
        <ExpandRow
          icon="door"
          label="Leaving early & comfort"
          section="leaving"
          classId={c.id}
          value={x.leaving.quietExitOk ? 'Fine to leave quietly' : 'Leaving early is noticeable'}
        >
          <ul className="facts">
            <Fact icon={x.leaving.quietExitOk ? 'check' : 'info'}>{x.leaving.note}</Fact>
            {/* PRD: "quiet space" field */}
            <Fact icon="calm">Quiet space: {x.quietSpace ?? <Missing />}</Fact>
            {x.social.map((s) => (
              <Fact key={s} icon="person">{s}</Fact>
            ))}
          </ul>
        </ExpandRow>
      </ul>

      {/* PRD (human review): members can report a mistake */}
      <ReportMistake classId={c.id} />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Report a mistake (PRD: "Report a mistake" goes to the partner team, answer within 48 h)
// ---------------------------------------------------------------------------

const REPORT_OPTIONS = [
  'Music was louder',
  'Light was brighter',
  'More people',
  'There was partner work',
  'Something else',
];

function ReportMistake({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const panelId = useId();

  if (sent) {
    return (
      <p className="report__done" role="status">
        <Icon name="check" size={18} />
        <span>Thanks! The partner team checks reports within 48 hours.</span>
      </p>
    );
  }

  return (
    <div className="report">
      <button
        type="button"
        className="report__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        Something not right? Report a mistake
      </button>
      <form
        id={panelId}
        hidden={!open}
        className="report__form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!choice) return;
          logEvent('mistake_reported', { classId, data: { reason: choice } });
          setSent(true);
        }}
      >
        <fieldset>
          <legend>What was different? Pick one.</legend>
          {REPORT_OPTIONS.map((o) => (
            <label key={o} className="radio">
              <input type="radio" name={`report-${classId}`} value={o} checked={choice === o} onChange={() => setChoice(o)} />
              <span>{o}</span>
            </label>
          ))}
        </fieldset>
        <button type="submit" className="btn btn--secondary" disabled={!choice}>
          Send
        </button>
      </form>
    </div>
  );
}
