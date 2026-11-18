import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ClassList } from './pages/ClassList';
import { ClassDetail } from './pages/ClassDetail';
import { Booked } from './pages/Booked';
import { Debug } from './pages/Debug';
import { AdminPicker, AdminStudio } from './pages/Admin';
import { DevToggle } from './components/DevToggle';
import { LogoMark } from './components/Logo';
import { FeedbackModal } from './components/FeedbackModal';
import { useVariant } from './lib/variant';
import { StampCounter } from './components/StampCounter';
import { pendingFeedback, shouldShowFeedback, useFeedbackState, type Booking } from './lib/feedback';
import { useDesktop } from './lib/desktop';
import { DetailPanel } from './components/DetailPanel';
import { SidePanel } from './components/SidePanel';
import { ProfileButton } from './components/ProfileButton';
import { Profile } from './pages/Profile';
import { Icon } from './components/Icon';
import { placeName, usePlace } from './lib/location';

/**
 * Urban Sports Clue: a playful, fictional multi-studio booking app. The "clue" is knowing
 * what a class is like before you go. Own logo and visual identity.
 * Research: F-INSIDE ("don't build another app… improve that app"), so Read the Room is a
 * feature inside the familiar booking flow (list → detail → book), not a separate app.
 */
export default function App() {
  const { launchId } = useFeedbackState();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const variant = useVariant();
  const desktop = useDesktop(); // D: two columns + side panel at 1024 px and wider
  usePlace();
  // Held in state so the "Stamp collected" screen stays up after the booking is marked answered.
  const [active, setActive] = useState<Booking | null>(null);

  // Checked once per app open (and on "Reopen app" in test mode), never mid-session.
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    // Members only: never on the moderator or studio-owner pages.
    if (pathname === '/debug' || pathname.startsWith('/admin')) return;
    if (shouldShowFeedback()) setActive(pendingFeedback());
  }, [launchId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={isAdmin ? 'shell shell--wide' : desktop ? 'shell shell--desk' : 'shell'}>
      <a href="#main" className="skip">Skip to content</a>
      <DevToggle />
      <header className="appbar">
        <Link to={isAdmin ? '/admin' : '/'} className="brand" aria-label={isAdmin ? 'Urban Sports Clue for studios' : 'Urban Sports Clue, home'}>
          <LogoMark />
          <span>Urban Sports <span className="brand__clue">Clue</span></span>
        </Link>
        {/* Version C only: small marker so C is easy to tell apart from D */}
        <span className="ctag" aria-hidden="true">C · test</span>
        {isAdmin ? <span className="brand__for">for studios</span> : (
          <span className="appbar__right">
            {/* D desktop: the current place in the top bar */}
            {desktop && <span className="appbar__place"><Icon name="pin" size={18} />{placeName()}</span>}
            <StampCounter />
            {/* D: round avatar → profile with stamps and rewards */}
            <ProfileButton />
          </span>
        )}
      </header>
      <Routes>
        <Route path="/" element={<ClassList />} />
        {/* D desktop: the class opens as a side panel over the list */}
        <Route path="/class/:id" element={desktop ? <><ClassList /><DetailPanel /></> : <ClassDetail />} />
        <Route path="/class/:id/booked" element={<Booked />} />
        {/* D: profile. Desktop: the same right side panel as the class detail; mobile: full screen */}
        <Route path="/profile" element={desktop ? <><ClassList /><SidePanel label="Profile"><Profile panel /></SidePanel></> : <Profile />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/admin" element={<AdminPicker />} />
        <Route path="/admin/:studioId" element={<AdminStudio />} />
        <Route path="*" element={<ClassList />} />
      </Routes>
      {active && (
        <FeedbackModal
          key={active.id}
          booking={active}
          version={variant === 'e' ? 'e' : 'b'}
          // A reopened app starts on home, so closing the questions lands there too,
          // not on whatever screen was open before (e.g. "Booked", which would be confusing).
          onClose={() => {
            setActive(null);
            navigate('/', { replace: true });
          }}
          onSeeRewards={() => {
            setActive(null);
            navigate('/profile', { replace: true });
          }}
        />
      )}
    </div>
  );
}
