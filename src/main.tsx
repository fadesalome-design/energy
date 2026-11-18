import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initVariantFromUrl, isClosedTestLink } from './lib/variant';
import { TestEnded } from './components/TestEnded';
import { initTesterFromUrl } from './lib/tester';
import './styles/global.css';

// Closed test links (round 1: ?variant=b / e, see OLD_LINKS_CLOSED; round 2: ?test=r7k2 / m4q9,
// see ROUND2_LINKS_CLOSED): only the "test has ended" screen, the app doesn't start, nothing saved.
const closed = isClosedTestLink();
if (!closed) {
  initVariantFromUrl();
  initTesterFromUrl();
}

// No <StrictMode>: its double-mount in dev would log every event twice.
createRoot(document.getElementById('root')!).render(
  closed ? <TestEnded /> : (
    // basename follows Vite's base, so links work in a GitHub Pages subfolder too
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <App />
    </BrowserRouter>
  ),
);
