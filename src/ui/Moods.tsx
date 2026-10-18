import type { Mood } from '../garden/diary';

type Eyes = 'dot' | 'arc' | 'closed' | 'heart' | 'star' | 'wink' | 'droopy';
type Mouth = 'smile' | 'grin' | 'soft' | 'flat' | 'frown' | 'wavy' | 'tongue' | 'o';
type Extra = 'blush' | 'tear' | 'brows-sad' | 'brows-angry' | 'zzz' | 'sweat' | 'heart' | 'shine';

const FACES: Record<Mood, { color: string; eyes: Eyes; mouth: Mouth; extra?: Extra[] }> = {
  happy: { color: '#f3d36b', eyes: 'dot', mouth: 'smile', extra: ['blush'] },
  joy: { color: '#f7c15a', eyes: 'arc', mouth: 'grin', extra: ['blush'] },
  love: { color: '#f2a6bf', eyes: 'heart', mouth: 'smile', extra: ['blush'] },
  calm: { color: '#b9d3b0', eyes: 'closed', mouth: 'soft' },
  proud: { color: '#e8b24a', eyes: 'closed', mouth: 'smile', extra: ['shine'] },
  excited: { color: '#f6a97a', eyes: 'star', mouth: 'grin' },
  silly: { color: '#f4c38a', eyes: 'wink', mouth: 'tongue' },
  grateful: { color: '#f0c4d2', eyes: 'arc', mouth: 'soft', extra: ['blush', 'heart'] },
  sleepy: { color: '#d9cfe6', eyes: 'closed', mouth: 'o', extra: ['zzz'] },
  tired: { color: '#cfc6b8', eyes: 'droopy', mouth: 'flat' },
  meh: { color: '#d8d2c2', eyes: 'dot', mouth: 'flat' },
  sad: { color: '#a9c4ec', eyes: 'dot', mouth: 'frown', extra: ['brows-sad'] },
  teary: { color: '#93b4e0', eyes: 'dot', mouth: 'frown', extra: ['brows-sad', 'tear'] },
  angry: { color: '#e9806e', eyes: 'dot', mouth: 'frown', extra: ['brows-angry'] },
  anxious: { color: '#c9b6e3', eyes: 'dot', mouth: 'wavy', extra: ['sweat'] },
  unwell: { color: '#bcd493', eyes: 'closed', mouth: 'wavy' },
};

const INK = '#3d2633';
const line = { fill: 'none', stroke: INK, strokeWidth: 1.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function Eye({ kind, x }: { kind: Eyes; x: number }) {
  switch (kind) {
    case 'dot':
      return <ellipse cx={x} cy={-2} rx={1.1} ry={1.4} fill={INK} />;
    case 'arc':
      return <path d={`M${x - 1.8},-1.4 Q${x},-3.8 ${x + 1.8},-1.4`} {...line} />;
    case 'closed':
      return <path d={`M${x - 1.8},-2.2 Q${x},-0.4 ${x + 1.8},-2.2`} {...line} />;
    case 'droopy':
      return (
        <g>
          <path d={`M${x - 2},-2.4 L${x + 2},-2.4`} {...line} />
          <path d={`M${x - 1.4},-2.2 Q${x},-0.8 ${x + 1.4},-2.2`} fill={INK} />
        </g>
      );
    case 'heart':
      return <path d={`M${x},-0.6 C${x - 3},-2.4 ${x - 1.6},-4.8 ${x},-3.2 C${x + 1.6},-4.8 ${x + 3},-2.4 ${x},-0.6 Z`} fill="#c0435f" />;
    case 'star':
      return <path d={`M${x},-4.4 L${x + 0.8},-2.8 L${x + 2.4},-2.6 L${x + 1.2},-1.5 L${x + 1.5},0.2 L${x},-0.7 L${x - 1.5},0.2 L${x - 1.2},-1.5 L${x - 2.4},-2.6 L${x - 0.8},-2.8 Z`} fill="#fff6c8" stroke={INK} strokeWidth={0.6} />;
    case 'wink':
      return x < 0 ? <ellipse cx={x} cy={-2} rx={1.1} ry={1.4} fill={INK} /> : <path d={`M${x - 1.8},-2 L${x + 1.8},-2`} {...line} />;
  }
}

function MouthShape({ kind }: { kind: Mouth }) {
  switch (kind) {
    case 'smile':
      return <path d="M-3.6,2.4 Q0,6 3.6,2.4" {...line} />;
    case 'soft':
      return <path d="M-2.4,3 Q0,4.8 2.4,3" {...line} />;
    case 'grin':
      return <path d="M-4,2 Q0,2.8 4,2 Q3.4,6.6 0,6.8 Q-3.4,6.6 -4,2 Z" fill="#7a2c3e" stroke={INK} strokeWidth={1} strokeLinejoin="round" />;
    case 'flat':
      return <path d="M-2.8,3.6 L2.8,3.6" {...line} />;
    case 'frown':
      return <path d="M-3.2,5 Q0,2.2 3.2,5" {...line} />;
    case 'wavy':
      return <path d="M-3.6,4 Q-2.4,2.8 -1.2,4 Q0,5.2 1.2,4 Q2.4,2.8 3.6,4" {...line} />;
    case 'o':
      return <ellipse cx={0} cy={3.8} rx={1.3} ry={1.6} fill="none" stroke={INK} strokeWidth={1.1} />;
    case 'tongue':
      return (
        <g>
          <path d="M-3.6,2.6 Q0,5.4 3.6,2.6" {...line} />
          <path d="M-0.4,3.8 L2.6,3.6 C2.8,6 0,6.6 -0.4,3.8 Z" fill="#e5899a" stroke={INK} strokeWidth={0.8} />
        </g>
      );
  }
}

function Extras({ list }: { list: Extra[] }) {
  return (
    <g>
      {list.map((e) => {
        switch (e) {
          case 'blush':
            return (
              <g key={e} fill="#e5899a" opacity={0.55}>
                <ellipse cx={-6} cy={1.4} rx={1.8} ry={1.1} />
                <ellipse cx={6} cy={1.4} rx={1.8} ry={1.1} />
              </g>
            );
          case 'tear':
            return <path key={e} d="M-3.6,0 C-2.6,1.6 -2.4,2.8 -3.6,3.6 C-4.8,2.8 -4.6,1.6 -3.6,0 Z" fill="#dff0ff" stroke="#4f6fb5" strokeWidth={0.6} />;
          case 'brows-sad':
            return <path key={e} d="M-5,-4.4 L-2,-5.6 M5,-4.4 L2,-5.6" {...line} strokeWidth={1} />;
          case 'brows-angry':
            return <path key={e} d="M-5,-5.6 L-1.8,-4.2 M5,-5.6 L1.8,-4.2" {...line} strokeWidth={1.2} />;
          case 'zzz':
            return <path key={e} d="M5.6,-9.4 L8.2,-9.4 L5.6,-6.8 L8.2,-6.8 M8.8,-12.6 L10.4,-12.6 L8.8,-11 L10.4,-11" fill="none" stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />;
          case 'sweat':
            return <path key={e} d="M7,-6.4 C8,-4.8 8.2,-3.6 7,-2.8 C5.8,-3.6 6,-4.8 7,-6.4 Z" fill="#dff0ff" stroke="#4f6fb5" strokeWidth={0.6} />;
          case 'heart':
            return <path key={e} d="M8.4,-6 C6.6,-7.4 7.4,-9.6 8.6,-8.4 C9.8,-9.6 10.8,-7.4 8.8,-6 Z" fill="#c0435f" />;
          case 'shine':
            return <path key={e} d="M8.6,-10.4 L9.2,-8.8 L10.8,-8.2 L9.2,-7.6 L8.6,-6 L8,-7.6 L6.4,-8.2 L8,-8.8 Z" fill="#fff1b8" stroke={INK} strokeWidth={0.5} />;
        }
      })}
    </g>
  );
}

/** A mood as a little round face, hand-inked like the rest of the garden. */
export function MoodFace({ mood, size = 28 }: { mood: Mood; size?: number }) {
  const f = FACES[mood];
  return (
    <svg viewBox="-12 -13 24 25" width={size} height={size} aria-hidden="true">
      <circle r="9.6" fill={f.color} stroke={INK} strokeWidth={1.1} />
      <path d="M-6,-5 Q-4,-7.6 -0.6,-8" fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={1.2} strokeLinecap="round" />
      <Eye kind={f.eyes} x={-3.4} />
      <Eye kind={f.eyes} x={3.4} />
      <MouthShape kind={f.mouth} />
      {f.extra && <Extras list={f.extra} />}
    </svg>
  );
}
