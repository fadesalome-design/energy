import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { endTime, getClass, getStudio } from '../data/classes';
import {
  dismissFeedback, getStamps, now, pickQuestions, submitFeedback,
  type Booking, type Level, type MatchAnswer, type Question,
} from '../lib/feedback';
import { addRatingV4, CATEGORY_LABEL, pickQuestionsV4, QUESTIONS } from '../lib/energy';
import { logEvent } from '../lib/events';
import { Icon } from './Icon';
import { Aura, type AuraLevel } from './Aura';
import { StampGrid } from './StampGrid';
import { RewardMedals } from './RewardMedals';
import { auraMembers, auraSentence } from '../lib/auraSummary';
import { claim, counterLabel, progressLine, useClaims } from '../lib/rewards';
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
type Step = 0 | 1 | 2 | 'ai' | 'final' | 'done';

/** Pause after a tap so the choice is visible before moving on. */
const ADVANCE_MS = 350;
type MessageMode = 'write' | 'record';

const LEVELS: Level[] = ['low', 'medium', 'high'];


// C: no confetti (the reward ticket and confetti were replaced by the aura stamp screen)

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
  void version; // C always runs the B-based rating (Version E's path was removed)
  // D: always Version E's categories (pickQuestionsV4), picked once per opening
  const questions = useMemo(() => energyQuestions(c), [c]);
  void pickQuestions;

  const [step, setStep] = useState<Step>(0); // D: opens on question 1
  const [answers, setAnswers] = useState<Record<string, Level>>({});
  const [match, setMatch] = useState<MatchAnswer | null>(null);
  const [mode, setMode] = useState<MessageMode>('write');
  const [text, setText] = useState('');
  const [voiceSec, setVoiceSec] = useState<number | null>(null);
  const [stamps, setStamps] = useState(getStamps);
  const [flyFrom, setFlyFrom] = useState<{ x: number; y: number; size: number } | null>(null);
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
    const st = document.querySelector('.fb .aura__stage')?.getBoundingClientRect();
    if (st) setFlyFrom({ x: st.left + st.width / 2, y: st.top + st.height / 2, size: Math.min(st.width, st.height) });
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


  const close = () => onClose();

  const qIndex = typeof step === 'number' ? step : null;
  const total = 4; // D: 3 questions + "Anything else?"
  // D: Question 1–3 of 3, then "Anything else?" as the 4th and last step
  const progress: number | null = qIndex !== null ? qIndex + 1 : step === 'final' ? 4 : null;
  void total;
  // C: aura state. answeredCount = how many of the 3 questions have an answer (0–3)
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  // C: the level follows the step the member is on (dots: question 1 / 2 / 3; full on the AI moment)
  const auraLevel: AuraLevel = step === 'ai' || step === 'final' ? 3 : typeof step === 'number' ? (step as AuraLevel) : 0;
  const auraLabel: 'shown' | 'gone' = step === 'ai' || (step === 0 && answeredCount === 0) ? 'shown' : 'gone';
  const answerIdx = Object.fromEntries(Object.entries(answers).map(([k, l]) => [k, LEVELS.indexOf(l) as 0 | 1 | 2]));

  const goBack = () => {
    if (advance.current) return;
    if (step === 'final') return setStep('ai');
    if (step === 'ai') return setStep(2);
    setStep(Math.max(0, (step as number) - 1) as Step);
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
                ‹ Back
              </button>
            ) : <span />}
            <button type="button" className="fb__notnow" onClick={notNow}>Not now</button>
          </div>
        )}
        {(
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
        {step === 0 && (
          <p className="aura-intro">3 quick questions about the room, not about you. Anonymous, and you'll collect a stamp.</p>
        )}
        {step !== 'done' && (
          <div className={step === 'final' ? 'aura-wrap aura-wrap--small' : 'aura-wrap'}>
            <Aura level={auraLevel} label={auraLabel} size={step === 'final' ? 'md' : 'lg'} />
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

              {qIndex === 0 && <p className="aura-hint aura-hint--bottom">Not now? We'll ask again next time you open the app.</p>}
            </div>
          );
        })()}


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
        {step === 'done' && <StampDone stamps={stamps} className={c.name} headingRef={headingRef} onClose={close} onSeeRewards={onSeeRewards} flyFrom={flyFrom} />}
      </div>
    </div>
  );

  return createPortal(body, document.body);
}

/**
 * Version C: "Stamp collected" in the cool aura style. After "Send and collect my stamp" the
 * AI-moment aura shrinks into a small glowing dot (~1 s), flies into the next empty circle and
 * lands there (0.4 → 1.15 → 1 with a soft turquoise glow, ~0.6 s); then the texts fade in.
 * Same stamp logic, counts and reward rules. Under reduced motion the new stamp simply appears.
 */
export function StampDone({
  stamps, className, headingRef, onClose, onSeeRewards, flyFrom,
}: {
  stamps: number; className: string; headingRef: React.RefObject<HTMLHeadingElement>; onClose: () => void;
  onSeeRewards?: () => void; flyFrom?: { x: number; y: number; size: number } | null;
}) {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = !!flyFrom && !reduced;
  const [phase, setPhase] = useState<'fly' | 'land' | 'done'>(animate ? 'fly' : 'done');
  const gridRef = useRef<HTMLDivElement>(null);
  const claims = useClaims();
  const line = progressLine(stamps);

  useLayoutEffect(() => {
    if (!animate || !flyFrom) return;
    const slot = gridRef.current?.querySelector(`[data-stamp="${stamps}"]`) as HTMLElement | null;
    if (!slot) { setPhase('done'); return; }
    const t = slot.getBoundingClientRect();
    const tx = t.left + t.width / 2, ty = t.top + t.height / 2;
    const dot = document.createElement('span');
    dot.className = 'flydot';
    const S = flyFrom.size;
    Object.assign(dot.style, { width: `${S}px`, height: `${S}px`, left: `${flyFrom.x - S / 2}px`, top: `${flyFrom.y - S / 2}px` });
    document.body.appendChild(dot);
    const small = t.width / S;
    const move = `translate(${tx - flyFrom.x}px, ${ty - flyFrom.y}px)`;
    const a = dot.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 0.95 },
      { transform: `translate(0, 0) scale(${small})`, opacity: 1, offset: 0.62 },
      { transform: `${move} scale(${small})`, opacity: 1 },
    ], { duration: 1600, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' });
    a.onfinish = () => {
      dot.remove();
      setPhase('land');
      window.setTimeout(() => setPhase('done'), 650);
    };
    return () => { a.cancel(); dot.remove(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const textsIn = phase !== 'fly';
  const claimHere = (id: 'socks' | 'choice' | 'hoodie') => {
    // Friend OR massage is chosen in the profile; socks and the hoodie are claimed right here
    if (id === 'choice') onSeeRewards?.(); else claim(id);
  };

  return (
    <div className="fb__screen sdone">
      <div className={textsIn ? 'sdone__texts sdone__texts--in' : 'sdone__texts'}>
        <p className="sdone__eyebrow">✦ Your energy became a stamp</p>
        <h2 id="fb-title" tabIndex={-1} ref={headingRef} className="sdone__title">Stamp collected</h2>
        <p className="sdone__lead">Thanks! Your answers help update the card for {className}.</p>
      </div>

      <div className="sdone__card" ref={gridRef}>
        <StampGrid stamps={stamps} pending={phase === 'fly'} landing={phase === 'land'} />
        <p className="sdone__line"><strong>{line.count}</strong> {line.rest}</p>
      </div>

      <section className={textsIn ? 'sdone__rewards sdone__texts--in' : 'sdone__rewards sdone__texts'} aria-labelledby="sdone-rewards">
        <h3 id="sdone-rewards" className="sdone__rtitle">Your rewards</h3>
        <RewardMedals stamps={stamps} claims={claims} onClaim={claimHere} />
      </section>

      <div className={textsIn ? 'sdone__actions sdone__texts--in' : 'sdone__actions sdone__texts'}>
        <button type="button" className="sdone__done" onClick={onClose}>Done</button>
        {onSeeRewards && <button type="button" className="linkbtn sdone__link" onClick={onSeeRewards}>See your rewards</button>}
      </div>
    </div>
  );
}
