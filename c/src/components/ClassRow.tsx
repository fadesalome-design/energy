import { Link } from 'react-router-dom';
import { type ClassInfo, getStudio } from '../data/classes';
import { Icon } from './Icon';
import { Photo } from './Photo';
import { km, studioKm, usePlace } from '../lib/location';

/**
 * D: one class card in the list. Photo on the left; time and duration, class name,
 * place · district · distance, then intensity and the room trait chips.
 * Chips are information only (not buttons), so they use a flat, borderless style.
 */
const INTENSITY = { gentle: 'Gentle', moderate: 'Moderate', hard: 'Hard' } as const;
const NOISE = { quiet: 'Quiet', medium: 'Some music', loud: 'Loud' } as const;
const LIGHT = { soft: 'Soft light', normal: 'Normal light', bright: 'Bright light', flashing: 'Flashing lights' } as const;
const CROWD = { small: 'Small group', medium: 'Medium group', large: 'Large group' } as const;

export function ClassRow({ c, reason, distance = false }: { c: ClassInfo; reason?: string; distance?: boolean }) {
  const studio = getStudio(c.studioId);
  usePlace(); // distance follows the place chosen in the Energy Match card
  const t = studio.traits;
  return (
    <li>
      <Link to={`/class/${c.id}`} className="row row--d">
        <Photo src={studio.photo} icon={c.type} className="row__photo" />
        <span className="row__main">
          <span className="row__when">
            <strong>{c.start}</strong> · {c.durationMin} min
          </span>
          <span className="row__name">{c.name}</span>
          <span className="row__studio">
            {studio.name} · {studio.district}{distance && <> · {km(studioKm(studio.id))}</>}
          </span>
          {reason && (
            <span className="row__reason">
              <Icon name="sparkle" size={14} />
              {reason}
            </span>
          )}
          <span className="tchips">
            <span className={`tchip tchip--${c.intensity}`}>
              <Icon name="flash" size={12} />{INTENSITY[c.intensity]}
            </span>
            <span className="tchip">{NOISE[t.noise]}</span>
            <span className="tchip">{LIGHT[t.light]}</span>
            <span className="tchip">{CROWD[t.crowd]}</span>
            {t.partnerWork === 'yes' && <span className="tchip">Partner work</span>}
          </span>
        </span>
        <Icon name="chevronRight" className="row__chev" />
      </Link>
    </li>
  );
}
