import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addDrawing,
  freeShelfSlots,
  gardenImages,
  withMemories,
  parseSave,
  bouquetAt,
  postSeen,
  rememberContact,
  setTag,
  cutStems,
  moveBouquet,
  receiveBouquet,
  removeBouquet,
  unpackParcel,
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
import { imagesInUse, MAX_PIXELS, type WallpaperSize } from './garden/decor';
import { addMemories, editMemory, MEMORY_PIXELS, photoTakenAt, removeMemories, roomFor, type Memories, type Memory, type PaperId } from './garden/memories';
import { MemoryBook } from './ui/Memories';
import { Paint, PAINT_H, PAINT_W } from './ui/Paint';
import { forgetUrl, rememberUrl, storedUrl } from './ui/storedImages';
import type { OwnPaper } from './scene/OwnDecor';
import { DecorateSheet, DrawingCard } from './ui/Decorate';
import { chooseImage, chooseImages, prepareImage } from './ui/upload';
import { awayDemo, buildTimelapse, gardenAt, LAPSE_MIN_GAP, parseAway, somethingGrew, type Timelapse } from './garden/timelapse';
import { stageAt } from './garden/growth';
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
import { canAddToHomeScreen, Welcome } from './ui/InstallHint';
import { BouquetCard, BouquetStudio, ParcelsSheet } from './ui/Bouquets';
import { arrivalNotice, NoticeNote, PostSheet, type Notice } from './ui/Post';
import { VisitView, visitorNotice, type Visiting } from './ui/Visit';
import { ViewSwiper } from './ui/ViewSwiper';
import { applyAction } from './remote/actions';
import { useMail } from './remote/useMail';
import { accessRules, blockedTags, claimTag, sendMail, setAccess, setBlocked, visitAction, visitGarden, type PostError } from './remote/client';
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
import { LangProvider, words } from './i18n';
import { designRef } from './garden/designs';
import { PlantArt } from './plants/PlantArt';
import { pansyPalette as paletteOf } from './plants/looks';
import { Toolbar } from './ui/Toolbar';
import { useWeather } from './weather/useWeather';
import { MOMENTS, type Moment } from './weather/moments';
import { useRemoteSync } from './remote/useRemoteSync';
import { useRemoteActions } from './remote/useRemoteActions';
import { vineSpecs } from './scene/vineSpecs';
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
/** The shared copy is kept up to date in the real app; in dev only with ?sync, and never during a preview. */
const SYNC = !AWAY && (import.meta.env.PROD || new URLSearchParams(window.location.search).has('sync'));

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
  /** making a bouquet, looking at one on the shelves, or the box of parcels on the floor */
  | { kind: 'bouquetStudio' }
  | { kind: 'bouquet'; id: string }
  | { kind: 'parcels' }
  | { kind: 'post' }
  /** in someone else's garden, by their leave */
  | { kind: 'visit'; visit: Visiting }
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

/** Reads back the pictures the room shows; her album's pictures are read only when it's open. */
async function loadPictures(garden: GardenState): Promise<Pictures> {
  const out: Pictures = {};
  await Promise.all(
    [...imagesInUse(garden.decor)].map(async (key) => {
      const blob = await getImage(key);
      if (blob) out[key] = URL.createObjectURL(blob);
    }),
  );
  void tidyImages(gardenImages(garden));
  return out;
}

/** Her easel: what it's for (an album, a painting to carry on with, a place on the shelves) and what it starts from. */
type Easel = { album: string | null; again: Memory | null; slot: SlotId | null; start: string | null; paper: PaperId | null };

export function App() {
  const [garden, setGarden] = useState<GardenState | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'idle' });
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const [wateringId, setWateringId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [now, setNow] = useNow();
  const viewH = useViewHeight();
  const grain = useMemo(() => grainDataUrl(), []);
  const devVineList = useMemo(() => (import.meta.env.DEV ? devVines() : []), []);
  const loaded = useRef(false);
  const gardenRef = useRef<GardenState | null>(null);
  gardenRef.current = garden;
  // in Safari on an iPhone a welcome comes first, instead of the garden: it belongs on the Home
  // Screen, which keeps a save of its own, so the letter waits for her there
  const installPreview = useMemo(() => new URLSearchParams(window.location.search).has('installhint'), []);
  const [installHidden, setInstallHidden] = useState(false);
  const welcoming = !!garden && !installHidden && (installPreview || (!garden.settings.installHint && canAddToHomeScreen()));
  // nothing is shared until her garden has loaded and is known not to be waiting behind the welcome
  const sharing = SYNC && garden !== null && !welcoming;
  useRemoteSync(garden, sharing);
  const [lapse, setLapse] = useState<Lapse | null>(null);
  /** The watering can and droplets over a plant, whether she watered it or it came from the admin page. */
  const showWatering = useCallback((id: string) => {
    setWateringId(id);
    window.setTimeout(() => setWateringId((w) => (w === id ? null : w)), 1900);
  }, []);
  const [snip, setSnip] = useState<Snip | null>(null);
  const lastLapse = useRef<Timelapse | null>(null);
  const opened = useRef<{ at: number; garden: GardenState } | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [memoriesOpen, setMemoriesOpen] = useState(false);
  const [easel, setEasel] = useState<Easel | null>(null);
  const [memoryBusy, setMemoryBusy] = useState<string | null>(null);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  /** The day she last opened the diary, so its "on this day" mark goes once she's seen it. */
  const [diarySeenOn, setDiarySeenOn] = useState<string | null>(null);
  // ?installhint shows the iPhone Home Screen note on any phone, to see how it looks
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
      void loadPictures(g).then(setPictures);
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

  // the letter opens by itself the first time, once any replay has finished
  const letterUnread = garden?.settings.letter === 'unread';
  const replaying = lapse !== null;
  useEffect(() => {
    if (!letterUnread || replaying || welcoming) return;
    const t = window.setTimeout(() => setLetterOpen(true), 700);
    return () => window.clearTimeout(t);
  }, [letterUnread, replaying, welcoming]);

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

  // moments sent from the admin page (a rainbow, a visitor at the lake...) and when each one ends
  const [sent, setSent] = useState<Partial<Record<Moment, number>>>({});
  const moments = useMemo(() => MOMENTS.filter((m) => (sent[m] ?? 0) > now), [sent, now]);
  // post sent to her tag: bouquets come in once the garden is open and no replay is playing
  const [notice, setNotice] = useState<Notice | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);
  useMail(sharing, garden !== null && lapse === null, gardenRef, setGarden, (a) => setNotice(arrivalNotice(a, words(gardenRef.current?.settings.lang ?? 'mixed'))));
  const loadBlocked = useCallback(() => blockedTags().catch(() => null), []);
  const loadAccess = useCallback(() => accessRules(), []);
  /** Someone's garden as it is, with this visitor's own waiting actions already shown done. */
  const fetchVisit = useCallback(async (tag: string): Promise<Visiting | PostError> => {
    const r = await visitGarden(tag);
    if ('error' in r) return r.error;
    const t = Date.now();
    const parsed = parseSave(r.garden, t);
    if (!parsed) return 'no garden';
    const shown = [...r.pending]
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
      .reduce((g, a) => applyAction(g, { id: a.id, kind: a.kind, payload: a.payload }, t).garden, parsed);
    return { tag: r.tag, level: r.level, lastSeen: r.lastSeen, garden: shown };
  }, []);
  const startVisit = useCallback(
    async (tag: string) => {
      const v = await fetchVisit(tag);
      if (typeof v === 'string') return v;
      setMode({ kind: 'visit', visit: v });
      return null;
    },
    [fetchVisit],
  );
  /** Does something in the garden being visited, and shows it done there at once. */
  const visitAct = useCallback(async (kind: 'water' | 'plant' | 'trim' | 'remove', payload: Record<string, unknown>) => {
    const current = modeRef.current;
    if (current.kind !== 'visit') return null;
    const r = await visitAction(current.visit.tag, kind, payload);
    if ('error' in r) return r.error;
    const t = Date.now();
    setMode((m) => (m.kind === 'visit' ? { ...m, visit: { ...m.visit, garden: applyAction(m.visit.garden, { id: r.id, kind, payload }, t).garden } } : m));
    if (t - current.visit.lastSeen > 6 * 60_000) {
      const w = words(gardenRef.current?.settings.lang ?? 'mixed');
      setNotice({ title: w.t('Done', 'Gotowe'), text: w.t(`#${current.visit.tag} will see it when they next open their garden.`, `#${current.visit.tag} zobaczy to przy następnym otwarciu ogrodu.`) });
    }
    return null;
  }, []);
  /** Opens the post box; she has seen what came, so the letterbox's flag comes down. */
  const openPost = useCallback(() => {
    setGarden((g) => (g ? postSeen(g) : g));
    setMode({ kind: 'post' });
  }, []);
  /** Takes (or changes) her tag in the post; resolves with why not, or null. */
  const claim = useCallback(async (tag: string) => {
    const r = await claimTag(tag);
    if ('error' in r) return r.error;
    setGarden((g) => (g ? setTag(g, r.tag) : g));
    return null;
  }, []);
  // changes sent from the admin page wait until the garden is open and no replay is playing
  useRemoteActions(
    sharing,
    garden !== null && lapse === null,
    gardenRef,
    setGarden,
    (e) => {
      if (e.kind === 'moment') setSent((m) => ({ ...m, [e.moment]: e.until }));
      else if (e.kind === 'trim') setSnip((s) => ({ id: e.plant, n: (s?.n ?? 0) + 1 }));
      else showWatering(e.plant);
    },
    { night: weather.night, sky: weather.sky, season: seasonShown(now) },
    (v) => {
      const n = visitorNotice(v, words(gardenRef.current?.settings.lang ?? 'mixed'));
      if (n) setNotice(n);
    },
  );

  // while visiting, their garden is looked at again now and then, so it stays as it is
  const visitTag = mode.kind === 'visit' ? mode.visit.tag : null;
  useEffect(() => {
    if (!visitTag) return;
    const timer = window.setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      const v = await fetchVisit(visitTag);
      if (typeof v !== 'string') setMode((m) => (m.kind === 'visit' && m.visit.tag === visitTag ? { ...m, visit: v } : m));
    }, 20_000);
    return () => window.clearInterval(timer);
  }, [visitTag, fetchVisit]);
  // her own room shows its colours over the furniture of the room she based it on; while she's
  // painting it, the draft shows instead
  const own = mode.kind === 'roomStudio' ? mode.draft : settings?.useOwn ? settings.own : null;
  const theme = own ? own.base : (settings?.theme ?? 'cozy');
  const uiDark = own ? isDarkRoom(own) : theme === 'witchy';
  const barColor = own ? own.wall : theme === 'cozy' ? '#ecdfc9' : '#2a1d2b';

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', barColor);
  }, [barColor]);

  // the page's language follows hers, so the phone's keyboard and spellcheck do too
  const lang = settings?.lang ?? 'mixed';
  useEffect(() => {
    document.documentElement.lang = lang === 'pl' ? 'pl' : 'en';
  }, [lang]);

  // her candle, the one she's designing while the studio is open; lit by her, or by itself when the room is dim
  const candle = mode.kind === 'candleStudio' ? mode.draft : (settings?.candle ?? null);
  const candleOn = flameOn(settings?.candleLit ?? null, roomIsDim(weather));
  useAmbience(!!settings?.sound, ambientMix(weather, seasonShown(now), new Date(now).getHours(), candleOn));

  if (!garden || !settings) return <div className="garden" style={paletteVars('cozy', weather)} />;
  const { t } = words(settings.lang);

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
    setPictures(await loadPictures(caughtUp));
    setGarden(caughtUp);
    setMode({ kind: 'idle' });
  };

  const today = dayKey(new Date(now));
  const memory = diarySeenOn !== today && onThisDay(garden.diary, today).length > 0;

  const onSlot = (slot: SlotId) => {
    const here = plantAt(garden, slot);
    const drawing = drawingAt(garden, slot);
    const bouquet = bouquetAt(garden, slot);
    if (mode.kind === 'move') {
      const id = mode.id;
      update((g) =>
        g.decor.drawings.some((d) => d.id === id) ? moveDrawing(g, id, slot) : g.bouquets.some((b) => b.id === id) ? moveBouquet(g, id, slot) : movePlant(g, id, slot),
      );
      setMode({ kind: 'idle' });
    } else if (here) {
      setMode(mode.kind === 'card' && mode.id === here.id ? { kind: 'idle' } : { kind: 'card', id: here.id });
    } else if (drawing) {
      setMode(mode.kind === 'drawing' && mode.id === drawing.id ? { kind: 'idle' } : { kind: 'drawing', id: drawing.id });
    } else if (bouquet) {
      setMode(mode.kind === 'bouquet' && mode.id === bouquet.id ? { kind: 'idle' } : { kind: 'bouquet', id: bouquet.id });
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
        setPictureError(t("There wasn't room on the phone to keep that picture.", 'Zabrakło miejsca w telefonie na ten obrazek.'));
        return null;
      }
      const url = URL.createObjectURL(prepared.blob);
      setPictures((p) => ({ ...p, [img]: url }));
      return { img, w: prepared.w, h: prepared.h };
    } catch {
      setPictureError(t("That picture couldn't be opened. A PNG or JPEG works best.", 'Nie udało się otworzyć tego obrazka. Najlepiej działa PNG albo JPEG.'));
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

  const changeMemories = (fn: (m: Memories) => Memories) => update((g) => withMemories(g, fn));

  /** Photos from her gallery, into the album she's looking at; each one shows up as soon as it's ready. */
  const addPhotos = async (album: string | null) => {
    const files = await chooseImages();
    if (!files.length) return;
    setMemoryError(null);
    const room = roomFor(gardenRef.current?.memories ?? garden.memories);
    const list = files.slice(0, Math.max(0, room));
    let failed = 0;
    let full = false;
    for (let i = 0; i < list.length; i++) {
      if (list.length > 1) setMemoryBusy(t(`Adding ${i + 1} of ${list.length}…`, `Dodaję ${i + 1} z ${list.length}…`));
      else setMemoryBusy(t('Adding…', 'Dodaję…'));
      const file = list[i]!;
      try {
        const big = await prepareImage(file, MEMORY_PIXELS.photo, 'jpeg');
        const small = await prepareImage(big.blob, MEMORY_PIXELS.thumb, 'jpeg');
        const taken = photoTakenAt(new Uint8Array(await file.slice(0, 256 * 1024).arrayBuffer()));
        const img = newId();
        const thumb = newId();
        try {
          await putImage(img, big.blob);
          await putImage(thumb, small.blob);
        } catch {
          full = true;
          void deleteImage(img);
          break;
        }
        rememberUrl(thumb, small.blob);
        const picked = file.lastModified > 0 && file.lastModified <= Date.now() ? file.lastModified : Date.now();
        const m: Memory = { id: newId(), kind: 'photo', img, thumb, w: big.w, h: big.h, at: taken ?? picked, caption: '', albums: album ? [album] : [], fav: false, paper: null };
        changeMemories((x) => addMemories(x, [m]));
      } catch {
        failed++;
      }
    }
    setMemoryBusy(null);
    if (full) setMemoryError(t("There isn't room on the phone for more pictures.", 'W telefonie zabrakło miejsca na kolejne zdjęcia.'));
    else if (failed) setMemoryError(t(`${failed} of them couldn't be opened.`, `Nie udało się otworzyć: ${failed}.`));
    else if (files.length > list.length) setMemoryError(t('The album is full.', 'Album jest pełny.'));
  };

  const openEasel = async (album: string | null, again: Memory | null, slot: SlotId | null = null) => {
    const start = again ? await storedUrl(again.img) : null;
    setEasel({ album, again, slot, start, paper: again ? again.paper : slot ? null : 'cream' });
  };

  /** Keeps a painting: in her album, and on the shelf too if she painted it for a place there. Throws if it couldn't be kept. */
  const keepPainting = async (blob: Blob, small: Blob, paper: PaperId | null) => {
    const e = easel;
    if (!e) return;
    const img = newId();
    const thumb = newId();
    await Promise.all([putImage(img, blob), putImage(thumb, small)]);
    rememberUrl(thumb, small);
    if (e.again) {
      const old = e.again;
      changeMemories((x) => editMemory(x, old.id, { img, thumb, w: PAINT_W, h: PAINT_H, at: Date.now(), paper }));
      for (const k of [old.img, old.thumb]) {
        void deleteImage(k);
        forgetUrl(k);
      }
    } else {
      const m: Memory = { id: newId(), kind: 'painting', img, thumb, w: PAINT_W, h: PAINT_H, at: Date.now(), caption: '', albums: e.album ? [e.album] : [], fav: false, paper };
      changeMemories((x) => addMemories(x, [m]));
    }
    if (e.slot) {
      const slot = e.slot;
      const key = newId();
      await putImage(key, blob);
      setPictures((p) => ({ ...p, [key]: URL.createObjectURL(blob) }));
      update((g) => addDrawing(g, { id: newId(), slot, img: key, w: PAINT_W, h: PAINT_H }));
      setMode({ kind: 'idle' });
    }
    setEasel(null);
  };

  /** A copy of a memory's picture, for the room to keep as its own (so deleting one never empties the other). */
  const copyPicture = async (m: Memory) => {
    const blob = await getImage(m.img);
    if (!blob) return null;
    const key = newId();
    try {
      await putImage(key, blob);
    } catch {
      return null;
    }
    setPictures((p) => ({ ...p, [key]: URL.createObjectURL(blob) }));
    return key;
  };

  const hangMemory = async (m: Memory) => {
    const key = await copyPicture(m);
    if (!key) return false;
    const old = gardenRef.current?.decor.photo;
    update((g) => setPhoto(g, { img: key, w: m.w, h: m.h }));
    dropPicture(old?.img);
    return true;
  };

  const shelveMemory = async (m: Memory) => {
    const slot = gardenRef.current && freeShelfSlots(gardenRef.current)[0];
    if (!slot) return false;
    const key = await copyPicture(m);
    if (!key) return false;
    update((g) => (freeShelfSlots(g).includes(slot) ? addDrawing(g, { id: newId(), slot, img: key, w: m.w, h: m.h }) : g));
    return true;
  };

  const forgetMemories = (ids: string[]) => {
    const { unused } = removeMemories(garden.memories, ids);
    changeMemories((x) => removeMemories(x, ids).memories);
    for (const k of unused) {
      void deleteImage(k);
      forgetUrl(k);
    }
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
    showWatering(id);
  };

  // during a replay the garden is drawn as it was at that moment
  const replayRoom = lapse !== null && lapse.grew;
  const shownNow = replayRoom ? lapse.tl.from + (lapse.tl.to - lapse.tl.from) * ease(lapse.p) : now;
  const shown = replayRoom ? { ...garden, plants: gardenAt(lapse.tl, shownNow).plants } : garden;

  // vines show while they're switched on and their plant stands on the sill
  const vines: VineSpec[] = devVineList.length ? devVineList : vineSpecs(garden, shown.plants);

  const cardPlant = mode.kind === 'card' ? garden.plants.find((p) => p.id === mode.id) : undefined;
  const stylePlant = mode.kind === 'style' ? garden.plants.find((p) => p.id === mode.id) : undefined;
  const studioPlant = mode.kind === 'potStudio' && mode.forPlant ? garden.plants.find((p) => p.id === mode.forPlant) : undefined;

  // in someone else's garden only theirs is drawn: two gardens on the page would mix their skies
  if (mode.kind === 'visit') {
    return (
      <LangProvider value={settings.lang}>
        <VisitView visit={mode.visit} now={now} viewH={viewH} onAct={visitAct} onLeave={() => setMode({ kind: 'idle' })} />
        {notice && <NoticeNote notice={notice} onDone={closeNotice} />}
      </LangProvider>
    );
  }

  return (
    <LangProvider value={settings.lang}>
      <div
        className={`garden theme-${theme}${uiDark ? ' ui-dark' : ''}${weather.night ? ' night' : ''}${weather.twilight === 'dusk' ? ' dusk' : ''}${lapse ? ' replaying' : ''}`}
        style={paletteVars(theme, weather, seasonShown(now), own)}
      >
        <ViewSwiper
          view={settings.view}
          enabled={mode.kind === 'idle' && !lapse && !letterOpen && !diaryOpen && !bookOpen && !memoriesOpen && !easel && !welcoming}
          onChange={(view) => setSettings({ view })}
          room={
            <Scene
              theme={theme}
              weather={weather}
              viewH={viewH}
              vines={vines}
              still={lapse !== null}
              snip={snip}
              onBook={openBook}
              paper={paper}
              photoUrl={garden.decor.photo ? (pictures[garden.decor.photo.img] ?? null) : null}
              onFrame={openDecorate}
              onParcels={() => {
                setGarden((g) => (g ? postSeen(g) : g));
                setMode({ kind: 'parcels' });
              }}
              onPost={sharing ? openPost : undefined}
              rainbow={rainbow}
              moments={moments}
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
          }
          shelves={
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
              bouquetId={mode.kind === 'bouquet' ? mode.id : null}
              rainbow={rainbow}
              moments={moments}
              candle={candle}
              candleOn={candleOn}
              onCandle={() => setSettings({ candleLit: !candleOn })}
              wateringId={wateringId}
              onSlot={onSlot}
            />
          }
        />
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
          onMemories={() => setMemoriesOpen(true)}
          onDecorate={openDecorate}
          onBouquet={() => setMode({ kind: 'bouquetStudio' })}
          onPost={openPost}
          postTag={garden.post.tag}
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
            onPaint={isHanging(mode.slot) ? null : () => void openEasel(null, null, mode.slot)}
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
        {welcoming && (
          <Welcome
            onStayHere={() => {
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
        {mode.kind === 'bouquetStudio' && (
          <BouquetStudio
            garden={garden}
            now={now}
            canSend={sharing}
            onClaim={claim}
            onSend={async (b, cutFrom, to) => {
              const { stems, vase, ribbon, note, seed } = b;
              const error = await sendMail(to, 'bouquet', { stems, vase, ribbon, note, seed });
              if (error) return error;
              update((g) => rememberContact(cutStems(g, cutFrom, Date.now()), to));
              setMode({ kind: 'idle' });
              const w = words(settings.lang);
              setNotice({ title: w.t(`On its way to #${to}`, `W drodze do #${to}`), text: w.t('It will be there when they next open their garden.', 'Dotrze, gdy następnym razem otworzą swój ogród.') });
              return null;
            }}
            onKeep={(b, cutFrom) => {
              const t = Date.now();
              update((g) => receiveBouquet(cutStems(g, cutFrom, t), { ...b, at: t }));
              setMode({ kind: 'idle' });
            }}
            onClose={() => setMode({ kind: 'idle' })}
          />
        )}
        {mode.kind === 'bouquet' && garden.bouquets.some((b) => b.id === mode.id) && (
          <BouquetCard
            bouquet={garden.bouquets.find((b) => b.id === mode.id)!}
            onMove={() => setMode({ kind: 'move', id: mode.id })}
            onRemove={() => {
              update((g) => removeBouquet(g, mode.id));
              setMode({ kind: 'idle' });
            }}
            onBlock={
              sharing
                ? async () => {
                    const from = garden.bouquets.find((b) => b.id === mode.id)?.from;
                    if (!from) return;
                    const ok = await setBlocked(from, true);
                    if (ok) setMode({ kind: 'idle' });
                    const w = words(settings.lang);
                    setNotice(
                      ok
                        ? { title: w.t(`No more post from #${from}`, `Bez poczty od #${from}`), text: w.t('You can unblock them in the post box.', 'Możesz to cofnąć w skrzynce pocztowej.') }
                        : { title: w.t('Not blocked', 'Nie zablokowano'), text: w.t("Couldn't reach the post. Try again when you're online.", 'Nie udało się połączyć z pocztą. Spróbuj, gdy będzie internet.') },
                    );
                  }
                : undefined
            }
            onClose={() => setMode({ kind: 'idle' })}
          />
        )}
        {mode.kind === 'post' && (
          <PostSheet
            tag={garden.post.tag}
            contacts={garden.post.contacts}
            parcels={garden.parcels.length}
            onClaim={claim}
            onParcels={() => setMode({ kind: 'parcels' })}
            loadBlocked={loadBlocked}
            onUnblock={(tag) => setBlocked(tag, false)}
            onVisit={startVisit}
            loadAccess={loadAccess}
            onSetAccess={setAccess}
            onClose={() => setMode({ kind: 'idle' })}
          />
        )}
        {notice && <NoticeNote notice={notice} onDone={closeNotice} />}
        {mode.kind === 'parcels' && (
          <ParcelsSheet
            garden={garden}
            onUnpack={(id) => update((g) => unpackParcel(g, id))}
            onRemove={(id) => update((g) => removeBouquet(g, id))}
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
        {mode.kind === 'move' && <MoveBanner text={t('Tap where it should go', 'Stuknij, gdzie ma stanąć')} onCancel={() => setMode({ kind: 'idle' })} />}
        {mode.kind === 'place' && <MoveBanner text={t('Tap a place in the window', 'Stuknij miejsce w oknie')} onCancel={() => setMode({ kind: 'idle' })} />}
        {AWAY && !lapse && mode.kind === 'idle' && (
          <div className="banner" role="status">
            <span>{AWAY_WATER ? t('Demo · watered daily', 'Demo · podlewane codziennie') : t('Demo · never watered', 'Demo · bez podlewania')}</span>
            <button onClick={() => opened.current && playLapse(buildTimelapse(opened.current.garden, opened.current.at - AWAY, opened.current.at), false)}>
              {t('Again', 'Jeszcze raz')}
            </button>
            <button onClick={() => window.location.assign(window.location.pathname)}>{t('Leave', 'Wyjdź')}</button>
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
        {memoriesOpen && (
          <MemoryBook
            memories={garden.memories}
            busy={memoryBusy}
            error={memoryError}
            canShelf={freeShelfSlots(garden).length > 0}
            onChange={changeMemories}
            onAdd={(album) => void addPhotos(album)}
            onPaint={(album, again) => void openEasel(album, again)}
            onRemove={forgetMemories}
            onHang={hangMemory}
            onShelf={shelveMemory}
            onClose={() => {
              setMemoriesOpen(false);
              setMemoryError(null);
            }}
          />
        )}
        {easel && <Paint key={easel.again?.id ?? 'new'} start={easel.start} paper={easel.paper} onSave={keepPainting} onClose={() => setEasel(null)} />}
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
    </LangProvider>
  );
}
