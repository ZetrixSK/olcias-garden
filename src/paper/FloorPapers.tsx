import { useWords } from '../i18n';

/**
 * The morning papers on the floor, centred on (0,0): the Kurier folded in half, Brzęczyk's
 * yellow on top. A new day's papers are still tied with a pink string; once read, they lie open.
 */
export function FloorPapers({ fresh, onOpen }: { fresh: boolean; onOpen: () => void }) {
  const { t } = useWords();
  return (
    <g
      className="tappable floor-papers"
      role="button"
      aria-label={fresh ? t('The morning papers: new today', 'Poranne gazety: dzisiejsze') : t('The morning papers', 'Poranne gazety')}
      data-sound="page"
      onClick={onOpen}
    >
      <ellipse cx="2" cy="6" rx="30" ry="4" fill="#000" opacity="0.12" />
      {/* the Kurier, folded: cream, with its title and columns */}
      <g transform="rotate(-6)">
        <path className="ink-thin" fill="#efe6d3" d="M-26,-10 L22,-12 L26,4 L-22,6 Z" />
        <path d="M-20,-7 L6,-8.2" stroke="#2d2228" strokeWidth="2" strokeLinecap="round" />
        <path d="M-20,-3 L18,-4.6 M-19,0 L18,-1.4 M-18,3 L8,2" stroke="#2d2228" strokeWidth="0.7" opacity="0.6" />
      </g>
      {/* Brzęczyk, smaller and louder, on top */}
      <g transform="translate(6 -6) rotate(9)">
        <path className="ink-thin" fill="#e2ad3f" d="M-16,-7 L16,-8 L18,4 L-14,5 Z" />
        <path d="M-12,-4 L6,-4.6" stroke="#1f1a14" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M-12,0 L12,-0.6" stroke="#1f1a14" strokeWidth="0.7" opacity="0.7" />
      </g>
      {fresh && (
        <g>
          {/* tied with a pink string, and a little bow */}
          <path d="M-4,-14 C-6,-4 -6,2 -5,7" fill="none" stroke="#c95d7f" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M-5,-8 C-10,-14 -14,-8 -6,-7 C-2,-12 4,-12 -4,-7" fill="none" stroke="#c95d7f" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      )}
      {/* a generous tap area */}
      <rect x="-34" y="-26" width="68" height="40" fill="transparent" />
    </g>
  );
}
