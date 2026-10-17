import { useState } from 'react';
import type { Settings, View } from '../garden/state';
import { SKY_KINDS, type SkyKind, type Weather } from '../theme/palettes';
import type { WeatherStatus } from '../weather/useWeather';

const SUN = (
  <g>
    <circle r="5.5" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <path key={a} transform={`rotate(${a})`} d="M0,-8.5 L0,-10.5" />
    ))}
  </g>
);
const MOON = <path d="M2,-9 A9,9 0 1 0 9,4 A7,7 0 0 1 2,-9 Z" />;
const CLOUD = <path d="M-8,5 C-12,5 -12,0 -8,-0.5 C-8,-5 -2,-7 1,-3.5 C3,-7 9,-6 9,-1 C12,-1 12,5 9,5 Z" />;
const RAIN = (
  <g>
    <path d="M-8,1 C-12,1 -12,-4 -8,-4.5 C-8,-9 -2,-11 1,-7.5 C3,-11 9,-10 9,-5 C12,-5 12,1 9,1 Z" />
    <path d="M-5,5 L-6,9 M0,5 L-1,9 M5,5 L4,9" />
  </g>
);
const MOON_CLOUD = (
  <g>
    <path d="M-1,-11 A7,7 0 1 0 6,-2 A5.4,5.4 0 0 1 -1,-11 Z" />
    <path d="M-6,9 C-10,9 -10,5 -6,4.5 C-6,1 -1,-0.5 1.4,2.4 C3,-0.6 8,0.2 8,4 C10.4,4 10.4,9 8,9 Z" />
  </g>
);

export function weatherIcon(w: Weather): JSX.Element {
  if (w.sky === 'rain') return RAIN;
  if (w.sky === 'cloudy') return w.night ? MOON_CLOUD : CLOUD;
  return w.night ? MOON : SUN;
}

const SKY_ICON: Record<SkyKind, JSX.Element> = { clear: SUN, cloudy: CLOUD, rain: RAIN };
const SKY_NAME: Record<SkyKind, string> = { clear: 'Clear', cloudy: 'Cloudy', rain: 'Rain' };

const VIEW_ICON: Record<View, JSX.Element> = {
  room: <path d="M-9,10 L-9,-2 A9,9 0 0 1 9,-2 L9,10 Z M0,-11 L0,10 M-9,2 L9,2" />,
  shelves: (
    <path d="M-11,-3 L11,-3 M-11,9 L11,9 M-7,-3 L-8,-9 L-3,-9 L-4,-3 M3,-3 L2,-8 L7,-8 L6,-3 M-4,9 L-5,3 L1,3 L0,9" />
  ),
};

function Icon({ children }: { children: JSX.Element }) {
  return <svg viewBox="-14 -14 28 28">{children}</svg>;
}

const STATUS_TEXT: Record<WeatherStatus, string> = {
  live: 'Live weather',
  offline: 'Live weather · offline for now',
  clock: 'Following the clock',
  manual: 'Chosen by you',
};

export function Toolbar({ settings, weather, status, onSettings, onLiveWeather, locating }: {
  settings: Settings;
  weather: Weather;
  status: WeatherStatus;
  onSettings: (patch: Partial<Settings>) => void;
  onLiveWeather: () => void;
  locating: boolean;
}) {
  const [menu, setMenu] = useState(false);
  const other: View = settings.view === 'room' ? 'shelves' : 'room';
  const manual = settings.weatherMode === 'manual';
  // picking a sky keeps the current day or night, and the other way round
  const choose = (patch: Partial<Weather>) => onSettings({ weatherMode: 'manual', manual: { ...weather, ...patch } });
  return (
    <>
      <button
        className="fab left"
        aria-label={other === 'shelves' ? 'Go to the shelves' : 'Go to the window'}
        onClick={() => onSettings({ view: other })}
      >
        <Icon>{VIEW_ICON[other]}</Icon>
      </button>
      <button className="fab right" aria-label="Weather and room" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
        <Icon>{weatherIcon(weather)}</Icon>
        {status === 'live' && <span className="live-dot" />}
      </button>
      {menu && (
        <>
          <div className="scrim" onClick={() => setMenu(false)} />
          <div className="weather-menu" role="dialog" aria-label="Weather and room">
            <p className="hint">{STATUS_TEXT[status]}</p>
            <button
              className="wide"
              aria-pressed={settings.weatherMode === 'live'}
              onClick={() => {
                onLiveWeather();
                setMenu(false);
              }}
              disabled={locating}
            >
              {locating ? 'Finding you…' : settings.location ? 'Live weather' : 'Live weather · uses location'}
            </button>
            <button className="wide" aria-pressed={settings.weatherMode === 'clock'} onClick={() => onSettings({ weatherMode: 'clock' })}>
              Follow the clock
            </button>
            <div className="row three">
              {SKY_KINDS.map((k) => (
                <button key={k} aria-label={SKY_NAME[k]} aria-pressed={manual && weather.sky === k} onClick={() => choose({ sky: k })}>
                  <Icon>{SKY_ICON[k]}</Icon>
                </button>
              ))}
            </div>
            <div className="row two">
              <button aria-label="Day" aria-pressed={manual && !weather.night} onClick={() => choose({ night: false })}>
                <Icon>{SUN}</Icon>
              </button>
              <button aria-label="Night" aria-pressed={manual && weather.night} onClick={() => choose({ night: true })}>
                <Icon>{MOON}</Icon>
              </button>
            </div>
            <p className="hint">Climbing vines</p>
            <div className="row two">
              <button aria-pressed={settings.vines} onClick={() => onSettings({ vines: true })}>
                On
              </button>
              <button aria-pressed={!settings.vines} onClick={() => onSettings({ vines: false })}>
                Off
              </button>
            </div>
            <p className="hint">Room</p>
            <div className="row two">
              <button aria-pressed={settings.theme === 'cozy'} onClick={() => onSettings({ theme: 'cozy' })}>
                Cozy
              </button>
              <button aria-pressed={settings.theme === 'witchy'} onClick={() => onSettings({ theme: 'witchy' })}>
                Witchy
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
