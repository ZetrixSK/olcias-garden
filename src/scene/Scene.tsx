import { useState, type ReactNode } from 'react';
import { candleLit as isCandleLit, roomTint, type Theme, type Weather } from '../theme/palettes';
import { PansyPlant } from '../plants/Pansy';
import { Potted, type PotKind } from '../plants/Pots';
import { RosePlant } from '../plants/Rose';
import { TulipPlant } from '../plants/Tulip';
import { Ball, CANDLE_FLAME, CornerPiece, Flame, ShelfTrinket, SillCandle, WallDecor } from './Decor';
import { DogBed, Dogs } from './Dogs';
import { FLOOR_Y, VIEW_H, VIEW_W, WINDOW_OPENING } from './geometry';
import { Landscape, Rain } from './Outside';
import { Curtains, Floor, Shelf, Sign, Sill, Wall, WindowFrame } from './Room';
import { Sky, SkyLights } from './Sky';

/** A potted plant that sways on its own and wobbles when tapped. */
function Planter({ id, x, y, pot, sway, children }: {
  id: string; x: number; y: number; pot: PotKind; sway: number; children: ReactNode;
}) {
  const [tap, setTap] = useState(0);
  return (
    <g transform={`translate(${x} ${y})`} className="tappable" onClick={() => setTap((t) => t + 1)}>
      <Potted kind={pot}>
        <g className="sway" style={{ animationDuration: `${sway}s`, animationDelay: `${-sway * 0.37}s` }}>
          <g key={`${id}-${tap}`} className={tap ? 'wobble' : undefined}>
            {children}
          </g>
        </g>
      </Potted>
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

export function Scene({ theme, weather, viewH }: { theme: Theme; weather: Weather; viewH: number }) {
  const { dy, minY, wallMid, pictureScale } = layoutFor(viewH);
  const tint = roomTint(weather);
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

      <Shelf />
      <Planter id="seed" x={118} y={298} pot="tiny-clay" sway={9}>
        <PansyPlant stage="seed" />
      </Planter>
      <Planter id="seedling" x={176} y={298} pot="tiny-speckle" sway={6}>
        <PansyPlant stage="seedling" />
      </Planter>
      <Planter id="bud" x={238} y={298} pot="tiny-pink" sway={7.5}>
        <PansyPlant stage="bud" />
      </Planter>
      <ShelfTrinket theme={theme} />

      <Sill />
      <Planter id="tulip" x={92} y={468} pot="slim" sway={8.5}>
        <TulipPlant />
      </Planter>
      <Planter id="rose" x={274} y={473} pot="round" sway={10}>
        <RosePlant />
      </Planter>
      <Planter id="pansy" x={190} y={476} pot="wide" sway={7}>
        <PansyPlant stage="bloom" />
      </Planter>
      <SillCandle theme={theme} />

      <Curtains theme={theme} />
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
