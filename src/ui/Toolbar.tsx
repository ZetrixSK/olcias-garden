import { LATEST } from '../changelog';
import { NEWS_ICON } from './WhatsNew';
import { useState } from 'react';
import type { Settings, View } from '../garden/state';
import { SKY_KINDS, type SkyKind, type Weather } from '../theme/palettes';
import type { WeatherStatus } from '../weather/useWeather';
import { CLOCK_ICON } from './Clock';
import { ENVELOPE_ICON } from './Letter';
import { BOOK_ICON } from './PressedBook';
import { DIARY_ICON } from './Diary';
import { BACKUP_ICON } from './Backup';
import { CAMERA_ICON } from './Picture';
import { ambience } from '../sound/ambience';
import { remoteConfigured } from '../remote/client';
import { LANGS, useWords, type Lang } from '../i18n';

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
const SKY_NAME: Record<SkyKind, [string, string]> = { clear: ['Clear', 'Pogodnie'], cloudy: ['Cloudy', 'Pochmurno'], rain: ['Rain', 'Deszcz'] };

const VIEW_ICON: Record<View, JSX.Element> = {
  room: <path d="M-9,10 L-9,-2 A9,9 0 0 1 9,-2 L9,10 Z M0,-11 L0,10 M-9,2 L9,2" />,
  shelves: (
    <path d="M-11,-3 L11,-3 M-11,9 L11,9 M-7,-3 L-8,-9 L-3,-9 L-4,-3 M3,-3 L2,-8 L7,-8 L6,-3 M-4,9 L-5,3 L1,3 L0,9" />
  ),
};

/** A photo album with a little picture on its cover. */
const ALBUM_ICON = (
  <g>
    <path d="M-9,-9 L8,-9 L8,9 L-9,9 Z M-6,-9 L-6,9 M-2.5,-5.5 L5,-5.5 L5,1.5 L-2.5,1.5 Z M-2.5,-0.5 L0,-3 L2,-1 L3,-2 L5,0" />
    <path d="M-2,5.5 L4.5,5.5" />
  </g>
);

function Icon({ children }: { children: JSX.Element }) {
  return <svg viewBox="-14 -14 28 28">{children}</svg>;
}

const STATUS_TEXT: Record<WeatherStatus, [string, string]> = {
  live: ['Live weather', 'Prawdziwa pogoda'],
  offline: ['Live weather · offline for now', 'Prawdziwa pogoda · na razie bez internetu'],
  clock: ['Following the clock', 'Według zegara'],
  manual: ['Chosen by you', 'Wybrana przez Ciebie'],
};

/** Each language, named in itself, and what it means. */
const LANG_NAME: Record<Lang, string> = { pl: 'Polski', en: 'English', mixed: 'EN+PL' };
const LANG_ABOUT: Record<Lang, string> = {
  pl: 'Wszystko po polsku',
  en: 'Everything in English',
  mixed: 'English, with Polish flower names',
};

export function Toolbar({ settings, weather, status, onSettings, onLiveWeather, locating, onLetter, onDiary, memory, onBook, onMemories, onNews, newsUnseen, onBackup, onPicture, onDecorate, onBouquet, onPost, postTag, onClock, onStudio, onOwnRoom }: {
  settings: Settings;
  weather: Weather;
  status: WeatherStatus;
  onSettings: (patch: Partial<Settings>) => void;
  onLiveWeather: () => void;
  locating: boolean;
  onLetter: () => void;
  onDiary: () => void;
  /** Whether the diary has a page from this day in an earlier year. */
  memory: boolean;
  onBackup: () => void;
  onPicture: () => void;
  onBook: () => void;
  onMemories: () => void;
  onNews: () => void;
  /** A version she hasn't looked at in "What's new" yet. */
  newsUnseen: boolean;
  onBouquet: () => void;
  onPost: () => void;
  /** Her tag in the post, if she has one. */
  postTag: string | null;
  onDecorate: () => void;
  /** Shows her own room, opening the room painter first if she hasn't made one yet (or to change it). */
  onOwnRoom: (edit: boolean) => void;
  onClock: () => void;
  onStudio: (what: 'pot' | 'pansy' | 'candle') => void;
}) {
  const [menu, setMenu] = useState(false);
  const other: View = settings.view === 'room' ? 'shelves' : 'room';
  const manual = settings.weatherMode === 'manual';
  // picking a sky keeps the current day or night, and the other way round
  const choose = (patch: Partial<Weather>) => onSettings({ weatherMode: 'manual', manual: { ...weather, ...patch } });
  const w = useWords();
  const { t } = w;
  const menuName = t('Weather and room', 'Pogoda i pokój');
  return (
    <>
      <button
        className="fab left"
        aria-label={other === 'shelves' ? t('Go to the shelves', 'Przejdź do półek') : t('Go to the window', 'Przejdź do okna')}
        onClick={() => onSettings({ view: other })}
      >
        <Icon>{VIEW_ICON[other]}</Icon>
      </button>
      {settings.letter !== 'deleted' && (
        <button
          className={settings.letter === 'unread' ? 'fab left second letter-fab unread' : 'fab left second letter-fab'}
          aria-label={t('A letter', 'List')}
          onClick={onLetter}
        >
          <Icon>{ENVELOPE_ICON}</Icon>
        </button>
      )}
      <button className={settings.letter !== 'deleted' ? 'fab left third' : 'fab left second'} aria-label={t('Diary', 'Pamiętnik')} data-sound="page" onClick={onDiary}>
        <Icon>{DIARY_ICON}</Icon>
        {memory && <span className="memory-dot" />}
      </button>
      <button className="fab right second" aria-label={t('While you were away', 'Kiedy Cię nie było')} onClick={onClock}>
        <Icon>{CLOCK_ICON}</Icon>
      </button>
      <button className="fab right" aria-label={menuName} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
        <Icon>{weatherIcon(weather)}</Icon>
        {status === 'live' && <span className="live-dot" />}
        {newsUnseen && <span className="news-dot" aria-hidden="true" />}
      </button>
      {menu && (
        <>
          <div className="scrim" onClick={() => setMenu(false)} />
          <div className="weather-menu" role="dialog" aria-label={menuName}>
            <p className="hint">{t(...STATUS_TEXT[status])}</p>
            <button
              className="wide"
              aria-pressed={settings.weatherMode === 'live'}
              onClick={() => {
                onLiveWeather();
                setMenu(false);
              }}
              disabled={locating}
            >
              {locating
                ? t('Finding you…', 'Szukam Cię…')
                : settings.location
                  ? t('Live weather', 'Prawdziwa pogoda')
                  : t('Live weather · uses location', 'Prawdziwa pogoda · użyje lokalizacji')}
            </button>
            <button className="wide" aria-pressed={settings.weatherMode === 'clock'} onClick={() => onSettings({ weatherMode: 'clock' })}>
              {t('Follow the clock', 'Według zegara')}
            </button>
            <div className="row three">
              {SKY_KINDS.map((k) => (
                <button key={k} aria-label={t(...SKY_NAME[k])} aria-pressed={manual && weather.sky === k} onClick={() => choose({ sky: k })}>
                  <Icon>{SKY_ICON[k]}</Icon>
                </button>
              ))}
            </div>
            <div className="row two">
              <button aria-label={t('Day', 'Dzień')} aria-pressed={manual && !weather.night} onClick={() => choose({ night: false })}>
                <Icon>{SUN}</Icon>
              </button>
              <button aria-label={t('Night', 'Noc')} aria-pressed={manual && weather.night} onClick={() => choose({ night: true })}>
                <Icon>{MOON}</Icon>
              </button>
            </div>
            <button
              className="wide with-icon"
              onClick={() => {
                setMenu(false);
                onBook();
              }}
            >
              <Icon>{BOOK_ICON}</Icon>
              {t('Pressed flowers', 'Zielnik')}
            </button>
            <button
              className="wide with-icon"
              onClick={() => {
                setMenu(false);
                onMemories();
              }}
            >
              <Icon>{ALBUM_ICON}</Icon>
              {t('Memories', 'Wspomnienia')}
            </button>
            <button
              className="wide with-icon"
              onClick={() => {
                setMenu(false);
                onPicture();
              }}
            >
              <Icon>{CAMERA_ICON}</Icon>
              {t('Save a picture', 'Zapisz obrazek')}
            </button>
            <button
              className="wide with-icon news-button"
              onClick={() => {
                setMenu(false);
                onNews();
              }}
            >
              <Icon>{NEWS_ICON}</Icon>
              <span>{t("What's new", 'Co nowego')}</span>
              <small>v{LATEST.replace(/\.0$/, '')}</small>
              {newsUnseen && <span className="news-dot inline" aria-label={t('new', 'nowe')} />}
            </button>
            <p className="hint">{t('Design your own', 'Zaprojektuj coś swojego')}</p>
            <button
              className="wide two-line"
              onClick={() => {
                setMenu(false);
                onDecorate();
              }}
            >
              {t('Decorate', 'Dekoracje')}
              <small>{t('wallpaper, photo, drawings', 'tapeta, zdjęcie, rysunki')}</small>
            </button>
            <button
              className="wide two-line"
              onClick={() => {
                setMenu(false);
                onBouquet();
              }}
            >
              {t('Make a bouquet', 'Ułóż bukiet')}
              <small>{t('from your flowers in bloom', 'z kwitnących kwiatów')}</small>
            </button>
            <div className="row three">
              {(
                [
                  ['pansy', w.lang === 'en' ? 'Pansy' : t('Bratek', 'Bratek')],
                  ['pot', t('Pot', 'Doniczka')],
                  ['candle', t('Candle', 'Świeca')],
                ] as const
              ).map(([what, name]) => (
                <button
                  key={what}
                  onClick={() => {
                    setMenu(false);
                    onStudio(what);
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
            <p className="hint">{t('Sounds', 'Dźwięki')}</p>
            <div className="row two">
              <button
                aria-pressed={settings.sound}
                onClick={() => {
                  // a phone only lets sound start straight from a tap
                  ambience()?.start();
                  onSettings({ sound: true });
                }}
              >
                {t('On', 'Wł.')}
              </button>
              <button aria-pressed={!settings.sound} onClick={() => onSettings({ sound: false })}>
                {t('Off', 'Wył.')}
              </button>
            </div>
            <p className="hint">{t('Climbing vines', 'Pnącza')}</p>
            <div className="row two">
              <button aria-pressed={settings.vines} onClick={() => onSettings({ vines: true })}>
                {t('On', 'Wł.')}
              </button>
              <button aria-pressed={!settings.vines} onClick={() => onSettings({ vines: false })}>
                {t('Off', 'Wył.')}
              </button>
            </div>
            <p className="hint">{t('Room', 'Pokój')}</p>
            <div className="row three">
              <button aria-pressed={!settings.useOwn && settings.theme === 'cozy'} onClick={() => onSettings({ theme: 'cozy', useOwn: false })}>
                {t('Cozy', 'Przytulny')}
              </button>
              <button aria-pressed={!settings.useOwn && settings.theme === 'witchy'} onClick={() => onSettings({ theme: 'witchy', useOwn: false })}>
                {t('Witchy', 'Wiedźmowy')}
              </button>
              <button
                aria-pressed={settings.useOwn}
                onClick={() => {
                  if (!settings.own) setMenu(false);
                  onOwnRoom(false);
                }}
              >
                {t('Mine', 'Mój')}
              </button>
            </div>
            {settings.useOwn && (
              <button
                className="wide"
                onClick={() => {
                  setMenu(false);
                  onOwnRoom(true);
                }}
              >
                {t("Change my room's colours", 'Zmień kolory pokoju')}
              </button>
            )}
            <p className="hint">{t('Keep it safe', 'Kopia zapasowa')}</p>
            <button
              className="wide with-icon"
              onClick={() => {
                setMenu(false);
                onBackup();
              }}
            >
              <Icon>{BACKUP_ICON}</Icon>
              {t('Backup · save or restore', 'Zapisz albo przywróć')}
            </button>
            {remoteConfigured && (
              <>
                <p className="hint">{t('Post', 'Poczta')}</p>
                <button
                  className="wide two-line"
                  onClick={() => {
                    setMenu(false);
                    onPost();
                  }}
                >
                  {t('Post box', 'Skrzynka pocztowa')}
                  <small>{settings && postTag ? `#${postTag}` : t('send and get bouquets', 'wysyłaj i dostawaj bukiety')}</small>
                </button>
                {/* her diary and the notes in her book stay on the phone unless she shares them */}
                <p className="hint">{t('Diary and notes', 'Pamiętnik i notatki')}</p>
                <div className="row two">
                  <button aria-pressed={!settings.shareNotes} onClick={() => onSettings({ shareNotes: false })}>
                    {t('Just for me', 'Tylko dla mnie')}
                  </button>
                  <button aria-pressed={settings.shareNotes} onClick={() => onSettings({ shareNotes: true })}>
                    {t('Shared', 'Wspólne')}
                  </button>
                </div>
              </>
            )}
            <p className="hint">Language · Język</p>
            <div className="row three">
              {LANGS.map((l) => (
                <button key={l} lang={l === 'pl' ? 'pl' : 'en'} aria-pressed={settings.lang === l} aria-label={`${LANG_NAME[l]}: ${LANG_ABOUT[l]}`} onClick={() => onSettings({ lang: l })}>
                  {LANG_NAME[l]}
                </button>
              ))}
            </div>
            <p className="hint lang-about">{LANG_ABOUT[settings.lang]}</p>
            {/* Polish says things differently to her and to him; English doesn't, so it's only asked here */}
            {settings.lang === 'pl' && (
              <>
                <p className="hint">Zwracaj się do mnie</p>
                <div className="row two">
                  <button aria-pressed={settings.me === 'she'} onClick={() => onSettings({ me: 'she' })}>
                    jak do niej
                  </button>
                  <button aria-pressed={settings.me === 'he'} onClick={() => onSettings({ me: 'he' })}>
                    jak do niego
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
