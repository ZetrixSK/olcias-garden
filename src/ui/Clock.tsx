import type { Timelapse } from '../garden/timelapse';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Eases the replay in and out, so the hands start slowly, rush, and settle. */
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

/** How long the hands take to sweep: longer absences take a little longer, never tediously. */
export function lapseDuration(lapse: Timelapse): number {
  const hours = (lapse.to - lapse.from) / HOUR;
  return Math.min(8500, Math.max(3000, 2400 + 1100 * Math.log2(1 + hours)));
}

/**
 * The time the hands show. Over a long absence they skip whole half-days, so they never spin
 * absurdly fast, but they still start at the time she left and stop at the time it is now.
 */
function handTime(lapse: Timelapse, e: number): number {
  const gap = lapse.to - lapse.from;
  const shown = gap > DAY ? (gap % (12 * HOUR)) + 12 * HOUR : gap;
  return lapse.to - shown * (1 - e);
}

export function elapsedText(ms: number): string {
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return min % 60 ? `${h} h ${min % 60} min` : `${h} h`;
  const d = Math.floor(h / 24);
  const rest = h % 24;
  return `${d} ${d === 1 ? 'day' : 'days'}${rest ? `, ${rest} h` : ''}`;
}

/** A little twin-bell alarm clock in the room's colours. */
function AlarmClock({ time }: { time: number }) {
  const d = new Date(time);
  const minutes = d.getMinutes() + d.getSeconds() / 60;
  const minDeg = minutes * 6;
  const hourDeg = ((d.getHours() % 12) + minutes / 60) * 30;
  return (
    <svg viewBox="-60 -66 120 128" aria-hidden="true">
      {/* bells and hammer */}
      <path className="ink" style={{ fill: 'var(--tie)' }} d="M-44,-34 C-50,-46 -40,-60 -26,-56 C-22,-55 -20,-52 -21,-50 Z" />
      <path className="ink" style={{ fill: 'var(--tie)' }} d="M44,-34 C50,-46 40,-60 26,-56 C22,-55 20,-52 21,-50 Z" />
      <path className="ink" fill="none" strokeWidth="2.2" d="M0,-48 L0,-58 M-6,-58 L6,-58" />
      {/* legs */}
      <path className="ink" style={{ fill: 'var(--sill-shade)' }} d="M-30,38 L-40,54 L-34,56 L-22,42 Z M30,38 L40,54 L34,56 L22,42 Z" />
      {/* case */}
      <circle className="ink" cx="0" cy="0" r="47" style={{ fill: 'var(--sill)' }} />
      <path d="M-40,-18 A43,43 0 0 1 -12,-42" fill="none" style={{ stroke: 'var(--sill-hi)' }} strokeWidth="3" strokeLinecap="round" />
      <circle className="ink" cx="0" cy="0" r="39" style={{ fill: 'var(--sign-bg)' }} />
      {/* hour marks, drawn by hand rather than ruled */}
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          transform={`rotate(${i * 30 + (i % 3 ? 1.5 : 0)})`}
          d={i % 3 === 0 ? 'M0,-34 L0,-27' : 'M0,-34 L0,-30.5'}
          style={{ stroke: 'var(--sign-ink)' }}
          strokeWidth={i % 3 === 0 ? 2.6 : 1.6}
          strokeLinecap="round"
        />
      ))}
      {/* hands */}
      <g transform={`rotate(${hourDeg})`}>
        <path className="ink" style={{ fill: 'var(--ink)' }} d="M-2.6,4 L-1.6,-18 L0,-22 L1.6,-18 L2.6,4 Z" />
      </g>
      <g transform={`rotate(${minDeg})`}>
        <path className="ink" style={{ fill: 'var(--ink)' }} d="M-1.8,5 L-1,-28 L0,-32 L1,-28 L1.8,5 Z" />
        <circle cx="0" cy="-24" r="2.4" style={{ fill: 'var(--tie)' }} />
      </g>
      <circle className="ink" cx="0" cy="0" r="3.4" style={{ fill: 'var(--tie)' }} />
    </svg>
  );
}

/** The clock shown while the garden replays what happened since she was last here. */
export function LapseClock({ lapse, p, fading, onSkip }: { lapse: Timelapse; p: number; fading: boolean; onSkip: () => void }) {
  const e = ease(Math.min(1, p));
  return (
    <div className={fading ? 'lapse fading' : 'lapse'} onClick={onSkip} role="status" aria-label="While you were away">
      <div className="lapse-clock">
        <AlarmClock time={handTime(lapse, e)} />
      </div>
      <p className="lapse-note">while you were away</p>
      <p className="lapse-time">{elapsedText((lapse.to - lapse.from) * e)}</p>
    </div>
  );
}

/** Toolbar icon. */
export const CLOCK_ICON = (
  <g>
    <circle cx="0" cy="1" r="8" />
    <path d="M0,-3 L0,1 L3,3 M-8,-6 C-9,-9 -6,-12 -3,-10 M8,-6 C9,-9 6,-12 3,-10 M-5,9 L-7,12 M5,9 L7,12" />
  </g>
);
