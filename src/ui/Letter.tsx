import { useState } from 'react';
import { LETTER } from '../letter';

/** The letter, on paper, with a wax seal. Keeping it is the default; throwing it away asks first. */
export function Letter({ onKeep, onThrowAway }: { onKeep: () => void; onThrowAway: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const paragraphs = LETTER.body.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
  return (
    <>
      <div className="scrim letter-scrim" onClick={onKeep} />
      <div className="letter" role="dialog" aria-label="A letter">
        <svg className="seal" viewBox="-20 -20 40 40" aria-hidden="true">
          <path
            className="ink"
            fill="#b5476a"
            d="M0,-15 C5,-16 8,-12 12,-11 C16,-8 14,-3 16,1 C17,6 12,8 10,12 C6,16 2,13 -2,15 C-7,16 -9,12 -12,10 C-16,6 -14,2 -16,-2 C-16,-7 -12,-9 -10,-12 C-7,-15 -4,-14 0,-15 Z"
          />
          <path d="M0,-6 C-3,-10 -9,-7 -6,-2 L0,5 L6,-2 C9,-7 3,-10 0,-6 Z" fill="#8e2f4f" />
        </svg>
        <div className="letter-paper">
          {LETTER.greeting && <p className="letter-greeting">{LETTER.greeting}</p>}
          {paragraphs.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
          {LETTER.signature && <p className="letter-signature">{LETTER.signature}</p>}
        </div>
        <div className="letter-actions">
          {confirm ? (
            <>
              <span>Throw it away for good?</span>
              <button className="danger" onClick={onThrowAway}>
                Yes
              </button>
              <button onClick={() => setConfirm(false)}>No</button>
            </>
          ) : (
            <>
              <button className="quiet" onClick={() => setConfirm(true)}>
                Throw away
              </button>
              <button onClick={onKeep}>Keep it</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export const ENVELOPE_ICON = (
  <g>
    <path d="M-10,-6 L10,-6 L10,7 L-10,7 Z" />
    <path d="M-10,-6 L0,2 L10,-6" />
    <path d="M0,1.6 C-1.2,0.4 -3,1.2 -2,2.8 L0,4.6 L2,2.8 C3,1.2 1.2,0.4 0,1.6 Z" fill="currentColor" stroke="none" />
  </g>
);
