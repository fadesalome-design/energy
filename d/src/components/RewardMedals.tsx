import { Icon } from './Icon';
import { CHOICE_LABEL, isClaimed, nextReward, REWARDS, type Choice, type RewardId } from '../lib/rewards';

/**
 * Version D (copied 1:1 from Version C): "Your rewards" as 3 soft medals in one row (shared by "Stamp collected" and the
 * profile). Socks (turquoise) · Guest pass or massage (violet) · Hoodie (green). The next reward is
 * fully visible with a small progress bar; later ones are dimmed (only the medal, never the
 * text, so the text keeps its contrast). Reached: "Ready to claim" + a small Claim pill.
 */
interface Claims { socks?: boolean; choice?: Choice; choiceClaimed?: boolean; hoodie?: boolean }

const NAME: Record<RewardId, string> = { socks: 'Socks', choice: 'Guest pass or massage', hoodie: 'Hoodie' };

export function RewardMedals({ stamps, claims, onClaim }: { stamps: number; claims: Claims; onClaim: (id: RewardId) => void }) {
  const next = nextReward(stamps);
  return (
    <ul className="medals">
      {REWARDS.map((r, i) => {
        const claimed = isClaimed(claims, r.id);
        const ready = stamps >= r.at && !claimed;
        const isNext = next?.id === r.id;
        const later = !ready && !claimed && !isNext;
        const from = r.at - 10;
        const pct = Math.min(Math.max((stamps - from) / 10, 0), 1) * 100;
        return (
          <li key={r.id} className={`medal medal--${r.id}${later ? ' medal--later' : ''}${ready ? ' medal--ready' : ''}`} style={{ ['--i' as string]: i }}>
            <span className="medal__coin"><Icon name={r.icon} size={24} /></span>
            <span className="medal__at">{r.at}</span>
            <span className="medal__name">{NAME[r.id]}</span>
            {claimed ? (
              <span className="medal__status">Claimed ✓{r.id === 'choice' && claims.choice ? ` · ${CHOICE_LABEL[claims.choice]}` : ''}</span>
            ) : ready ? (
              <>
                <span className="medal__status medal__status--ready">Ready to claim</span>
                <button type="button" className="medal__claim" onClick={() => onClaim(r.id)}>Claim</button>
              </>
            ) : (
              <span className="medal__status">{r.at - stamps} to go</span>
            )}
            {isNext && !ready && (
              <span className="medal__bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
