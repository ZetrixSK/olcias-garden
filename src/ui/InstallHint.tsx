import { useWords } from '../i18n';
import { PANSY_MIX, PansyFlower, PansyLeaf } from '../plants/Pansy';

/** Safari on an iPhone or iPad, not yet opened from the Home Screen. */
export function canAddToHomeScreen(): boolean {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true || (window.matchMedia?.('(display-mode: standalone)').matches ?? false);
  return ios && !standalone;
}

/** Safari's share button, drawn the way it looks on the phone. */
const SHARE = (
  <svg className="install-share" viewBox="-12 -13 24 26" aria-hidden="true">
    <path d="M-4,-3 L-7,-3 L-7,10 L7,10 L7,-3 L4,-3" />
    <path d="M0,-11 L0,3 M-3.6,-7.6 L0,-11 L3.6,-7.6" />
  </svg>
);

/** A sealed envelope with a bratek tucked behind it: what's waiting for her on the Home Screen. */
function Envelope() {
  return (
    <svg className="welcome-art" viewBox="-110 -112 220 180" aria-hidden="true">
      {/* the bratek and its leaves, tucked behind the envelope's corner */}
      <g transform="translate(60 -64) rotate(16)">
        <PansyLeaf x={-2} y={26} rot={-58} len={12} s={1} />
        <PansyLeaf x={2} y={28} rot={44} len={11} s={0.9} />
        <PansyFlower x={0} y={0} s={1.5} rot={8} c={PANSY_MIX[0]!} />
      </g>
      <g transform="rotate(-4)">
        <path className="ink" fill="#f8f1e4" d="M-84,-46 L84,-46 C87,-46 88,-45 88,-42 L88,42 C88,45 87,46 84,46 L-84,46 C-87,46 -88,45 -88,42 L-88,-42 C-88,-45 -87,-46 -84,-46 Z" />
        <path d="M-86,44 L-14,-2 M86,44 L14,-2" fill="none" className="ink-thin" />
        <path className="ink" fill="#efe4d0" d="M-87,-44 L0,10 L87,-44 Z" />
        <path d="M-70,-36 L-8,2" fill="none" stroke="#fbf7f0" strokeWidth="1.6" strokeLinecap="round" />
        {/* the pansy-heart wax seal, the same as on the letter */}
        <g transform="translate(0 6) scale(1.15)">
          <path
            className="ink"
            fill="#b5476a"
            d="M0,-15 C5,-16 8,-12 12,-11 C16,-8 14,-3 16,1 C17,6 12,8 10,12 C6,16 2,13 -2,15 C-7,16 -9,12 -12,10 C-16,6 -14,2 -16,-2 C-16,-7 -12,-9 -10,-12 C-7,-15 -4,-14 0,-15 Z"
          />
          <path d="M0,-6 C-3,-10 -9,-7 -6,-2 L0,5 L6,-2 C9,-7 3,-10 0,-6 Z" fill="#8e2f4f" />
        </g>
      </g>
    </svg>
  );
}

/**
 * The first thing she sees in Safari on an iPhone, instead of the garden: the garden lives on the
 * Home Screen, which keeps a save of its own apart from Safari's, so the letter waits for her there.
 * She can still open it here instead.
 */
export function Welcome({ onStayHere }: { onStayHere: () => void }) {
  const { pl } = useWords();
  return (
    <div className="welcome" role="dialog" aria-label={pl ? 'Czeka na Ciebie ogród' : 'A garden is waiting for you'}>
      <div className="welcome-inner">
        <Envelope />
        {pl ? (
          <>
            <h1>Czeka na Ciebie ogród</h1>
            <p className="welcome-lead">Mieszka na ekranie początkowym, jak aplikacja. Tam też czeka na Ciebie list.</p>
            <ol>
              <li>
                Stuknij Udostępnij {SHARE} w Safari. Jeśli go nie widać, jest pod <b>⋯</b>
              </li>
              <li>
                Wybierz <b>Do ekranu początkowego</b>
              </li>
              <li>Otwórz ogród z nowej ikonki</li>
            </ol>
          </>
        ) : (
          <>
            <h1>A garden is waiting for you</h1>
            <p className="welcome-lead">It lives on your Home Screen, like an app. There's a letter waiting for you there too.</p>
            <ol>
              <li>
                Tap Share {SHARE} in Safari. If it isn't there, it's under <b>⋯</b>
              </li>
              <li>
                Choose <b>Add to Home Screen</b>
              </li>
              <li>Open the garden from its new icon</li>
            </ol>
          </>
        )}
        <button className="welcome-here" onClick={onStayHere}>
          {pl ? 'Otwórz tutaj, w Safari' : 'Open it here in Safari instead'}
        </button>
      </div>
    </div>
  );
}
