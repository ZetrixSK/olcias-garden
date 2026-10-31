import type { GardenState, SlotId, WindowSpot } from '../garden/state';
import { flameOn } from '../garden/candle';
import { LangProvider } from '../i18n';
import { Scene } from '../scene/Scene';
import { ShelfView } from '../scene/ShelfView';
import { vineSpecs } from '../scene/vineSpecs';
import { candleLit as roomIsDim, paletteVars, type Weather } from '../theme/palettes';
import { seasonShown } from '../theme/seasons';
import type { Moment } from '../weather/moments';

/** The frame her garden is drawn in, at a phone's proportions. */
export const FRAME = { w: 340, h: 600 };

/**
 * Her garden as her phone shows it: her room and colours, her plants and vines, her sky, and any
 * moments still showing. Only her own pictures (wallpaper, photo, drawings) are missing, as they
 * stay on her phone. Tapping a plant picks it; tapping an empty place on the shelves offers planting.
 */
export function World({ garden, weather, now, view, selectedId, moments, onPlant, onEmpty }: {
  garden: GardenState;
  weather: Weather;
  now: number;
  view: 'room' | 'shelves';
  selectedId: string | null;
  moments: readonly Moment[];
  onPlant: (id: string) => void;
  onEmpty: (slot: SlotId) => void;
}) {
  const s = garden.settings;
  const own = s.useOwn ? s.own : null;
  const theme = own ? own.base : s.theme;
  const candleOn = flameOn(s.candleLit, roomIsDim(weather));
  const viewH = (400 * FRAME.h) / FRAME.w;
  const onSpot = (spot: WindowSpot) => {
    const p = garden.plants.find((x) => x.display === spot);
    if (p) onPlant(p.id);
  };
  const onSlot = (slot: SlotId) => {
    const p = garden.plants.find((x) => x.slot === slot);
    if (p) onPlant(p.id);
    else onEmpty(slot);
  };
  return (
    <div className="admin-frame" style={{ width: FRAME.w, height: FRAME.h }}>
      <LangProvider value={s.lang}>
        <div className={`garden theme-${theme}${weather.night ? ' night' : ''}${weather.twilight === 'dusk' ? ' dusk' : ''}`} style={paletteVars(theme, weather, seasonShown(now), own)}>
          <div className="view" key={view}>
            {view === 'room' ? (
              <Scene
                theme={theme}
                weather={weather}
                viewH={viewH}
                vines={vineSpecs(garden)}
                moments={moments}
                candle={s.candle}
                candleOn={candleOn}
                garden={garden}
                now={now}
                selectedId={selectedId}
                placingId={null}
                wateringId={null}
                onSpot={onSpot}
              />
            ) : (
              <ShelfView
                theme={theme}
                weather={weather}
                viewH={viewH}
                garden={garden}
                now={now}
                selectedId={selectedId}
                movingId={null}
                moments={moments}
                candle={s.candle}
                candleOn={candleOn}
                wateringId={null}
                onSlot={onSlot}
              />
            )}
          </div>
        </div>
      </LangProvider>
    </div>
  );
}
