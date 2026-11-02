import { useState } from 'react';
import { LETTER } from '../letter';
import { useWords } from '../i18n';

/** A little wax seal pressed with a heart, under the name at the end of the letter. */
function WaxHeart() {
  return (
    <svg className="wax-heart" viewBox="-20 -20 40 40" aria-hidden="true">
      {/* the wax, spread a little unevenly where it was pressed */}
      <path
        d="M1,-15.5 C6,-16.2 8.6,-12.4 12.4,-11.2 C16.4,-8.4 14.6,-3.4 16.4,0.8 C17.2,6.2 12.6,8.2 10.4,12.2 C6.6,16.4 2.2,13.4 -2,15.4 C-7.2,16.2 -9.4,12.4 -12.4,10.2 C-16.6,6.4 -14.2,2.2 -16.4,-2.2 C-16.4,-7.4 -12.2,-9.4 -10.2,-12.4 C-7,-15.6 -3.6,-14.6 1,-15.5 Z"
        fill="#b5476a"
        stroke="#7a2843"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* the ring the stamp left, and the heart pressed into it */}
      <circle r="10.4" fill="none" stroke="#8e2f4f" strokeWidth="1.4" opacity="0.8" />
      <path d="M0,-3.2 C-2.4,-7.4 -8,-5.6 -7,-1.4 C-6.4,1.6 -2.6,4.2 0,6.6 C2.6,4.2 6.4,1.6 7,-1.4 C8,-5.6 2.4,-7.4 0,-3.2 Z" fill="#8e2f4f" />
      <path d="M-4.8,-4.2 C-5.8,-3.6 -6,-2.4 -5.6,-1.4" fill="none" stroke="#e58aa6" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
      {/* light catching the raised edge of the wax */}
      <path d="M-11,-8 C-8.4,-11.6 -4.4,-13 -0.6,-13.2" fill="none" stroke="#f3c1cf" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/**
 * The letter, on paper, with a wax seal. The first time it only offers to be kept, so the first
 * moment isn't a choice; read again from the envelope, it can also be thrown away (asking first).
 */
export function Letter({ first = false, onKeep, onThrowAway }: { first?: boolean; onKeep: () => void; onThrowAway: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const { t } = useWords();
  const paragraphs = LETTER.body.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
  return (
    <>
      <div className="scrim letter-scrim" onClick={onKeep} />
      <div className="letter" role="dialog" aria-label={t('A letter', 'List')}>
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
          {LETTER.signature && (
            <p className="letter-signature">
              {LETTER.signature}
              <WaxHeart />
            </p>
          )}
        </div>
        <div className="letter-actions">
          {confirm ? (
            <>
              <span>{t('Throw it away for good?', 'Wyrzucić go na zawsze?')}</span>
              <button className="danger" onClick={onThrowAway}>
                {t('Yes', 'Tak')}
              </button>
              <button onClick={() => setConfirm(false)}>{t('No', 'Nie')}</button>
            </>
          ) : (
            <>
              {!first && (
                <button className="quiet" onClick={() => setConfirm(true)}>
                  {t('Throw away', 'Wyrzuć')}
                </button>
              )}
              <button onClick={onKeep}>{t('Keep it', 'Zatrzymaj')}</button>
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
