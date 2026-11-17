import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initVariantFromUrl } from './lib/variant';
import { initTesterFromUrl } from './lib/tester';
import './styles/global.css';

initVariantFromUrl();
initTesterFromUrl();

// No <StrictMode>: its double-mount in dev would log every event twice.
createRoot(document.getElementById('root')!).render(
  // basename follows Vite's base, so links work in a GitHub Pages subfolder too
  <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
    <App />
  </BrowserRouter>,
);
