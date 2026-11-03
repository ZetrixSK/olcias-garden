import { useState } from 'react';
import { MAX_GARLAND, MILTON, TRINKETS, type Market } from '../garden/market';
import { useWords } from '../i18n';
import { RARITY_COLOUR, TrinketPortrait } from '../scene/MarketArt';
import { RARITY_NAME, TRINKET_ABOUT, TRINKET_NAME } from './marketWords';
import { Purse } from './Market';
import { say } from './visitorWords';

/**
 * Her trinket box: every charm and figure, the ones she has and outlines of the rest. Charms go on
 * the string across the window (seven at most); figures stand on the shelves or wait in the box.
 */
export function TrinketBox({ market, canStand, onToggleCharm, onStand, onPutAway, onMove, onClose }: {
  market: Market;
  /** Whether there's a free place on the shelves for a figure. */
  canStand: boolean;
  onToggleCharm: (id: string) => void;
  onStand: (id: string) => void;
  onPutAway: (id: string) => void;
  /** Picks a figure up to move it along the shelves. */
  onMove: (id: string) => void;
  onClose: () => void;
}) {
  const w = useWords();
  const { t } = w;
  const [chosen, setChosen] = useState<string | null>(null);
  const owns = (id: string) => (id === MILTON ? market.milton : market.owned.includes(id));
  const standing = (id: string) => market.figures.some((f) => f.id === id);
  const charms = TRINKETS.filter((x) => x.kind === 'charm');
  const figures = [...(market.milton ? [{ id: MILTON, kind: 'figure' as const, rarity: 'legendary' as const }] : []), ...TRINKETS.filter((x) => x.kind === 'figure')];
  const found = market.owned.length + (market.milton ? 1 : 0);
  const pick = chosen && owns(chosen) ? chosen : null;
  const isCharm = pick ? charms.some((c) => c.id === pick) : false;

  const tile = (id: string, rarity: keyof typeof RARITY_COLOUR) => {
    const mine = owns(id);
    const on = isCharmId(id) ? market.garland.includes(id) : standing(id);
    return (
      <button
        key={id}
        className={`trinket-tile${mine ? '' : ' unknown'}${on ? ' out' : ''}`}
        style={{ ['--rarity' as string]: RARITY_COLOUR[rarity] }}
        aria-pressed={chosen === id}
        aria-label={mine ? t(...TRINKET_NAME[id]!) : t('Not found yet', 'Jeszcze nie znalezione')}
        onClick={() => setChosen(id)}
      >
        <TrinketPortrait id={id} />
      </button>
    );
  };
  const isCharmId = (id: string) => charms.some((c) => c.id === id);

  return (
    <div className="sheet studio trinket-box" role="dialog" aria-label={t('Trinket box', 'Szkatułka')}>
      <div className="sheet-head">
        <h2>{t('Trinket box', 'Szkatułka')}</h2>
        <Purse petals={market.petals} />
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>
          ×
        </button>
      </div>
      <div className="studio-body">
        <p className="hint">
          {t(`${found} of ${TRINKETS.length + 1} found. Pani Ćma brings new ones on weekend nights.`, `Znalezione: ${found} z ${TRINKETS.length + 1}. Pani Ćma przynosi nowe w weekendowe noce.`)}
        </p>
        <p className="meta">{t(`Charms for the window (${market.garland.length} of ${MAX_GARLAND} hanging)`, `Zawieszki do okna (wisi ${market.garland.length} z ${MAX_GARLAND})`)}</p>
        <div className="trinket-grid">{charms.map((c) => tile(c.id, c.rarity))}</div>
        <p className="meta">{t('Figures for the shelves', 'Figurki na półki')}</p>
        <div className="trinket-grid">{figures.map((f) => tile(f.id, f.rarity))}</div>
        {chosen && !pick && <p className="hint">{t('Still to find. Maybe this weekend…', 'Jeszcze do znalezienia. Może w ten weekend…')}</p>}
        {pick && (
          <div className="market-detail">
            <strong>{t(...TRINKET_NAME[pick]!)}</strong>
            {pick !== MILTON && (
              <span className="rarity" style={{ color: RARITY_COLOUR[TRINKETS.find((x) => x.id === pick)!.rarity] }}>
                {t(...RARITY_NAME[TRINKETS.find((x) => x.id === pick)!.rarity])}
              </span>
            )}
            <p>{say(w, TRINKET_ABOUT[pick]!)}</p>
            <div className="row-buttons">
              {pick === MILTON ? (
                <p className="hint">{t('He lives in the dogs’ bed.', 'Mieszka w legowisku, u psów.')}</p>
              ) : isCharm ? (
                <button className="primary" disabled={!market.garland.includes(pick) && market.garland.length >= MAX_GARLAND} onClick={() => onToggleCharm(pick)}>
                  {market.garland.includes(pick) ? t('Take it down', 'Zdejmij') : t('Hang it in the window', 'Powieś w oknie')}
                </button>
              ) : standing(pick) ? (
                <>
                  <button onClick={() => onMove(pick)}>{t('Move', 'Przesuń')}</button>
                  <button onClick={() => onPutAway(pick)}>{t('Put it in the box', 'Schowaj do szkatułki')}</button>
                </>
              ) : (
                <button className="primary" disabled={!canStand} onClick={() => onStand(pick)}>
                  {canStand ? t('Stand it on a shelf', 'Postaw na półce') : t('No room on the shelves', 'Brak miejsca na półkach')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** A figure on the shelves, looked at closely: what it is, and moving it or putting it away. */
export function FigureCard({ id, onMove, onPutAway, onClose }: { id: string; onMove: () => void; onPutAway: () => void; onClose: () => void }) {
  const w = useWords();
  const { t } = w;
  const tr = TRINKETS.find((x) => x.id === id);
  return (
    <div className="sheet" role="dialog" aria-label={t(...TRINKET_NAME[id]!)}>
      <div className="sheet-head">
        <h2>{t(...TRINKET_NAME[id]!)}</h2>
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>
          ×
        </button>
      </div>
      <div className="figure-card">
        <TrinketPortrait id={id} />
        <div>
          {tr && (
            <span className="rarity" style={{ color: RARITY_COLOUR[tr.rarity] }}>
              {t(...RARITY_NAME[tr.rarity])}
            </span>
          )}
          <p>{say(w, TRINKET_ABOUT[id]!)}</p>
        </div>
      </div>
      <div className="actions two-wide">
        <button onClick={onMove}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-10,0 L10,0 M6,-4 L10,0 L6,4 M-6,-4 L-10,0 L-6,4" />
          </svg>
          {t('Move', 'Przesuń')}
        </button>
        <button onClick={onPutAway}>{t('Put it in the box', 'Schowaj do szkatułki')}</button>
      </div>
    </div>
  );
}
