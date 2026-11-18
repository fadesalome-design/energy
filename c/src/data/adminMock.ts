/**
 * MOCK data for the studio admin report. Everything here is invented to showcase the feature.
 *
 * In the real product, member answers (see lib/feedback.ts) would be aggregated on a server
 * and an AI model would write the report. Here the numbers are generated deterministically
 * from each class's card, with a few hand-picked "the card is wrong" stories, and the
 * "AI" text is written from templates over those numbers, so text and charts always agree.
 *
 * Privacy rules the real report must follow (and this mock shows):
 * - Owners never see individual answers, messages or voice notes.
 * - A topic needs at least MIN_ANSWERS answers before we show anything about it.
 */
import { classes, getStudio, studios, type ClassInfo } from './classes';
import { QUESTION_POOL, type Level } from '../lib/feedback';
import { MOODS, SENSORY } from '../lib/filters';

export const MIN_ANSWERS = 5;
export const PERIOD_DAYS = 30;

export type Dist = Record<Level, number>;

export interface Topic {
  id: string;
  label: string;
  question: string;
  words: Record<Level, string>;
  answers: number;
  dist: Dist;
  /** What the card says today, as a level. null = "Not described yet" */
  claim: Level | null;
  claimText: string | null;
  /** Most common member answer */
  majority: Level;
  status: 'matches' | 'differs' | 'missing' | 'too-few';
}

export interface CardFix {
  id: string;
  classId: string;
  topic: string;
  kind: 'update' | 'add';
  from: string | null;
  to: string;
  evidence: string;
}

export interface ClassReport {
  c: ClassInfo;
  answers: number;
  match: { yes: number; partly: number; no: number };
  topics: Topic[];
  fixes: CardFix[];
  hiddenBy: { id: string; label: string; count: number }[];
  funnel: { views: number; bookings: number; notForMe: number };
}

export interface StudioReport {
  studioId: string;
  answers: number;
  classes: ClassReport[];
  matchYesPct: number;
  hiddenTotal: number;
  summary: string;
  suggestions: { title: string; body: string; classId: string; impact: string }[];
}

// ---------------------------------------------------------------------------

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const LEVELS: Level[] = ['low', 'medium', 'high'];

/** What each class's card currently claims, translated to Low / Medium / High. */
function claimFor(id: string, c: ClassInfo): Level | null {
  const x = c.expect;
  switch (id) {
    case 'crowd': return ({ calm: 'low', moderate: 'medium', busy: 'high' } as const)[x.crowd.busyness];
    case 'music': return x.sound.volume <= 2 ? 'low' : x.sound.volume === 3 ? 'medium' : 'high';
    case 'voice': return x.sound.mic === null ? null : x.trainer.style >= 4 ? 'high' : x.sound.mic ? 'medium' : 'low';
    case 'light': return x.light.level === 'flashing' ? 'high' : x.light.level === 'bright' ? 'medium' : 'low';
    case 'air': return x.clean.temperature === null ? null : /warm/i.test(x.clean.temperature) ? 'high' : 'low';
    case 'touch':
      if (x.partner.work === 'required' || (x.trainer.handsOn && x.trainer.asksBeforeTouch === false)) return 'high';
      return x.trainer.handsOn ? 'medium' : 'low';
    case 'break': return x.leaving.quietExitOk ? 'low' : 'high';
    case 'changing': {
      const s = getStudio(c.studioId).facilities.changingRoom.crowding;
      return s === 'roomy' ? 'low' : s === 'gets-busy' ? 'medium' : 'high';
    }
    default: return null; // smell, pace: not on the card yet
  }
}

/**
 * Hand-picked stories: what members say differs from the card.
 * Everything not listed here roughly agrees with the card.
 */
const STORIES: Record<string, Partial<Record<string, Level>>> = {
  'slow-flow': { light: 'medium' },
  'vinyasa-open': { music: 'high', crowd: 'high' },
  'reformer-open': { crowd: 'high' },
  'sunrise-spin': { music: 'high' },
  'hiit-express': { air: 'high' },
  'strength-basics': { changing: 'high' },
  'boxing-fundamentals': { break: 'high' },
  'contemporary-beginners': { voice: 'low', pace: 'low' },
  'dance-cardio': { light: 'high', pace: 'high' },
  'lane-swim': { music: 'medium', smell: 'high' },
  'mat-pilates': { smell: 'low' },
  'rhythm-ride': {},
};

function makeDist(center: Level, total: number, r: () => number): Dist {
  const share = 0.6 + r() * 0.2;
  const main = Math.round(total * share);
  const rest = total - main;
  const i = LEVELS.indexOf(center);
  const d: Dist = { low: 0, medium: 0, high: 0 };
  d[center] = main;
  const neighbours = LEVELS.filter((_, j) => Math.abs(j - i) === 1);
  if (neighbours.length === 1) {
    const far = LEVELS.find((_, j) => Math.abs(j - i) === 2)!;
    const near = Math.round(rest * 0.8);
    d[neighbours[0]] = near;
    d[far] = rest - near;
  } else {
    const a = Math.round(rest * (0.4 + r() * 0.2));
    d[neighbours[0]] = a;
    d[neighbours[1]] = rest - a;
  }
  return d;
}

function claimWord(id: string, level: Level) {
  return QUESTION_POOL.find((q) => q.id === id)!.options[level];
}

function buildClass(c: ClassInfo): ClassReport {
  const r = rng(c.id);
  const answers = c.reports;
  const story = STORIES[c.id] ?? {};

  const topics: Topic[] = QUESTION_POOL.map((q, qi) => {
    // Each feedback asks 3 of the 10 questions, so each topic gets roughly 3/10 of the answers.
    const n = Math.max(1, Math.round(answers * (0.24 + ((qi * 7 + answers) % 10) / 100)));
    const claim = claimFor(q.id, c);
    const center = story[q.id] ?? claim ?? LEVELS[Math.floor(r() * 3)];
    const dist = makeDist(center, n, r);
    const majority = LEVELS.reduce((m, l) => (dist[l] > dist[m] ? l : m), 'low' as Level);
    const status: Topic['status'] =
      n < MIN_ANSWERS ? 'too-few' : claim === null ? 'missing' : majority === claim ? 'matches' : 'differs';
    return {
      id: q.id, label: q.cardRow === 'Sound' ? (q.id === 'music' ? 'Music' : 'Instructor voice') : topicLabel(q.id),
      question: q.prompt, words: q.options, answers: n, dist, claim,
      claimText: claim ? claimWord(q.id, claim) : null, majority, status,
    };
  });

  const differs = topics.filter((t) => t.status === 'differs').length;
  const yes = Math.max(0.35, 0.82 - differs * 0.17 - r() * 0.05);
  const partly = Math.min(1 - yes, 0.12 + differs * 0.08);
  const yesN = Math.round(answers * yes);
  const partlyN = Math.round(answers * partly);
  const match = { yes: yesN, partly: partlyN, no: Math.max(0, answers - yesN - partlyN) };

  const fixes: CardFix[] = topics
    .filter((t) => t.status === 'differs' || t.status === 'missing')
    .map((t) => ({
      id: `${c.id}:${t.id}`,
      classId: c.id,
      topic: t.label,
      kind: t.status === 'missing' ? 'add' : 'update',
      from: t.claimText,
      to: t.words[t.majority],
      evidence: `${t.dist[t.majority]} of ${t.answers} members said "${t.words[t.majority]}"`,
    }));

  const pop: Record<string, number> = { quietMusic: 1.4, notCrowded: 1.3, softLight: 1, noFlashing: 0.6, touchConsent: 0.7, noPartner: 0.5, easyExit: 0.8 };
  const hiddenBy = [
    ...SENSORY.filter((s) => !s.test(c)).map((s) => ({
      id: s.id, label: s.label, count: Math.round((14 + r() * 30) * (pop[s.id] ?? 1)),
    })),
    ...MOODS.filter((m) => !m.test(c)).map((m) => ({
      id: `mood-${m.id}`, label: `Mood: ${m.label}`, count: Math.round(10 + r() * 35),
    })),
  ].sort((a, b) => b.count - a.count);

  const views = Math.round(answers * (5 + r() * 3));
  const bookings = Math.round(views * (0.18 + (1 - differs * 0.08) * 0.14 + r() * 0.04));
  return {
    c, answers, match, topics, fixes, hiddenBy,
    funnel: { views, bookings, notForMe: Math.round(views * (0.06 + differs * 0.03 + r() * 0.03)) },
  };
}

function topicLabel(id: string) {
  return ({ crowd: 'Crowd', light: 'Light', air: 'Air', smell: 'Smells', touch: 'Touch & partners', pace: 'Predictability', break: 'Stepping out', changing: 'Changing room' } as Record<string, string>)[id] ?? id;
}

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

/** The "AI" part: template text over the same numbers the charts use. */
function writeReport(reports: ClassReport[]) {
  const answers = reports.reduce((s, r) => s + r.answers, 0);
  const yes = reports.reduce((s, r) => s + r.match.yes, 0);
  const best = [...reports].sort((a, b) => pct(b.match.yes, b.answers) - pct(a.match.yes, a.answers))[0];
  const worst = [...reports].sort((a, b) => pct(a.match.yes, a.answers) - pct(b.match.yes, b.answers))[0];
  // Biggest gaps first: classes with the lowest card match lead.
  const differs = [...reports]
    .sort((a, b) => pct(a.match.yes, a.answers) - pct(b.match.yes, b.answers))
    .flatMap((r) => r.topics.filter((t) => t.status === 'differs').map((t) => ({ r, t })));
  const missing = reports.flatMap((r) => r.topics.filter((t) => t.status === 'missing').map((t) => ({ r, t })));

  let summary = `Over the last ${PERIOD_DAYS} days, ${answers} members answered questions about your classes. `;
  summary += `${pct(yes, answers)}% said the class matched its "What to expect" card. `;
  if (reports.length > 1 && best !== worst && best !== differs[0]?.r) {
    summary += `${best.c.name} is described most accurately (${pct(best.match.yes, best.answers)}% "yes"). `;
  }
  if (differs.length) {
    const d = differs[0];
    summary += `The biggest gap is ${d.t.label.toLowerCase()} in ${d.r.c.name}: the card says "${d.t.claimText}", but most members said "${d.t.words[d.t.majority]}". `;
  } else {
    summary += 'Members describe your rooms the same way your cards do. ';
  }
  summary += 'Remember: "loud" or "busy" is not bad. Many members choose exactly that. What matters is that the card says so.';

  const suggestions: StudioReport['suggestions'] = [];
  for (const { r, t } of differs.slice(0, 2)) {
    suggestions.push({
      classId: r.c.id,
      title: `Update "${t.label}" on ${r.c.name}`,
      body: `${t.dist[t.majority]} of ${t.answers} members said "${t.words[t.majority]}", while the card says "${t.claimText}". Either update the card, or, if this is not how you want the class to feel, look at what changed. Members who are sensitive to ${t.label.toLowerCase()} rely on this line.`,
      impact: `Card match for this class: ${pct(r.match.yes, r.answers)}% today`,
    });
  }
  const topHidden = reports
    .map((r) => ({ r, h: r.hiddenBy.find((h) => !h.id.startsWith('mood-')) }))
    .filter((x) => x.h)
    .sort((a, b) => b.h!.count - a.h!.count)[0];
  if (topHidden) {
    suggestions.push({
      classId: topHidden.r.c.id,
      title: `${topHidden.r.c.name} is hidden by "${topHidden.h!.label}"`,
      body: `Members who use this sensory filter didn't see the class ${topHidden.h!.count} times. If it fits the class, consider a gentler version (for example one session a week with softer settings) and describe it on its own card.`,
      impact: `${topHidden.h!.count} times hidden in ${PERIOD_DAYS} days`,
    });
  }
  if (missing.length && suggestions.length < 4) {
    const m = missing[0];
    suggestions.push({
      classId: m.r.c.id,
      title: `Add "${m.t.label}" to ${m.r.c.name}`,
      body: `Your card doesn't describe this yet. Members now agree on "${m.t.words[m.t.majority]}" (${m.t.dist[m.t.majority]} of ${m.t.answers}). Adding it removes a "Not described yet" from the card.`,
      impact: 'One fewer unknown for new members',
    });
  }
  if (!suggestions.length) {
    suggestions.push({
      classId: best.c.id,
      title: 'Keep doing what you do',
      body: 'Your cards match what members experience. Check back after you change music, lights or class size.',
      impact: '',
    });
  }
  return { summary, suggestions, answers, yesPct: pct(yes, answers) };
}

export function getStudioReport(studioId: string): StudioReport | null {
  if (!studios.some((s) => s.id === studioId)) return null;
  const reps = classes.filter((c) => c.studioId === studioId).map(buildClass);
  const w = writeReport(reps);
  return {
    studioId,
    answers: w.answers,
    classes: reps,
    matchYesPct: w.yesPct,
    hiddenTotal: reps.reduce((s, r) => s + r.hiddenBy.filter((h) => !h.id.startsWith('mood-')).reduce((a, h) => a + h.count, 0), 0),
    summary: w.summary,
    suggestions: w.suggestions,
  };
}
