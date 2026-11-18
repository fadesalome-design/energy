import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { endTime, getClass, getStudio } from '../data/classes';
import {
  closeBooking, dismissFeedback, getStamps, now, pickQuestions, submitFeedback,
  type Booking, type Level, type MatchAnswer, type Question,
} from '../lib/feedback';
import { addRatingV4, CATEGORY_LABEL, pickQuestionsV4, QUESTIONS } from '../lib/energy';
import { logEvent } from '../lib/events';
import { Icon } from './Icon';
import { Aura, type AuraLevel } from './Aura';
import { auraMembers, auraSentence } from '../lib/auraSummary';
import { counterLabel, level, progressLine, rewardReachedAt } from '../lib/rewards';
import { VoiceRecorder } from './VoiceRecorder';

/**
 * Full-screen "How was the room?" check after an attended class.
 *
 * Calm-mode choices:
 * - Opens straight on question 1 (no "Start" commitment), with a one-line intro above it.
 * - One question per screen; tapping an answer moves on. "Back" undoes, progress in words ("2 of 3").
 * - Asks about the room, never about the person (PRD: no health information).
 * - Low / Medium / High in neutral words + a bar icon, same order every time, colour is never the signal.
 * - "Not now" is always visible; we say up front that we'll ask again next time.
 * - Minimal motion; the stamp animation is off under prefers-reduced-motion.
 */

// D: 3 questions from Version E's 6 categories (PRD v4: fewest ratings first, never the same
// set twice in a row; descriptive answers), then Version B's "Anything else?" screen ('final'),
// then "Stamp collected". Progress: Question 1–3 of 3, then the last step (4 steps).
// C: 'ai' = the AI moment after question 3 (aura + the room's summary)
type Step = 0 | 1 | 2 | 'expected' | 'ai' | 'final' | 'done';

/** Pause after a tap so the choice is visible before moving on. */
const ADVANCE_MS = 350;
type MessageMode = 'write' | 'record';

const LEVELS: Level[] = ['low', 'medium', 'high'];


/**
 * A few slow, muted confetti pieces that fall once behind the ticket.
 * Fixed positions (no randomness between renders), no flashing, hidden for reduced motion.
 */
const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  delay: 1.2 + ((i * 7) % 10) / 14,
  dur: 2.6 + ((i * 5) % 7) / 6,
  rot: ((i * 53) % 180) - 90,
  shape: i % 3,
  tone: i % 4,
}));

function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {CONFETTI.map((p, i) => (
        <span
          key={i}
          className={`confetti__bit confetti__bit--s${p.shape} confetti__bit--t${p.tone}`}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            ['--rot' as string]: `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}

export function dayLabel(endsAt: string) {
  const end = new Date(endsAt);
  const today = new Date(now());
  const days = Math.round(
    (new Date(today.toDateString()).getTime() - new Date(end.toDateString()).getTime()) / 86_400_000,
  );
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return end.toLocaleDateString('en-GB', { weekday: 'long' });
}

/** Version E questions in the same shape as Version B's (index 0/1/2 → low/medium/high slots). */
function energyQuestions(c: Parameters<typeof pickQuestionsV4>[0]): Question[] {
  return pickQuestionsV4(c).map((q) => ({
    id: q.id, cardRow: CATEGORY_LABEL[q.category], icon: q.icon, prompt: q.prompt,
    options: { low: q.options[0], medium: q.options[1], high: q.options[2] },
  }));
}

export function FeedbackModal({ booking, onClose, onSeeRewards, version = 'b' }: { booking: Booking; onClose: () => void; onSeeRewards?: () => void; version?: 'b' | 'e' }) {
  const c = getClass(booking.classId)!;
  void getStudio; // C: the soft header shows the class name and time only
  const isE = version === 'e';
  // D: always Version E's categories (pickQuestionsV4), picked once per opening
  const questions = useMemo(() => energyQuestions(c), [c]);
  void pickQuestions;
  const [expected, setExpected] = useState<'yes' | 'no' | null>(null);

  const [step, setStep] = useState<Step>(0); // D: opens on question 1
  const [answers, setAnswers] = useState<Record<string, Level>>({});
  const [match, setMatch] = useState<MatchAnswer | null>(null);
  const [mode, setMode] = useState<MessageMode>('write');
  const [text, setText] = useState('');
  const [voiceSec, setVoiceSec] = useState<number | null>(null);
  const [stamps, setStamps] = useState(getStamps);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advance = useRef<number | null>(null);
  const started = useRef(false);

  // Open: lock the page behind, make it inert for screen readers and keyboard.
  useEffect(() => {
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    logEvent('feedback_shown', { classId: c.id, classType: c.type, data: { version: 'd', questions: questions.map((q) => q.id) } });
    return () => {
      root?.removeAttribute('inert');
      document.body.style.overflow = prevOverflow;
      if (advance.current) window.clearTimeout(advance.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Move focus to each new screen's heading so screen readers announce it.
  // Not on first open: the dialog itself is announced, and focusing the question is enough.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const notNow = () => {
    logEvent('feedback_dismissed', {
      classId: c.id, classType: c.type,
      data: { step: String(step), answered: Object.keys(answers).length },
    });
    dismissFeedback();
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'done') notNow();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const answer = (qid: string, level: Level) => {
    setAnswers((a) => ({ ...a, [qid]: level }));
    logEvent('feedback_answered', { classId: c.id, classType: c.type, data: { question: qid, answer: level } });
  };

  const send = () => {
    if (isE) return sendEnergy();
    const message =
      mode === 'record' && voiceSec ? { kind: 'voice' as const, seconds: voiceSec }
      : mode === 'write' && text.trim() ? { kind: 'text' as const, text: text.trim() }
      : { kind: 'none' as const };
    // D: one record with the 3 answers, the card answer and the message …
    const asked = questions.map((q) => {
      const lvl = answers[q.id];
      // category = the PRD v4 category id (level, crowd, clean, atmosphere, coaching, senses);
      // cardSection = the card section it feeds (atmosphere and coaching share one)
      const category = QUESTIONS.find((x) => x.id === q.id)?.category ?? q.id;
      return { id: q.id, category, cardSection: q.cardRow, prompt: q.prompt, answer: lvl ? q.options[lvl] : '', answerIndex: (lvl ? LEVELS.indexOf(lvl) : 1) as 0 | 1 | 2 };
    }).filter((x) => x.answer);
    const total = submitFeedback({
      bookingId: booking.id, classId: c.id, submittedAt: new Date(now()).toISOString(),
      answers, match, message, questions: asked,
    });
    // … and the same answers feed the member data behind the card (as in Version E)
    addRatingV4({
      classId: c.id, at: new Date(now()).toISOString(),
      expected: match === 'yes' ? 'yes' : match === 'no' ? 'no' : null,
      answers: Object.fromEntries(asked.map((x) => [x.id, x.answerIndex])),
    });
    logEvent('feedback_submitted', {
      classId: c.id, classType: c.type,
      data: {
        version: 'd', answers: Object.fromEntries(asked.map((x) => [x.id, x.answer])), match, message: message.kind,
        textLength: message.kind === 'text' ? message.text.length : 0,
        voiceSeconds: message.kind === 'voice' ? message.seconds : 0,
        stamps: total,
      },
    });
    setStamps(total);
    setStep('done');
  };

  /** Version E: answers feed the card and Quiet & dim; the message stays with the team. */
  const sendEnergy = () => {
    const message = mode === 'record' && voiceSec ? 'voice' : mode === 'write' && text.trim() ? 'text' : 'none';
    const idx = Object.fromEntries(Object.entries(answers).map(([k, l]) => [k, LEVELS.indexOf(l) as 0 | 1 | 2]));
    addRatingV4({ classId: c.id, at: new Date(now()).toISOString(), expected, answers: idx });
    const total = closeBooking(booking.id, 'submitted');
    logEvent('feedback_submitted', {
      classId: c.id, classType: c.type,
      data: {
        version: 'e', expected, message,
        answers: Object.fromEntries(questions.map((q) => [q.id, answers[q.id] ? q.options[answers[q.id]] : null])),
        textLength: message === 'text' ? text.trim().length : 0,
        voiceSeconds: message === 'voice' ? voiceSec : 0,
        stamps: total,
      },
    });
    setStamps(total);
    setStep('done');
  };

  const close = () => onClose();

  const qIndex = typeof step === 'number' ? step : null;
  const total = 4; // D: 3 questions + "Anything else?"
  // D: Question 1–3 of 3, then "Anything else?" as the 4th and last step
  const progress: number | null = qIndex !== null ? qIndex + 1 : step === 'final' ? 4 : null;
  void total;
  // C: aura state. answeredCount = how many of the 3 questions have an answer (0–3)
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const auraLevel: AuraLevel = step === 'ai' || step === 'final' ? 3 : (Math.min(answeredCount, 3) as AuraLevel);
  const auraLabel: 'shown' | 'gone' = step === 'ai' || (step === 0 && answeredCount === 0) ? 'shown' : 'gone';
  const answerIdx = Object.fromEntries(Object.entries(answers).map(([k, l]) => [k, LEVELS.indexOf(l) as 0 | 1 | 2]));

  const goBack = () => {
    if (advance.current) return;
    if (step === 'final') return setStep('ai');
    if (step === 'ai' || step === 'expected') return setStep(2);
    setStep(Math.max(0, (step as number) - 1) as Step);
  };

  const chooseExpected = (v: MatchAnswer) => {
    if (advance.current) return;
    setMatch(v);
    setExpected(v === 'partly' ? null : v);
    logEvent('feedback_answered', { classId: c.id, classType: c.type, data: { question: 'expected', answer: v } });
    advance.current = window.setTimeout(() => { advance.current = null; setStep('final'); }, ADVANCE_MS);
  };

  /**
   * Tapping an answer selects it and moves on by itself. The short pause lets people
   * see what they picked before the next question appears. Tapping the already-chosen
   * answer (after going Back) moves on too.
   */
  const choose = (qid: string, level: Level, i: number) => {
    if (advance.current) return;
    if (!started.current) {
      started.current = true;
      logEvent('feedback_started', { classId: c.id, classType: c.type });
    }
    if (answers[qid] !== level) answer(qid, level);
    advance.current = window.setTimeout(() => {
      advance.current = null;
      setStep(i < 2 ? ((i + 1) as Step) : 'ai');
    }, ADVANCE_MS);
  };

  const body = (
    <div className="fb fb--aura" role="dialog" aria-modal="true" aria-labelledby="fb-title">
      <div className="fb__inner">
        {/* C: Back + Not now (small), then the class (left) and the stamp pill (right) */}
        {step !== 'done' && (
          <div className="fb__top fb__top--aura">
            {progress && progress > 1 || step === 'ai' ? (
              <button type="button" className="fb__back" onClick={goBack}>
                <Icon name="arrowLeft" size={20} /> Back
              </button>
            ) : <span />}
            <button type="button" className="fb__notnow" onClick={notNow}>Not now</button>
          </div>
        )}
        {step !== 'done' && (
          <div className="aura-head">
            <p className="aura-head__class">
              <span className="aura-head__name">{c.name}</span>
              <span className="aura-head__time">{dayLabel(booking.endsAt)} {c.start}–{endTime(c)}</span>
            </p>
            <span className="aura-stamps" aria-label={`${stamps} stamps`}>
              <Icon name="stamp" size={16} />{counterLabel(stamps)}
            </span>
          </div>
        )}

        {/* C: ONE aura for the whole rating flow, so its colours fade from step to step.
            Level = answers given (0–3); full on the AI moment. The label shows at the start and
            on the AI moment, and dissolves after the first answer and on the way to the stamp. */}
        {step !== 'done' && step !== 'expected' && (
          <div className={step === 'final' ? 'aura-wrap aura-wrap--small' : 'aura-wrap'}>
            <Aura level={auraLevel} label={auraLabel} size={step === 'final' ? 'md' : 'lg'} />
            <div className="aura-lines" aria-hidden="true">
              {[0, 1, 2].map((i) => <span key={i} className={i < answeredCount || step === 'ai' || step === 'final' ? `aura-lines__l aura-lines__l--${i + 1} aura-lines__l--on` : 'aura-lines__l'} />)}
            </div>
          </div>
        )}

        {/* ---------- Questions (the first one opens straight away) ---------- */}
        {qIndex !== null && (() => {
          const q = questions[qIndex];
          const chosen = answers[q.id];
          return (
            <div className="fb__screen aura-screen" key={q.id}>
              <p className="aura-count">{qIndex + 1} of 3 · reading the room</p>
              <h2 id="fb-title" tabIndex={-1} ref={headingRef} className="fb__title aura-q">{q.prompt}</h2>
              <p className="aura-hint">Helps the "{q.cardRow}" part of the card.</p>

              {/* Buttons, not radios: arrow keys on a radio group would select AND jump ahead. */}
              <div className="fb__options" role="group" aria-labelledby="fb-title">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    aria-pressed={chosen === lvl}
                    className={chosen === lvl ? 'apill apill--on' : 'apill'}
                    onClick={() => choose(q.id, lvl, qIndex)}
                  >
                    {/* D: same button style as the rest of D; a tick (not a radio circle) when chosen */}
                    {chosen === lvl && <Icon name="check" size={18} className="opt__tick" />}
                    <span className="opt__word">{q.options[lvl]}</span>
                  </button>
                ))}
              </div>

              <p className="aura-hint">
                {chosen
                  ? 'Tap an answer to continue.'
                  : qIndex === 0
                    ? <>3 quick questions about the room, not about you. Anonymous, and you'll collect a stamp ({counterLabel(stamps).replace('/', ' of ')}). Not now? We'll ask again next time.</>
                    : 'Tap the one that fits best.'}
              </p>
            </div>
          );
        })()}

        {/* ---------- D: Did the class match its card? (always, after the 3 questions) ---------- */}
        {step === 'expected' && (
          <div className="fb__screen">
            <h2 id="fb-title" tabIndex={-1} ref={headingRef} className="fb__title">Did the class match its "What to expect" card?</h2>
            <div className="fb__options" role="group" aria-labelledby="fb-title">
              {([['yes', 'Yes'], ['partly', 'Partly'], ['no', 'No']] as const).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={match === v}
                  className={match === v ? 'opt opt--on' : 'opt'}
                  onClick={() => chooseExpected(v)}
                >
                  <span className="opt__word">{label}</span>
                  <span className="opt__check" aria-hidden="true"><Icon name="check" size={18} /></span>
                </button>
              ))}
            </div>
            <p className="fb__later muted small">{match ? 'Tap an answer to continue.' : 'Helps us keep the card right.'}</p>
          </div>
        )}

        {/* ---------- C: AI moment (after question 3) ----------
            PLACEHOLDER – replaced by the real AI summary (CALM-8) in Lovable. In C the sentence is
            built by simple rules from the 3 answers and the class's demo data (lib/auraSummary.ts). */}
        {step === 'ai' && (
          <div className="fb__screen aura-screen">
            <div className="aicard">
              <h2 id="fb-title" tabIndex={-1} ref={headingRef} className="aicard__title">
                The room's aura · from {auraMembers(c)} members
              </h2>
              <p className="aicard__text">{auraSentence(c, answerIdx)}</p>
              <p className="aicard__note">Your energy was added to the What to expect card.</p>
            </div>
            <div className="fb__actions">
              <button type="button" className="btn btn--primary btn--block" onClick={() => setStep('final')}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ---------- D: the ORIGINAL Version B "Anything else?" screen (copied from B) ---------- */}
        {step === 'final' && (
          <div className="fb__screen aura-screen">
            <h2 id="fb-title" tabIndex={-1} ref={headingRef} className="fb__title">Anything else?</h2>
            <p className="muted">Both are optional. You can send without them.</p>

            <fieldset className="fb__match">
              <legend>Did the class match its "What to expect" card?</legend>
              <div className="seg" role="radiogroup">
                {([['yes', 'Yes'], ['partly', 'Partly'], ['no', 'No']] as const).map(([v, label]) => (
                  <label key={v} className={match === v ? 'seg__opt seg__opt--on' : 'seg__opt'}>
                    <input type="radio" name="match" value={v} checked={match === v} onChange={() => setMatch(v)} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="fb__msg">
              <p className="fb__msg-label" id="msg-label">Tell us more</p>
              <div className="tabs" role="tablist" aria-labelledby="msg-label">
                <button
                  type="button" role="tab" aria-selected={mode === 'write'}
                  className={mode === 'write' ? 'tabs__tab tabs__tab--on' : 'tabs__tab'}
                  onClick={() => setMode('write')}
                >
                  <Icon name="pen" size={18} /> Write
                </button>
                <button
                  type="button" role="tab" aria-selected={mode === 'record'}
                  className={mode === 'record' ? 'tabs__tab tabs__tab--on' : 'tabs__tab'}
                  onClick={() => setMode('record')}
                >
                  <Icon name="mic" size={18} /> Record
                </button>
              </div>

              {mode === 'write' ? (
                <textarea
                  className="fb__text"
                  rows={4}
                  maxLength={500}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  aria-labelledby="msg-label"
                  placeholder="E.g. the music got louder in the second half"
                />
              ) : (
                <VoiceRecorder
                  onChange={(s) => {
                    setVoiceSec(s);
                    if (s) logEvent('feedback_voice_recorded', { classId: c.id, data: { seconds: s } });
                  }}
                />
              )}

              <p className="fb__privacy small">
                <Icon name="info" size={16} />
                <span>
                  Only the Urban Sports Clue team reads or hears this. It's never shown on the card. Tell us about the room. No need to share anything about your health.
                </span>
              </p>
            </div>

            <div className="fb__actions">
              <button type="button" className="btn btn--primary btn--block" onClick={send}>
                Send and collect my stamp
              </button>
            </div>
          </div>
        )}

        {/* ---------- Done: stamp, or the free-class reward on every 10th stamp ---------- */}
        {step === 'done' && <StampDone stamps={stamps} className={c.name} headingRef={headingRef} onClose={close} onSeeRewards={onSeeRewards} />}
      </div>
    </div>
  );

  return createPortal(body, document.body);
}

/**
 * "Stamp collected" (D rules): the 10-circle card of the current level (1–10, 11–20, 21–30) and
 * the same "4 of 10. 6 more for your socks." line as the profile. At 10 / 20 / 30 the card turns
 * into the reward ticket (socks / friend or massage / hoodie). "See your rewards" opens the profile.
 */
export function StampDone({
  stamps, className, headingRef, onClose, onSeeRewards,
}: { stamps: number; className: string; headingRef: React.RefObject<HTMLHeadingElement>; onClose: () => void; onSeeRewards?: () => void }) {
  const close = onClose;
  const lvl = level(stamps);
  const reached = rewardReachedAt(stamps);
  const line = progressLine(stamps);
  const onCard = Math.min(Math.max(stamps - lvl.from + 1, 0), 10);
  const card = (
    <div className="stampcard" role="img" aria-label={`${onCard} of 10 stamps on this card (${lvl.from}–${lvl.to})`}>
      {Array.from({ length: 10 }, (_, i) => {
        const n = lvl.from + i;
        const filled = n <= stamps;
        const isNew = n === stamps;
        return (
          <span key={n} className={`stampcard__slot${filled ? ' stampcard__slot--on' : ''}${isNew ? ' stampcard__slot--new' : ''}`}>
            {filled ? <Icon name="stamp" size={26} /> : n}
          </span>
        );
      })}
    </div>
  );
  const seeRewards = onSeeRewards && (
    <button type="button" className="linkbtn fb__seerewards" onClick={onSeeRewards}>See your rewards</button>
  );

  if (reached) {
    const ticket = reached.id === 'socks'
      ? { title: 'Socks', sub: 'Pick them up at any studio' }
      : reached.id === 'choice'
        ? { title: 'Invite a friend or a massage', sub: 'Choose one in your rewards' }
        : { title: 'Urban Sports Clue hoodie', sub: 'Pick it up at any studio' };
    return (
      <div className="fb__screen fb__screen--done fb__screen--reward">
        <Confetti />
        <h2 id="fb-title" tabIndex={-1} ref={headingRef} className="fb__title">
          {reached.id === 'choice' ? 'You\'ve earned a reward!' : `You've earned ${reached.id === 'socks' ? 'socks' : 'a hoodie'}!`}
        </h2>
        <p className="fb__lead">That was your {reached.at}th stamp. Thanks for helping others read the room.</p>

        {/* The full stamp card turns into a ticket (pure CSS sequence, runs once) */}
        <div className="reward">
          <div className="aura-behind"><Aura level={0} size="md" label="none" /></div>
          <div className="reward__card" aria-hidden="true">{card}</div>
          <div className="ticket">
            <span className="ticket__shine" aria-hidden="true" />
            <span className="ticket__icon" aria-hidden="true"><Icon name={reached.icon} size={40} /></span>
            <span className="ticket__body">
              <span className="ticket__eyebrow">Reward unlocked</span>
              <span className="ticket__title">{ticket.title}</span>
              <span className="ticket__sub">{ticket.sub}</span>
            </span>
          </div>
        </div>

        <p className="fb__reward"><strong>{line.count}</strong> {line.rest}</p>
        {seeRewards}

        <div className="fb__actions">
          <button type="button" className="btn btn--primary btn--block" onClick={close}>Great, thanks</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fb__screen fb__screen--done">
      <div className="aura-medal">
        <Aura level={0} size="sm" label="none" />
        <span className="fb__stamp-new" aria-hidden="true"><Icon name="stamp" size={56} /></span>
      </div>
      <h2 id="fb-title" tabIndex={-1} ref={headingRef} className="fb__title">Stamp collected</h2>
      <p className="fb__lead">Thanks! Your answers will help update the card for {className}.</p>
      {card}
      <p className="fb__reward"><strong>{line.count}</strong> {line.rest}</p>
      {seeRewards}
      <div className="fb__actions">
        <button type="button" className="btn btn--primary btn--block" onClick={close}>Done</button>
      </div>
    </div>
  );
}
