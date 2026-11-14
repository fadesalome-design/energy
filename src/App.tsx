import { Link, Route, Routes } from 'react-router-dom';
import { ClassList } from './pages/ClassList';
import { ClassDetail } from './pages/ClassDetail';
import { Booked } from './pages/Booked';
import { Debug } from './pages/Debug';
import { DevToggle } from './components/DevToggle';

/**
 * Klassly is a fictional multi-studio booking app.
 * Research: F-INSIDE ("don't build another app"), so Read the Room is a feature inside its normal flow.
 */
export default function App() {
  return (
    <div className="shell">
      <a href="#main" className="skip">Skip to content</a>
      <DevToggle />
      <header className="appbar">
        <Link to="/" className="brand" aria-label="Klassly, home">
          <span className="brand__mark" aria-hidden="true" />
          Klassly
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
