import { useEffect } from 'react';
import { LogoMark } from './Logo';

/** Shown for closed old test links: a simple thank-you, no app and no links. */
export function TestEnded() {
  useEffect(() => {
    document.title = 'Test ended · Urban Sports Clue';
  }, []);
  return (
    <main className="ended" id="main">
      <div className="ended__card">
        <span className="ended__logo" aria-hidden="true"><LogoMark /></span>
        <h1 className="ended__title">This test has ended.</h1>
        <p className="ended__text">
          Thank you for your help! <span aria-hidden="true">💚</span>
        </p>
      </div>
    </main>
  );
}
