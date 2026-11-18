import { Link } from 'react-router-dom';
import { memberInitial, memberName } from '../lib/persona';

/** SANDBOX D: round avatar (persona's initial) in the header; opens the profile. */
export function ProfileButton() {
  return (
    <Link to="/profile" className="avatar avatar--btn" aria-label={`${memberName}'s profile and rewards`}>
      <span aria-hidden="true">{memberInitial}</span>
    </Link>
  );
}
