import { WINDOW_SPOTS, type GardenState, type WindowSpot } from '../garden/state';
import { chooseRoutes, type VineSpot } from '../garden/vines';
import { POT_HEIGHT } from '../plants/Pots';
import { candleLit as isCandleLit, roomTint, type Theme, type Weather } from '../theme/palettes';
import { Ball, CANDLE_FLAME, CornerPiece, Flame, ShelfTrinket, SillCandle, WallDecor } from './Decor';
import { DogBed, Dogs } from './Dogs';
import { EmptySlot, GardenPlanter } from './GardenPlanter';
import { FLOOR_Y, SILL_Y, VIEW_H, VIEW_W, WINDOW_OPENING } from './geometry';
import { Landscape, Rain } from './Outside';
import { Curtains, Floor, Shelf, Sign, Sill, Wall, WindowFrame } from './Room';
import { Sky, SkyLights } from './Sky';
import { leanFor, runnerStart, VINE_PHASE, VineRunner, Vines, type PlacedVine, type Snip, type VineSpec } from './Vines';

/** Where each window spot stands: x, the surface it stands on, the drawing scale and the tap area's width. */
const SPOT_POS: Record<WindowSpot, { x: number; base: number; scale: number; w: number; h: number }> = {
  'shelf-1': { x: 118, base: 322, scale: 0.6, w: 56, h: 96 },
  'shelf-2': { x: 176, base: 322, scale: 0.6, w: 56, h: 96 },
  'shelf-3': { x: 236, base: 322, scale: 0.6, w: 56, h: 96 },
  'sill-1': { x: 94, base: SILL_Y + 1, scale: 1, w: 92, h: 168 },
  'sill-2': { x: 190, base: SILL_Y + 1, scale: 1, w: 92, h: 168 },
  'sill-3': { x: 280, base: SILL_Y + 1, scale: 1, w: 86, h: 168 },
};

type SpotProps = {
  garden: GardenState;
  now: number;
  selectedId: string | null;
  placingId: string | null;
  wateringId: string | null;
  onSpot: (spot: WindowSpot) => void;
  placed: PlacedVine[];
};

/** Where each vine starts: in the soil of the plant standing in its spot. At most one per pot. */
function placeVines(vines: VineSpec[], garden: GardenState): PlacedVine[] {
  const bySpot = new Map<WindowSpot, VineSpec>();
  for (const v of vines) {
    if (!bySpot.has(v.from) && garden.plants.some((p) => p.display === v.from)) bySpot.set(v.from, v);
  }
  const middle = bySpot.get('sill-2');
  const routes = chooseRoutes(bySpot.has('sill-1'), bySpot.has('sill-3'), middle ? (middle.dir ?? 'right') : null);
  return [...bySpot].flatMap(([spot, vine]) => {
    const kind = routes[spot as VineSpot];
    const plant = garden.plants.find((p) => p.display === spot);
    if (!kind || !plant) return [];
    const pos = SPOT_POS[spot];
    const rimY = pos.base - POT_HEIGHT[plant.pot] * pos.scale;
    return [{ vine, kind, start: runnerStart(kind, pos.x, rimY), phase: VINE_PHASE[spot] ?? 0 }];
  });
}

/** Her plants in one row of the window (shelf or sill), with invisible tap areas over each spot. */
function WindowRow({ row, garden, now, selectedId, placingId, wateringId, onSpot, placed }: SpotProps & { row: 'shelf' | 'sill' }) {
  const spots = WINDOW_SPOTS.filter((s) => s.startsWith(row));
  return (
    <g>
      {spots.map((spot) => {
        const pos = SPOT_POS[spot];
        const plant = garden.plants.find((p) => p.display === spot);
        const rimY = pos.base - (plant ? POT_HEIGHT[plant.pot] * pos.scale : 0);
        const climbing = placed.filter((v) => v.vine.from === spot);
        return (
          <g key={spot} transform={`translate(${pos.x} ${rimY.toFixed(1)}) scale(${pos.scale})`}>
            {plant ? (
              <GardenPlanter
                plant={plant}
                now={now}
                selected={plant.id === selectedId}
                moving={plant.id === placingId}
                watering={plant.id === wateringId}
                lean={climbing[0] ? leanFor(climbing[0].kind) : 0}
                runner={
                  climbing.length > 0 && (
                    <g transform={`translate(${-pos.x} ${(-rimY).toFixed(1)})`}>
                      {climbing.map((v) => (
                        <VineRunner key={v.vine.id} placed={v} />
                      ))}
                    </g>
                  )
                }
              />
            ) : (
              <g transform={`scale(${1 / pos.scale}) translate(0 -3)`}>
                <EmptySlot highlight={placingId !== null} />
              </g>
            )}
          </g>
        );
      })}
      {spots.map((spot) => {
        const pos = SPOT_POS[spot];
        return (
          <rect
            key={spot}
            x={pos.x - pos.w / 2}
            y={pos.base - pos.h}
            width={pos.w}
            height={pos.h + 4}
            fill="transparent"
            className="tappable"
            onClick={() => onSpot(spot)}
          />
        );
      })}
    </g>
  );
}

/**
 * The scene is drawn for a 400x866 frame. On shorter screens (Safari with its toolbars) the wall
 * between sill and floor gives up height first, then the top of the room is cropped; on taller ones
 * the wall grows a little and more ceiling shows.
 */
function layoutFor(viewH: number) {
  const dy = Math.max(-100, Math.min(40, viewH - VIEW_H));
  const minY = VIEW_H + dy - viewH;
  const gapTop = 556;
  const gapBottom = FLOOR_Y - 16 + dy;
  const wallMid = (gapTop + gapBottom) / 2;
  const pictureScale = Math.min(1, (gapBottom - gapTop - 10) / 82);
  return { dy, minY, wallMid, pictureScale };
}

export function Scene({ theme, weather, viewH, vines, snip = null, hideCurtains = false, ...rest }: {
  theme: Theme;
  weather: Weather;
  viewH: number;
  vines: VineSpec[];
  snip?: Snip | null;
  /** Dev only: shows the bare window, to judge the vines without the curtains over them. */
  hideCurtains?: boolean;
} & Omit<SpotProps, 'placed'>) {
  const placed = placeVines(vines, rest.garden);
  const spots = { ...rest, placed };
  const { dy, minY, wallMid, pictureScale } = layoutFor(viewH);
  const tint = roomTint(weather, theme);
  const candleLit = isCandleLit(weather);
  const [fx, fy] = CANDLE_FLAME[theme];
  return (
    <svg className="scene" viewBox={`0 ${minY.toFixed(1)} ${VIEW_W} ${viewH.toFixed(1)}`} preserveAspectRatio="xMidYMax slice">
      <defs>
        <clipPath id="window-clip">
          <path d={WINDOW_OPENING} />
        </clipPath>
        <radialGradient id="candle-glow">
          <stop offset="0" stopColor="#ffc97e" stopOpacity="0.72" />
          <stop offset="0.35" stopColor="#ff9f5a" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ff9f5a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g clipPath="url(#window-clip)">
        <Sky weather={weather} />
        <Landscape weather={weather} />
        {weather.sky === 'rain' && <Rain />}
      </g>

      <Wall theme={theme} />
      <WindowFrame />

      {/* vines climb behind the shelf board, like the ropes, and behind the pots on the sill */}
      <Vines placed={placed} snip={snip} />
      <Shelf />
      <WindowRow row="shelf" {...spots} />
      <ShelfTrinket theme={theme} />

      <Sill />
      <WindowRow row="sill" {...spots} />
      <SillCandle theme={theme} />

      {!hideCurtains && <Curtains theme={theme} />}
      <WallDecor theme={theme} cy={wallMid} scale={pictureScale} />
      <g transform={`translate(0 ${(wallMid - 606).toFixed(1)})`}>
        <Sign theme={theme} />
      </g>

      <g transform={`translate(0 ${dy})`}>
        <Floor />
        <CornerPiece theme={theme} />
        <g transform="translate(210 866) scale(1.1) translate(-210 -866)">
          <DogBed part="back" />
          <Dogs />
          <DogBed part="front" />
        </g>
        <Ball />
      </g>

      {/* light: one tint for the whole scene keeps sky and room in the same light */}
      {tint && <rect className="tint" x="0" y="-300" width={VIEW_W} height={VIEW_H + 600} fill={tint.color} opacity={tint.opacity} />}
      <SkyLights weather={weather} />
      {candleLit && (
        <>
          <circle className="glow" cx={fx} cy={fy} r={weather.night ? 250 : 170} fill="url(#candle-glow)" />
          <Flame x={fx} y={fy} />
        </>
      )}
    </svg>
  );
}
