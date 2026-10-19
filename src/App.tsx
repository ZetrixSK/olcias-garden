import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addDrawing,
  addPlant,
  canPress,
  catchUpNights,
  DEFAULT_SETTINGS,
  deleteDesign,
  deleteDiaryEntry,
  drawingAt,
  isHanging,
  moveDrawing,
  newId,
  removeDrawing,
  saveDiaryEntry,
  setPhoto,
  setPlantName,
  setPressNote,
  setWallpaper,
  savePansyDesign,
  savePotDesign,
  setPot,
  setVariety,
  movePlant,
  placeInWindow,
  plantAt,
  pressFlower,
  removePlant,
  takeDown,
  trimVine,
  unpress,
  updateSettings,
  waterPlant,
  windowPlantAt,
  type GardenState,
  type Settings,
  type SlotId,
  type WindowSpot,
} from './garden/state';
import { deleteImage, getImage, loadGarden, persistStorage, putImage, restoreGarden, saveGarden, tidyImages } from './garden/storage';
import { imagesInUse, MAX_PIXELS, type Decor, type WallpaperSize } from './garden/decor';
import type { OwnPaper } from './scene/OwnDecor';
import { DecorateSheet, DrawingCard } from './ui/Decorate';
import { chooseImage, prepareImage } from './ui/upload';
import { awayDemo, buildTimelapse, gardenAt, LAPSE_MIN_GAP, parseAway, somethingGrew, type Timelapse } from './garden/timelapse';
import { stageAt } from './garden/growth';
import { isVineSpecies, isVineSpot } from './garden/vines';
import { pansyPalette } from './plants/looks';
import type { SpeciesId } from './garden/species';
import { grainDataUrl } from './grain';
import { Scene } from './scene/Scene';
import { ShelfView } from './scene/ShelfView';
import type { Snip, VineSpec } from './scene/Vines';
import { ease, lapseDuration, LapseClock } from './ui/Clock';
import { Letter } from './ui/Letter';
import { PressedBook } from './ui/PressedBook';
import { DiaryBook } from './ui/Diary';
import { BackupSheet } from './ui/Backup';
import { canAddToHomeScreen, InstallHint } from './ui/InstallHint';
import { dayKey, onThisDay } from './garden/diary';
import type { Restored } from './garden/backup';
import { pressedToday } from './garden/pressed';
import { paletteVars, type Weather } from './theme/palettes';
import { seasonShown } from './theme/seasons';
import { isDarkRoom, startingRoom, type OwnRoom } from './theme/ownRoom';
import { MoveBanner, PlantCard, PlantPicker, StyleSheet, VarietyPicker, WindowChooser } from './ui/Sheets';
import { CandleStudio, NEW_PANSY, NEW_POT, PansyStudio, PotStudio, RoomStudio } from './ui/Studio';
import { PictureSheet } from './ui/Picture';
import { flameOn, type CandleLook } from './garden/candle';
import { candleLit as roomIsDim } from './theme/palettes';
import { ambientMix } from './sound/mix';
import { useAmbience } from './sound/useAmbience';
import { designRef } from './garden/designs';
import { PlantArt } from './plants/PlantArt';
import { pansyPalette as paletteOf } from './plants/looks';
import { Toolbar } from './ui/Toolbar';
import { useWeather } from './weather/useWeather';
import { requestLocation } from './weather/weather';

/** Height of the screen in scene units, where scenes are always 400 units wide. */
function useViewHeight() {
  const measure = () => (400 * window.innerHeight) / Math.max(1, window.innerWidth);
  const [h, setH] = useState(measure);
  useEffect(() => {
    const onResize = () => setH(measure());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return h;
}

/** Current time, refreshed once a minute and whenever the app comes back to the foreground. */
function useNow() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);
  return [now, setNow] as const;
}

/** Dev only: ?view=shelves&theme=witchy&weather=rain&night=1 to look at any combination. */
function devOverrides(g: GardenState): GardenState {
  const q = new URLSearchParams(window.location.search);
  const patch: Partial<Settings> = {};
  const view = q.get('view');
  const theme = q.get('theme');
  const weather = q.get('weather');
  if (view === 'room' || view === 'shelves') patch.view = view;
  if (theme === 'cozy' || theme === 'witchy') patch.theme = theme;
  if (weather === 'clear' || weather === 'cloudy' || weather === 'rain') {
    patch.weatherMode = 'manual';
    patch.manual = { sky: weather, night: q.get('night') === '1' };
  }
  return updateSettings(g, patch);
}

/** Dev only: ?vines=pansy@sill-1:0.6,rose@sill-3:1,pansy@sill-2:1:left draws vines for the art prototype. */
function devVines(): VineSpec[] {
  const q = new URLSearchParams(window.location.search).get('vines');
  if (!q) return [];
  return q.split(',').flatMap((part, i) => {
    const m = /^(pansy|rose)@(sill-[123]):([\d.]+)(?::(left|right))?$/.exec(part);
    if (!m) return [];
    const vine: VineSpec = { id: `dev-${i}-${m[1]}`, species: m[1] as VineSpec['species'], from: m[2] as VineSpec['from'], length: Number(m[3]) };
    return [m[4] ? { ...vine, dir: m[4] as 'left' | 'right' } : vine];
  });
}

/**
 * ?away=8h (or 30m, 2d, 1w) replays that much time away, with her plants rewound so they all grow
 * in it. Nothing is saved while it's on, so the real garden is never touched.
 */
const AWAY = parseAway(new URLSearchParams(window.location.search).get('away'));
/** With &nowater the preview leaves the plants unwatered all that time, so nothing outgrows its pot. */
const AWAY_WATER = !new URLSearchParams(window.location.search).has('nowater');

const prefersStill = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * A replay in progress: how far along it is, and whether it is fading out. When nothing grew only
 * the clock moves, so the room isn't redrawn for nothing.
 */
type Lapse = { tl: Timelapse; grew: boolean; p: number; fading: boolean; skipped: boolean };

/** The room is redrawn at most this often during a replay; the phone has a whole illustration to repaint. */
const LAPSE_FRAME_MS = 33;

type Mode =
  | { kind: 'idle' }
  /** shelves: choosing a species for an empty slot */
  | { kind: 'pick'; slot: SlotId }
  | { kind: 'card'; id: string }
  /** shelves: moving a plant to another slot */
  | { kind: 'move'; id: string }
  /** window: choosing where a plant should stand */
  | { kind: 'place'; id: string }
  /** window: choosing which plant goes into an empty spot */
  | { kind: 'choose'; spot: WindowSpot }
  /** planting a bratek: choosing its colours */
  | { kind: 'variety'; slot: SlotId }
  /** a plant's pot and colours */
  | { kind: 'style'; id: string }
  /** painting a pot, new or one of hers; `forPlant` gets it once saved */
  | { kind: 'potStudio'; editing: string | null; forPlant: string | null }
  /** designing a bratek; `forSlot` is planted with it, `forPlant` switches to it, once saved */
  | { kind: 'pansyStudio'; editing: string | null; forSlot: SlotId | null; forPlant: string | null }
  /** her wallpaper, photo and drawings */
  | { kind: 'decorate' }
  /** one of her drawings on the shelves */
  | { kind: 'drawing'; id: string }
  /** painting her own room; `draft` shows in the room until she saves or closes */
  | { kind: 'roomStudio'; draft: OwnRoom; editing: boolean }
  /** saving the garden to a file, or bringing one back */
  | { kind: 'backup' }
  /** a picture of the garden as it is */
  | { kind: 'picture' }
  /** her candle; `draft` shows on the sill until she saves or closes */
  | { kind: 'candleStudio'; draft: CandleLook };

/** Her pictures, as addresses the drawing can use, keyed by the image's name in storage. */
type Pictures = Record<string, string>;

async function loadPictures(decor: Decor): Promise<Pictures> {
  const inUse = imagesInUse(decor);
  const out: Pictures = {};
  await Promise.all(
    [...inUse].map(async (key) => {
      const blob = await getImage(key);
      if (blob) out[key] = URL.createObjectURL(blob);
    }),
  );
  void tidyImages(inUse);
  return out;
}

export function App() {
  const [garden, setGarden] = useState<GardenState | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'idle' });
  const [wateringId, setWateringId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [now, setNow] = useNow();
  const viewH = useViewHeight();
  const grain = useMemo(() => grainDataUrl(), []);
  const devVineList = useMemo(() => (import.meta.env.DEV ? devVines() : []), []);
  const loaded = useRef(false);
  const gardenRef = useRef<GardenState | null>(null);
  gardenRef.current = garden;
  const [lapse, setLapse] = useState<Lapse | null>(null);
  const lastLapse = useRef<Timelapse | null>(null);
  const opened = useRef<{ at: number; garden: GardenState } | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [snip, setSnip] = useState<Snip | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [diaryOpen, setDiaryOpen] = useState(false);
  /** The day she last opened the diary, so its "on this day" mark goes once she's seen it. */
  const [diarySeenOn, setDiarySeenOn] = useState<string | null>(null);
  // ?installhint shows the iPhone Home Screen note on any phone, to see how it looks
  const installPreview = useMemo(() => new URLSearchParams(window.location.search).has('installhint'), []);
  const [installHidden, setInstallHidden] = useState(false);
  const openBook = useCallback(() => setBookOpen(true), []);
  const [pictures, setPictures] = useState<Pictures>({});
  const [adding, setAdding] = useState<'wallpaper' | 'photo' | 'drawing' | null>(null);
  const [pictureError, setPictureError] = useState<string | null>(null);
  const openDecorate = useCallback(() => setMode({ kind: 'decorate' }), []);

  /** Replays what happened between two moments. With reduced motion it only plays when asked. */
  const playLapse = useCallback((tl: Timelapse, auto: boolean) => {
    lastLapse.current = tl;
    if (auto && prefersStill()) return;
    const grew = somethingGrew(tl, (p, t) => stageAt(p.species, p, t));
    setLapse({ tl, grew, p: 0, fading: false, skipped: false });
  }, []);

  useEffect(() => {
    loadGarden().then((g) => {
      loaded.current = true;
      const t = Date.now();
      void loadPictures(g.decor).then(setPictures);
      if (AWAY) {
        const demo = awayDemo(g, AWAY, t, AWAY_WATER);
        opened.current = { at: t, garden: demo };
        setGarden(catchUpNights(demo, t));
        playLapse(buildTimelapse(demo, t - AWAY, t), false);
        return;
      }
      opened.current = { at: t, garden: g };
      const caughtUp = catchUpNights(g, t);
      setGarden(import.meta.env.DEV ? devOverrides(caughtUp) : caughtUp);
      if (t - g.lastSeen >= LAPSE_MIN_GAP) playLapse(buildTimelapse(g, g.lastSeen, t), true);
      void persistStorage();
    });
  }, [playLapse]);

  // save shortly after every change, noting the time so the next visit knows how long she was away
  useEffect(() => {
    if (!garden || !loaded.current || AWAY) return;
    const t = window.setTimeout(() => void saveGarden({ ...garden, lastSeen: Date.now() }), 250);
    return () => window.clearTimeout(t);
  }, [garden]);

  // the nightly 3:00 check, also when the app stays open across it; and a fresh "last seen" each minute
  useEffect(() => {
    setGarden((g) => (g ? catchUpNights(g, now) : g));
    if (gardenRef.current && loaded.current && !AWAY) void saveGarden({ ...gardenRef.current, lastSeen: now });
  }, [now]);

  // leaving and coming back: on return after a while, replay what happened in between
  useEffect(() => {
    let hiddenAt: number | null = null;
    const onVisibility = () => {
      const g = gardenRef.current;
      if (!g || !loaded.current || AWAY) return;
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        void saveGarden({ ...g, lastSeen: hiddenAt });
      } else if (hiddenAt !== null) {
        const t = Date.now();
        if (t - hiddenAt >= LAPSE_MIN_GAP) playLapse(buildTimelapse(g, hiddenAt, t), true);
        hiddenAt = null;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [playLapse]);

  // drive the replay: sweep, hold a moment on the result, then fade the clock away
  const lapseTl = lapse?.tl;
  useEffect(() => {
    if (!lapseTl) return;
    const duration = prefersStill() ? 0 : lapseDuration(lapseTl);
    const start = performance.now();
    const timers: number[] = [];
    let raf = 0;
    let lastDrawn = -Infinity;
    const mine = (fn: (l: Lapse) => Lapse | null) => setLapse((l) => (l && l.tl === lapseTl ? fn(l) : l));
    const finish = () => {
      timers.push(window.setTimeout(() => mine((l) => ({ ...l, fading: true })), 1300));
      timers.push(window.setTimeout(() => mine(() => null), 2300));
    };
    const frame = (t: number) => {
      const p = duration ? Math.min(1, Math.max(0, (t - start) / duration)) : 1;
      if (p === 1 || t - lastDrawn >= LAPSE_FRAME_MS) {
        lastDrawn = t;
        mine((l) => (l.skipped ? l : { ...l, p }));
      }
      if (p < 1) raf = requestAnimationFrame(frame);
      else finish();
    };
    raf = requestAnimationFrame(frame);
    // a safety net: however the phone schedules frames, the replay never outstays its welcome
    timers.push(window.setTimeout(() => mine(() => null), duration + 4500));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [lapseTl]);

  const skipLapse = () => {
    setLapse((l) => (l ? { ...l, p: 1, fading: true, skipped: true } : l));
    window.setTimeout(() => setLapse((l) => (l?.skipped ? null : l)), 900);
  };

  // in Safari on iPhone, a note on keeping the garden on the Home Screen comes first, once
  const offerInstall =
    !!garden && !installHidden && lapse === null && (installPreview || (!garden.settings.installHint && canAddToHomeScreen()));

  // the letter opens by itself the first time, once any replay has finished
  const letterUnread = garden?.settings.letter === 'unread';
  const replaying = lapse !== null;
  useEffect(() => {
    if (!letterUnread || replaying || offerInstall) return;
    const t = window.setTimeout(() => setLetterOpen(true), 700);
    return () => window.clearTimeout(t);
  }, [letterUnread, replaying, offerInstall]);

  const update = useCallback((fn: (g: GardenState) => GardenState) => setGarden((g) => (g ? fn(g) : g)), []);

  // her wallpaper, drawn only once its picture has been read back from storage
  const wallpaper = garden?.decor.wallpaper ?? null;
  const wallpaperUrl = wallpaper ? (pictures[wallpaper.img] ?? null) : null;
  const paper = useMemo<OwnPaper | null>(
    () => (wallpaper && wallpaperUrl ? { url: wallpaperUrl, w: wallpaper.w, h: wallpaper.h, size: wallpaper.size, soft: wallpaper.soft } : null),
    [wallpaper, wallpaperUrl],
  );
  const settings = garden?.settings;
  const { weather: realWeather, status } = useWeather(settings ?? DEFAULT_SETTINGS, now);
  // ?glow=dawn or ?glow=dusk shows the sky at sunrise or sunset, to see it without waiting
  const glowPreview = new URLSearchParams(window.location.search).get('glow');
  const weather: Weather =
    (glowPreview === 'dawn' || glowPreview === 'dusk') && realWeather.sky !== 'rain'
      ? { ...realWeather, night: false, twilight: glowPreview }
      : realWeather;

  // when rain stops by day, a rainbow stays over the lake for a while
  const lastSky = useRef(weather.sky);
  const [rainbowUntil, setRainbowUntil] = useState(0);
  useEffect(() => {
    if (lastSky.current === 'rain' && weather.sky !== 'rain') setRainbowUntil(Date.now() + 75 * 60_000);
    lastSky.current = weather.sky;
  }, [weather.sky]);
  const rainbow = !weather.night && now < rainbowUntil;
  // her own room shows its colours over the furniture of the room she based it on; while she's
  // painting it, the draft shows instead
  const own = mode.kind === 'roomStudio' ? mode.draft : settings?.useOwn ? settings.own : null;
  const theme = own ? own.base : (settings?.theme ?? 'cozy');
  const uiDark = own ? isDarkRoom(own) : theme === 'witchy';
  const barColor = own ? own.wall : theme === 'cozy' ? '#ecdfc9' : '#2a1d2b';

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', barColor);
  }, [barColor]);

  // her candle, the one she's designing while the studio is open; lit by her, or by itself when the room is dim
  const candle = mode.kind === 'candleStudio' ? mode.draft : (settings?.candle ?? null);
  const candleOn = flameOn(settings?.candleLit ?? null, roomIsDim(weather));
  useAmbience(!!settings?.sound, ambientMix(weather, seasonShown(now), new Date(now).getHours(), candleOn));

  if (!garden || !settings) return <div className="garden" style={paletteVars('cozy', weather)} />;

  const setSettings = (patch: Partial<Settings>) => {
    update((g) => updateSettings(g, patch));
    if (patch.view) setMode({ kind: 'idle' });
  };

  const liveWeather = () => {
    if (settings.location) return setSettings({ weatherMode: 'live' });
    setLocating(true);
    requestLocation()
      .then((location) => setSettings({ weatherMode: 'live', location }))
      .catch(() => setSettings({ weatherMode: 'clock' }))
      .finally(() => setLocating(false));
  };

  /** Puts a backup in place of the garden, pictures and all, and shows it straight away. */
  const restore = async (r: Restored) => {
    const t = Date.now();
    await restoreGarden({ ...r.garden, lastSeen: t }, r.images, t);
    Object.values(pictures).forEach((url) => URL.revokeObjectURL(url));
    const caughtUp = catchUpNights(r.garden, t);
    opened.current = { at: t, garden: caughtUp };
    lastLapse.current = null;
    setPictures(await loadPictures(caughtUp.decor));
    setGarden(caughtUp);
    setMode({ kind: 'idle' });
  };

  const today = dayKey(new Date(now));
  const memory = diarySeenOn !== today && onThisDay(garden.diary, today).length > 0;

  const onSlot = (slot: SlotId) => {
    const here = plantAt(garden, slot);
    const drawing = drawingAt(garden, slot);
    if (mode.kind === 'move') {
      const id = mode.id;
      update((g) => (g.decor.drawings.some((d) => d.id === id) ? moveDrawing(g, id, slot) : movePlant(g, id, slot)));
      setMode({ kind: 'idle' });
    } else if (here) {
      setMode(mode.kind === 'card' && mode.id === here.id ? { kind: 'idle' } : { kind: 'card', id: here.id });
    } else if (drawing) {
      setMode(mode.kind === 'drawing' && mode.id === drawing.id ? { kind: 'idle' } : { kind: 'drawing', id: drawing.id });
    } else {
      setMode({ kind: 'pick', slot });
    }
  };

  /** Asks for a picture, shrinks it, keeps it, and hands back its name and size; null if she cancelled or it failed. */
  const addPicture = async (what: 'wallpaper' | 'photo' | 'drawing') => {
    const file = await chooseImage();
    if (!file) return null;
    setAdding(what);
    setPictureError(null);
    try {
      const prepared = await prepareImage(file, MAX_PIXELS[what], what === 'photo' ? 'jpeg' : 'png');
      const img = newId();
      try {
        await putImage(img, prepared.blob);
      } catch {
        setPictureError("There wasn't room on the phone to keep that picture.");
        return null;
      }
      const url = URL.createObjectURL(prepared.blob);
      setPictures((p) => ({ ...p, [img]: url }));
      return { img, w: prepared.w, h: prepared.h };
    } catch {
      setPictureError("That picture couldn't be opened. A PNG or JPEG works best.");
      return null;
    } finally {
      setAdding(null);
    }
  };

  /** Lets go of a picture nothing uses any more. */
  const dropPicture = (img: string | undefined) => {
    if (!img) return;
    void deleteImage(img);
    setPictures((p) => {
      if (p[img]) URL.revokeObjectURL(p[img]!);
      const { [img]: _, ...rest } = p;
      return rest;
    });
  };

  const chooseWallpaper = async () => {
    const pic = await addPicture('wallpaper');
    if (!pic) return;
    const old = garden.decor.wallpaper;
    update((g) => setWallpaper(g, { ...pic, size: old?.size ?? 'm', soft: old?.soft ?? false }));
    dropPicture(old?.img);
  };

  const choosePhoto = async () => {
    const pic = await addPicture('photo');
    if (!pic) return;
    const old = garden.decor.photo;
    update((g) => setPhoto(g, pic));
    dropPicture(old?.img);
  };

  const drawingIn = async (slot: SlotId) => {
    const pic = await addPicture('drawing');
    if (!pic) return;
    update((g) => addDrawing(g, { id: newId(), slot, ...pic }));
    setMode({ kind: 'idle' });
  };

  const onSpot = (spot: WindowSpot) => {
    const here = windowPlantAt(garden, spot);
    if (mode.kind === 'place') {
      update((g) => placeInWindow(g, mode.id, spot));
      setMode({ kind: 'idle' });
    } else if (here) {
      setMode(mode.kind === 'card' && mode.id === here.id ? { kind: 'idle' } : { kind: 'card', id: here.id });
    } else {
      setMode({ kind: 'choose', spot });
    }
  };

  const plantIn = (slot: SlotId, species: SpeciesId, variety: string | null = null) => {
    const t = Date.now();
    setNow(t);
    update((g) => addPlant(g, slot, species, t, newId(), variety));
    setMode({ kind: 'idle' });
  };

  const plantSpecies = (species: SpeciesId) => {
    if (mode.kind !== 'pick') return;
    // a bratek first asks which colours it should bloom in
    if (species === 'pansy') setMode({ kind: 'variety', slot: mode.slot });
    else plantIn(mode.slot, species);
  };

  const water = (id: string) => {
    const t = Date.now();
    setNow(t);
    update((g) => waterPlant(g, id, t));
    setWateringId(id);
    window.setTimeout(() => setWateringId((w) => (w === id ? null : w)), 1900);
  };

  // during a replay the garden is drawn as it was at that moment
  const replayRoom = lapse !== null && lapse.grew;
  const shownNow = replayRoom ? lapse.tl.from + (lapse.tl.to - lapse.tl.from) * ease(lapse.p) : now;
  const shown = replayRoom ? { ...garden, plants: gardenAt(lapse.tl, shownNow).plants } : garden;

  // vines show while they're switched on and their plant stands on the sill
  const vines: VineSpec[] = devVineList.length
    ? devVineList
    : settings.vines
      ? shown.plants.flatMap((p) =>
          p.vine && isVineSpot(p.display) && isVineSpecies(p.species)
            ? [
                {
                  id: p.id,
                  species: p.species,
                  from: p.display,
                  length: p.vine.length,
                  palette: pansyPalette(p.variety, garden.designs),
                  ...(p.vine.dir ? { dir: p.vine.dir } : {}),
                },
              ]
            : [],
        )
      : [];

  const cardPlant = mode.kind === 'card' ? garden.plants.find((p) => p.id === mode.id) : undefined;
  const stylePlant = mode.kind === 'style' ? garden.plants.find((p) => p.id === mode.id) : undefined;
  const studioPlant = mode.kind === 'potStudio' && mode.forPlant ? garden.plants.find((p) => p.id === mode.forPlant) : undefined;

  return (
    <div
      className={`garden theme-${theme}${uiDark ? ' ui-dark' : ''}${weather.night ? ' night' : ''}${lapse ? ' replaying' : ''}`}
      style={paletteVars(theme, weather, seasonShown(now), own)}
    >
      <div className="view" key={settings.view}>
        {settings.view === 'room' ? (
          <Scene
            theme={theme}
            weather={weather}
            viewH={viewH}
            vines={vines}
            snip={snip}
            onBook={openBook}
            paper={paper}
            photoUrl={garden.decor.photo ? (pictures[garden.decor.photo.img] ?? null) : null}
            onFrame={openDecorate}
            rainbow={rainbow}
            candle={candle}
            candleOn={candleOn}
            onCandle={() => setSettings({ candleLit: !candleOn })}
            hideCurtains={import.meta.env.DEV && window.location.search.includes('nocurtains')}
            garden={shown}
            now={shownNow}
            selectedId={cardPlant?.id ?? null}
            placingId={mode.kind === 'place' ? mode.id : null}
            wateringId={wateringId}
            onSpot={onSpot}
          />
        ) : (
          <ShelfView
            theme={theme}
            weather={weather}
            viewH={viewH}
            garden={shown}
            now={shownNow}
            selectedId={cardPlant?.id ?? null}
            movingId={mode.kind === 'move' ? mode.id : null}
            paper={paper}
            pictures={pictures}
            drawingId={mode.kind === 'drawing' ? mode.id : null}
            rainbow={rainbow}
            candle={candle}
            candleOn={candleOn}
            onCandle={() => setSettings({ candleLit: !candleOn })}
            wateringId={wateringId}
            onSlot={onSlot}
          />
        )}
      </div>
      <div className="grain" style={{ backgroundImage: `url(${grain})` }} />
      <Toolbar
        settings={settings}
        weather={weather}
        status={status}
        onSettings={setSettings}
        onLiveWeather={liveWeather}
        locating={locating}
        onLetter={() => setLetterOpen(true)}
        onDiary={() => {
          setDiaryOpen(true);
          setDiarySeenOn(today);
        }}
        memory={memory}
        onBackup={() => setMode({ kind: 'backup' })}
        onPicture={() => setMode({ kind: 'picture' })}
        onBook={openBook}
        onDecorate={openDecorate}
        onOwnRoom={(edit) => {
          if (settings.own && !edit) setSettings({ useOwn: true });
          else setMode({ kind: 'roomStudio', draft: settings.own ?? startingRoom(settings.theme), editing: !!settings.own });
        }}
        onStudio={(what) =>
          setMode(
            what === 'pot'
              ? { kind: 'potStudio', editing: null, forPlant: null }
              : what === 'candle'
                ? { kind: 'candleStudio', draft: settings.candle ?? (theme === 'witchy' ? { shape: 'taper', wax: '#2a1f2e' } : { shape: 'jar', wax: '#e7a7b6' }) }
                : { kind: 'pansyStudio', editing: null, forSlot: null, forPlant: null },
          )
        }
        onClock={() => {
          const o = opened.current;
          const tl = lastLapse.current ?? (o ? buildTimelapse(o.garden, o.at, Date.now()) : null);
          if (tl) playLapse(tl, false);
        }}
      />
      {mode.kind === 'pick' && (
        <PlantPicker
          onPick={plantSpecies}
          onDrawing={isHanging(mode.slot) ? null : () => void drawingIn(mode.slot)}
          busy={adding === 'drawing'}
          error={pictureError}
          onClose={() => setMode({ kind: 'idle' })}
        />
      )}
      {mode.kind === 'decorate' && (
        <DecorateSheet
          decor={garden.decor}
          wallpaperUrl={wallpaperUrl}
          photoUrl={garden.decor.photo ? (pictures[garden.decor.photo.img] ?? null) : null}
          busy={adding}
          error={pictureError}
          onWallpaper={() => void chooseWallpaper()}
          onWallpaperLook={(patch: { size?: WallpaperSize; soft?: boolean }) =>
            update((g) => (g.decor.wallpaper ? setWallpaper(g, { ...g.decor.wallpaper, ...patch }) : g))
          }
          onWallpaperReset={() => {
            const old = garden.decor.wallpaper;
            update((g) => setWallpaper(g, null));
            dropPicture(old?.img);
          }}
          onPhoto={() => void choosePhoto()}
          onPhotoReset={() => {
            const old = garden.decor.photo;
            update((g) => setPhoto(g, null));
            dropPicture(old?.img);
          }}
          onClose={() => {
            setPictureError(null);
            setMode({ kind: 'idle' });
          }}
        />
      )}
      {mode.kind === 'picture' && <PictureSheet onClose={() => setMode({ kind: 'idle' })} />}
      {mode.kind === 'candleStudio' && (
        <CandleStudio
          look={mode.draft}
          lit={settings.candleLit}
          own={settings.candle !== null}
          onChange={(draft) => setMode({ kind: 'candleStudio', draft })}
          onLit={(candleLit) => setSettings({ candleLit })}
          onRoomCandle={() => {
            setSettings({ candle: null });
            setMode({ kind: 'idle' });
          }}
          onSave={() => {
            setSettings({ candle: mode.draft });
            setMode({ kind: 'idle' });
          }}
          onClose={() => setMode({ kind: 'idle' })}
        />
      )}
      {mode.kind === 'backup' && <BackupSheet garden={garden} onRestore={restore} onClose={() => setMode({ kind: 'idle' })} />}
      {offerInstall && (
        <InstallHint
          onDone={() => {
            setInstallHidden(true);
            setSettings({ installHint: true });
          }}
        />
      )}
      {mode.kind === 'roomStudio' && (
        <RoomStudio
          room={mode.draft}
          editing={mode.editing}
          onChange={(draft) => setMode({ ...mode, draft })}
          onSave={() => {
            setSettings({ own: mode.draft, useOwn: true });
            setMode({ kind: 'idle' });
          }}
          onClose={() => setMode({ kind: 'idle' })}
        />
      )}
      {mode.kind === 'drawing' && (
        <DrawingCard
          onMove={() => setMode({ kind: 'move', id: mode.id })}
          onRemove={() => {
            const d = garden.decor.drawings.find((x) => x.id === mode.id);
            update((g) => removeDrawing(g, mode.id));
            dropPicture(d?.img);
            setMode({ kind: 'idle' });
          }}
          onClose={() => setMode({ kind: 'idle' })}
        />
      )}
      {mode.kind === 'choose' && (
        <WindowChooser
          plants={garden.plants.filter((p) => p.display === null)}
          now={now}
          designs={garden.designs}
          onPick={(id) => {
            update((g) => placeInWindow(g, id, mode.spot));
            setMode({ kind: 'idle' });
          }}
          onShelves={() => setSettings({ view: 'shelves' })}
          onClose={() => setMode({ kind: 'idle' })}
        />
      )}
      {cardPlant && (
        <PlantCard
          key={cardPlant.id}
          plant={cardPlant}
          now={now}
          inWindowView={settings.view === 'room'}
          onWater={() => water(cardPlant.id)}
          onMove={() => setMode(settings.view === 'room' ? { kind: 'place', id: cardPlant.id } : { kind: 'move', id: cardPlant.id })}
          onWindow={() => {
            if (cardPlant.display) {
              update((g) => takeDown(g, cardPlant.id));
              setMode({ kind: 'idle' });
            } else {
              setSettings({ view: 'room' });
              setMode({ kind: 'place', id: cardPlant.id });
            }
          }}
          onStyle={() => setMode({ kind: 'style', id: cardPlant.id })}
          onTrim={
            settings.vines && cardPlant.vine
              ? () => {
                  // a flower from the cut stem goes into the book, the first trim of the day
                  const t = Date.now();
                  setNow(t);
                  update((g) => pressFlower(trimVine(g, cardPlant.id), cardPlant.id, t));
                  setSnip((s) => ({ id: cardPlant.id, n: (s?.n ?? 0) + 1 }));
                }
              : null
          }
          onPress={
            canPress(garden, cardPlant.id, now)
              ? () => {
                  const t = Date.now();
                  setNow(t);
                  update((g) => pressFlower(g, cardPlant.id, t));
                }
              : null
          }
          pressedToday={pressedToday(garden.pressed, cardPlant.id, now)}
          onBook={openBook}
          onName={(name) => update((g) => setPlantName(g, cardPlant.id, name))}
          onRemove={() => {
            update((g) => removePlant(g, cardPlant.id));
            setMode({ kind: 'idle' });
          }}
          onClose={() => setMode({ kind: 'idle' })}
        />
      )}
      {mode.kind === 'variety' && (
        <VarietyPicker
          designs={garden.designs}
          onPick={(v) => plantIn(mode.slot, 'pansy', v)}
          onDesign={() => setMode({ kind: 'pansyStudio', editing: null, forSlot: mode.slot, forPlant: null })}
          onEdit={(id) => setMode({ kind: 'pansyStudio', editing: id, forSlot: mode.slot, forPlant: null })}
          onClose={() => setMode({ kind: 'idle' })}
        />
      )}
      {mode.kind === 'style' && stylePlant && (
        <StyleSheet
          plant={stylePlant}
          designs={garden.designs}
          now={now}
          onPot={(pot) => update((g) => setPot(g, stylePlant.id, pot))}
          onVariety={(v) => update((g) => setVariety(g, stylePlant.id, v))}
          onPaint={() => setMode({ kind: 'potStudio', editing: null, forPlant: stylePlant.id })}
          onEditPot={(id) => setMode({ kind: 'potStudio', editing: id, forPlant: stylePlant.id })}
          onDesignPansy={() => setMode({ kind: 'pansyStudio', editing: null, forSlot: null, forPlant: stylePlant.id })}
          onEditPansy={(id) => setMode({ kind: 'pansyStudio', editing: id, forSlot: null, forPlant: stylePlant.id })}
          onClose={() => setMode({ kind: 'card', id: stylePlant.id })}
        />
      )}
      {mode.kind === 'potStudio' && (
        <PotStudio
          key={mode.editing ?? 'new'}
          initial={garden.designs.pots.find((d) => d.id === mode.editing) ?? NEW_POT()}
          editing={mode.editing !== null}
          onSave={(d) => {
            update((g) => {
              const saved = savePotDesign(g, d);
              return mode.forPlant ? setPot(saved, mode.forPlant, designRef(d.id)) : saved;
            });
            setMode(mode.forPlant ? { kind: 'style', id: mode.forPlant } : { kind: 'idle' });
          }}
          onDelete={() => {
            if (mode.editing) update((g) => deleteDesign(g, 'pot', mode.editing!));
            setMode(mode.forPlant ? { kind: 'style', id: mode.forPlant } : { kind: 'idle' });
          }}
          onClose={() => setMode(mode.forPlant ? { kind: 'style', id: mode.forPlant } : { kind: 'idle' })}
        >
          {studioPlant ? (
            <PlantArt species={studioPlant.species} stage="bloom" palette={paletteOf(studioPlant.variety, garden.designs)} />
          ) : (
            <PlantArt species="pansy" stage="bloom" />
          )}
        </PotStudio>
      )}
      {mode.kind === 'pansyStudio' && (
        <PansyStudio
          key={mode.editing ?? 'new'}
          initial={garden.designs.pansies.find((d) => d.id === mode.editing) ?? NEW_PANSY()}
          editing={mode.editing !== null}
          onSave={(d) => {
            const ref = designRef(d.id);
            update((g) => {
              const saved = savePansyDesign(g, d);
              return mode.forPlant ? setVariety(saved, mode.forPlant, ref) : saved;
            });
            if (mode.forSlot) plantIn(mode.forSlot, 'pansy', ref);
            else setMode(mode.forPlant ? { kind: 'style', id: mode.forPlant } : { kind: 'idle' });
          }}
          onDelete={() => {
            if (mode.editing) update((g) => deleteDesign(g, 'pansy', mode.editing!));
            setMode(mode.forSlot ? { kind: 'variety', slot: mode.forSlot } : mode.forPlant ? { kind: 'style', id: mode.forPlant } : { kind: 'idle' });
          }}
          onClose={() =>
            setMode(mode.forSlot ? { kind: 'variety', slot: mode.forSlot } : mode.forPlant ? { kind: 'style', id: mode.forPlant } : { kind: 'idle' })
          }
        />
      )}
      {mode.kind === 'move' && <MoveBanner text="Tap where it should go" onCancel={() => setMode({ kind: 'idle' })} />}
      {mode.kind === 'place' && <MoveBanner text="Tap a place in the window" onCancel={() => setMode({ kind: 'idle' })} />}
      {AWAY && !lapse && mode.kind === 'idle' && (
        <div className="banner" role="status">
          <span>{AWAY_WATER ? 'Demo · watered daily' : 'Demo · never watered'}</span>
          <button onClick={() => opened.current && playLapse(buildTimelapse(opened.current.garden, opened.current.at - AWAY, opened.current.at), false)}>
            Again
          </button>
          <button onClick={() => window.location.assign(window.location.pathname)}>Leave</button>
        </div>
      )}
      {lapse && <LapseClock lapse={lapse.tl} p={lapse.p} fading={lapse.fading} onSkip={skipLapse} />}
      {diaryOpen && (
        <DiaryBook
          diary={garden.diary}
          now={now}
          onSave={(key, mood, text) => update((g) => saveDiaryEntry(g, key, mood, text, Date.now()))}
          onDelete={(key) => update((g) => deleteDiaryEntry(g, key))}
          onClose={() => setDiaryOpen(false)}
        />
      )}
      {bookOpen && (
        <PressedBook
          pressed={garden.pressed}
          onNote={(id, note) => update((g) => setPressNote(g, id, note))}
          onRemove={(id) => update((g) => unpress(g, id))}
          onClose={() => setBookOpen(false)}
        />
      )}
      {letterOpen && !lapse && (
        <Letter
          onKeep={() => {
            setLetterOpen(false);
            if (settings.letter === 'unread') setSettings({ letter: 'kept' });
          }}
          onThrowAway={() => {
            setLetterOpen(false);
            setSettings({ letter: 'deleted' });
          }}
        />
      )}
    </div>
  );
}
