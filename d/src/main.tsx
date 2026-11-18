import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { initVariantFromUrl } from './lib/variant';
import { initTesterFromUrl } from './lib/tester';
import './styles/global.css';

initVariantFromUrl();
initTesterFromUrl();

// No <StrictMode>: its double-mount in dev would log every event twice.
createRoot(document.getElementById('root')!).render(
  // D sandbox: hash links (/energy/d/#/class/...), so a refresh never hits the main app's 404 page
  <HashRouter>
    <App />
  </HashRouter>,
);
