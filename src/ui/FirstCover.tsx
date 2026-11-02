import { useEffect, useState } from 'react';

const REVEAL_MS = 1100;

/**
 * The very first visit keeps the garden a surprise: plain paper lies over it while the letter is
 * read and her tag is chosen, then lifts away slowly to show the garden underneath.
 */
export function FirstCover({ show }: { show: boolean }) {
  const [present, setPresent] = useState(show);
  const [lifting, setLifting] = useState(false);
  useEffect(() => {
    if (show) {
      setPresent(true);
      setLifting(false);
      return;
    }
    if (!present) return;
    setLifting(true);
    const t = window.setTimeout(() => setPresent(false), REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!present) return null;
  return <div className={`first-cover${lifting ? ' lifting' : ''}`} aria-hidden="true" />;
}
