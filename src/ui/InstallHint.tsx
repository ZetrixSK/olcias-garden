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

/** A one-time note in Safari on iPhone: how to keep the garden on the Home Screen, where it works like an app. */
export function InstallHint({ onDone }: { onDone: () => void }) {
  return (
    <div className="sheet install-hint" role="dialog" aria-label="Keep the garden on your Home Screen">
      <h2>Keep it on your Home Screen</h2>
      <ol>
        <li>
          Tap Share {SHARE} in Safari. If it isn't there, it's under <b>⋯</b>
        </li>
        <li>
          Choose <b>Add to Home Screen</b>
        </li>
        <li>Open the garden from its new icon. It fills the screen and works without the internet.</li>
      </ol>
      <p className="decor-hint">
        The Home Screen garden keeps its own save, apart from Safari, so it's best to add it before planting anything.
      </p>
      <button onClick={onDone}>Got it</button>
    </div>
  );
}
