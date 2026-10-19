import { SLOT_IDS, type GardenState, type SlotId } from '../garden/state';
import { POT_HEIGHT } from '../plants/Pots';
import { plantLook } from '../plants/looks';
import { candleLit as isCandleLit, roomTint, type Theme, type Weather } from '../theme/palettes';
import { CandleLight, candleFlame, SHELF_SPARKLES, SillCandle, WallSparkles } from './Decor';
import type { CandleLook } from '../garden/candle';
import { PeekingDogs } from './Dogs';
import { dogMood } from './dogMood';
import { EmptySlot, GardenPlanter } from './GardenPlanter';
import { fv, sv } from './geometry';
import { Sign, WallMotifs } from './Room';
import { Bunting, SillEnds } from './ShelfDecor';
import { LakeLife, Landscape, Rain, SeasonAir, SeasonBranch } from './Outside';
import { outsideKey, outsideNow } from '../weather/moments';
import { useMemo } from 'react';
import { Sky, SkyLights } from './Sky';
import { moonPhase } from '../weather/moon';
import { occasionShown, seasonShown } from '../theme/seasons';
import { Bats, JackOLantern, LanternLight } from './Halloween';
import { OwnWallpaper, ShelfDrawing, wallFill, type OwnPaper } from './OwnDecor';
import { HangingBat } from './HangingBat';

/** The shelf wall is drawn in a 400 x 760 frame; taller screens show more wall above and more dog below. */
const CORE_H = 760;
const PLANT_SCALE = 0.72;

const OPENING = 'M112,270 L112,128 A88,88 0 0 1 288,128 L288,270 Z';
const OUTER = 'M100,280 L100,128 A100,100 0 0 1 300,128 L300,280 Z';
/** Maps the room view's sky (drawn for its big window) into this smaller window. */
const SKY_FIT = 'translate(90 -21.5) scale(0.55)';
const WINDOW_BOX = { x: 112, y: 40, w: 176, h: 230 };

type SlotPos = { x: number; y: number; hang?: boolean };
export const SLOT_POS: Record<SlotId, SlotPos> = {
  'hang-l': { x: 50, y: 252, hang: true },
  'sill-l': { x: 152, y: 277 },
  'sill-r': { x: 248, y: 277 },
  'hang-r': { x: 350, y: 252, hang: true },
  'row2-a': { x: 56, y: 446 },
  'row2-b': { x: 152, y: 446 },
  'row2-c': { x: 248, y: 446 },
  'row2-d': { x: 344, y: 446 },
  'row3-a': { x: 56, y: 618 },
  'row3-b': { x: 152, y: 618 },
  'row3-c': { x: 248, y: 618 },
  'row3-d': { x: 344, y: 618 },
};

function Board({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  const brackets = x1 - x0 > 200 ? [x0 + 26, (x0 + x1) / 2, x1 - 26] : [x0 + 18, x1 - 18];
  return (
    <g>
      <path d={`M${x0 + 4},${y + 12} L${x1 - 4},${y + 12} L${x1 - 10},${y + 20} L${x0 + 10},${y + 20} Z`} style={fv('wall-shade')} />
      {brackets.map((bx) => (
        <path key={bx} className="ink" style={fv('shelf-shade')} d={`M${bx - 3},${y + 10} L${bx + 3},${y + 10} L${bx + 3},${y + 34} C${bx + 1},${y + 26} ${bx - 1},${y + 20} ${bx - 3},${y + 18} Z`} />
      ))}
      <path className="ink" style={fv('shelf')} d={`M${x0},${y - 1} L${x1},${y - 1} L${x1},${y + 5} L${x0},${y + 5} Z`} />
      <path className="ink" style={fv('shelf-shade')} d={`M${x0},${y + 5} L${x1},${y + 5} L${x1},${y + 11} L${x0},${y + 11} Z`} />
      <path d={`M${x0 + 8},${y + 2} L${x1 - 30},${y + 2}`} style={sv('sill-hi')} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </g>
  );
}

function ShelfWindow() {
  return (
    <g>
      <path d={OPENING} fill="none" style={sv('frame-shade')} strokeWidth="8" />
      <path fillRule="evenodd" className="ink" style={fv('frame')} d={`${OUTER} ${OPENING}`} />
      <path d="M105,276 L105,128 A95,95 0 0 1 150,48" fill="none" style={sv('frame-hi')} strokeWidth="2.2" strokeLinecap="round" />
      <path className="ink" style={fv('frame')} d="M196.5,38 L203.5,38 L203.5,270 L196.5,270 Z" />
      <path className="ink" style={fv('frame')} d="M112,124 L288,124 L288,131 L112,131 Z" />
      <path className="ink" style={fv('frame')} d="M112,196 L288,196 L288,202 L112,202 Z" />
      <path d="M126,262 L160,206 L165,206 L131,262 Z" fill="#fff" opacity="0.06" />
      {/* the sill */}
      <path className="ink" style={fv('sill-hi')} d="M92,270 L308,270 L314,280 L86,280 Z" />
      <path className="ink" style={fv('sill')} d="M86,280 L314,280 L314,292 L86,292 Z" />
    </g>
  );
}

/** A macramé hanger: three cords gathered at a ring, hanging from the ceiling. */
function Hanger({ x, rimY }: { x: number; rimY: number }) {
  // the ring sits above the tallest plants, so the cords fall behind the leaves
  const ring = rimY - 132;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={`M${x},-300 L${x},${ring}`} style={sv('ink')} strokeWidth="3.4" />
      <path d={`M${x},-300 L${x},${ring}`} style={sv('rope')} strokeWidth="2" />
      {[-22, 0, 22].map((dx) => (
        <g key={dx}>
          <path d={`M${x},${ring} Q${x + dx * 0.6},${(ring + rimY) / 2} ${x + dx},${rimY + 4}`} style={sv('ink')} strokeWidth="2.6" />
          <path d={`M${x},${ring} Q${x + dx * 0.6},${(ring + rimY) / 2} ${x + dx},${rimY + 4}`} style={sv('rope')} strokeWidth="1.4" />
        </g>
      ))}
      <circle cx={x} cy={ring} r="4" className="ink" style={fv('rope')} />
    </g>
  );
}

export function ShelfView({ theme, weather, viewH, garden, now, selectedId, movingId, wateringId, onSlot, paper = null, pictures = {}, drawingId = null, rainbow = false, candle = null, candleOn, onCandle }: {
  theme: Theme;
  weather: Weather;
  viewH: number;
  garden: GardenState;
  now: number;
  selectedId: string | null;
  movingId: string | null;
  wateringId: string | null;
  onSlot: (slot: SlotId) => void;
  paper?: OwnPaper | null;
  /** Her pictures by name, for the drawings on the shelves. */
  pictures?: Record<string, string>;
  /** The drawing whose card is open. */
  drawingId?: string | null;
  rainbow?: boolean;
  /** Her own candle, or null for the room's own. */
  candle?: CandleLook | null;
  candleOn: boolean;
  onCandle?: () => void;
}) {
  // short screens (Safari with its bars) see the whole wall slightly smaller, with wallpaper at the sides
  const h = Math.max(viewH, CORE_H);
  const minY = (CORE_H - h) / 2;
  const bottom = minY + h;
  const tint = roomTint(weather, theme);
  const candleLit = isCandleLit(weather);
  const [fx, fy] = candleFlame(theme, candle);
  const candleShift = { x: 200 - 335, y: 277 - 517 };
  const bySlot = new Map(garden.plants.map((p) => [p.slot, p]));
  const season = seasonShown(now);
  const occasion = occasionShown(now);
  const key = outsideKey(now, season, weather.night, weather.sky, rainbow);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the key holds everything that matters
  const outside = useMemo(() => outsideNow(now, season, weather.night, weather.sky, rainbow), [key]);
  const lantern = { x: 200, y: bottom - 46, s: 0.95 };

  return (
    <svg className="scene" viewBox={`0 ${minY.toFixed(1)} 400 ${h.toFixed(1)}`} preserveAspectRatio="xMidYMid meet">
      <WallMotifs />
      <defs>
        <clipPath id="shelf-window-clip">
          <path d={OPENING} />
        </clipPath>
        <radialGradient id="shelf-candle-glow">
          <stop offset="0" stopColor="#ffc97e" stopOpacity="0.72" />
          <stop offset="0.35" stopColor="#ff9f5a" stopOpacity="0.2" />
          <stop offset="1" stopColor="#ff9f5a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g clipPath="url(#shelf-window-clip)">
        <g transform={SKY_FIT}>
          <Sky weather={weather} rainbow={outside.rainbow} aurora={outside.aurora} />
          <Landscape weather={weather} season={season} />
          <SeasonBranch season={season} />
          <LakeLife visitors={outside.visitors} fog={outside.fog} />
          <SeasonAir season={season} weather={weather} />
          {occasion === 'halloween' && weather.night && weather.sky !== 'rain' && <Bats />}
        </g>
        {weather.sky === 'rain' && <Rain box={WINDOW_BOX} density={0.7} />}
      </g>

      <path fillRule="evenodd" style={fv('wall')} d={`M-400,-400 H800 V1200 H-400 Z ${OUTER}`} />
      {paper && <OwnWallpaper paper={paper} />}
      <path fillRule="evenodd" fill={wallFill(theme, paper)} d={`M-400,-400 H800 V1200 H-400 Z ${OUTER}`} />
      <ShelfWindow />
      <Bunting theme={theme} occasion={occasion} />
      {(theme === 'witchy' || occasion === 'halloween') && <HangingBat x={317} y={-13} s={1.35} awake={weather.night} />}
      <SillEnds theme={theme} />

      <Board x0={10} x1={390} y={446} />
      <Board x0={10} x1={390} y={618} />

      <g
        className="tappable"
        role="button"
        aria-label={candleOn ? 'Blow out the candle' : 'Light the candle'}
        data-sound={candleOn ? 'blow' : 'light'}
        transform={`translate(${candleShift.x} ${candleShift.y})`}
        onClick={onCandle}
      >
        <SillCandle theme={theme} look={candle} />
        <rect x="314" y="456" width="46" height="64" fill="transparent" />
      </g>

      {SLOT_IDS.map((slot) => {
        const pos = SLOT_POS[slot];
        const plant = bySlot.get(slot);
        const drawing = plant ? undefined : garden.decor.drawings.find((d) => d.slot === slot);
        const potH = plant ? POT_HEIGHT[plantLook(plant, garden.designs).shape] * PLANT_SCALE : 30;
        const rimY = pos.y - potH;
        return (
          <g key={slot}>
            {pos.hang && <Hanger x={pos.x} rimY={plant ? rimY : pos.y - 26} />}
            <g transform={`translate(${pos.x} ${plant ? rimY : pos.y}) scale(${plant ? PLANT_SCALE : 1})`}>
              {drawing ? (
                <ShelfDrawing
                  url={pictures[drawing.img]}
                  w={drawing.w}
                  h={drawing.h}
                  selected={drawing.id === drawingId}
                  moving={drawing.id === movingId}
                />
              ) : plant ? (
                <GardenPlanter
                  plant={plant}
                  designs={garden.designs}
                  ribbon={plant.display !== null}
                  now={now}
                  selected={plant.id === selectedId}
                  moving={plant.id === movingId}
                  watering={plant.id === wateringId}
                />
              ) : (
                <EmptySlot hang={pos.hang} highlight={movingId !== null} />
              )}
            </g>
            <rect
              x={pos.x - 44}
              y={pos.y - 140}
              width="88"
              height={pos.hang ? 150 : 146}
              fill="transparent"
              className="tappable"
              onClick={() => onSlot(slot)}
            />
          </g>
        );
      })}

      {/* the name, hung from the underside of the bottom shelf, between the dogs */}
      <g transform={`translate(200 ${Math.min(695, bottom - 88).toFixed(1)}) scale(0.85) translate(-200 -606)`}>
        <Sign theme={theme} />
      </g>

      <PeekingDogs bottom={bottom} mood={dogMood(weather, new Date(now).getHours())} />
      {/* at Halloween a pumpkin sits on the sofa back between the dogs */}
      {occasion === 'halloween' && <JackOLantern {...lantern} />}

      {tint && <rect className="tint" x="-400" y="-400" width="1200" height="1600" fill={tint.color} opacity={tint.opacity} />}
      <g clipPath="url(#shelf-window-clip)">
        <g transform={SKY_FIT}>
          <SkyLights weather={weather} phase={Math.round(moonPhase(now) * 100) / 100} />
        </g>
      </g>
      {theme === 'witchy' && <WallSparkles points={SHELF_SPARKLES} night={weather.night} />}
      {occasion === 'halloween' && candleLit && <LanternLight {...lantern} glow="shelf-candle-glow" />}
      <CandleLight x={fx + candleShift.x} y={fy + candleShift.y} lit={candleOn} glow="shelf-candle-glow" r={weather.night ? 240 : 160} />
    </svg>
  );
}
