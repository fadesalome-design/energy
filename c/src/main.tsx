import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { PhoneFrame } from './components/PhoneFrame';
import { initThemeFromUrl } from './lib/theme';
import { initVariantFromUrl } from './lib/variant';
import { initTesterFromUrl } from './lib/tester';
import './styles/global.css';

// Colour theme first (?theme=violet default, ?theme=green), also for the phone-frame page
initThemeFromUrl();

// D presentation mode: ?frame=phone shows the mobile app inside a phone frame (an iframe)
const framed = new URLSearchParams(window.location.search).get('frame') === 'phone';
if (!framed) {
  initVariantFromUrl();
  initTesterFromUrl();
}

// No <StrictMode>: its double-mount in dev would log every event twice.
createRoot(document.getElementById('root')!).render(framed ? <PhoneFrame /> :
  // Hash links (/energy/c/#/class/...), so a refresh never hits the main app's 404 page
  <HashRouter>
    <App />
  </HashRouter>,
);
