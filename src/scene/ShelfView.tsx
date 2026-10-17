import { isSoilWet, stageAt } from '../garden/growth';
import { SLOT_IDS, type GardenState, type Plant, type SlotId } from '../garden/state';
import { PlantArt } from '../plants/PlantArt';
import { POT_HEIGHT, Potted } from '../plants/Pots';
import { candleLit as isCandleLit, roomTint, type Theme, type Weather } from '../theme/palettes';
import { CANDLE_FLAME, Flame, SillCandle } from './Decor';
import { PeekingDogs } from './Dogs';
import { fv, sv } from './geometry';
import { WallMotifs } from './Room';
import { Landscape, Rain } from './Outside';
import { Sky, SkyLights } from './Sky';

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

function Planter({ plant, now, selected, moving, watering }: {
  plant: Plant; now: number; selected: boolean; moving: boolean; watering: boolean;
}) {
  const stage = stageAt(plant.species, plant, now);
  const wet = isSoilWet(plant, now);
  // remount the inner group on each watering so the wobble replays
  const wobbleKey = plant.waterings.length;
  return (
    <g className={moving ? 'moving' : undefined}>
      <Potted kind={plant.pot} wet={wet}>
        <g className="sway" style={{ animationDuration: `${7 + (plant.id.charCodeAt(0) % 5)}s` }}>
          <g key={wobbleKey} className={plant.waterings.length ? 'wobble' : undefined}>
            <PlantArt species={plant.species} stage={stage} />
          </g>
        </g>
      </Potted>
      {selected && <ellipse cx="0" cy={POT_HEIGHT[plant.pot] + 4} rx="40" ry="6" fill="none" className="ink selected-ring" strokeDasharray="4 5" />}
      {watering && <WateringCan />}
    </g>
  );
}

/** A little can tips over the pot and pours; shown for a moment after tapping Water. */
function WateringCan() {
  return (
    <g className="pour" transform="translate(0 -46) scale(1.35)">
      <g className="can">
        <path className="ink" fill="#8fa596" d="M14,-74 L16,-52 C16,-49 40,-49 40,-52 L42,-74 Z" />
        <path className="ink" fill="#8fa596" d="M16,-62 L-6,-78 L-8,-75 L14,-58 Z" />
        <path className="ink" fill="#a8bcae" d="M-10,-82 L-3,-76 L-7,-71 L-13,-77 Z" />
        <path className="ink" fill="none" strokeWidth="2.2" d="M42,-70 C54,-72 54,-56 42,-56" />
        <path d="M17,-66 L41,-66" stroke="#e69bb2" strokeWidth="2.4" />
      </g>
      {[-14, -8, -2, 4].map((dx, i) => (
        <path
          key={dx}
          className="drop-fall"
          style={{ animationDelay: `${0.35 + i * 0.12}s` }}
          d={`M${dx},-64 C${dx + 1.4},-61 ${dx + 1.6},-59.4 ${dx},-58 C${dx - 1.6},-59.4 ${dx - 1.4},-61 ${dx},-64 Z`}
          fill="#bcd8e8"
          stroke="#3d5568"
          strokeWidth="0.6"
        />
      ))}
    </g>
  );
}

function EmptySlot({ hang, highlight }: { hang?: boolean; highlight: boolean }) {
  return (
    <g className={highlight ? 'slot-target' : 'slot-empty'}>
      <ellipse cx="0" cy={hang ? 30 : 0} rx="26" ry="5" fill="none" className="ink" strokeDasharray="3 5" />
      <path d={`M0,${hang ? 24 : -6} L0,${hang ? 12 : -18} M-6,${hang ? 18 : -12} L6,${hang ? 18 : -12}`} className="ink" fill="none" strokeWidth="2" />
    </g>
  );
}

export function ShelfView({ theme, weather, viewH, garden, now, selectedId, movingId, wateringId, onSlot }: {
  theme: Theme;
  weather: Weather;
  viewH: number;
  garden: GardenState;
  now: number;
  selectedId: string | null;
  movingId: string | null;
  wateringId: string | null;
  onSlot: (slot: SlotId) => void;
}) {
  // short screens (Safari with its bars) see the whole wall slightly smaller, with wallpaper at the sides
  const h = Math.max(viewH, CORE_H);
  const minY = (CORE_H - h) / 2;
  const bottom = minY + h;
  const tint = roomTint(weather);
  const candleLit = isCandleLit(weather);
  const [fx, fy] = CANDLE_FLAME[theme];
  const candleShift = { x: 200 - 335, y: 277 - 517 };
  const bySlot = new Map(garden.plants.map((p) => [p.slot, p]));

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
          <Sky weather={weather} />
          <Landscape weather={weather} />
        </g>
        {weather.sky === 'rain' && <Rain box={WINDOW_BOX} density={0.7} />}
      </g>

      <path fillRule="evenodd" style={fv('wall')} d={`M-400,-400 H800 V1200 H-400 Z ${OUTER}`} />
      <path fillRule="evenodd" fill={`url(#motif-${theme})`} d={`M-400,-400 H800 V1200 H-400 Z ${OUTER}`} />
      <ShelfWindow />

      <Board x0={10} x1={390} y={446} />
      <Board x0={10} x1={390} y={618} />

      <g transform={`translate(${candleShift.x} ${candleShift.y})`}>
        <SillCandle theme={theme} />
      </g>

      {SLOT_IDS.map((slot) => {
        const pos = SLOT_POS[slot];
        const plant = bySlot.get(slot);
        const potH = plant ? POT_HEIGHT[plant.pot] * PLANT_SCALE : 30;
        const rimY = pos.y - potH;
        return (
          <g key={slot}>
            {pos.hang && <Hanger x={pos.x} rimY={plant ? rimY : pos.y - 26} />}
            <g transform={`translate(${pos.x} ${plant ? rimY : pos.y}) scale(${plant ? PLANT_SCALE : 1})`}>
              {plant ? (
                <Planter
                  plant={plant}
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

      <PeekingDogs bottom={bottom} />

      {tint && <rect className="tint" x="-400" y="-400" width="1200" height="1600" fill={tint.color} opacity={tint.opacity} />}
      <g clipPath="url(#shelf-window-clip)">
        <g transform={SKY_FIT}>
          <SkyLights weather={weather} />
        </g>
      </g>
      {candleLit && (
        <>
          <circle className="glow" cx={fx + candleShift.x} cy={fy + candleShift.y} r={weather.night ? 240 : 160} fill="url(#shelf-candle-glow)" />
          <Flame x={fx + candleShift.x} y={fy + candleShift.y} />
        </>
      )}
    </svg>
  );
}
