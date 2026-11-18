import { useState } from 'react';
import { Icon } from './Icon';

/**
 * D: a place photo (free stock, decorative, so alt=""). If it fails to load, or while there
 * is no URL, a soft mint gradient with the type icon shows instead, never a broken image.
 */
export function Photo({ src, icon, className = '' }: { src?: string; icon: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <span className={`photo ${className}`} aria-hidden="true">
      {(!src || failed) ? (
        <span className="photo__fallback"><Icon name={icon} size={28} /></span>
      ) : (
        <>
          {/* the gradient + icon stays underneath until the photo has really loaded */}
          {!loaded && <span className="photo__fallback"><Icon name={icon} size={28} /></span>}
          <img
            src={src} alt="" loading="lazy" decoding="async"
            className={loaded ? 'photo__img photo__img--on' : 'photo__img'}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </>
      )}
    </span>
  );
}
