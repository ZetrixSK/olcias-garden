import { memo, useCallback, useMemo, useState } from 'react';
import { outsideKey, outsideNow, withMoments, type Moment, type Outside } from '../weather/moments';
import { WINDOW_SPOTS, type GardenState, type WindowSpot } from '../garden/state';
import { chooseRoutes, type VineSpot } from '../garden/vines';
import { POT_HEIGHT } from '../plants/Pots';
import { plantLook } from '../plants/looks';
import { candleLit as isCandleLit, roomTint, type Theme, type Weather } from '../theme/palettes';
import { Ball, CandleLight, candleFlame, CornerPiece, ROOM_SPARKLES, ShelfTrinket, SillCandle, WallDecor, WallSparkles, WarmLightDefs } from './Decor';
import type { CandleLook } from '../garden/candle';
import { DogBed, Dogs } from './Dogs';
import { dogMood, type DogMood } from './dogMood';
import { EmptySlot, GardenPlanter, GlowPlanter } from './GardenPlanter';
import { FLOOR_Y, SILL_Y, VIEW_H, VIEW_W, WINDOW_OPENING } from './geometry';
import { Frost, LakeLife, Landscape, Rain, SeasonAir, SeasonBranch } from './Outside';
import { Floor, Shelf, Sign, Sill, Wall, WindowFrame } from './Room';
import { Sky, SkyLights } from './Sky';
import { moonPhase } from '../weather/moon';
import { occasionShown, seasonShown, type Occasion, type Season } from '../theme/seasons';
import { Bats, LanternLight, ROOM_LANTERN, RoomPumpkins } from './Halloween';
import type { OwnPaper } from './OwnDecor';
import { HangingBat } from './HangingBat';
import { CurtainStage } from './CurtainStage';
import { leanFor, runnerStart, VINE_PHASE, VineRunner, Vines, type PlacedVine, type Snip, type VineSpec } from './Vines';
import { useGrowingVines } from './useGrowingVines';
import { FloorParcels } from '../ui/Bouquets';
import { Letterbox } from './Letterbox';
import { VisitorArt } from './VisitorArt';
import { Garland, Milton, SpeechBubble } from './MarketArt';
import type { VisitorId } from '../garden/visitors';

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

/** The flowers that glow, at their plants' places in the window, for drawing above the night's tint. */
function WindowGlow({ garden, now }: { garden: GardenState; now: number }) {
  return (
    <g pointerEvents="none">
      {WINDOW_SPOTS.map((spot) => {
        const plant = garden.plants.find((p) => p.display === spot);
        if (!plant) return null;
        const pos = SPOT_POS[spot];
        const rimY = pos.base - POT_HEIGHT[plantLook(plant, garden.designs).shape] * pos.scale;
        return (
          <g key={spot} transform={`translate(${pos.x} ${rimY.toFixed(1)}) scale(${pos.scale})`}>
            <GlowPlanter plant={plant} now={now} />
          </g>
        );
      })}
    </g>
  );
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
const Backdrop = memo(function Backdrop({ theme, sky, night, twilight, season, occasion, paper, outside, flyer }: Lit & Calendar & { paper: OwnPaper | null; outside: Outside; flyer: VisitorId | null }) {
  const weather = { sky, night, twilight };
  return (
    <>
      <g clipPath="url(#window-clip)">
        <Sky weather={weather} rainbow={outside.rainbow} aurora={outside.aurora} />
        <Landscape weather={weather} season={season} />
        <SeasonBranch season={season} />
        <LakeLife visitors={outside.visitors} fog={outside.fog} />
        <SeasonAir season={season} weather={weather} />
        {/* a visitor who flies (the bumblebee, the ghost) waits by the window while they're at the door */}
        {flyer && (
          <g className="window-flyer" transform="translate(150 168) scale(0.46)">
            <VisitorArt id={flyer} />
          </g>
        )}
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
const RoomFront = memo(function RoomFront({ theme, dy, wallMid, pictureScale, hideCurtains, phase, mood, occasion, onBook, photoUrl, onFrame, parcels, onParcels, mailNews, onPost, name, onSign, curtainsClosed, onCurtains, onCurtainsOpen, milton, miltonSays, onMilton }: {
  /** Milton, in the dogs' bed, if he has come; what he's saying, if she just tapped him. */
  milton: boolean;
  miltonSays: string | null;
  onMilton?: () => void;
  curtainsClosed: boolean;
  /** Tapping the curtains draws them or ties them back (only in her own garden). */
  onCurtains?: () => void;
  onCurtainsOpen: () => void;
  /** Her name for the garden, on the sign; tapping the sign calls onSign (only in her own garden). */
  name: string | null;
  onSign?: () => void;
  theme: Theme; dy: number; wallMid: number; pictureScale: number; hideCurtains: boolean; phase: number; mood: DogMood;
  occasion: Occasion;
  onBook?: () => void;
  photoUrl: string | null;
  onFrame?: () => void;
  parcels: number;
  onParcels?: () => void;
  /** Whether a bouquet came since she last looked in the post box (the letterbox's flag is up). */
  mailNews: boolean;
  /** Tapping the letterbox; without it there's no letterbox (the post isn't set up). */
  onPost?: () => void;
}) {
  return (
    <>
      <WallDecor theme={theme} cy={wallMid} scale={pictureScale} phase={phase} onBook={onBook} photoUrl={photoUrl} onFrame={onFrame} roomForPost={!!onPost} />
      {/* her letterbox, on the wall between the sign and the photo frame */}
      {onPost && (
        <g transform={`translate(283 ${(wallMid + 2).toFixed(1)}) scale(${(pictureScale * 1.15).toFixed(3)})`}>
          <Letterbox theme={theme} news={mailNews} onOpen={onPost} />
        </g>
      )}
      {/* a touch left of centre, to leave the letterbox room beside it */}
      <g transform={`translate(${onPost ? -12 : 0} ${(wallMid - 606).toFixed(1)})`}>
        <Sign theme={theme} name={name} onTap={onSign} />
      </g>
      {/* the curtains hang in front of the pictures on the wall; only the cloth above them is tapped */}
      {!hideCurtains && <CurtainStage theme={theme} closed={curtainsClosed} onToggle={onCurtains} onOpen={onCurtainsOpen} />}
      {/* the witchy room's bat, asleep on the curtain rod by day; it visits the cozy room for Halloween */}
      {(theme === 'witchy' || occasion === 'halloween') && <HangingBat x={298} y={36} s={1.55} awake={mood === 'asleep'} />}
      <g transform={`translate(0 ${dy})`}>
        <Floor />
        <CornerPiece theme={theme} />
        <g transform="translate(210 866) scale(1.1) translate(-210 -866)">
          <DogBed part="back" />
          <Dogs mood={mood} />
          <DogBed part="front" />
          {/* Milton, in his own basket on the edge of the bed, between the dogs; they keep him company */}
          {milton && (
            <g transform="translate(236 846) scale(1.05)" className="tappable" role="button" aria-label="Milton" onClick={onMilton}>
              <Milton talking={miltonSays !== null} />
              <rect x="-28" y="-50" width="56" height="54" fill="transparent" />
            </g>
          )}
          {milton && miltonSays && (
            <SpeechBubble x={236} y={798} text={miltonSays} />
          )}
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
        {/* bouquets that came with no room on the shelves wait in a box, in front of the dog bed */}
        <FloorParcels count={parcels} onOpen={onParcels ?? (() => {})} />
      </g>
    </>
  );
});

/** The light over everything: night or rain tint, moon and stars, candlelight. */
const Lights = memo(function Lights({ theme, sky, night, twilight, phase, occasion, dy, wallMid, fx, fy, candleOn, shower, veiled }: Lit & {
  shower: boolean;
  /** The curtains are drawn (or moving): the sky behind them is hidden, the candle only glimmers through. */
  veiled: boolean;
  phase: number;
  occasion: Occasion;
  dy: number;
  wallMid: number;
  fx: number;
  fy: number;
  candleOn: boolean;
}) {
  const weather = { sky, night, twilight };
  const tint = roomTint(weather, theme);
  return (
    <>
      {/* one tint for the whole scene keeps sky and room in the same light */}
      {tint && <rect className="tint" x="0" y="-300" width={VIEW_W} height={VIEW_H + 600} fill={tint.color} opacity={tint.opacity} />}
      <g mask={veiled ? 'url(#curtain-cover)' : undefined}>
        <SkyLights weather={weather} phase={phase} shower={shower} />
      </g>
      {theme === 'witchy' && <WallSparkles points={ROOM_SPARKLES} cy={wallMid} night={night} />}
      {occasion === 'halloween' && isCandleLit(weather) && (
        <g transform={`translate(0 ${dy})`}>
          <LanternLight {...ROOM_LANTERN} />
        </g>
      )}
      <g mask={veiled ? 'url(#curtain-cover-soft)' : undefined}>
        <CandleLight x={fx} y={fy} lit={candleOn} glow="candle-glow" r={night ? 250 : 170} />
      </g>
    </>
  );
});

const ShelfBoard = memo(Shelf);
const SillBoard = memo(Sill);
const Trinket = memo(ShelfTrinket);
const Candle = memo(SillCandle);

export function Scene({ theme, weather, viewH, vines, still = false, moments = [], onParcels, onPost, snip = null, hideCurtains = false, onBook, paper = null, photoUrl = null, onFrame, onSign, onCurtains, rainbow = false, candle = null, candleOn, onCandle, flyer = null, miltonSays = null, onMilton, ...rest }: {
  /** What Milton is saying, for a moment after she taps him. */
  miltonSays?: string | null;
  onMilton?: () => void;
  /** A flying visitor waiting at the door, seen outside the window meanwhile. */
  flyer?: VisitorId | null;
  theme: Theme;
  weather: Weather;
  viewH: number;
  vines: VineSpec[];
  /** During a replay vines are drawn as the replay has them, without growing in on their own. */
  still?: boolean;
  /** Moments sent from the admin page that are showing now. */
  moments?: readonly Moment[];
  /** Tapping the parcel box on the floor. */
  onParcels?: () => void;
  /** Tapping the letterbox on the wall; without it, no letterbox. */
  onPost?: () => void;
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
  /** Tapping the sign, to name the garden; without it the sign is only to look at (someone else's garden). */
  onSign?: () => void;
  /** Tapping the curtains, to draw them or tie them back; without it they're only to look at. */
  onCurtains?: () => void;
  /** Her own candle, or null for the room's own. */
  candle?: CandleLook | null;
  candleOn: boolean;
  /** Tapping the candle lights it or blows it out. */
  onCandle?: () => void;
} & Omit<SpotProps, 'placed'>) {
  const placed = placeVines(useGrowingVines(vines, still), rest.garden);
  const spots = { ...rest, placed };
  const { dy, minY, wallMid, pictureScale } = layoutFor(viewH);
  const cal: Calendar = { season: seasonShown(rest.now), occasion: occasionShown(rest.now) };
  const key = `${outsideKey(rest.now, cal.season, weather.night, weather.sky, rainbow)}|${moments.join()}`;
  const outside = useMemo(
    () => withMoments(outsideNow(rest.now, cal.season, weather.night, weather.sky, rainbow), moments, cal.season, weather.night, weather.sky),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the key holds everything that matters
    [key],
  );
  const curtainsClosed = rest.garden.settings.curtainsClosed;
  const [veiled, setVeiled] = useState(curtainsClosed);
  if (curtainsClosed && !veiled) setVeiled(true);
  const onCurtainsOpen = useCallback(() => setVeiled(false), []);

  return (
    <svg className="scene" viewBox={`0 ${minY.toFixed(1)} ${VIEW_W} ${viewH.toFixed(1)}`} preserveAspectRatio="xMidYMax slice">
      <defs>
        <clipPath id="window-clip">
          <path d={WINDOW_OPENING} />
        </clipPath>
        <WarmLightDefs id="candle-glow" />
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
        flyer={flyer}
      />

      {/* vines climb behind the shelf board, like the ropes, and behind the pots on the sill */}
      <Vines placed={placed} snip={snip} />
      {/* her charms, on a string across the window */}
      <Garland charms={rest.garden.market.garland} />
      <ShelfBoard />
      <WindowRow row="shelf" {...spots} />
      <Trinket theme={theme} />

      <SillBoard />
      <WindowRow row="sill" {...spots} />
      <g
        className="tappable"
        role="button"
        aria-label={candleOn ? 'Blow out the candle' : 'Light the candle'}
        data-sound={candleOn ? 'blow' : 'light'}
        onClick={onCandle}
      >
        <Candle theme={theme} look={candle} />
        <rect x="314" y="456" width="46" height="64" fill="transparent" />
      </g>

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
       parcels={rest.garden.parcels.length} onParcels={onParcels} mailNews={rest.garden.post.unread > 0} onPost={onPost}
        name={rest.garden.settings.gardenName}
        onSign={onSign}
        curtainsClosed={curtainsClosed}
        onCurtains={onCurtains}
        onCurtainsOpen={onCurtainsOpen}
        milton={rest.garden.market.milton}
        miltonSays={miltonSays}
        onMilton={onMilton}
      />
      <Lights theme={theme} sky={weather.sky} night={weather.night} twilight={weather.twilight ?? null} phase={phaseAt(rest.now)} occasion={cal.occasion} dy={dy} wallMid={wallMid} fx={candleFlame(theme, candle)[0]} fy={candleFlame(theme, candle)[1]} candleOn={candleOn} shower={moments.includes('shooting-stars')} veiled={veiled} />
      {weather.night && (
        <g mask={veiled ? 'url(#curtain-cover-soft)' : undefined}>
          <WindowGlow garden={rest.garden} now={rest.now} />
        </g>
      )}
    </svg>
  );
}
