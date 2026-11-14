/**
 * Small hand-drawn line icon set (24×24, stroke = currentColor).
 * Icons are always decorative (aria-hidden): every icon sits next to text.
 * Accessibility: never rely on colour or icon alone.
 */
import type { ReactElement } from 'react';

const paths: Record<string, ReactElement> = {
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14.2c2.4-.3 4.4 1.3 5 4.3" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5c.7-3.4 3.3-5.5 6.5-5.5s5.8 2.1 6.5 5.5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5l1.8 4.9 4.7 1.8-4.7 1.8L12 16.9l-1.8-4.9-4.7-1.8 4.7-1.8z" />
      <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </>
  ),
  level: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20v-4h4v-4h4V8h4v12" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M15.5 9a4 4 0 010 6" />
      <path d="M18 6.5a7.5 7.5 0 010 11" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.8" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
    </>
  ),
  trainer: (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M6 20.5v-3.5c0-2.5 2.7-4.5 6-4.5s6 2 6 4.5v3.5" />
      <path d="M9.5 16.5h5" />
    </>
  ),
  hand: (
    <>
      <path d="M8 12.5V6.5a1.5 1.5 0 013 0v5" />
      <path d="M11 11V5a1.5 1.5 0 013 0v6" />
      <path d="M14 11.5V7a1.5 1.5 0 013 0v6.5c0 4-2.5 7-6 7-2.5 0-4-1.3-5.3-3.4L4 13.5a1.5 1.5 0 012.6-1.5L8 14" />
    </>
  ),
  partner: (
    <>
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="7.5" r="2.5" />
      <path d="M3 19c.4-3 2.2-5 4.5-5 1.5 0 2.7.8 3.5 2" />
      <path d="M21 19c-.4-3-2.2-5-4.5-5-1.5 0-2.7.8-3.5 2" />
    </>
  ),
  flow: (
    <>
      <path d="M4 18c3 0 3-8 6-8s3 4 6 4 2-6 4-6" />
      <circle cx="4" cy="18" r="1.2" />
      <circle cx="20" cy="8" r="1.2" />
    </>
  ),
  shower: (
    <>
      <path d="M5 21V7a3 3 0 016 0" />
      <path d="M8 10h7" />
      <path d="M9.5 13.5v.5M12 13.5v.5M14.5 13.5v.5M10.5 17v.5M13.5 17v.5" />
    </>
  ),
  bag: (
    <>
      <rect x="4" y="8" width="16" height="12" rx="2.5" />
      <path d="M9 8V6.5A1.5 1.5 0 0110.5 5h3A1.5 1.5 0 0115 6.5V8" />
      <path d="M4 13h16" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  door: (
    <>
      <path d="M6 20.5V4.5a1 1 0 011-1h8a1 1 0 011 1v16" />
      <path d="M3.5 20.5h17" />
      <circle cx="13" cy="12.5" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  minus: <path d="M6 12h12" />,
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  chevronRight: <path d="M9.5 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3.5" width="6" height="10.5" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5v3" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 018 0v2.5" />
    </>
  ),
  towel: (
    <>
      <path d="M6 4h12v14H6z" />
      <path d="M6 14h12M9 18v2.5M15 18v2.5" />
    </>
  ),
  changing: (
    <>
      <path d="M12 6.5a1.8 1.8 0 10-1.8-1.8" />
      <path d="M12 6.5v1.5L3.5 14.5c-.7.5-.3 1.5.5 1.5h16c.8 0 1.2-1 .5-1.5L12 8" />
    </>
  ),
  calm: (
    <>
      <path d="M3.5 10c2.8-2 5.7-2 8.5 0s5.7 2 8.5 0" />
      <path d="M3.5 15c2.8-2 5.7-2 8.5 0s5.7 2 8.5 0" />
    </>
  ),
  moderate: (
    <>
      <circle cx="8" cy="9" r="2.3" />
      <circle cx="16" cy="9" r="2.3" />
      <path d="M4 18c.5-2.4 2-4 4-4s3.5 1.6 4 4M12 18c.5-2.4 2-4 4-4s3.5 1.6 4 4" />
    </>
  ),
  busy: (
    <>
      <circle cx="6" cy="9" r="2" />
      <circle cx="12" cy="7.5" r="2" />
      <circle cx="18" cy="9" r="2" />
      <path d="M2.5 17.5c.4-2.2 1.7-3.6 3.5-3.6M21.5 17.5c-.4-2.2-1.7-3.6-3.5-3.6M8 17.5c.4-2.6 2-4.2 4-4.2s3.6 1.6 4 4.2" />
    </>
  ),
  dim: <path d="M19.5 14.5A8 8 0 019.5 4.5a8 8 0 1010 10z" />,
  flash: <path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" />,
  // class types
  yoga: (
    <>
      <circle cx="12" cy="5.5" r="2" />
      <path d="M12 8.5v5M6 11l6 2.5 6-2.5M7 19.5l5-3 5 3" />
    </>
  ),
  pilates: (
    <>
      <path d="M3 18h18" />
      <circle cx="7" cy="11" r="2" />
      <path d="M9 12.5l4 3.5h5l2-4" />
    </>
  ),
  hiit: <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 01-10 0c0-2.2 1-3.5 2.2-4.6.3 1.6 1 2.6 2 3C11 8.5 11.5 5.5 12 3z" />,
  spinning: (
    <>
      <circle cx="6" cy="16.5" r="3.5" />
      <circle cx="18" cy="16.5" r="3.5" />
      <path d="M6 16.5l4-7h5l3 7M9 6.5h3M12.5 9.5l-1.5 7" />
    </>
  ),
  dance: (
    <>
      <path d="M9 18V5.5l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="15.5" r="2.5" />
    </>
  ),
  swimming: (
    <>
      <path d="M2.5 16c1.6 1.2 3.2 1.2 4.8 0s3.2-1.2 4.8 0 3.2 1.2 4.8 0 3.2-1.2 4.6 0" />
      <path d="M2.5 20c1.6 1.2 3.2 1.2 4.8 0s3.2-1.2 4.8 0 3.2 1.2 4.8 0 3.2-1.2 4.6 0" />
      <circle cx="17" cy="6.5" r="2" />
      <path d="M5 12.5l4.5-4 3 2.5 3-1.5" />
    </>
  ),
  boxing: (
    <>
      <path d="M7 11V7.5A3.5 3.5 0 0110.5 4h3A4.5 4.5 0 0118 8.5V13a4 4 0 01-4 4H9.5A2.5 2.5 0 017 14.5z" />
      <path d="M7 11h3.5a2 2 0 010 4H9M8.5 17v3.5h8V17" />
    </>
  ),
  gym: (
    <>
      <path d="M7 7v10M17 7v10M4 9.5v5M20 9.5v5M7 12h10" />
    </>
  ),
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 22, className }: { name: IconName | string; size?: number; className?: string }) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name] ?? paths.info}
    </svg>
  );
}
