/** A stem drawn as an inked stroke: a dark outline under a coloured core. */
export function Stem({ d, w = 2.6, color = '#6b9455' }: { d: string; w?: number; color?: string }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} style={{ stroke: 'var(--ink)' }} strokeWidth={w + 1.8} />
      <path d={d} stroke={color} strokeWidth={w} />
    </g>
  );
}

export const LEAF = {
  base: '#6f9a5a',
  shade: '#557e47',
  hi: '#93b878',
  vein: '#4b6f3f',
};

/** A wooden seed marker with the plant's Polish name, the way she'd label a pot. */
export function SeedMarker({ label }: { label: string }) {
  const w = Math.max(30, label.length * 5.6 + 8);
  return (
    <g transform="translate(9 0) rotate(6)">
      <path className="ink" fill="#d8b98e" d="M-1.6,4 L-1.6,-24 L1.6,-24 L1.6,4 Z" />
      <path className="ink" fill="#efe1c6" d={`M${-w / 2},-38 L${w / 2},-38 L${w / 2},-23 L${-w / 2},-23 Z`} />
      <text x="0" y="-27" textAnchor="middle" fontFamily="Kalam" fontWeight="700" fontSize="10.5" style={{ fill: 'var(--ink)' }}>
        {label}
      </text>
    </g>
  );
}

/** Freshly sown seeds on the soil. */
export function Seeds({ color = '#6a4a30' }: { color?: string }) {
  return (
    <g>
      <path d="M-12,0 C-8,-3 6,-3.5 12,-0.5" fill="none" stroke="#3a281f" strokeWidth="1.2" />
      <ellipse cx="-5" cy="-2" rx="1.6" ry="1" fill={color} transform="rotate(-20 -5 -2)" />
      <ellipse cx="1" cy="-2.6" rx="1.5" ry="0.95" fill={color} transform="rotate(15 1 -2.6)" />
      <ellipse cx="-1.5" cy="-0.8" rx="1.4" ry="0.9" fill={color} />
    </g>
  );
}
