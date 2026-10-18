import { POT_KINDS, SPECIES, SPECIES_IDS, STAGES } from './garden/species';
import { PlantArt } from './plants/PlantArt';
import { PansyPlant } from './plants/Pansy';
import { Potted } from './plants/Pots';
import { WallMotifs } from './scene/Room';
import type { Pressing } from './garden/pressed';
import { PressedBook } from './ui/PressedBook';

/** Dev-only sheet of every species at every stage, opened with ?gallery. */
export function Gallery() {
  return (
    <svg viewBox="0 0 400 820" style={{ width: '100%', height: '100%', background: 'var(--wall)' }}>
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
