/**
 * Back navigation with the real history (hash routes): every screen opened from another one
 * goes back to it, exactly like the browser / phone back button. If there is nothing to go back
 * to (the page was opened directly), it goes to the class list.
 */
import { useLocation, useNavigate } from 'react-router-dom';

export function useBack() {
  const navigate = useNavigate();
  const location = useLocation();
  return () => (location.key !== 'default' ? navigate(-1) : navigate('/', { replace: true }));
}

/** The class whose "Stamp collected" screen was shown last, so "‹ Back" from the rewards can return to it. */
const KEY = 'c_rtr.lastStamp';
export interface LastStamp { classId: string; endsAt: string }
export function rememberStamp(v: LastStamp) {
  try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch { /* storage blocked */ }
}
export function lastStamp(): LastStamp | null {
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { return null; }
}
