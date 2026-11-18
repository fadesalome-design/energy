/**
 * SANDBOX D: presentation mode (?frame=phone). Shows the mobile app in a phone-shaped frame,
 * centred on a calm background. The app runs inside an iframe at phone width, so it is
 * exactly the mobile version (same page, same data, same storage).
 */
export function PhoneFrame() {
  const url = new URL(window.location.href);
  url.searchParams.delete('frame');
  return (
    <div className="pframe">
      <div className="pframe__device">
        <span className="pframe__notch" aria-hidden="true" />
        <iframe className="pframe__screen" src={url.pathname + url.search + url.hash} title="Urban Sports Clue, phone view" />
      </div>
      <p className="pframe__caption">Urban Sports Clue · Energy Match · prototype</p>
    </div>
  );
}
