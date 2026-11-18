import { useEffect, useState } from 'react';

/**
 * SANDBOX D: presentation mode (?frame=phone). A generic modern phone (thin dark bezel, rounded
 * screen, small pill-shaped camera cut-out; no logo or brand) with a 440 × 956 CSS px screen.
 * The app runs inside an iframe at exactly that width (the SAME code as normal mobile), below a
 * 54 px status-bar strip.
 *
 * Size: like a product shot. By default the phone is 1.3 × the size that would fit the whole
 * window height, so it's wider and the text is bigger. The top (with the camera pill) stays fully
 * visible with a small margin; the bottom may run past the window edge (cropped). The page itself
 * never scrolls; the app scrolls inside the VISIBLE part of the phone screen.
 * Change the size with ?scale= (e.g. ?frame=phone&scale=1.4); it is applied through the CSS
 * variable --phone-scale.
 *
 * The iframe address carries the build number, so the browser never reuses an older cached
 * copy of D inside the frame.
 */
declare const __D_BUILD__: string;

const SCREEN_W = 440;
const SCREEN_H = 956;
const STATUS_H = 54;
const BEZEL = 12;
const PHONE_W = SCREEN_W + BEZEL * 2;
const PHONE_H = SCREEN_H + BEZEL * 2;
const TOP_MARGIN = 24;
const DEFAULT_ZOOM = 1.3;

function zoomFromUrl(): number {
  const z = parseFloat(new URLSearchParams(window.location.search).get('scale') ?? '');
  return Number.isFinite(z) && z > 0.3 && z < 4 ? z : DEFAULT_ZOOM;
}

function layout(zoom: number) {
  // The size that would fit the whole phone into 92% of the window height (the old size) …
  const fit = Math.min((window.innerHeight * 0.92) / PHONE_H, 1);
  // … times the zoom, but never wider than the window
  const scale = Math.min(fit * zoom, (window.innerWidth - 32) / PHONE_W);
  // Height of the screen area that is actually visible in the window (below the status strip)
  const visible = (window.innerHeight - TOP_MARGIN) / scale - BEZEL - STATUS_H;
  const appH = Math.max(320, Math.min(SCREEN_H - STATUS_H, Math.floor(visible)));
  return { scale, appH };
}

export function PhoneFrame() {
  const [zoom] = useState(zoomFromUrl);
  const [{ scale, appH }, setLayout] = useState(() => layout(zoom));

  useEffect(() => {
    const onResize = () => setLayout(layout(zoom));
    window.addEventListener('resize', onResize);
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [zoom]);

  const url = new URL(window.location.href);
  url.searchParams.delete('frame');
  url.searchParams.delete('scale');
  url.searchParams.set('v', __D_BUILD__);

  return (
    <div className="pframe" style={{ ['--phone-scale' as string]: scale }}>
      <div className="pframe__device">
        <div className="pframe__screenwrap">
          <iframe
            className="pframe__screen"
            src={url.pathname + url.search + url.hash}
            title="Urban Sports Clue, phone view"
            width={SCREEN_W}
            height={appH}
            style={{ height: appH }}
          />
          <span className="pframe__island" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
