import { Link } from 'react-router-dom';
import { type ClassInfo, getStudio } from '../data/classes';
import { typeLabel } from '../lib/labels';
import { Icon } from './Icon';
import { km, studioKm, usePlace } from '../lib/location';

/**
 * One row in the class list.
 * Research: F-LOCATION (district, time and duration up front)
 * Research: F-INSIDE (looks like a normal booking-app list, Read the Room lives on the detail screen)
 */
export function ClassRow({ c, reason, distance = false }: { c: ClassInfo; reason?: string; distance?: boolean }) {
  const studio = getStudio(c.studioId);
  usePlace(); // D: distance follows the place chosen in the Energy Match card
  return (
    <li>
      <Link to={`/class/${c.id}`} className="row">
        <span className="row__time">
          <span className="row__start">{c.start}</span>
          <span className="row__dur">{c.durationMin} min</span>
        </span>
        <span className="row__main">
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
          <span className="chip">
            <Icon name={c.type} size={16} />
            {typeLabel[c.type]}
          </span>
        </span>
        <Icon name="chevronRight" className="row__chev" />
      </Link>
    </li>
  );
}
