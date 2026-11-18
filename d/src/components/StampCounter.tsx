import { useFeedbackState } from '../lib/feedback';
import { counterLabel, nextReward } from '../lib/rewards';
import { Icon } from './Icon';

/** Small stamp count in the app bar. Not a link yet: the rewards screen is out of scope. */
/** D: stamps toward the next reward ("4/10", "14/20", "24/30"); same total as the profile. */
export function StampCounter() {
  const { stamps } = useFeedbackState();
  const next = nextReward(stamps);
  const label = next
    ? `${stamps} stamps. ${next.at - stamps} more for ${next.short}.`
    : `${stamps} stamps. Every reward unlocked.`;
  return (
    <p className="stamps-pill" aria-label={label} title={label}>
      <Icon name="stamp" size={18} />
      <span aria-hidden="true">{counterLabel(stamps)}</span>
    </p>
  );
}
