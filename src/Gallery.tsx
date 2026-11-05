import { RibbonBow } from './plants/Ribbon';
import { GIFT_RIBBONS } from './garden/visitors';
import { TRINKETS } from './garden/market';
import { CardBack, Milton, PanJezyk, PaniCma, Stall, TrinketArt } from './scene/MarketArt';
import { VISITOR_IDS } from './garden/visitors';
import { VisitorArt } from './scene/VisitorArt';
import { POT_KINDS, SPECIES, SPECIES_IDS, STAGES, type SpeciesId } from './garden/species';
import { RIBBONS, VASES } from './garden/bouquets';
import { BouquetArt, ParcelBox } from './plants/Bouquet';
import { PlantArt } from './plants/PlantArt';
import { PansyPlant } from './plants/Pansy';
import { Potted } from './plants/Pots';
import { WallMotifs } from './scene/Room';
import type { Pressing } from './garden/pressed';
import { PressedBook } from './ui/PressedBook';

/** Dev-only sheet of every species at every stage, opened with ?gallery. */
export function Gallery() {
  return (
    <svg className={new URLSearchParams(location.search).has("open") ? "show-open" : undefined} viewBox={`0 0 400 ${80 + SPECIES_IDS.length * 150}`} style={{ width: "100%", background: "var(--wall)" }}>
      {SPECIES_IDS.map((sp, r) =>
        STAGES.map((st, c) => (
          <g key={`${sp}-${st}`} transform={`translate(${55 + c * 97} ${150 + r * 150}) scale(0.72)`}>
            <Potted kind={POT_KINDS[(r + c) % POT_KINDS.length]!} wet={c === 1}>
              <PlantArt species={sp} stage={st} />
            </Potted>
          </g>
        )),
      )}
      {SPECIES_IDS.map((sp, r) => (
        <text key={sp} x="4" y={150 + r * 150 + 50} fontSize="9" fontFamily="Kalam">{SPECIES[sp].name}</text>
      ))}
    </svg>
  );
}

/** Dev-only app icon: her black pansy pot on cream paper. Opened with ?icon&pad=0.18 and screenshotted. */
export function IconArt({ pad }: { pad: number }) {
  // the potted pansy spans roughly x -58..58, y -112..50 in plant units
  const inner = 512 * (1 - pad * 2);
  const s = inner / 168;
  return (
    <svg viewBox="0 0 512 512" style={{ width: '100vw', height: '100vh', display: 'block' }}>
      <rect width="512" height="512" fill="#ecdfc9" />
      <rect width="512" height="512" fill="url(#motif-cozy)" />
      <WallMotifs />
      <ellipse cx="256" cy={256 + 80 * s} rx={56 * s} ry={5 * s} fill="#3d2633" opacity="0.12" />
      <g transform={`translate(256 ${256 + 31 * s}) scale(${s})`}>
        <Potted kind="wide">
          <PansyPlant stage="bloom" />
        </Potted>
      </g>
    </svg>
  );
}

/** Dev-only: the pressed-flower book filled with two of every species and one of her own bratki. Opened with ?pressed. */
export function PressedGallery() {
  const day = Date.UTC(2026, 9, 1);
  const own = { id: 'f1', name: 'Słoneczko', top: '#f3d36b', low: '#6b3fa0', face: 'whiskers' as const, faceColor: '#241326', edge: '#fbf6ee' };
  const pressed: Pressing[] = [
    ...SPECIES_IDS.flatMap((species, i) => [0, 1].map((k) => ({
      id: `${species}-${k}`, plantId: species, species, at: day + (i * 2 + k) * 86_400_000, variety: null, design: null, name: null, note: '',
    }))),
    { id: 'own', plantId: 'own', species: 'pansy', at: day + 12 * 86_400_000, variety: null, design: own, name: 'Moje słoneczko', note: 'The first one I designed myself, pressed on a rainy day.' },
    { id: 'velvet', plantId: 'v', species: 'pansy', at: day + 13 * 86_400_000, variety: 'velvet', design: null, name: null, note: '' },
  ];
  const page = Number(new URLSearchParams(location.search).get('page') ?? 0);
  return <PressedBook key={page} pressed={pressed.slice(page * 4, page * 4 + 4)} onNote={() => {}} onRemove={() => {}} onClose={() => {}} />;
}

/** Dev-only: bouquets of every kind in each vase, and the parcel box. Opened with ?bouquets. */
export function BouquetGallery() {
  const mixes: Array<[string, SpeciesId[]]> = [
    ['a', ['pansy', 'pansy', 'pansy']],
    ['b', ['rose', 'lavender', 'daisy', 'rose', 'lavender']],
    ['c', ['moonflower', 'batflower', 'hollyhock']],
    ['d', ['tulip', 'tulip', 'tulip', 'daisy', 'tulip']],
    ['e', ['cyclamen', 'snowdrop', 'hellebore', 'snowdrop']],
    ['f', ['pansy', 'rose', 'tulip', 'daisy', 'lavender', 'pumpkin', 'pansy']],
  ];
  return (
    <svg viewBox="0 0 400 420" style={{ width: '100%', background: 'var(--wall)' }}>
      {mixes.map(([id, species], i) => (
        <g key={id} transform={`translate(${70 + (i % 3) * 130} ${150 + Math.floor(i / 3) * 170}) scale(1.15)`}>
          <BouquetArt
            bouquet={{
              id,
              stems: species.map((s, k) => ({ species: s, variety: s === 'pansy' ? (['olcia', 'velvet', 'mix', 'rosy'][k % 4] ?? null) : null, design: null })),
              vase: VASES[i % 3]!,
              ribbon: i % 2 ? RIBBONS[i % RIBBONS.length]! : null,
              note: i % 2 ? '' : 'for you',
              seed: i + 3,
            }}
          />
        </g>
      ))}
      <g transform="translate(360 400) scale(1.4)">
        <ParcelBox count={2} />
      </g>
    </svg>
  );
}

/** Dev-only sheet of every visitor in every mood, opened with ?visitors. */
export function VisitorGallery() {
  const moods = ['waiting', 'happy', 'delighted', 'puzzled'] as const;
  return (
    <svg viewBox={`0 0 400 ${VISITOR_IDS.length * 120 + 30}`} style={{ width: '100%', background: 'var(--wall)' }}>
      {VISITOR_IDS.map((v, r) =>
        moods.map((m, c) => (
          <g key={`${v}-${m}`} transform={`translate(${52 + c * 98} ${150 + r * 120}) scale(0.72)`}>
            <VisitorArt id={v} mood={m} />
          </g>
        )),
      )}
    </svg>
  );
}

/** Dev-only sheet of the market: both keepers, the stalls, every trinket and Milton, opened with ?marketart. */
export function MarketGallery() {
  return (
    <svg viewBox="0 0 400 760" style={{ width: '100%', background: 'var(--wall)' }}>
      <defs>
        <radialGradient id="stall-glow">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {(['waiting', 'happy', 'asleep'] as const).map((m, i) => (
        <g key={m} transform={`translate(${60 + i * 90} 120)`}>
          <PanJezyk mood={m} />
        </g>
      ))}
      <g transform="translate(330 120) scale(0.9)">
        <PaniCma />
      </g>
      <g transform="translate(110 340) scale(0.36)">
        <Stall night={false} keeper={<PanJezyk />} />
      </g>
      <g transform="translate(290 340) scale(0.36)">
        <Stall night keeper={<PaniCma />} />
      </g>
      {TRINKETS.map((t, i) => (
        <g key={t.id} transform={`translate(${30 + (i % 8) * 48} ${t.kind === 'charm' ? 420 + Math.floor(i / 8) * 70 : 460 + Math.floor(i / 8) * 70}) scale(1.5)`}>
          <TrinketArt id={t.id} />
        </g>
      ))}
      <g transform="translate(200 700) scale(1.6)">
        <Milton />
      </g>
      <g transform="translate(300 640) scale(1)">
        <foreignObject width="60" height="84">
          <CardBack />
        </foreignObject>
      </g>
    </svg>
  );
}

/** Dev-only: every ribbon, close up and on a bouquet, opened with ?ribbons. */
export function RibbonGallery() {
  const all = [...RIBBONS, ...Object.values(GIFT_RIBBONS)];
  return (
    <svg viewBox="0 0 400 300" style={{ width: '100%', background: 'var(--wall)' }}>
      {all.map((c, i) => (
        <g key={c}>
          <g transform={`translate(${34 + (i % 6) * 66} ${40 + Math.floor(i / 6) * 60}) scale(2.2)`}>
            <RibbonBow color={c} />
          </g>
        </g>
      ))}
      {Object.values(GIFT_RIBBONS).map((c, i) => (
        <g key={c} transform={`translate(${34 + i * 66} 280) scale(1.25)`}>
          <BouquetArt bouquet={{ id: `r${i}`, stems: [{ species: 'rose', variety: null, design: null }, { species: 'daisy', variety: null, design: null }, { species: 'lavender', variety: null, design: null }], vase: 'jar', ribbon: c, note: '', seed: 3 }} showNote={false} />
        </g>
      ))}
    </svg>
  );
}
