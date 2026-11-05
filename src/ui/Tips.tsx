import type { Tip } from '../garden/state';
import { useWords } from '../i18n';

const WORDS: Record<Tip, [string, string]> = {
  swipe: ['Swipe sideways: your shelves are there.', 'Przesuń palcem w bok: tam są Twoje półki.'],
  plant: [
    'Tap an empty place to plant something. There are bratek seeds in your tin, and the first three you plant grow faster.',
    'Dotknij pustego miejsca, żeby coś posadzić. W puszce masz nasiona bratków, a trzy pierwsze kwiaty urosną szybciej.',
  ],
  water: ['Tap a plant to water it: watered flowers grow faster. Nothing bad happens if you forget.', 'Dotknij kwiatka, żeby go podlać: podlane rosną szybciej. Nic się nie stanie, jak zapomnisz.'],
  bouquet: ['Flowers in bloom make bouquets. It’s in the menu, top right.', 'Z kwitnących kwiatów ułożysz bukiet. Jest w menu, w prawym górnym rogu.'],
  market: ['Visitors give petals for bouquets. Spend them at the market, in the menu.', 'Za bukiety goście dają płatki. Wydasz je na targu, w menu.'],
  night: ['On weekend nights Pani Ćma comes. Look for the little lantern.', 'W weekendowe noce przychodzi Pani Ćma. Szukaj małej latarenki.'],
};

/** A small note pinned at the bottom of the screen, one at a time, signed like the letter. */
export function TipNote({ tip, first, onDone, onOff }: { tip: Tip; first: boolean; onDone: () => void; onOff: () => void }) {
  const { t } = useWords();
  return (
    <div className="tip-note" role="note">
      <span className="tip-tape" aria-hidden="true" />
      <p>{t(...WORDS[tip])}</p>
      <div className="tip-foot">
        {first ? (
          <button className="tip-off" onClick={onOff}>
            {t('No tips, thanks', 'Bez wskazówek')}
          </button>
        ) : (
          <span />
        )}
        <span className="tip-sign">— d.</span>
      </div>
      <button className="tip-close" aria-label={t('Put it away', 'Odłóż')} onClick={onDone}>
        ×
      </button>
    </div>
  );
}
