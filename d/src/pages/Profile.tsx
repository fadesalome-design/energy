import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useFeedbackState } from '../lib/feedback';
import { memberInitial, memberName } from '../lib/persona';
import {
  CHOICE_DESCRIPTION, CHOICE_LABEL, claim, isClaimed, level, MAX_STAMPS, progressLine, REWARDS, useClaims, type Choice, type Reward,
} from '../lib/rewards';

/**
 * SANDBOX D: member profile with stamps and rewards. Mobile and ?frame=phone: full screen with
 * a back arrow. Desktop: inside the shared right side panel (`panel`), closed with ×.
 */
export function Profile({ panel = false }: { panel?: boolean }) {
  const { stamps } = useFeedbackState();
  const claims = useClaims();
  const lvl = level(stamps);
  const line = progressLine(stamps);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = `${memberName}'s profile · Urban Sports Clue`;
    if (!panel) window.scrollTo(0, 0);
    titleRef.current?.focus();
  }, [panel]);

  return (
    <main className={panel ? 'page profile profile--panel' : 'page profile'} id={panel ? undefined : 'main'}>
      {!panel && (
        <Link to="/" className="back">
          <Icon name="arrowLeft" size={20} /> Classes
        </Link>
      )}

      <header className="profile__head">
        <span className="avatar avatar--lg" aria-hidden="true">{memberInitial}</span>
        <h1 tabIndex={-1} ref={titleRef}>Hi {memberName}</h1>
      </header>

      {/* Your stamps: the 10 circles of the current level (1–10, 11–20, 21–30) */}
      <section className="pcard" aria-labelledby="stamps-title">
        <h2 id="stamps-title" className="pcard__title">Your stamps</h2>
        <div className="stampcard" role="img" aria-label={`${Math.min(Math.max(stamps - lvl.from + 1, 0), 10)} of 10 stamps on this card (${lvl.from}–${lvl.to})`}>
          {Array.from({ length: 10 }, (_, i) => {
            const n = lvl.from + i;
            const filled = n <= stamps;
            return (
              <span key={n} className={`stampcard__slot${filled ? ' stampcard__slot--on' : ''}`}>
                {filled ? <Icon name="stamp" size={26} /> : n}
              </span>
            );
          })}
        </div>
        <p className="pcard__line"><strong>{line.count}</strong> {line.rest}</p>

        {/* Progress 0–30 with the three milestones */}
        <div className="pbar" aria-hidden="true">
          <div className="pbar__track">
            <span className="pbar__fill" style={{ width: `${Math.min(stamps, MAX_STAMPS) / MAX_STAMPS * 100}%` }} />
            <span className="pbar__now" style={{ left: `${Math.min(stamps, MAX_STAMPS) / MAX_STAMPS * 100}%` }} />
          </div>
          <div className="pbar__marks">
            {REWARDS.map((r) => (
              <span key={r.id} className={stamps >= r.at ? 'pbar__mark pbar__mark--on' : 'pbar__mark'} style={{ left: `${r.at / MAX_STAMPS * 100}%` }}>
                <span className="pbar__dot"><Icon name={stamps >= r.at ? 'check' : r.icon} size={14} /></span>
                <span className="pbar__at">{r.at}</span>
                <span className="pbar__name">{r.id === 'choice' ? 'Guest pass or massage' : r.id === 'socks' ? 'Socks' : 'Hoodie'}</span>
              </span>
            ))}
          </div>
        </div>
        <p className="sr-only">{stamps} of {MAX_STAMPS} stamps. Rewards at 10 (socks), 20 (guest pass or massage) and 30 (hoodie).</p>
      </section>

      {/* Your rewards */}
      <section className="pcard" aria-labelledby="rewards-title">
        <h2 id="rewards-title" className="pcard__title">Your rewards</h2>
        <ul className="rewards">
          {REWARDS.map((r) => <RewardRow key={r.id} r={r} stamps={stamps} claimed={isClaimed(claims, r.id)} chosen={claims.choice} />)}
        </ul>
      </section>

      <section className="pcard pcard--plain" aria-labelledby="how-title">
        <h2 id="how-title" className="pcard__title">How to collect stamps</h2>
        <p>Rate a class after you go – one stamp per rating.</p>
      </section>
    </main>
  );
}

function RewardRow({ r, stamps, claimed, chosen }: { r: Reward; stamps: number; claimed: boolean; chosen?: Choice }) {
  const ready = stamps >= r.at && !claimed;
  const [pick, setPick] = useState<Choice | null>(null);
  const left = r.at - stamps;
  return (
    <li className={ready ? 'reward-row reward-row--ready' : 'reward-row'}>
      <span className="reward-row__icon"><Icon name={r.icon} size={22} /></span>
      <span className="reward-row__main">
        <span className="reward-row__title">{r.title}</span>
        {r.id === 'choice' && <span className="reward-row__at">{CHOICE_DESCRIPTION}</span>}
        <span className="reward-row__at">At {r.at} stamps</span>
        {claimed ? (
          <span className="reward-row__status reward-row__status--done">
            Claimed ✓{r.id === 'choice' && chosen ? ` · ${CHOICE_LABEL[chosen]}` : ''}
          </span>
        ) : ready ? (
          <span className="reward-row__status reward-row__status--ready">Ready to claim</span>
        ) : (
          <span className="reward-row__status">{left === 1 ? '1 stamp to go' : `${left} stamps to go`}</span>
        )}

        {/* At 20 the member picks ONE: free class for a friend or free massage, then claims (demo only) */}
        {ready && r.id === 'choice' && (
          <span className="reward-row__choice" role="group" aria-label="Choose one">
            {(['friend', 'massage'] as Choice[]).map((c) => (
              <button key={c} type="button" className={pick === c ? 'pill pill--sub pill--on' : 'pill pill--sub'} aria-pressed={pick === c} onClick={() => setPick(c)}>
                <Icon name={pick === c ? 'check' : c === 'friend' ? 'partner' : 'hand'} size={16} />
                {CHOICE_LABEL[c]}
              </button>
            ))}
          </span>
        )}
      </span>
      {ready && (
        <button
          type="button"
          className="btn btn--primary reward-row__claim"
          disabled={r.id === 'choice' && !pick}
          onClick={() => claim(r.id, pick ?? undefined)}
        >
          Claim
        </button>
      )}
    </li>
  );
}
