import { Link, Route, Routes } from 'react-router-dom';
import { ClassList } from './pages/ClassList';
import { ClassDetail } from './pages/ClassDetail';
import { Booked } from './pages/Booked';
import { Debug } from './pages/Debug';
import { DevToggle } from './components/DevToggle';
import { LogoMark } from './components/Logo';

/**
 * Urban Sports Clue: a playful, fictional multi-studio booking app. The "clue" is knowing
 * what a class is like before you go. Own logo and visual identity.
 * Research: F-INSIDE ("don't build another app… improve that app"), so Read the Room is a
 * feature inside the familiar booking flow (list → detail → book), not a separate app.
 */
export default function App() {
  return (
    <div className="shell">
      <a href="#main" className="skip">Skip to content</a>
      <DevToggle />
      <header className="appbar">
        <Link to="/" className="brand" aria-label="Urban Sports Clue, home">
          <LogoMark />
          <span>Urban Sports <span className="brand__clue">Clue</span></span>
        </Link>
      </header>
      <Routes>
        <Route path="/" element={<ClassList />} />
        <Route path="/class/:id" element={<ClassDetail />} />
        <Route path="/class/:id/booked" element={<Booked />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="*" element={<ClassList />} />
      </Routes>
    </div>
  );
}
