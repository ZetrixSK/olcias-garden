import { useState } from 'react';
import { MAX_HEARTS, VISITOR_IDS, type VisitorId, type Visitors } from '../garden/visitors';
import { useWords } from '../i18n';
import { BouquetArt } from '../plants/Bouquet';
import { VisitorPortrait } from '../scene/VisitorArt';
import { FAVOURITE_UNKNOWN, say, VISITOR_BIO, VISITOR_FAVOURITE, VISITOR_LIKES, VISITOR_NAME } from './visitorWords';

/**
 * The visitors' book: a page for everyone who has knocked, with what she has learnt about them,
 * how fond of her they are and the bouquets she made them. Those still to come are only outlines.
 */
export function VisitorBook({ visitors, onClose }: { visitors: Visitors; onClose: () => void }) {
  const w = useWords();
  const { t } = w;
  const met = VISITOR_IDS.filter((v) => visitors.friends[v]);
  const [page, setPage] = useState<VisitorId | null>(met[0] ?? null);
  const friend = page ? visitors.friends[page] : undefined;
  return (
    <div className="sheet studio visitor-book" role="dialog" aria-label={t('Visitors', 'Goście')}>
      <div className="sheet-head">
        <h2>{t('Visitors', 'Goście')}</h2>
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>
          ×
        </button>
      </div>
      <div className="visitor-tabs">
        {VISITOR_IDS.map((v) => {
          const known = !!visitors.friends[v];
          return (
            <button
              key={v}
              className={known ? undefined : 'unknown'}
              aria-pressed={page === v}
              aria-label={known ? say(w, VISITOR_NAME[v]) : t('Not met yet', 'Jeszcze się nie znacie')}
              onClick={() => setPage(v)}
            >
              <VisitorPortrait id={v} />
            </button>
          );
        })}
      </div>
      <div className="studio-body">
        {met.length === 0 && !page && (
          <p className="hint">{t('Nobody has knocked yet. They will.', 'Jeszcze nikt nie zapukał. Ale zapuka.')}</p>
        )}
        {page && !friend && (
          <div className="visitor-page unknown">
            <p className="hint">{t('You haven’t met yet. Someone will knock one day.', 'Jeszcze się nie znacie. Ktoś kiedyś zapuka.')}</p>
          </div>
        )}
        {page && friend && (
          <div className="visitor-page">
            <div className="visitor-head">
              <VisitorPortrait id={page} mood={friend.hearts >= MAX_HEARTS ? 'delighted' : 'happy'} className="visitor-big" />
              <div>
                <h3>{say(w, VISITOR_NAME[page])}</h3>
                <div className="visitor-hearts" aria-label={`${friend.hearts}/${MAX_HEARTS}`}>
                  {Array.from({ length: MAX_HEARTS }, (_, i) => (
                    <span key={i} className={i < friend.hearts ? 'on' : undefined} />
                  ))}
                </div>
                <p className="hint">
                  {t(
                    `${friend.visits} ${friend.visits === 1 ? 'bouquet' : 'bouquets'} so far`,
                    `${friend.visits} ${w.plural(friend.visits, 'bukiet', 'bukiety', 'bukietów')} do tej pory`,
                  )}
                </p>
              </div>
            </div>
            <p className="visitor-bio">{say(w, VISITOR_BIO[page])}</p>
            <ul className="visitor-likes">
              {VISITOR_LIKES[page].map((line, i) => (
                <li key={i} className={i < friend.visits ? undefined : 'hidden'}>
                  {i < friend.visits ? say(w, line) : t('…something you’ll find out', '…coś, czego się dowiesz')}
                </li>
              ))}
              <li className={friend.fav ? 'fav' : 'hidden'}>{say(w, friend.fav ? VISITOR_FAVOURITE[page] : FAVOURITE_UNKNOWN)}</li>
            </ul>
            {friend.bouquets.length > 0 && (
              <>
                <p className="meta">{t('Bouquets from you', 'Bukiety od Ciebie')}</p>
                <div className="visitor-bouquets">
                  {friend.bouquets.map((b) => (
                    <svg key={b.id + b.at} viewBox="-56 -112 112 118" aria-hidden="true">
                      <BouquetArt bouquet={b} showNote={false} />
                    </svg>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
