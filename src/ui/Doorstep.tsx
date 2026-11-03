import { useEffect, useState } from 'react';
import { FLYING, VisitorArt, type VisitorMood } from '../scene/VisitorArt';
import { Blossom } from '../scene/MarketArt';
import { MAX_HEARTS, type Gift, type Request, type Thanks, type VisitorId } from '../garden/visitors';
import type { Vase } from '../garden/bouquets';
import { roomTint, type Weather } from '../theme/palettes';
import { seeded } from '../scene/geometry';
import { useWords } from '../i18n';
import { PlantArt } from '../plants/PlantArt';
import { BouquetArt } from '../plants/Bouquet';
import { PansyFlower } from '../plants/Pansy';
import { designColors } from '../plants/looks';
import { ConfirmButton } from './Decorate';
import { VASE_NAMES } from './Bouquets';
import { giftLine, noteClose, noteOpen, say, stillHereLine, thanksLine, VISITOR_NAME, wishLine } from './visitorWords';
import { ambienceIfMade } from '../sound/ambience';

/** The doorway: an arch in the wall, 180 wide, its threshold at y 470. */
const DOOR = 'M110,470 L110,178 A90,90 0 0 1 290,178 L290,470 Z';
const HINGE = 110;

/** Raindrops, stars: scattered once, the same each time. */
const DROPS = (() => {
  const r = seeded(31);
  return Array.from({ length: 34 }, () => ({ x: 100 + r() * 200, y: 70 + r() * 400, d: r() * 1.2 }));
})();
const STARS = (() => {
  const r = seeded(7);
  return Array.from({ length: 16 }, () => ({ x: 118 + r() * 164, y: 96 + r() * 150, s: 0.6 + r() * 0.9 }));
})();

/** What's outside the door: sky, the lane, a little fence, the step. In the weather of the day. */
function Outside({ weather }: { weather: Weather }) {
  const night = weather.night;
  const tint = roomTint(weather, 'cozy');
  return (
    <g clipPath="url(#door-opening)">
      <defs>
        <linearGradient id="door-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--sky-top)' }} />
          <stop offset="0.6" style={{ stopColor: 'var(--sky-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--sky-low)' }} />
        </linearGradient>
      </defs>
      <rect x="100" y="80" width="200" height="400" fill="url(#door-sky)" />
      {night && weather.sky === 'clear' && (
        <g fill="#fff6d8">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.s} opacity={0.8} />
          ))}
          <circle cx="252" cy="128" r="11" fill="#f6efd2" />
          <circle cx="257" cy="124" r="10" fill="var(--sky-top)" />
        </g>
      )}
      {!night && weather.sky === 'clear' && (
        <g>
          <circle cx="256" cy="134" r="16" fill="#f6d36b" stroke="var(--ink)" strokeWidth="1.2" />
          <circle cx="251" cy="129" r="5" fill="#fbe7a6" />
        </g>
      )}
      {weather.sky !== 'clear' && (
        <g fill="#eef0f6" stroke="var(--ink)" strokeWidth="1.1" opacity={night ? 0.5 : 0.95}>
          <path d="M120,150 C118,138 134,132 142,140 C148,128 168,130 170,144 C182,142 186,156 176,160 L124,160 C114,160 112,152 120,150 Z" />
          <path d="M214,120 C214,110 228,106 234,112 C240,102 258,104 260,116 C272,114 276,128 266,132 L218,132 C208,132 206,124 214,120 Z" />
        </g>
      )}
      {/* the hills and the lane down to the lake */}
      <path d="M100,330 C140,310 180,318 220,306 C250,298 280,304 300,300 L300,480 L100,480 Z" fill="#9db58a" stroke="var(--ink)" strokeWidth="1.2" />
      <path d="M100,350 C150,338 200,346 300,330 L300,480 L100,480 Z" fill="#b5c99a" />
      <path d="M186,346 C190,380 172,410 150,446 L250,446 C228,410 210,380 214,346 Z" fill="#e2cfae" stroke="var(--ink)" strokeWidth="1" />
      {/* a little picket fence either side of the lane */}
      <g stroke="var(--ink)" strokeWidth="1" fill="#f3e9da">
        {[106, 120, 134, 148, 162].map((x) => (
          <path key={x} d={`M${x},392 L${x},372 L${x + 4},366 L${x + 8},372 L${x + 8},392 Z`} />
        ))}
        {[234, 248, 262, 276, 290].map((x) => (
          <path key={x} d={`M${x},392 L${x},372 L${x + 4},366 L${x + 8},372 L${x + 8},392 Z`} />
        ))}
        <path d="M100,378 L172,378 M228,378 L300,378" fill="none" />
      </g>
      {/* a round bush by the fence */}
      <path d="M268,368 C258,368 254,354 264,350 C264,340 280,338 284,346 C294,344 300,356 294,364 C296,370 288,374 282,370 C278,374 270,374 268,368 Z" fill="#7fa36a" stroke="var(--ink)" strokeWidth="1" />
      {/* the step outside the door, stone */}
      <path d="M100,436 L300,436 L300,470 L100,470 Z" fill="#cbbfae" stroke="var(--ink)" strokeWidth="1.2" />
      <path d="M100,442 L300,442" stroke="#e0d6c8" strokeWidth="2" />
      <path d="M160,452 L174,452 M230,460 L246,460" stroke="#a99c8a" strokeWidth="1" strokeLinecap="round" />
      {/* a pansy in a pot on the step */}
      <g transform="translate(272 440)">
        <path d="M-11,0 L11,0 L13,-16 L-13,-16 Z" fill="#c97a5a" stroke="var(--ink)" strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M-14,-16 L14,-16 L14,-20 L-14,-20 Z" fill="#d98d6c" stroke="var(--ink)" strokeWidth="1.1" />
        <path d="M-6,-20 C-8,-26 -4,-28 -2,-24 M6,-20 C8,-26 4,-28 2,-24" fill="#7fa36a" stroke="var(--ink)" strokeWidth="0.9" />
        <PansyFlower x={-5} y={-27} s={0.42} c={designColors({ id: 'p', name: '', top: '#2c1733', low: '#f0a8c0', face: 'whiskers', faceColor: '#2c1733', edge: null })} />
        <PansyFlower x={6} y={-30} s={0.38} c={designColors({ id: 'q', name: '', top: '#f0b5c7', low: '#fbe3ea', face: 'whiskers', faceColor: '#8a2f55', edge: null })} />
      </g>
      {weather.sky === 'rain' && (
        <g stroke="#dfe7f4" strokeWidth="1.1" strokeLinecap="round" opacity="0.75" className="door-rain">
          {DROPS.map((d, i) => (
            <path key={i} d={`M${d.x},${d.y} l-3,9`} style={{ animationDelay: `${-d.d}s` }} />
          ))}
        </g>
      )}
      {tint && <rect x="100" y="80" width="200" height="400" fill={tint.color} opacity={tint.opacity * 0.6} />}
    </g>
  );
}

/** The front door: planks, a round window, a brass knocker. Swings in on its hinge when opened. */
/** Roughly where each one's face is, so their shadow shows in the door's little window. */
const FACE_Y: Record<VisitorId, number> = { jadzia: -86, atrament: -66, duszek: -74, rechotka: -74, listonosz: -84, wiedzmusia: -78, jingleton: -56 };

function FrontDoor({ open, knocking, visitor }: { open: boolean; knocking: boolean; visitor: VisitorId }) {
  return (
    <g className={`front-door${open ? ' open' : ''}${knocking ? ' knocking' : ''}`} style={{ transformOrigin: `${HINGE}px 320px` }}>
      <path d={DOOR} fill="#9a6a44" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" />
      <g stroke="#7d5232" strokeWidth="1.2">
        {[146, 182, 218, 254].map((x) => (
          <path key={x} d={`M${x},${x === 146 || x === 254 ? 118 : 92} L${x},470`} />
        ))}
      </g>
      <path d="M110,300 L290,300 M110,430 L290,430" stroke="#7d5232" strokeWidth="5" />
      <path d="M110,300 L290,300 M110,430 L290,430" stroke="var(--ink)" strokeWidth="0.6" opacity="0.6" />
      {/* a round window, a little warm light behind it */}
      <circle cx="200" cy="182" r="26" fill="#f2dfb5" stroke="var(--ink)" strokeWidth="1.6" />
      {/* whoever is knocking, a shadow behind the frosted glass */}
      {knocking && (
        <g clipPath="url(#door-window)">
          <g className="door-shadow" transform={`translate(200 ${(190 - FACE_Y[visitor] * 0.62).toFixed(1)}) scale(0.62)`}>
            <VisitorArt id={visitor} />
          </g>
        </g>
      )}
      <path d="M174,182 L226,182 M200,156 L200,208" stroke="#7d5232" strokeWidth="3" />
      <circle cx="200" cy="182" r="26" fill="none" stroke="var(--ink)" strokeWidth="1.6" />
      {/* the knocker and the handle */}
      <g transform="translate(200 250)">
        <circle r="5" fill="#c9a45c" stroke="var(--ink)" strokeWidth="1" />
        <g className="knocker">
          <circle cy="13" r="11" fill="none" stroke="#c9a45c" strokeWidth="3.4" />
          <circle cy="13" r="11" fill="none" stroke="var(--ink)" strokeWidth="0.8" />
        </g>
      </g>
      <circle cx="270" cy="330" r="5.4" fill="#c9a45c" stroke="var(--ink)" strokeWidth="1.1" />
    </g>
  );
}

/** The room side of the doorway: wall, frame, floor and the mat. */
function Inside() {
  return (
    <g>
      <rect x="-200" y="0" width="800" height="560" fill="var(--wall)" />
      <path d="M-200,470 L600,470 L600,560 L-200,560 Z" fill="var(--floor)" />
      <path d="M-200,470 L600,470" stroke="var(--ink)" strokeWidth="1.4" />
      <path d="M-200,500 L600,500 M-200,532 L600,532" stroke="var(--floor-line, #86593a)" strokeWidth="1" opacity="0.5" />
      {/* the frame round the door */}
      <path d="M96,470 L96,178 A104,104 0 0 1 304,178 L304,470" fill="none" stroke="var(--frame, #a7b598)" strokeWidth="14" />
      <path d="M89,470 L89,178 A111,111 0 0 1 311,178 L311,470 M103,470 L103,178 A97,97 0 0 1 297,178 L297,470" fill="none" stroke="var(--ink)" strokeWidth="1.3" />
      {/* the doormat */}
      <path d="M140,476 L260,476 L272,500 L128,500 Z" fill="#c46d7d" stroke="var(--ink)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M146,482 L254,482 L262,494 L138,494 Z" fill="none" stroke="#f1d0d6" strokeWidth="1.2" strokeDasharray="3 3" />
      {/* a coat hook with a scarf, beside the door */}
      <g transform="translate(340 236)">
        <circle r="3" fill="#c9a45c" stroke="var(--ink)" strokeWidth="0.9" />
        <path d="M-2,2 C-10,10 -10,40 -6,64 L4,64 C6,40 6,14 2,2 Z" fill="#d98aa6" stroke="var(--ink)" strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M-6,64 L-7,72 M-2,64 L-2,73 M2,64 L3,72" stroke="#d98aa6" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M-7,20 L4,20 M-8,36 L5,36" stroke="#f3e2ea" strokeWidth="2" />
      </g>
    </g>
  );
}

/** A lantern hanging just outside, lit when it's dim: the visitor stands in its light. */
function Lantern({ lit }: { lit: boolean }) {
  return (
    <g transform="translate(318 168)">
      {lit && <circle r="46" fill="url(#door-lantern-glow)" />}
      <path d="M0,-24 L0,-12" stroke="var(--ink)" strokeWidth="1.2" />
      <path d="M-7,-12 L7,-12 L9,-8 L-9,-8 Z" fill="#3a2d3b" stroke="var(--ink)" strokeWidth="1" />
      <path d="M-7,-8 L7,-8 L6,10 L-6,10 Z" fill={lit ? '#f6d48a' : '#e8e0d0'} stroke="var(--ink)" strokeWidth="1.1" />
      <path d="M0,-8 L0,10" stroke="#3a2d3b" strokeWidth="0.9" />
      <path d="M-8,10 L8,10 L6,14 L-6,14 Z" fill="#3a2d3b" stroke="var(--ink)" strokeWidth="1" />
    </g>
  );
}

/** Five petals in a row, filled as many as it earned. */
function PetalRow({ n }: { n: number }) {
  return (
    <svg className="petal-row" viewBox="-4 -12 112 22" role="img" aria-label={`${n}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i} transform={`translate(${10 + i * 22} 0)`} className={i < n ? 'petal on' : 'petal'} style={{ animationDelay: `${0.25 + i * 0.18}s` }}>
          <g transform="scale(1.05)">
            <Blossom empty={i >= n} />
          </g>
        </g>
      ))}
    </svg>
  );
}

function Hearts({ n }: { n: number }) {
  const heart = 'M0,4 C-6,0 -7,-4 -4,-6 C-2,-7.4 0,-6 0,-4.6 C0,-6 2,-7.4 4,-6 C7,-4 6,0 0,4 Z';
  return (
    <svg className="heart-row" viewBox="-2 -9 94 16" role="img" aria-label={`${n}/${MAX_HEARTS}`}>
      {Array.from({ length: MAX_HEARTS }, (_, i) => (
        <path key={i} d={heart} transform={`translate(${9 + i * 18} 0) scale(1.2)`} fill={i < n ? '#e86f8c' : 'none'} stroke="var(--ink)" strokeWidth="0.9" />
      ))}
    </svg>
  );
}

/** A gift, drawn: the flower in bloom, the ribbon tied in a bow, the vase, or a packet of seeds. */
export function GiftArt({ gift }: { gift: Gift }) {
  if (gift.kind === 'species') {
    return (
      <svg viewBox="-40 -96 80 100" aria-hidden="true">
        <PlantArt species={gift.species} stage="bloom" />
      </svg>
    );
  }
  if (gift.kind === 'ribbon') {
    return (
      <svg viewBox="-16 -12 32 28" aria-hidden="true">
        <path className="ink-thin" fill={gift.color} d="M0,0 C-4,-7 -13,-8 -13,-2 C-13,3 -6,3 0,0 Z M0,0 C4,-7 13,-8 13,-2 C13,3 6,3 0,0 Z" />
        <path className="ink-thin" fill={gift.color} d="M-1,1 C-3,6 -5,11 -8,14 L-5,13.6 L-4,16 C-1,12 0,6 0.4,1.4 Z M1,1 C3,6 6,10 9,13 L6,13 L5.6,15.6 C3,12 1,6 0,1.6 Z" />
        <ellipse className="ink-thin" rx="2.4" ry="2.6" fill={gift.color} />
      </svg>
    );
  }
  if (gift.kind === 'vase') {
    return (
      <svg viewBox="-24 -52 48 56" aria-hidden="true">
        <BouquetArt bouquet={{ id: 'gift', stems: [], vase: gift.vase, ribbon: null, note: '', seed: 1 }} showNote={false} />
      </svg>
    );
  }
  return (
    <svg viewBox="-24 -32 48 62" aria-hidden="true">
      <path className="ink" fill="#e9d6b0" d="M-18,-22 L18,-22 L18,26 L-18,26 Z" />
      <path className="ink" fill="#dcc497" d="M-18,-22 L-14,-28 L14,-28 L18,-22 Z" />
      <path d="M-15,-17 L15,-17 M-15,21 L15,21" stroke="#b9925e" strokeWidth="0.8" strokeDasharray="2 2" />
      <PansyFlower x={0} y={2} s={0.62} c={designColors(gift.design)} />
    </svg>
  );
}

/**
 * The front door. Someone knocks; she opens it, and they stand on the step in the day's weather
 * with their note. Later, the same doorway is where they take the bouquet and say thank you.
 */
export function Doorstep({ request, thanks, weather, onOpen, onMake, onNotNow, onClose }: {
  request: Request | null;
  /** After she gave them the bouquet: how it went, and what they left her. */
  thanks: Thanks | null;
  weather: Weather;
  /** She opened the door: the knocking stops. */
  onOpen: () => void;
  onMake: () => void;
  onNotNow: () => void;
  onClose: () => void;
}) {
  const w = useWords();
  const { t } = w;
  const visitor: VisitorId | null = thanks?.visitor ?? request?.visitor ?? null;
  const [open, setOpen] = useState(!!thanks || !!request?.seen);
  const [shown, setShown] = useState(open);
  /** Which of their lines they say this time. */
  const [pick] = useState(() => Math.floor(Math.random() * 6));
  /** She'd opened the door to them before, and they waited. */
  const [again] = useState(() => !thanks && !!request?.seen);
  // knock, knock: in time with the knocker, while the door is shut
  useEffect(() => {
    if (open) return;
    const knockNow = () => ambienceIfMade()?.effect('knock');
    const first = window.setTimeout(knockNow, 1550);
    let loop = 0;
    const later = window.setTimeout(() => {
      loop = window.setInterval(knockNow, 4800);
    }, 1550);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(later);
      window.clearInterval(loop);
    };
  }, [open]);
  // the visitor steps into view once the door has swung
  useEffect(() => {
    if (!open || shown) return;
    const timer = window.setTimeout(() => setShown(true), 650);
    return () => window.clearTimeout(timer);
  }, [open, shown]);
  if (!visitor) return null;
  const name = say(w, VISITOR_NAME[visitor]);
  const mood: VisitorMood = thanks ? (thanks.petals >= 5 ? 'delighted' : thanks.petals >= 3 ? 'happy' : 'puzzled') : 'waiting';
  const flying = FLYING.includes(visitor);
  const lit = weather.night || weather.sky === 'rain' || weather.twilight === 'dusk';
  const knocking = !open;
  return (
    <>
      <div className="scrim letter-scrim" onClick={knocking ? onClose : undefined} />
      <div className="doorstep" role="dialog" aria-label={t('At the door', 'Przy drzwiach')}>
        <svg className="doorstep-scene" viewBox="40 60 320 470" preserveAspectRatio="xMidYMax slice">
          <defs>
            <clipPath id="door-opening">
              <path d={DOOR} />
            </clipPath>
            <clipPath id="door-window">
              <circle cx="200" cy="182" r="25" />
            </clipPath>
            <radialGradient id="door-lantern-glow">
              <stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <Inside />
          <Outside weather={weather} />
          {/* the dusk falls on the room, not on the visitor, who stands in the lantern's light */}
          {weather.night && <rect x="-200" y="0" width="800" height="560" fill="#24224f" opacity="0.18" pointerEvents="none" />}
          {open && shown && (
            <g className="door-visitor" transform={`translate(200 ${flying ? 404 : 452}) scale(1.25)`}>
              <VisitorArt id={visitor} mood={mood} />
            </g>
          )}
          <Lantern lit={lit} />
          <FrontDoor open={open} knocking={knocking} visitor={visitor} />
        </svg>
        <div className="doorstep-card">
          {knocking ? (
            <>
              <p className="knock-words">{t('Knock, knock!', 'Puk, puk!')}</p>
              <p className="hint">{t('Someone is at the door.', 'Ktoś stoi pod drzwiami.')}</p>
              <div className="letter-actions">
                <button className="quiet" onClick={onClose}>
                  {t('Later', 'Później')}
                </button>
                <button
                  data-sound="page"
                  onClick={() => {
                    setOpen(true);
                    onOpen();
                  }}
                >
                  {t('Open the door', 'Otwórz drzwi')}
                </button>
              </div>
            </>
          ) : thanks ? (
            <>
              <h2>{name}</h2>
              <PetalRow n={thanks.petals} />
              <p className="visitor-says">„{thanksLine(w, visitor, thanks.petals, pick)}”</p>
              <p className="hint petals-earned">
                {t(`+${thanks.petals} ${thanks.petals === 1 ? 'petal' : 'petals'} in your purse`, `+${thanks.petals} ${w.plural(thanks.petals, 'płatek', 'płatki', 'płatków')} do sakiewki`)}
              </p>
              {thanks.firstFav && <p className="hint">{t('You found their favourite thing!', 'Odkryto ulubioną rzecz!')}</p>}
              <Hearts n={thanks.hearts} />
              {thanks.gift && (
                <div className="gift">
                  <div className="gift-art">
                    <GiftArt gift={thanks.gift} />
                  </div>
                  <div>
                    <strong>{giftLine(w, thanks.gift, (v: Vase) => t(...VASE_NAMES[v])).title}</strong>
                    <p>{giftLine(w, thanks.gift, (v: Vase) => t(...VASE_NAMES[v])).text}</p>
                  </div>
                </div>
              )}
              <div className="letter-actions">
                <button onClick={onClose}>{t('Wave goodbye', 'Pomachaj na pożegnanie')}</button>
              </div>
            </>
          ) : request ? (
            <>
              {again && <p className="visitor-says">„{stillHereLine(w, visitor, pick)}”</p>}
              <div className="visitor-note">
                <p>{noteOpen(w, visitor, request.text)}</p>
                <ul>
                  {request.wishes.map((wish, i) => (
                    <li key={i}>{wishLine(w, wish)}</li>
                  ))}
                </ul>
                <p className="note-sign">{noteClose(w, visitor, request.text)}</p>
              </div>
              <div className="letter-actions">
                <ConfirmButton label={t('Not now', 'Nie teraz')} confirm={t('Sure? They’ll go', 'Na pewno? Pójdzie')} onConfirm={onNotNow} />
                <button className="quiet" onClick={onClose}>
                  {t('Back in a bit', 'Zaraz wrócę')}
                </button>
                <button data-sound="soil" onClick={onMake}>
                  {t('Make the bouquet', 'Ułóż bukiet')}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
