import { STAMPS_FOR_REWARD, useFeedbackState } from '../lib/feedback';
import { Icon } from './Icon';

/** Small stamp count in the app bar. Not a link yet: the rewards screen is out of scope. */
export function StampCounter() {
  const { stamps } = useFeedbackState();
  const label =
    stamps >= STAMPS_FOR_REWARD
      ? `${stamps} stamps collected. Enough for a free class.`
      : `${stamps} of ${STAMPS_FOR_REWARD} stamps collected for a free class.`;
  return (
    <p className="stamps-pill" aria-label={label} title={label}>
      <Icon name="stamp" size={18} />
      <span aria-hidden="true">
        {stamps >= STAMPS_FOR_REWARD ? stamps : `${stamps}/${STAMPS_FOR_REWARD}`}
      </span>
    </p>
  );
}
