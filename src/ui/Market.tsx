import { useEffect, useState } from 'react';
import { DAY_PRICE, MILTON, trinket, trinketPrice, type SeedItem } from '../garden/market';
import type { GardenState } from '../garden/state';
import { useWords } from '../i18n';
import { PlantArt } from '../plants/PlantArt';
import { PansyFlower } from '../plants/Pansy';
import { designColors } from '../plants/looks';
import { BouquetArt } from '../plants/Bouquet';
import { Blossom, CardBack, StallDressing, PaniCma, PanJezyk, RARITY_COLOUR, Stall, TrinketPortrait, type KeeperMood } from '../scene/MarketArt';
import type { Weather } from '../theme/palettes';
import { cmaDone, cmaHello, CMA_MILTON, cmaShort, cmaThanks, jezykAsleep, jezykEmpty, jezykHello, jezykShort, jezykThanks, RARITY_NAME, seedAbout, seedName, TRINKET_ABOUT, TRINKET_NAME } from './marketWords';
import { say } from './visitorWords';

/** Stars scattered up the night sky, however tall the screen. */
const SKY_DOTS: Array<[number, number, number]> = (() => {
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 70 }, () => [-60 + r() * 520, -900 + r() * 1110, 0.6 + r() * 1.1] as [number, number, number]);
})();

/** A petal, for the purse and the prices. */
export function PetalIcon() {
  return (
    <svg className="petal-icon" viewBox="-9.5 -9.5 19 19" aria-hidden="true">
      <Blossom />
    </svg>
  );
}

export function Purse({ petals }: { petals: number }) {
  const { t } = useWords();
  return (
    <span className="purse" aria-label={t(`${petals} petals`, `${petals} płatków`)}>
      <PetalIcon />
      {petals}
    </span>
  );
}

/** A seed packet, its band in the colour of its rarity, with what's inside drawn on the front. */
export function SeedPacketCard({ item }: { item: SeedItem }) {
  return (
    <svg viewBox="-24 -32 48 62" aria-hidden="true">
      <path className="ink" fill="#efe1c4" d="M-18,-22 L18,-22 L18,26 L-18,26 Z" />
      <path className="ink" fill="#e2cfa8" d="M-18,-22 L-14,-28 L14,-28 L18,-22 Z" />
      <path d="M-18,18 L18,18 L18,26 L-18,26 Z" fill={RARITY_COLOUR[item.rarity]} />
      <path className="ink" fill="none" d="M-18,-22 L18,-22 L18,26 L-18,26 Z" />
      <path d="M-15,-17 L15,-17" stroke="#b9925e" strokeWidth="0.8" strokeDasharray="2 2" />
      <g clipPath="url(#packet-window)">
        {item.kind === 'species' && (
          <g transform="translate(0 16) scale(0.34)">
            <PlantArt species={item.species} stage="bloom" />
          </g>
        )}
        {item.kind === 'pansy' && <PansyFlower x={0} y={0} s={0.56} c={designColors(item.design)} />}
        {item.kind === 'ribbon' && (
          <g transform="translate(0 -2) scale(1.3)">
            <path className="ink-thin" fill={item.color} d="M0,0 C-4,-7 -13,-8 -13,-2 C-13,3 -6,3 0,0 Z M0,0 C4,-7 13,-8 13,-2 C13,3 6,3 0,0 Z" />
            <path className="ink-thin" fill={item.color} d="M-1,1 C-3,6 -5,9 -7,11 L-4,11 L-3,13 C-1,10 0,6 0.4,1.4 Z M1,1 C3,6 5,9 7,11 L4,11 L3,13 C1,10 0,6 0,1.6 Z" />
            <ellipse className="ink-thin" rx="2.2" ry="2.4" fill={item.color} />
          </g>
        )}
        {item.kind === 'vase' && (
          <g transform="translate(0 14) scale(0.62)">
            <BouquetArt bouquet={{ id: 'v', stems: [], vase: item.vase, ribbon: null, note: '', seed: 1 }} showNote={false} />
          </g>
        )}
      </g>
      <defs>
        <clipPath id="packet-window">
          <rect x="-17" y="-16" width="34" height="33" />
        </clipPath>
      </defs>
    </svg>
  );
}

/**
 * The market. By day, Pan Jeżyk's seed stall; on weekend nights, Pani Ćma and her face-down cards;
 * otherwise the stall shut and the hedgehog asleep behind it.
 */
export function MarketStall({ garden, weather, nightKey, onBuySeed, onTurn, onBuyTrinket, onClose }: {
  garden: GardenState;
  weather: Weather;
  /** This weekend's night market, if it's open. */
  nightKey: string | null;
  /** Buys a packet; resolves false if it couldn't be bought (not enough petals). */
  onBuySeed: (id: string) => boolean;
  onTurn: (i: number) => void;
  onBuyTrinket: (id: string) => boolean;
  onClose: () => void;
}) {
  const w = useWords();
  const { t } = w;
  const m = garden.market;
  const night = nightKey !== null;
  const closed = !night && weather.night;
  const [line, setLine] = useState(() => Math.floor(Math.random() * 12));
  const [mood, setMood] = useState<KeeperMood>(closed ? 'asleep' : 'waiting');
  const [say_, setSay] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    if (mood !== 'happy') return;
    const timer = window.setTimeout(() => setMood('waiting'), 2600);
    return () => window.clearTimeout(timer);
  }, [mood]);

  const keeper = night ? <PaniCma mood={mood === 'asleep' ? 'waiting' : mood} /> : <PanJezyk mood={closed ? 'asleep' : mood} />;
  const stock = m.day?.key ? m.day.items : [];
  const cards = night && m.night?.key === nightKey ? m.night : null;
  const hello = closed ? jezykAsleep(w, line) : night ? cmaHello(w, line) : stock.every((i) => m.day?.bought.includes(i.id)) ? jezykEmpty(w) : jezykHello(w, line);
  const chosenSeed = !night ? stock.find((i) => i.id === selected) : undefined;
  const chosenCard = night && cards && selected && cards.cards.includes(selected) ? selected : null;

  return (
    <>
      <div className="scrim letter-scrim" />
      <div className={`market${night ? ' at-night' : ''}`} role="dialog" aria-label={night ? t('The night market', 'Nocny targ') : t('The market', 'Targ')}>
        <button className="fab right market-close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-7,-7 L7,7 M7,-7 L-7,7" />
          </svg>
        </button>
        <svg className="market-scene" viewBox="50 36 300 294" preserveAspectRatio="xMidYMax meet">
          <defs>
            <linearGradient id="market-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={night || closed ? '#231d42' : '#9ec7e4'} />
              <stop offset="1" stopColor={night || closed ? '#4a3a66' : '#e6eef0'} />
            </linearGradient>
            <radialGradient id="stall-glow">
              <stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="-400" y="-1600" width="1200" height="1600" fill={night || closed ? '#231d42' : '#9ec7e4'} />
          <rect x="-400" y="0" width="1200" height="400" fill="url(#market-sky)" />
          {(night || closed) &&
            SKY_DOTS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff6d8" opacity="0.8" />)}
          {!night && !closed &&
            [[90, 70, 1], [280, 20, 0.8], [150, -120, 1.1], [300, -260, 0.9], [70, -380, 1]].map(([x, y, s], i) => (
              <path
                key={i}
                transform={`translate(${x} ${y}) scale(${s})`}
                d="M0,10 C-2,0 12,-6 18,2 C24,-8 42,-6 42,6 C52,6 54,18 44,20 L4,20 C-6,20 -8,12 0,10 Z"
                fill="#f8f6f0"
                stroke="var(--ink, #3d2633)"
                strokeWidth="1.1"
                opacity="0.95"
              />
            ))}
          {(night || closed) && (
            <g>
              <circle cx="330" cy="70" r="14" fill="#f6efd2" />
              <circle cx="336" cy="66" r="13" fill="#231d42" />
            </g>
          )}
          <path d="M-200,250 C0,232 200,244 600,236 L600,400 L-200,400 Z" fill={night || closed ? '#3d4a3e' : '#9db58a'} />
          <path d="M-200,262 C0,252 200,258 600,252 L600,400 L-200,400 Z" fill={night || closed ? '#4a5a48' : '#b5c99a'} />
          <g transform="translate(200 268) scale(0.88)">
            <Stall night={night} closed={closed} keeper={keeper} />
          </g>
          <StallDressing night={night || closed} closed={closed} sign={night ? t('Night market', 'Nocny targ') : t('Market', 'Targ')} />
        </svg>
        <div className="market-card">
          <div className="market-top">
            <p className="visitor-says">„{say_ ?? hello}”</p>
            <Purse petals={m.petals} />
          </div>
          {closed ? (
            <p className="hint">{t('The night market is open on Friday, Saturday and Sunday nights.', 'Nocny targ jest otwarty w piątkowe, sobotnie i niedzielne noce.')}</p>
          ) : night ? (
            <>
              <div className="night-cards">
                {cards?.cards.map((id, i) => {
                  const turned = cards.turned[i];
                  const bought = cards.bought.includes(id);
                  const rarity = id === MILTON ? 'legendary' : (trinket(id)?.rarity ?? 'common');
                  return (
                    <button
                      key={id}
                      className={`mcard${turned ? ' turned' : ''}${selected === id ? ' on' : ''}${bought ? ' bought' : ''}${id === MILTON ? ' milton-card' : ''}`}
                      style={{ ['--rarity' as string]: RARITY_COLOUR[rarity], transitionDelay: '0s' }}
                      aria-label={turned ? t(...TRINKET_NAME[id]!) : t('A card, face down', 'Zakryta karta')}
                      data-sound={turned ? 'tap' : 'page'}
                      onClick={() => {
                        if (!turned) {
                          onTurn(i);
                          setSelected(id);
                          setSay(id === MILTON ? say(w, CMA_MILTON) : null);
                        } else setSelected(id);
                      }}
                    >
                      <span className="mcard-inner">
                        <span className="mcard-back">
                          <CardBack />
                        </span>
                        <span className="mcard-front">
                          <TrinketPortrait id={id} />
                          {bought && <span className="mcard-mark">✓</span>}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {chosenCard && (
                <div className="market-detail">
                  <strong>{t(...TRINKET_NAME[chosenCard]!)}</strong>
                  <span className="rarity" style={{ color: RARITY_COLOUR[chosenCard === MILTON ? 'legendary' : (trinket(chosenCard)?.rarity ?? 'common')] }}>
                    {chosenCard === MILTON ? t('One of a kind', 'Jedyny taki') : t(...RARITY_NAME[trinket(chosenCard)?.rarity ?? 'common'])}
                  </span>
                  <p>{say(w, TRINKET_ABOUT[chosenCard]!)}</p>
                  {cards?.bought.includes(chosenCard) ? (
                    <p className="hint">{t('It’s yours.', 'Jest Twój.')}</p>
                  ) : (
                    <button
                      className="primary"
                      data-sound="soil"
                      onClick={() => {
                        const ok = onBuyTrinket(chosenCard);
                        if (ok) {
                          setMood('happy');
                          setSay(cmaThanks(w, line));
                          setLine((n) => n + 1);
                        } else setSay(cmaShort(w));
                      }}
                    >
                      {chosenCard === MILTON ? t('Take him home', 'Zabierz go do domu') : t(`Buy for ${trinketPrice(chosenCard)}`, `Kup za ${trinketPrice(chosenCard)}`)}
                      {chosenCard !== MILTON && <PetalIcon />}
                    </button>
                  )}
                </div>
              )}
              {cards && cards.cards.every((id) => cards.bought.includes(id)) && <p className="hint">{cmaDone(w)}</p>}
            </>
          ) : (
            <>
              <div className="seed-stall">
                {stock.map((item) => {
                  const bought = m.day?.bought.includes(item.id);
                  return (
                    <button key={item.id} className={`${selected === item.id ? 'on' : ''}${bought ? ' bought' : ''}`} disabled={bought} onClick={() => setSelected(item.id)}>
                      <SeedPacketCard item={item} />
                      <span className="seed-name wrap">{seedName(w, item)}</span>
                      <span className="seed-price">
                        {bought ? t('Bought', 'Kupione') : DAY_PRICE[item.rarity]}
                        {!bought && <PetalIcon />}
                      </span>
                    </button>
                  );
                })}
              </div>
              {chosenSeed && !m.day?.bought.includes(chosenSeed.id) && (
                <div className="market-detail">
                  <strong>{seedName(w, chosenSeed)}</strong>
                  <span className="rarity" style={{ color: RARITY_COLOUR[chosenSeed.rarity] }}>
                    {t(...RARITY_NAME[chosenSeed.rarity])}
                  </span>
                  <p>{seedAbout(w, chosenSeed)}</p>
                  <button
                    className="primary"
                    data-sound="soil"
                    onClick={() => {
                      const ok = onBuySeed(chosenSeed.id);
                      if (ok) {
                        setMood('happy');
                        setSay(jezykThanks(w, line));
                        setLine((n) => n + 1);
                        setSelected(null);
                      } else setSay(jezykShort(w, line));
                    }}
                  >
                    {t(`Buy for ${DAY_PRICE[chosenSeed.rarity]}`, `Kup za ${DAY_PRICE[chosenSeed.rarity]}`)}
                    <PetalIcon />
                  </button>
                </div>
              )}
              <p className="hint market-how">
                {t('Petals come from visitors, for every bouquet you make them.', 'Płatki dostajesz od gości za każdy bukiet, który im ułożysz.')}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
