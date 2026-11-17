import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { endTime, getClass, getStudio } from '../data/classes';
import { closeBooking, getStamps, now, type Booking } from '../lib/feedback';
import { addRatingV4, CATEGORY_LABEL, pickQuestionsV4, type RatingV4 } from '../lib/energy';
import { logEvent } from '../lib/events';
import { dayLabel, StampDone } from './FeedbackModal';
import { Icon } from './Icon';

/**
 * "Rate your class" (Energy Match, PRD v4 G–H).
 * 1. "Was it as you expected?"  2–4. one tap question from each of 3 different categories,
 * preferring the categories with the fewest ratings for this class. About 15 seconds,
 * no free text. "Skip" is always visible and we never ask about this class again.
 * Answers feed the card and the Quiet & dim chip.
 */
type Step = 'expected' | 0 | 1 | 2 | 'done';
const ADVANCE_MS = 350;

export function RateClassV4({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const c = getClass(booking.classId)!;
  const studio = getStudio(c.studioId);
  const questions = useMemo(() => pickQuestionsV4(c), [c]);
  const [step, setStep] = useState<Step>('expected');
  const [expected, setExpected] = useState<RatingV4['expected']>(null);
  const [answers, setAnswers] = useState<RatingV4['answers']>({});
  const [stamps, setStamps] = useState(getStamps);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advance = useRef<number | null>(null);

  useEffect(() => {
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    logEvent('feedback_shown', { classId: c.id, classType: c.type, data: { version: 'energy', questions: questions.map((q) => q.id) } });
    return () => {
      root?.removeAttribute('inert');
      document.body.style.overflow = prev;
      if (advance.current) window.clearTimeout(advance.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { headingRef.current?.focus(); }, [step]);

  const skip = () => {
    logEvent('feedback_dismissed', { classId: c.id, classType: c.type, data: { version: 'energy', step: String(step) } });
    closeBooking(booking.id, 'skipped');
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && step !== 'done') skip(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const finish = (all: RatingV4['answers']) => {
    addRatingV4({ classId: c.id, at: new Date(now()).toISOString(), expected, answers: all });
    const total = closeBooking(booking.id, 'submitted');
    logEvent('feedback_submitted', { classId: c.id, classType: c.type, data: { version: 'energy', expected, answers: all, stamps: total } });
    setStamps(total);
    setStep('done');
  };

  const later = (fn: () => void) => {
    if (advance.current) return;
    advance.current = window.setTimeout(() => { advance.current = null; fn(); }, ADVANCE_MS);
  };

  const pickExpected = (v: 'yes' | 'partly' | 'no') => {
    if (advance.current) return;
    setExpected(v);
    logEvent('feedback_answered', { classId: c.id, data: { question: 'expected', answer: v } });
    later(() => setStep(0));
  };

  const pickAnswer = (i: 0 | 1 | 2, val: 0 | 1 | 2) => {
    if (advance.current) return;
    const q = questions[i];
    const next = { ...answers, [q.id]: val };
    setAnswers(next);
    logEvent('feedback_answered', { classId: c.id, data: { question: q.id, answer: q.options[val] } });
    later(() => (i < 2 ? setStep((i + 1) as Step) : finish(next)));
  };

  const back = () => {
    if (advance.current) return;
    setStep(step === 0 ? 'expected' : ((step as number) - 1) as Step);
  };

  const progress = step === 'expected' ? 1 : typeof step === 'number' ? step + 2 : 4;

  const options = (labels: readonly string[], chosen: number | null, onPick: (i: 0 | 1 | 2) => void) => (
    <div className="fb__options" role="group" aria-labelledby="fb-title">
      {labels.map((l, i) => (
        <button key={l} type="button" aria-pressed={chosen === i} className={chosen === i ? 'opt opt--on' : 'opt'} onClick={() => onPick(i as 0 | 1 | 2)}>
          <span className="opt__word">{l}</span>
          <span className="opt__check" aria-hidden="true"><Icon name="check" size={18} /></span>
        </button>
      ))}
    </div>
  );

  const body = (
    <div className="fb" role="dialog" aria-modal="true" aria-labelledby="fb-title">
      <div className="fb__inner">
        {step !== 'done' && (
          <>
            <div className="fb__top">
              {step !== 'expected' ? (
                <button type="button" className="fb__back" onClick={back}><Icon name="arrowLeft" size={20} /> Back</button>
              ) : <span />}
              <p className="fb__progress">{progress} of 4</p>
              <button type="button" className="fb__notnow" onClick={skip}>Skip</button>
            </div>
            <div className="fb__steps" aria-hidden="true">
              {[1, 2, 3, 4].map((i) => <span key={i} className={i <= progress ? 'fb__step fb__step--on' : 'fb__step'} />)}
            </div>
            <div className="fb__classhead">
              <span className="fb__classicon"><Icon name={c.type} size={24} /></span>
              <div>
                <p className="fb__classname">{c.name}</p>
                <p className="fb__classmeta">{dayLabel(booking.endsAt)} {c.start}–{endTime(c)} · {studio.name}</p>
              </div>
            </div>
          </>
        )}

        {step === 'expected' && (
          <div className="fb__screen">
            <p className="fb__intro">Rate your class: 4 taps, about 15 seconds. Your answers help others pick a class.</p>
            <h2 id="fb-title" tabIndex={-1} ref={headingRef} className="fb__title">Was it as you expected?</h2>
            {options(['Yes', 'Partly', 'No'], expected === null ? null : ['yes', 'partly', 'no'].indexOf(expected), (i) => pickExpected((['yes', 'partly', 'no'] as const)[i]))}
          </div>
        )}

        {typeof step === 'number' && (() => {
          const q = questions[step];
          const chosen = answers[q.id] ?? null;
          return (
            <div className="fb__screen" key={q.id}>
              <p className="muted small">{CATEGORY_LABEL[q.category]}</p>
              <h2 id="fb-title" tabIndex={-1} ref={headingRef} className="fb__title">{q.prompt}</h2>
              {options(q.options, chosen, (v) => pickAnswer(step, v))}
            </div>
          );
        })()}

        {step === 'done' && <StampDone stamps={stamps} className={c.name} headingRef={headingRef} onClose={onClose} />}
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
