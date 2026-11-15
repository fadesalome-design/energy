import { Link, Route, Routes } from 'react-router-dom';
import { ClassList } from './pages/ClassList';
import { ClassDetail } from './pages/ClassDetail';
import { Booked } from './pages/Booked';
import { Debug } from './pages/Debug';
import { DevToggle } from './components/DevToggle';

/**
 * Concept: "Read the room before you go" as a feature inside the Urban Sports Club app.
 * Research: F-INSIDE ("don't build another app… improve that app"), so it lives in the normal booking flow.
 * Only the app name is used as plain text: no USC logo, colours or visual identity are copied.
 */
export default function App() {
  return (
    <div className="shell">
      <a href="#main" className="skip">Skip to content</a>
      <DevToggle />
      <header className="appbar">
        <Link to="/" className="brand">
          Urban Sports Club
        </Link>
        <span className="concept-tag">Concept</span>
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
