import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initVariantFromUrl } from './lib/variant';
import './styles/global.css';

initVariantFromUrl();

// No <StrictMode>: its double-mount in dev would log every event twice.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
