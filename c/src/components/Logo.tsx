/**
 * Urban Sports Clue logo: own mark, a magnifying glass ("get the clue")
 * whose lens frames a small doorway ("read the room before you go").
 * Original artwork, not based on any real app's logo.
 */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <circle cx="14" cy="14" r="7" fill="none" stroke="var(--bg)" strokeWidth="2.5" />
      <path d="M11.5 18v-5.2a2.5 2.5 0 015 0V18" fill="none" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" />
      <path d="M19.2 19.2l5.3 5.3" stroke="var(--bg)" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}
