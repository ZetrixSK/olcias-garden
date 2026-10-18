import { memo, useMemo } from 'react';
import { outsideKey, outsideNow, type Outside } from '../weather/moments';
import { WINDOW_SPOTS, type GardenState, type WindowSpot } from '../garden/state';
import { chooseRoutes, type VineSpot } from '../garden/vines';
import { POT_HEIGHT } from '../plants/Pots';
import { plantLook } from '../plants/looks';
import { candleLit as isCandleLit, roomTint, type Theme, type Weather } from '../theme/palettes';
import { Ball, CANDLE_FLAME, CornerPiece, Flame, ROOM_SPARKLES, ShelfTrinket, SillCandle, WallDecor, WallSparkles } from './Decor';
import { DogBed, Dogs } from './Dogs';
import { dogMood, type DogMood } from './dogMood';
import { EmptySlot, GardenPlanter } from './GardenPlanter';
import { FLOOR_Y, SILL_Y, VIEW_H, VIEW_W, WINDOW_OPENING } from './geometry';
import { Frost, LakeLife, Landscape, Rain, SeasonAir, SeasonBranch } from './Outside';
import { Curtains, Floor, Shelf, Sign, Sill, Wall, WindowFrame } from './Room';
import { Sky, SkyLights } from './Sky';
import { moonPhase } from '../weather/moon';
import { occasionShown, seasonShown, type Occasion, type Season } from '../theme/seasons';
import { Bats, LanternLight, ROOM_LANTERN, RoomPumpkins } from './Halloween';
import type { OwnPaper } from './OwnDecor';
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
    const rimY = pos.base - POT_HEIGHT[plantLook(plant, garden.designs).shape] * pos.scale;
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
        const rimY = pos.base - (plant ? POT_HEIGHT[plantLook(plant, garden.designs).shape] * pos.scale : 0);
        const climbing = placed.filter((v) => v.vine.from === spot);
        return (
          <g key={spot} transform={`translate(${pos.x} ${rimY.toFixed(1)}) scale(${pos.scale})`}>
            {plant ? (
              <GardenPlanter
                plant={plant}
                designs={garden.designs}
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

type Lit = { theme: Theme; sky: Weather['sky']; night: boolean; twilight: Weather['twilight'] };
type Calendar = { season: Season; occasion: Occasion };
/** The moon's phase, rounded so the lights aren't redrawn every minute for a change nobody could see. */
const phaseAt = (now: number) => Math.round(moonPhase(now) * 100) / 100;

/** Sky, landscape, wall and window frame: they only change with the theme and the weather. */
const Backdrop = memo(function Backdrop({ theme, sky, night, twilight, season, occasion, paper, outside }: Lit & Calendar & { paper: OwnPaper | null; outside: Outside }) {
  const weather = { sky, night, twilight };
  return (
    <>
      <g clipPath="url(#window-clip)">
        <Sky weather={weather} rainbow={outside.rainbow} aurora={outside.aurora} />
        <Landscape weather={weather} season={season} />
        <SeasonBranch season={season} />
        <LakeLife visitors={outside.visitors} fog={outside.fog} />
        <SeasonAir season={season} weather={weather} />
        {/* outside, so they pass behind the shelf and the plants */}
        {occasion === 'halloween' && night && sky !== 'rain' && <Bats />}
        {sky === 'rain' && <Rain />}
        {season === 'winter' && <Frost />}
      </g>
      <Wall theme={theme} paper={paper} />
      <WindowFrame />
    </>
  );
});

/** Curtains, pictures, sign, floor and the dogs. */
const RoomFront = memo(function RoomFront({ theme, dy, wallMid, pictureScale, hideCurtains, phase, mood, occasion, onBook, photoUrl, onFrame }: {
  theme: Theme; dy: number; wallMid: number; pictureScale: number; hideCurtains: boolean; phase: number; mood: DogMood;
  occasion: Occasion;
  onBook?: () => void;
  photoUrl: string | null;
  onFrame?: () => void;
}) {
  return (
    <>
      {!hideCurtains && <Curtains theme={theme} />}
      <WallDecor theme={theme} cy={wallMid} scale={pictureScale} phase={phase} onBook={onBook} photoUrl={photoUrl} onFrame={onFrame} />
      <g transform={`translate(0 ${(wallMid - 606).toFixed(1)})`}>
        <Sign theme={theme} />
      </g>
      <g transform={`translate(0 ${dy})`}>
        <Floor />
        <CornerPiece theme={theme} />
        <g transform="translate(210 866) scale(1.1) translate(-210 -866)">
          <DogBed part="back" />
          <Dogs mood={mood} />
          <DogBed part="front" />
        </g>
        {occasion === 'halloween' ? (
          <>
            {/* the ball rolls aside for the pumpkins */}
            <g transform="translate(112 18)">
              <Ball />
            </g>
            <RoomPumpkins theme={theme} />
          </>
        ) : (
          <Ball />
        )}
      </g>
    </>
  );
});

/** The light over everything: night or rain tint, moon and stars, candlelight. */
const Lights = memo(function Lights({ theme, sky, night, twilight, phase, occasion, dy, wallMid }: Lit & { phase: number; occasion: Occasion; dy: number; wallMid: number }) {
  const weather = { sky, night, twilight };
  const tint = roomTint(weather, theme);
  const [fx, fy] = CANDLE_FLAME[theme];
  return (
    <>
      {/* one tint for the whole scene keeps sky and room in the same light */}
      {tint && <rect className="tint" x="0" y="-300" width={VIEW_W} height={VIEW_H + 600} fill={tint.color} opacity={tint.opacity} />}
      <SkyLights weather={weather} phase={phase} />
      {theme === 'witchy' && <WallSparkles points={ROOM_SPARKLES} cy={wallMid} night={night} />}
      {occasion === 'halloween' && isCandleLit(weather) && (
        <g transform={`translate(0 ${dy})`}>
          <LanternLight {...ROOM_LANTERN} />
        </g>
      )}
      {isCandleLit(weather) && (
        <>
          <circle className="glow" cx={fx} cy={fy} r={night ? 250 : 170} fill="url(#candle-glow)" />
          <Flame x={fx} y={fy} />
        </>
      )}
    </>
  );
});

const ShelfBoard = memo(Shelf);
const SillBoard = memo(Sill);
const Trinket = memo(ShelfTrinket);
const Candle = memo(SillCandle);

export function Scene({ theme, weather, viewH, vines, snip = null, hideCurtains = false, onBook, paper = null, photoUrl = null, onFrame, rainbow = false, ...rest }: {
  theme: Theme;
  weather: Weather;
  viewH: number;
  vines: VineSpec[];
  snip?: Snip | null;
  /** Dev only: shows the bare window, to judge the vines without the curtains over them. */
  hideCurtains?: boolean;
  /** Tapping the pressed pansy on the wall opens her book. */
  onBook?: () => void;
  /** Her own wallpaper, if she has one. */
  paper?: OwnPaper | null;
  /** A rainbow over the lake, for a while after rain. */
  rainbow?: boolean;
  /** Her photo in the frame on the wall; tapping the frame calls onFrame. */
  photoUrl?: string | null;
  onFrame?: () => void;
} & Omit<SpotProps, 'placed'>) {
  const placed = placeVines(vines, rest.garden);
  const spots = { ...rest, placed };
  const { dy, minY, wallMid, pictureScale } = layoutFor(viewH);
  const cal: Calendar = { season: seasonShown(rest.now), occasion: occasionShown(rest.now) };
  const key = outsideKey(rest.now, cal.season, weather.night, weather.sky, rainbow);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the key holds everything that matters
  const outside = useMemo(() => outsideNow(rest.now, cal.season, weather.night, weather.sky, rainbow), [key]);
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

      <Backdrop
        theme={theme}
        sky={weather.sky}
        night={weather.night}
        twilight={weather.twilight ?? null}
        season={cal.season}
        occasion={cal.occasion}
        paper={paper}
        outside={outside}
      />

      {/* vines climb behind the shelf board, like the ropes, and behind the pots on the sill */}
      <Vines placed={placed} snip={snip} />
      <ShelfBoard />
      <WindowRow row="shelf" {...spots} />
      <Trinket theme={theme} />

      <SillBoard />
      <WindowRow row="sill" {...spots} />
      <Candle theme={theme} />

      <RoomFront
        theme={theme}
        dy={dy}
        wallMid={wallMid}
        pictureScale={pictureScale}
        hideCurtains={hideCurtains}
        phase={phaseAt(rest.now)}
        mood={dogMood(weather, new Date(rest.now).getHours())}
        occasion={cal.occasion}
        onBook={onBook}
        photoUrl={photoUrl}
        onFrame={onFrame}
      />
      <Lights theme={theme} sky={weather.sky} night={weather.night} twilight={weather.twilight ?? null} phase={phaseAt(rest.now)} occasion={cal.occasion} dy={dy} wallMid={wallMid} />
    </svg>
  );
}
