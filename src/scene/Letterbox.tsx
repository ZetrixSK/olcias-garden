import type { Theme } from '../theme/palettes';
import { useWords } from '../i18n';

/** Dusty rose with a pink flag in the cozy room; black with gold in the witchy one. */
const LOOK: Record<Theme, { body: string; shade: string; hi: string; flag: string; trim: string }> = {
  cozy: { body: '#c95d7f', shade: '#a8486a', hi: '#e58aa6', flag: '#f2c4cf', trim: '#7c2141' },
  witchy: { body: '#2b2229', shade: '#1d161c', hi: '#4a3a46', flag: '#c9a45c', trim: '#c9a45c' },
};

/**
 * Her letterbox on the wall, centred on (0,0): tapping it opens the post box. When a bouquet has
 * come since she last looked, its flag is up and a letter peeks out of the slot.
 */
export function Letterbox({ theme, news, onOpen }: { theme: Theme; news: boolean; onOpen?: () => void }) {
  const { t } = useWords();
  const c = LOOK[theme];
  return (
    <g
      className="tappable"
      role="button"
      aria-label={news ? t('Post box: something new', 'Skrzynka: coś nowego') : t('Post box', 'Skrzynka pocztowa')}
      data-sound="page"
      onClick={onOpen}
    >
      {/* the nail and its shadow on the wall */}
      <ellipse cx="0" cy="17" rx="12" ry="2.4" fill="#000" opacity="0.1" />
      {/* the flag on its arm, at the side: standing up when there's post, hanging down when not */}
      <g transform={news ? undefined : 'rotate(180 11 4)'}>
        <path d="M11,4 L11,-13" stroke={c.trim} strokeWidth="1.6" strokeLinecap="round" />
        <path className="ink-thin" fill={c.flag} d="M11,-14 L20,-14 L20,-8 L11,-8 Z" />
      </g>
      {/* the box: a rounded top, a lid with the slot in it */}
      <path className="ink" fill={c.body} d="M-11,15 L-11,-6 C-11,-14 -6,-17 0,-17 C6,-17 11,-14 11,-6 L11,15 Z" />
      <path d="M4,-16 C8,-14 11,-11 11,-6 L11,15 L6,15 L6,-6 C6,-10 5.4,-13 4,-16 Z" fill={c.shade} opacity="0.55" />
      <path d="M-8,-8 C-8,-12 -5,-14.6 -2,-15.4" fill="none" stroke={c.hi} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M-11,-3 L11,-3" className="ink-thin" fill="none" />
      {news && (
        <g transform="translate(-1 -9) rotate(-8)">
          <path className="ink-thin" fill="#fbf7f0" d="M-6,0 L6,0 L6,6 L-6,6 Z" />
          <path d="M-6,0 L0,3.6 L6,0" fill="none" className="ink-thin" />
        </g>
      )}
      <rect x="-7.4" y="-7.4" width="14.8" height="2.8" rx="1.2" fill="#1d1420" />
      {/* a little heart on the front */}
      <path d="M0,7.4 C-2.4,5.4 -4.6,3.6 -4.6,1.6 C-4.6,0 -3.4,-1 -2.2,-1 C-1.2,-1 -0.4,-0.4 0,0.4 C0.4,-0.4 1.2,-1 2.2,-1 C3.4,-1 4.6,0 4.6,1.6 C4.6,3.6 2.4,5.4 0,7.4 Z" fill={c.trim} />
      <circle cx="-7.4" cy="11.4" r="0.9" fill={c.shade} />
      <circle cx="7.4" cy="11.4" r="0.9" fill={c.shade} />
      {/* a generous tap area around it */}
      <rect x="-22" y="-26" width="44" height="46" fill="transparent" />
    </g>
  );
}
