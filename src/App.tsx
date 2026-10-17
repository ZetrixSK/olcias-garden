import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addPlant,
  DEFAULT_SETTINGS,
  cyclePot,
  movePlant,
  placeInWindow,
  plantAt,
  removePlant,
  takeDown,
  updateSettings,
  waterPlant,
  windowPlantAt,
  type GardenState,
  type Settings,
  type SlotId,
  type WindowSpot,
} from './garden/state';
import { loadGarden, saveGarden } from './garden/storage';
import type { SpeciesId } from './garden/species';
import { grainDataUrl } from './grain';
import { Scene } from './scene/Scene';
import { ShelfView } from './scene/ShelfView';
import { paletteVars } from './theme/palettes';
import { MoveBanner, PlantCard, PlantPicker, WindowChooser } from './ui/Sheets';
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
  | { kind: 'choose'; spot: WindowSpot };

export function App() {
  const [garden, setGarden] = useState<GardenState | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'idle' });
  const [wateringId, setWateringId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [now, setNow] = useNow();
  const viewH = useViewHeight();
  const grain = useMemo(() => grainDataUrl(), []);
  const loaded = useRef(false);

  useEffect(() => {
    loadGarden().then((g) => {
      loaded.current = true;
      setGarden(import.meta.env.DEV ? devOverrides(g) : g);
    });
  }, []);

  // save shortly after every change
  useEffect(() => {
    if (!garden || !loaded.current) return;
    const t = window.setTimeout(() => void saveGarden(garden), 250);
    return () => window.clearTimeout(t);
  }, [garden]);

  const update = useCallback((fn: (g: GardenState) => GardenState) => setGarden((g) => (g ? fn(g) : g)), []);
  const settings = garden?.settings;
  const { weather, status } = useWeather(settings ?? DEFAULT_SETTINGS, now);
  const theme = settings?.theme ?? 'cozy';

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'cozy' ? '#ecdfc9' : '#2a1d2b');
  }, [theme]);

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

  const onSlot = (slot: SlotId) => {
    const here = plantAt(garden, slot);
    if (mode.kind === 'move') {
      update((g) => movePlant(g, mode.id, slot));
      setMode({ kind: 'idle' });
    } else if (here) {
      setMode(mode.kind === 'card' && mode.id === here.id ? { kind: 'idle' } : { kind: 'card', id: here.id });
    } else {
      setMode({ kind: 'pick', slot });
    }
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

  const plantSpecies = (species: SpeciesId) => {
    if (mode.kind !== 'pick') return;
    const t = Date.now();
    setNow(t);
    update((g) => addPlant(g, mode.slot, species, t));
    setMode({ kind: 'idle' });
  };

  const water = (id: string) => {
    const t = Date.now();
    setNow(t);
    update((g) => waterPlant(g, id, t));
    setWateringId(id);
    window.setTimeout(() => setWateringId((w) => (w === id ? null : w)), 1900);
  };

  const cardPlant = mode.kind === 'card' ? garden.plants.find((p) => p.id === mode.id) : undefined;

  return (
    <div className="garden" style={paletteVars(theme, weather)}>
      <div className="view" key={settings.view}>
        {settings.view === 'room' ? (
          <Scene
            theme={theme}
            weather={weather}
            viewH={viewH}
            garden={garden}
            now={now}
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
            garden={garden}
            now={now}
            selectedId={cardPlant?.id ?? null}
            movingId={mode.kind === 'move' ? mode.id : null}
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
      />
      {mode.kind === 'pick' && <PlantPicker onPick={plantSpecies} onClose={() => setMode({ kind: 'idle' })} />}
      {mode.kind === 'choose' && (
        <WindowChooser
          plants={garden.plants.filter((p) => p.display === null)}
          now={now}
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
          onPot={() => update((g) => cyclePot(g, cardPlant.id))}
          onRemove={() => {
            update((g) => removePlant(g, cardPlant.id));
            setMode({ kind: 'idle' });
          }}
          onClose={() => setMode({ kind: 'idle' })}
        />
      )}
      {mode.kind === 'move' && <MoveBanner text="Tap where it should go" onCancel={() => setMode({ kind: 'idle' })} />}
      {mode.kind === 'place' && <MoveBanner text="Tap a place in the window" onCancel={() => setMode({ kind: 'idle' })} />}
    </div>
  );
}
