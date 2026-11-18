import { useEffect, useState } from 'react';

/**
 * SANDBOX D: presentation mode (?frame=phone). A generic modern phone (thin dark bezel, rounded
 * screen, small pill-shaped camera cut-out; no logo or brand) with a 440 × 956 CSS px screen,
 * a Pro Max-class viewport. The app runs inside an iframe at exactly that width, so it is the
 * SAME code as normal mobile. The whole phone scales to fit the window (max 92% of its height),
 * and content scrolls inside the screen, not the page.
 *
 * The iframe address carries the build number, so the browser never reuses an older cached
 * copy of D inside the frame (that showed an outdated layout before).
 */
declare const __D_BUILD__: string;

const SCREEN_W = 440;
const SCREEN_H = 956;
/** Status-bar strip at the top of the screen (around the camera pill), like a real phone:
    the app starts below it, so the pill never covers the app's header. */
const STATUS_H = 54;
const BEZEL = 12;
const PHONE_W = SCREEN_W + BEZEL * 2;
const PHONE_H = SCREEN_H + BEZEL * 2;

function fitScale() {
  const byH = (window.innerHeight * 0.92) / PHONE_H;
  const byW = (window.innerWidth - 32) / PHONE_W;
  return Math.min(1, byH, byW);
}

export function PhoneFrame() {
  const [scale, setScale] = useState(fitScale);
  const [roomForCaption, setRoomForCaption] = useState(true);

  useEffect(() => {
    const onResize = () => {
      const s = fitScale();
      setScale(s);
      setRoomForCaption(window.innerHeight - PHONE_H * s > 72);
    };
    onResize();
    window.addEventListener('resize', onResize);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = prev;
    };
  }, []);

  const url = new URL(window.location.href);
  url.searchParams.delete('frame');
  url.searchParams.set('v', __D_BUILD__);

  return (
    <div className="pframe">
      {/* The box takes the scaled size, so centring and the caption use the real visible size */}
      <div className="pframe__box" style={{ width: PHONE_W * scale, height: PHONE_H * scale }}>
        <div className="pframe__device" style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${scale})` }}>
          <div className="pframe__screenwrap">
            <iframe
              className="pframe__screen"
              src={url.pathname + url.search + url.hash}
              title="Urban Sports Clue, phone view"
              width={SCREEN_W}
              height={SCREEN_H - STATUS_H}
            />
            <span className="pframe__island" aria-hidden="true" />
          </div>
        </div>
      </div>
      {roomForCaption && <p className="pframe__caption">Urban Sports Clue · Energy Match · prototype</p>}
    </div>
  );
}
