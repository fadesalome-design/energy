/**
 * SANDBOX D: the member's first name for the demo. From ?user= (e.g. ?user=Jonas), default
 * "Anna". Read once at startup; works with other parameters (?frame=phone passes it on to the
 * phone screen). Letters only, first letter capitalised, max 20 characters.
 */
const DEFAULT_NAME = 'Anna';

function fromUrl(): string {
  const raw = new URLSearchParams(window.location.search).get('user') ?? '';
  const clean = raw.replace(/[^\p{L}\- ]/gu, '').trim().slice(0, 20);
  if (!clean) return DEFAULT_NAME;
  return clean.charAt(0).toLocaleUpperCase('en') + clean.slice(1);
}

export const memberName = fromUrl();
export const memberInitial = memberName.charAt(0).toLocaleUpperCase('en');
