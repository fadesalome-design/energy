import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { PhoneFrame } from './components/PhoneFrame';
import { initVariantFromUrl } from './lib/variant';
import { initTesterFromUrl } from './lib/tester';
import './styles/global.css';

// D presentation mode: ?frame=phone shows the mobile app inside a phone frame (an iframe)
const framed = new URLSearchParams(window.location.search).get('frame') === 'phone';
if (!framed) {
  initVariantFromUrl();
  initTesterFromUrl();
}

// No <StrictMode>: its double-mount in dev would log every event twice.
createRoot(document.getElementById('root')!).render(framed ? <PhoneFrame /> :
  // D sandbox: hash links (/energy/d/#/class/...), so a refresh never hits the main app's 404 page
  <HashRouter>
    <App />
  </HashRouter>,
);
