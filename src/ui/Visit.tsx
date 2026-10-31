import { useEffect, useState } from 'react';
import { stageAt } from '../garden/growth';
import { SPECIES, STAGE_LABEL, type SpeciesId } from '../garden/species';
import { freeShelfSlots, isHanging, newId, type GardenState, type SlotId, type WindowSpot } from '../garden/state';
import { ViewSwiper } from './ViewSwiper';
import { flameOn } from '../garden/candle';
import type { Words } from '../i18n';
import { useWords } from '../i18n';
import type { AccessRule, PostError, VisitLevel } from '../remote/client';
import { Scene } from '../scene/Scene';
import { ShelfView } from '../scene/ShelfView';
import { vineSpecs } from '../scene/vineSpecs';
import { candleLit as roomIsDim, paletteVars } from '../theme/palettes';
import { seasonShown } from '../theme/seasons';
import { useWeather } from '../weather/useWeather';
import { ConfirmButton } from './Decorate';
import { cleanTag, postMessage, TagInput, validTag, type Notice } from './Post';
import { PlantPicker } from './Sheets';

export const LEVELS: VisitLevel[] = [0, 1, 2, 3, 4];

export function levelName(l: VisitLevel, { t }: Words): string {
  return [t("Can't visit", 'Nie może wejść'), t('Look', 'Oglądać'), t('Water', 'Podlewać'), t('Tend', 'Doglądać'), t('Everything', 'Wszystko')][l]!;
}

export function levelAbout(l: VisitLevel, { t }: Words): string {
  return [
    t('Your garden stays private.', 'Twój ogród zostaje tylko Twój.'),
    t('They can look around, nothing more.', 'Mogą się rozejrzeć, nic więcej.'),
    t('They can look, and water your plants.', 'Mogą oglądać i podlewać kwiaty.'),
    t('They can water, plant flowers in empty places and trim vines.', 'Mogą podlewać, sadzić w wolnych miejscach i przycinać pnącza.'),
    t('They can do all that, and take plants out too.', 'Mogą to wszystko, a także usuwać rośliny.'),
  ][l]!;
}

/** What she's told when a visitor did something in her garden. */
export function visitorNotice(v: { from: string; kind: string; payload: unknown; before: GardenState }, w: Words): Notice | null {
  const { t } = w;
  const p = typeof v.payload === 'object' && v.payload ? (v.payload as Record<string, unknown>) : {};
  const plant = v.before.plants.find((x) => x.id === p.plant);
  const what = plant ? plant.name ?? w.marker(plant.species) : t('a plant', 'roślinę');
  const who = `#${v.from}`;
  switch (v.kind) {
    case 'water':
      return { title: t(`${who} watered your ${what}`, `${who} podlał(a): ${what}`), text: t('They came to visit your garden.', 'Ktoś odwiedził Twój ogród.') };
    case 'trim':
      return { title: t(`${who} trimmed the vine on your ${what}`, `${who} przyciął/przycięła pnącze: ${what}`), text: '' };
    case 'plant': {
      const species = typeof p.species === 'string' && p.species in SPECIES ? w.marker(p.species as SpeciesId) : t('a flower', 'kwiat');
      return { title: t(`${who} planted a ${species} for you`, `${who} posadził(a) dla Ciebie: ${species}`), text: t('Look on your shelves.', 'Zajrzyj na półki.') };
    }
    case 'remove':
      return { title: t(`${who} took out your ${what}`, `${who} usunął/usunęła: ${what}`), text: t('You can change what visitors may do in the post box.', 'W skrzynce możesz zmienić, co wolno gościom.') };
    default:
      return null;
  }
}

/** Her rules for visitors: one level for anyone who knows her tag, and particular people with their own. */
export function AccessSection({ load, onSet }: { load: () => Promise<AccessRule[] | null>; onSet: (who: string, level: VisitLevel | null) => Promise<boolean> }) {
  const w = useWords();
  const { t } = w;
  const [rules, setRules] = useState<AccessRule[] | null | 'loading'>('loading');
  const [who, setWho] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    void load().then(setRules);
  }, [load]);
  if (rules === 'loading') return <p className="hint">{t('Moment…', 'Chwila…')}</p>;
  if (rules === null) return <p className="hint">{t('This needs the internet.', 'To potrzebuje internetu.')}</p>;
  const anyone = rules.find((r) => r.who === '*')?.level ?? 0;
  const people = rules.filter((r) => r.who !== '*');
  const set = async (target: string, level: VisitLevel | null) => {
    const ok = await onSet(target, level);
    setFailed(!ok);
    if (!ok) return;
    setRules((list) => {
      const rest = (list === 'loading' || list === null ? [] : list).filter((r) => r.who !== target);
      return level === null ? rest : [...rest, { who: target, level }].sort((a, b) => a.who.localeCompare(b.who));
    });
  };
  return (
    <>
      <p className="hint">{t('Anyone who knows your tag can:', 'Każdy, kto zna Twój tag, może:')}</p>
      <div className="level-pick">
        {LEVELS.map((l) => (
          <button key={l} aria-pressed={anyone === l} onClick={() => void set('*', l)}>
            {levelName(l, w)}
          </button>
        ))}
      </div>
      <p className="hint level-about">{levelAbout(anyone, w)}</p>
      <p className="hint">{t('Particular people, whatever the rule above:', 'Wybrane osoby, niezależnie od tego powyżej:')}</p>
      <ul className="people">
        {people.map((r) => (
          <li key={r.who}>
            <span>#{r.who}</span>
            <select value={r.level} onChange={(e) => void set(r.who, Number(e.target.value) as VisitLevel)} aria-label={t(`What #${r.who} can do`, `Co może #${r.who}`)}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{levelName(l, w)}</option>
              ))}
            </select>
            <button aria-label={t(`Forget #${r.who}`, `Usuń #${r.who}`)} onClick={() => void set(r.who, null)}>×</button>
          </li>
        ))}
      </ul>
      <form
        className="claim"
        onSubmit={(e) => {
          e.preventDefault();
          if (!validTag(who)) return;
          void set(who, 2).then(() => setWho(''));
        }}
      >
        <TagInput value={who} onChange={setWho} placeholder={t('their tag', 'ich tag')} />
        <button type="submit" disabled={!validTag(who)}>{t('Add', 'Dodaj')}</button>
      </form>
      {failed && <p className="decor-error">{t("Couldn't save that. Try again when you're online.", 'Nie udało się zapisać. Spróbuj, gdy będzie internet.')}</p>}
    </>
  );
}

/** Going to someone else's garden, by their tag. */
export function VisitStart({ onVisit }: { onVisit: (tag: string) => Promise<PostError | null> }) {
  const w = useWords();
  const { t } = w;
  const [tag, setTag] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<PostError | null>(null);
  return (
    <form
      className="claim"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(await onVisit(cleanTag(tag)));
        setBusy(false);
      }}
    >
      <TagInput value={tag} onChange={(v) => { setTag(v); setError(null); }} placeholder={t('their tag', 'ich tag')} />
      <button type="submit" disabled={!validTag(tag) || busy}>{busy ? t('Moment…', 'Chwila…') : t('Visit', 'Odwiedź')}</button>
      {error && <p className="decor-error">{postMessage(error, w)}</p>}
    </form>
  );
}

export type Visiting = { tag: string; level: VisitLevel; lastSeen: number; garden: GardenState };
type Act = (kind: 'water' | 'plant' | 'trim' | 'remove', payload: Record<string, unknown>) => Promise<PostError | null>;

const ago = (then: number, now: number, { t }: Words) => {
  const m = Math.round((now - then) / 60_000);
  if (m < 6) return t('open right now', 'otwarty teraz');
  if (m < 60) return t(`last open ${m} min ago`, `ostatnio otwarty ${m} min temu`);
  const h = Math.round(m / 60);
  if (h < 36) return t(`last open ${h} h ago`, `ostatnio otwarty ${h} godz. temu`);
  return t(`last open ${Math.round(h / 24)} days ago`, `ostatnio otwarty ${Math.round(h / 24)} dni temu`);
};

/**
 * Someone else's garden, as they see it: their room, their plants, their sky. Tapping a plant
 * offers what their owner allows; what's done waits in their garden until their phone carries it out.
 */
export function VisitView({ visit, now, viewH, onAct, onLeave }: { visit: Visiting; now: number; viewH: number; onAct: Act; onLeave: () => void }) {
  const w = useWords();
  const { t } = w;
  const g = visit.garden;
  const s = g.settings;
  const { weather } = useWeather(s, now);
  const [view, setView] = useState(s.view);
  const [picked, setPicked] = useState<{ kind: 'plant'; id: string } | { kind: 'slot'; slot: SlotId } | null>(null);
  const [watering, setWatering] = useState<string | null>(null);
  const [error, setError] = useState<PostError | null>(null);
  const own = s.useOwn ? s.own : null;
  const theme = own ? own.base : s.theme;
  const candleOn = flameOn(s.candleLit, roomIsDim(weather));
  const plant = picked?.kind === 'plant' ? g.plants.find((p) => p.id === picked.id) : undefined;
  const canPlant = visit.level >= 3;

  const act: Act = async (kind, payload) => {
    setError(null);
    const e = await onAct(kind, payload);
    if (e) setError(e);
    else if (kind === 'water' && typeof payload.plant === 'string') {
      const id = payload.plant;
      setWatering(id);
      window.setTimeout(() => setWatering((x) => (x === id ? null : x)), 1900);
    }
    if (!e && kind !== 'water') setPicked(null);
    return e;
  };

  const onSpot = (spot: WindowSpot) => {
    const p = g.plants.find((x) => x.display === spot);
    if (p) setPicked({ kind: 'plant', id: p.id });
  };
  const onSlot = (slot: SlotId) => {
    const p = g.plants.find((x) => x.slot === slot);
    if (p) setPicked({ kind: 'plant', id: p.id });
    else if (canPlant && !isHanging(slot) && freeShelfSlots(g).includes(slot)) setPicked({ kind: 'slot', slot });
  };

  return (
    <div className="visit-layer">
      <div className={`garden theme-${theme}${weather.night ? ' night' : ''}${weather.twilight === 'dusk' ? ' dusk' : ''}`} style={paletteVars(theme, weather, seasonShown(now), own)}>
        <ViewSwiper view={view} enabled={!picked} onChange={setView}
          room={
            <Scene theme={theme} weather={weather} viewH={viewH} vines={vineSpecs(g)} candle={s.candle} candleOn={candleOn} garden={g} now={now} selectedId={plant?.id ?? null} placingId={null} wateringId={watering} onSpot={onSpot} />
          }
          shelves={
            <ShelfView theme={theme} weather={weather} viewH={viewH} garden={g} now={now} selectedId={plant?.id ?? null} movingId={null} candle={s.candle} candleOn={candleOn} wateringId={watering} onSlot={onSlot} />
          }
        />
      </div>
      <div className="visit-bar">
        <div>
          <strong>{t(`#${visit.tag}'s garden`, `Ogród #${visit.tag}`)}</strong>
          <small>
            {ago(visit.lastSeen, now, w)} · {levelName(visit.level, w).toLowerCase()}
          </small>
        </div>
        <button aria-label={view === 'room' ? t('Go to the shelves', 'Idź do półek') : t('Go to the window', 'Idź do okna')} onClick={() => setView(view === 'room' ? 'shelves' : 'room')}>
          {view === 'room' ? t('Shelves', 'Półki') : t('Window', 'Okno')}
        </button>
        <button className="primary" onClick={onLeave}>{t('Leave', 'Wyjdź')}</button>
      </div>
      {plant && (
        <div className="sheet visit-card" role="dialog" aria-label={plant.name ?? w.flower(plant.species)}>
          <div className="sheet-head">
            <h2>{plant.name ?? w.flower(plant.species)}</h2>
            <button className="close" aria-label={t('Close', 'Zamknij')} onClick={() => setPicked(null)}>×</button>
          </div>
          <p className="hint">{w.flower(plant.species)} · {t(STAGE_LABEL[stageAt(plant.species, plant, now)], { seed: 'Posadzony', seedling: 'Kiełkuje', bud: 'Pąki', bloom: 'Kwitnie' }[stageAt(plant.species, plant, now)])}</p>
          {visit.level < 2 ? (
            <p className="hint">{t('You can look, but not touch.', 'Możesz oglądać, ale nie dotykać.')}</p>
          ) : (
            <div className="row-buttons">
              <button data-sound="water" onClick={() => void act('water', { plant: plant.id })}>{t('Water', 'Podlej')}</button>
              {visit.level >= 3 && plant.vine && <button onClick={() => void act('trim', { plant: plant.id })}>{t('Trim the vine', 'Przytnij pnącze')}</button>}
              {visit.level >= 4 && (
                <ConfirmButton label={t('Take it out', 'Usuń')} confirm={t('Sure? Take it out', 'Na pewno? Usuń')} onConfirm={() => void act('remove', { plant: plant.id })} />
              )}
            </div>
          )}
          {canPlant && <p className="hint">{t('You can also plant something in an empty place on their shelves.', 'Możesz też coś posadzić w wolnym miejscu na ich półkach.')}</p>}
          {error && <p className="decor-error">{postMessage(error, w)}</p>}
        </div>
      )}
      {picked?.kind === 'slot' && (
        <PlantPicker
          // its id is chosen here, so it stays the same plant while their garden is looked at again
          onPick={(species) => void act('plant', { id: newId(), slot: picked.slot, species })}
          onDrawing={null}
          busy={false}
          error={error ? postMessage(error, w) : null}
          onClose={() => setPicked(null)}
        />
      )}
    </div>
  );
}
