/**
 * Version C: colour theme. ?theme=violet (default) or ?theme=green (the original D palette),
 * read once at startup and set on <html data-theme>. All colours are tokens in global.css.
 * Works with ?frame=phone, ?scale= and ?user= (the phone frame passes ?theme= to the app).
 */
export type Theme = 'violet' | 'green';

export function initThemeFromUrl(): Theme {
  const t = new URLSearchParams(window.location.search).get('theme')?.toLowerCase();
  const theme: Theme = t === 'green' ? 'green' : 'violet';
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', theme === 'green' ? '#F6F4EF' : '#F6F6FB');
  return theme;
}
