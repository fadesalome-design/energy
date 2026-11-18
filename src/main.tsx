import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initVariantFromUrl, isClosedOldLink } from './lib/variant';
import { TestEnded } from './components/TestEnded';
import { initTesterFromUrl } from './lib/tester';
import './styles/global.css';

// Closed old test links (?variant=b / ?variant=e, see OLD_LINKS_CLOSED): only the
// "test has ended" screen, the app doesn't start and nothing is saved.
const closed = isClosedOldLink();
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
