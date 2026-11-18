import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StampGrid } from '../components/StampGrid';
import { RewardMedals } from '../components/RewardMedals';
import { Icon } from '../components/Icon';
import { useFeedbackState } from '../lib/feedback';
import { memberInitial, memberName } from '../lib/persona';
import {
  CHOICE_DESCRIPTION, CHOICE_LABEL, claim, MAX_STAMPS, progressLine, REWARDS, useClaims, type Choice,
} from '../lib/rewards';

/**
 * SANDBOX D: member profile with stamps and rewards. Mobile and ?frame=phone: full screen with
 * a back arrow. Desktop: inside the shared right side panel (`panel`), closed with ×.
 */
export function Profile({ panel = false }: { panel?: boolean }) {
  const { stamps } = useFeedbackState();
  const claims = useClaims();
  const line = progressLine(stamps);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const rewardsRef = useRef<HTMLElement>(null);
  const [choosing, setChoosing] = useState(false);
  const location = useLocation();
  // "See your rewards" (from Stamp collected) opens the profile at the rewards
  useEffect(() => {
    if ((location.state as { to?: string } | null)?.to === 'rewards') rewardsRef.current?.scrollIntoView({ block: 'start' });
  }, [location.state]);

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
        {/* C: same mini-aura stamps as "Stamp collected" */}
        <StampGrid stamps={stamps} />
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
      <section className="pcard" aria-labelledby="rewards-title" id="rewards" ref={rewardsRef}>
        <h2 id="rewards-title" className="pcard__title">Your rewards</h2>
        {/* C: same soft medals as "Stamp collected" */}
        <RewardMedals stamps={stamps} claims={claims} onClaim={(id) => (id === 'choice' ? setChoosing(true) : claim(id))} />
        {/* the Claim pill on "Guest pass or massage" leads here: pick one, then Claim */}
        {stamps >= 20 && !claims.choiceClaimed && <ChoiceRow focus={choosing} />}
      </section>

      <section className="pcard pcard--plain" aria-labelledby="how-title">
        <h2 id="how-title" className="pcard__title">How to collect stamps</h2>
        <p>Rate a class after you go – one stamp per rating.</p>
      </section>
    </main>
  );
}

/** At 20 stamps: pick ONE (free class for a friend OR free massage), then Claim (demo only). */
function ChoiceRow({ focus }: { focus: boolean }) {
  const [pick, setPick] = useState<Choice | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (focus) ref.current?.scrollIntoView({ block: 'center' }); }, [focus]);
  return (
    <div ref={ref} className="choice-row" role="group" aria-label="Guest pass or massage: choose one">
      <p className="choice-row__q">Your 20-stamp reward: choose one</p>
      <p className="muted small">{CHOICE_DESCRIPTION}</p>
      <div className="choice-row__opts">
        {(['friend', 'massage'] as Choice[]).map((c) => (
          <button key={c} type="button" className={pick === c ? 'apill apill--on' : 'apill'} aria-pressed={pick === c} onClick={() => setPick(c)}>
            <Icon name={pick === c ? 'check' : c === 'friend' ? 'partner' : 'hand'} size={16} />
            {CHOICE_LABEL[c]}
          </button>
        ))}
      </div>
      <button type="button" className="sdone__done" disabled={!pick} onClick={() => pick && claim('choice', pick)}>Claim</button>
      <span className="sr-only">{pick ? CHOICE_LABEL[pick] : ''}</span>
    </div>
  );
}
