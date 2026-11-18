import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getStudio, studios } from '../data/classes';
import { getStudioReport, MIN_ANSWERS, PERIOD_DAYS, type ClassReport, type Topic } from '../data/adminMock';
import { typeLabel } from '../lib/labels';
import { HBars, Legend, StackedBar, StatTile, TableView } from '../components/Charts';
import { Icon } from '../components/Icon';

/**
 * Studio admin (MOCKUP). Each studio owner sees an AI-written report built from
 * anonymous member answers, never the raw answers themselves.
 *
 * Key framing: answers describe the room (Low/Medium/High), they are not good or bad.
 * The only good/bad measure is "did the class match its card?". The report pushes
 * owners to describe classes honestly, not to make every class quiet.
 */

// Chart colours (validated: diverging Yes/Partly/No with a neutral gray midpoint;
// sequential teal for Low → High). Labels or tables always accompany them.
// C: colours come from the theme tokens in global.css (violet / green)
const C = {
  yes: 'var(--chart-yes)', partly: 'var(--chart-partly)', no: 'var(--chart-no)',
  low: 'var(--chart-low)', medium: 'var(--chart-medium)', high: 'var(--chart-high)',
};

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

function periodLabel() {
  const end = new Date();
  const start = new Date(end.getTime() - PERIOD_DAYS * 86_400_000);
  const f = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${f(start)} – ${f(end)}`;
}

function matchSegments(m: ClassReport['match']) {
  return [
    { key: 'yes', label: 'Matched the card', value: m.yes, color: C.yes },
    { key: 'partly', label: 'Partly', value: m.partly, color: C.partly, ink: 'var(--ink)' },
    { key: 'no', label: "Didn't match", value: m.no, color: C.no },
  ];
}

const MATCH_LEGEND = [
  { label: 'Matched the card', color: C.yes },
  { label: 'Partly', color: C.partly },
  { label: "Didn't match", color: C.no },
];

// ---------------------------------------------------------------------------
// /admin — studio picker
// ---------------------------------------------------------------------------

export function AdminPicker() {
  useEffect(() => {
    document.title = 'Studio reports · Urban Sports Clue';
  }, []);
  return (
    <main className="admin" id="main">
      <MockBanner />
      <p className="eyebrow">For studios</p>
      <h1>Studio reports</h1>
      <p className="admin__lead muted">
        Pick a studio to see its report. In the real product, each owner only sees their own studio
        after logging in.
      </p>
      <ul className="picker">
        {studios.map((s) => {
          const r = getStudioReport(s.id)!;
          return (
            <li key={s.id}>
              <Link to={`/admin/${s.id}`} className="picker__card">
                <span className="picker__name">{s.name}</span>
                <span className="muted small">{s.district} · {r.classes.length} {r.classes.length === 1 ? 'class' : 'classes'}</span>
                <span className="picker__stats">
                  <span><strong>{r.answers}</strong> answers</span>
                  <span><strong>{r.matchYesPct}%</strong> card match</span>
                </span>
                <Icon name="chevronRight" className="picker__chev" />
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

function MockBanner() {
  return (
    <p className="mockbanner">
      <Icon name="info" size={18} />
      <span><strong>Mockup with invented data.</strong> The "AI" text is written from templates over the same numbers as the charts.</span>
    </p>
  );
}

// ---------------------------------------------------------------------------
// /admin/:studioId — the report
// ---------------------------------------------------------------------------

export function AdminStudio() {
  const { studioId = '' } = useParams();
  const report = useMemo(() => getStudioReport(studioId), [studioId]);
  const [classId, setClassId] = useState<string | null>(null);

  useEffect(() => {
    if (report) document.title = `${getStudio(studioId).name} report · Urban Sports Clue`;
    window.scrollTo(0, 0);
    setClassId(null);
  }, [studioId, report]);

  if (!report) {
    return (
      <main className="admin" id="main">
        <h1>Studio not found</h1>
        <Link to="/admin">All studios</Link>
      </main>
    );
  }

  const studio = getStudio(studioId);
  const active = report.classes.find((r) => r.c.id === classId) ?? report.classes[0];
  const fixesTotal = report.classes.reduce((s, r) => s + r.fixes.length, 0);

  return (
    <main className="admin" id="main">
      <Link to="/admin" className="back"><Icon name="arrowLeft" size={20} /> All studios</Link>
      <MockBanner />

      <header className="admin__head">
        <p className="eyebrow">Studio report · last {PERIOD_DAYS} days · {periodLabel()}</p>
        <h1>{studio.name}</h1>
        <p className="muted">{studio.district} · {studio.address}</p>
      </header>

      <div className="stats">
        <StatTile label="Member answers" value={report.answers} note={`about ${report.classes.length === 1 ? 'your class' : `${report.classes.length} classes`}`} />
        <StatTile label="Matched the card" value={`${report.matchYesPct}%`} note='said "Yes"' />
        <StatTile label="Suggested card fixes" value={fixesTotal} note="ready to review" />
        <StatTile label="Hidden by sensory filters" value={report.hiddenTotal} note="times in the class list" />
      </div>

      <div className="admin__grid">
        {/* AI report */}
        <section className="panel panel--ai" aria-labelledby="ai-title">
          <div className="panel__head">
            <h2 id="ai-title"><Icon name="sparkle" size={22} /> What members are telling you</h2>
            <span className="ai-badge">AI summary</span>
          </div>
          <p className="ai__summary">{report.summary}</p>
          <h3 className="ai__h3">Suggestions</h3>
          <ol className="ai__list">
            {report.suggestions.map((s) => (
              <li key={s.title}>
                <p className="ai__title">{s.title}</p>
                <p>{s.body}</p>
                {s.impact && <p className="ai__impact">{s.impact}</p>}
                {report.classes.length > 1 && (
                  <button type="button" className="linkbtn" onClick={() => {
                    setClassId(s.classId);
                    document.getElementById('class-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}>
                    See the class
                  </button>
                )}
              </li>
            ))}
          </ol>
          <p className="ai__foot muted small">
            <Icon name="lock" size={16} />
            Written by AI from {report.answers} anonymous answers. You never see individual answers,
            messages or voice notes. Topics with fewer than {MIN_ANSWERS} answers are left out.
          </p>
        </section>

        {/* Card match by class */}
        <section className="panel panel--sticky" aria-labelledby="match-title">
          <h2 id="match-title">Did classes match their card?</h2>
          <p className="muted small">The one measure here that's good or bad. A loud class with a card that says "loud" is a success.</p>
          <Legend items={MATCH_LEGEND} />
          <ul className="matchlist">
            {report.classes.map((r) => (
              <li key={r.c.id}>
                <p className="matchlist__name">
                  {r.c.name} <span className="muted small">· {r.answers} answers</span>
                </p>
                <StackedBar segments={matchSegments(r.match)} label={`${r.c.name}, card match`} />
              </li>
            ))}
          </ul>
          <TableView
            caption="Card match by class"
            head={['Class', 'Matched', 'Partly', "Didn't match", 'Answers']}
            rows={report.classes.map((r) => [r.c.name, `${pct(r.match.yes, r.answers)}%`, `${pct(r.match.partly, r.answers)}%`, `${pct(r.match.no, r.answers)}%`, r.answers])}
          />
        </section>
      </div>

      {/* Per class */}
      <section className="classdetail" id="class-detail" aria-labelledby="cd-title">
        <div>
          <h2 id="cd-title" className="section-title">Class by class</h2>
          <p className="muted small">How each class felt to members, what to fix on its card, and what hides it.</p>
        </div>
        {report.classes.length > 1 && (
          <div className="ctabs" role="tablist" aria-label="Classes">
            {report.classes.map((r) => (
              <button
                key={r.c.id}
                type="button"
                role="tab"
                aria-selected={r === active}
                className={r === active ? 'ctabs__tab ctabs__tab--on' : 'ctabs__tab'}
                onClick={() => setClassId(r.c.id)}
              >
                <Icon name={r.c.type} size={18} /> {r.c.name}
              </button>
            ))}
          </div>
        )}
        <ClassPanel key={active.c.id} r={active} />
      </section>
    </main>
  );
}

// ---------------------------------------------------------------------------

const STATUS: Record<Topic['status'], { icon: string; word: string; cls: string }> = {
  matches: { icon: 'check', word: 'Matches card', cls: 'tstatus--ok' },
  differs: { icon: 'info', word: 'Differs from card', cls: 'tstatus--diff' },
  missing: { icon: 'minus', word: 'Not on card yet', cls: 'tstatus--missing' },
  'too-few': { icon: 'clock', word: 'Too few answers', cls: 'tstatus--few' },
};

const ORDER: Record<Topic['status'], number> = { differs: 0, missing: 1, matches: 2, 'too-few': 3 };

function ClassPanel({ r }: { r: ClassReport }) {
  const [decided, setDecided] = useState<Record<string, 'accepted' | 'dismissed'>>({});
  const topics = [...r.topics].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const { views, bookings, notForMe } = r.funnel;

  return (
    <div className="cpanel">
      <div className="cpanel__head">
        <span className="chip"><Icon name={r.c.type} size={16} /> {typeLabel[r.c.type]}</span>
        <h2>{r.c.name}</h2>
        <p className="muted">{r.c.start} · {r.c.durationMin} min · with {r.c.trainer} · {r.answers} answers</p>
      </div>

      <div className="stats stats--class">
        <StatTile label="Class views" value={views} />
        <StatTile label="Booked after viewing" value={`${pct(bookings, views)}%`} note={`${bookings} bookings`} />
        <StatTile label={'"Not for me today"'} value={`${pct(notForMe, views)}%`} note={`${notForMe} times`} />
        <StatTile label="Matched the card" value={`${pct(r.match.yes, r.answers)}%`} note={`of ${r.answers} answers`} />
      </div>

      {/* Felt vs described */}
      <section className="panel" aria-labelledby="felt-title">
        <h3 id="felt-title" className="panel__h">How it felt vs. what the card says</h3>
        {topics.every((t) => t.status === 'too-few') ? (
          <div className="empty empty--left">
            <p><strong>Not enough answers yet</strong></p>
            <p className="muted">
              {r.c.name} has {r.answers} answers, spread over {topics.length} topics (each member answers 3).
              A topic appears once {MIN_ANSWERS} members have answered it, so nobody can be recognised.
            </p>
          </div>
        ) : (<>
        <p className="muted small">Low, Medium and High describe the room. None of them is better than another.</p>
        <Legend items={[{ label: 'Low', color: C.low }, { label: 'Medium', color: C.medium }, { label: 'High', color: C.high }]} />
        <ul className="felt">
          {topics.map((t) => {
            const st = STATUS[t.status];
            return (
              <li key={t.id} className={`felt__row${t.status === 'too-few' ? ' felt__row--few' : ''}`}>
                <div className="felt__topic">
                  <p className="felt__label">{t.label}</p>
                  <p className="muted small">{t.answers} answers</p>
                </div>
                <div className="felt__chart">
                  {t.status === 'too-few' ? (
                    <p className="felt__few muted small">Hidden until {MIN_ANSWERS} members have answered, to keep answers anonymous.</p>
                  ) : (
                    <>
                      <StackedBar
                        height={20}
                        label={t.label}
                        segments={(['low', 'medium', 'high'] as const).map((l) => ({
                          key: l, label: `${t.words[l]} (${l})`, value: t.dist[l], color: C[l], ink: l === 'low' ? 'var(--primary-dark)' : 'var(--on-primary)',
                        }))}
                      />
                      <p className="felt__words small">
                        Most said <strong>{t.words[t.majority]}</strong>
                        {' · '}Card says {t.claimText ? <strong>{t.claimText}</strong> : <em className="muted">not described yet</em>}
                      </p>
                    </>
                  )}
                </div>
                <p className={`tstatus ${st.cls}`}><Icon name={st.icon} size={16} /> {st.word}</p>
              </li>
            );
          })}
        </ul>
        <TableView
          caption={`${r.c.name}: how it felt vs the card`}
          head={['Topic', 'Low', 'Medium', 'High', 'Card says', 'Status']}
          rows={topics.map((t) =>
            t.status === 'too-few'
              ? [t.label, '–', '–', '–', t.claimText ?? 'Not described', STATUS[t.status].word]
              : [t.label, t.dist.low, t.dist.medium, t.dist.high, t.claimText ?? 'Not described', STATUS[t.status].word])}
        />
        </>)}
      </section>

      <div className="admin__grid admin__grid--even">
        {/* Suggested card fixes */}
        <section className="panel" aria-labelledby="fix-title">
          <h3 id="fix-title" className="panel__h">Suggested card fixes</h3>
          {r.fixes.length === 0 ? (
            <p className="muted">Nothing to fix. Your card matches what members say.</p>
          ) : (
            <ul className="fixes">
              {r.fixes.map((f) => {
                const d = decided[f.id];
                return (
                  <li key={f.id} className={`fix${d ? ' fix--done' : ''}`}>
                    <p className="fix__topic">{f.kind === 'add' ? 'Add' : 'Update'} · {f.topic}</p>
                    <p className="fix__change">
                      {f.from ? <><s>{f.from}</s> <Icon name="chevronRight" size={16} /> </> : null}
                      <strong>{f.to}</strong>
                    </p>
                    <p className="muted small">{f.evidence}</p>
                    {d ? (
                      <p className="fix__state" role="status">
                        <Icon name={d === 'accepted' ? 'check' : 'x'} size={16} />
                        {d === 'accepted' ? 'Sent to the card (mockup, nothing saved)' : 'Dismissed'}
                      </p>
                    ) : (
                      <div className="fix__actions">
                        <button type="button" className="btn btn--primary btn--sm" onClick={() => setDecided({ ...decided, [f.id]: 'accepted' })}>
                          Update card
                        </button>
                        <button type="button" className="btn btn--quiet btn--sm" onClick={() => setDecided({ ...decided, [f.id]: 'dismissed' })}>
                          Not right
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* What hides this class */}
        <section className="panel" aria-labelledby="hide-title">
          <h3 id="hide-title" className="panel__h">What hides this class</h3>
          <p className="muted small">
            Times members didn't see this class because of a filter they chose, last {PERIOD_DAYS} days.
          </p>
          {r.hiddenBy.length === 0 ? (
            <p className="muted">No filter hides this class.</p>
          ) : (
            <>
              <HBars unit="times hidden" rows={r.hiddenBy.map((h) => ({ label: h.label, value: h.count }))} />
              <TableView caption="Times hidden by filter" head={['Filter', 'Times hidden']} rows={r.hiddenBy.map((h) => [h.label, h.count])} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
