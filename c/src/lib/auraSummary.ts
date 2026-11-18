/**
 * Version C: the "room's aura" sentence on the AI moment screen.
 *
 * PLACEHOLDER – replaced by the real AI summary (CALM-8) in Lovable.
 * In C it is built by simple rules (no AI call): this member's 3 answers win where they exist,
 * otherwise the class's room data from the demo ratings and studio traits fill the gaps.
 */
import { getStudio, type ClassInfo } from '../data/classes';
import { getRatingsV4 } from './energy';

/** answers: question id → chosen option (0 / 1 / 2) for the 3 questions just answered */
export function auraSentence(c: ClassInfo, answers: Record<string, 0 | 1 | 2>): string {
  const t = getStudio(c.studioId).traits;

  const sound =
    answers.music === 2 ? 'loud music'
      : answers.music === 0 ? 'quiet'
        : answers.atmosphere === 0 ? 'a calm feel'
          : answers.atmosphere === 2 ? 'high energy'
            : t.noise === 'quiet' ? 'usually quiet' : t.noise === 'loud' ? 'usually loud' : 'some music in the background';

  const space =
    answers.crowd === 0 ? 'space around you'
      : answers.crowd === 1 ? 'comfortably full'
        : answers.crowd === 2 ? 'often packed'
          : t.crowd === 'small' ? 'space around you' : t.crowd === 'large' ? 'often packed' : 'a medium-sized group';

  const effort =
    answers.level === 2 ? 'harder than the label'
      : answers.level === 0 ? 'easier than the label'
        : answers.coaching === 2 ? 'coaching that pushes hard'
          : answers.coaching === 0 ? 'gentle coaching'
            : `${c.intensity} effort`;

  const s = [sound, space, effort].join(', ');
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}.`;
}

/** "from N members": the class's demo member answers + ratings given in C + this one */
export function auraMembers(c: ClassInfo): number {
  return c.reports + getRatingsV4().filter((r) => r.classId === c.id).length + 1;
}
