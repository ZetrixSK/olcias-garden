import { MysterySeedsArt } from './Packages';
import { whoHasSeeds, type VisitorId } from '../garden/visitors';
import { say, VISITOR_NAME } from './visitorWords';
import { useState, type ReactNode } from 'react';
import { isSoilWet, nextStage, stageAt, waterWouldHelp } from '../garden/growth';
import { MAX_NAME } from '../garden/pressed';
import {
  designRef,
  PANSY_PRESETS,
  POT_SHAPES,
  type Designs,
  type PotRef,
} from '../garden/designs';
import { SPECIES, SPECIES_IDS, type SpeciesId, type Stage } from '../garden/species';
import { useWords, words, type Words } from '../i18n';
import { MAX_GARDEN_NAME, type Plant, type SeedPacket } from '../garden/state';
import { TRAIT_WORDS } from './traitWords';
import { pansyPalette } from '../plants/looks';
import { PansyFlower } from '../plants/Pansy';
import { Sign } from '../scene/Room';
import type { Theme } from '../theme/palettes';
import { plantLook } from '../plants/looks';
import { PlantArt } from '../plants/PlantArt';
import { Potted } from '../plants/Pots';

/** A plant drawn small for a sheet, styled the way she has styled it. */
function Preview({ species, stage = 'bloom', pot, variety = null, designs }: {
  species: SpeciesId;
  stage?: Stage;
  pot?: PotRef;
  variety?: string | null;
  designs?: Designs;
}) {
  const look = plantLook({ species, pot: pot ?? SPECIES[species].pot, variety }, designs ?? { pansies: [], pots: [] });
  return (
    <svg viewBox="-56 -150 112 210" aria-hidden="true">
      <Potted kind={look.shape} design={look.pot}>
        <PlantArt species={species} stage={stage} palette={look.palette} />
      </Potted>
    </svg>
  );
}

const PENCIL = <path d="M-6,6 L-5,2 L4,-7 L7,-4 L-2,5 Z M2,-5 L5,-2" />;

/** A tile in a chooser grid, with an optional little pencil for things she made herself. */
function Tile({ label, sub, selected, onPick, onEdit, children }: {
  label: string;
  sub?: string;
  selected?: boolean;
  onPick: () => void;
  onEdit?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="tile">
      <button aria-pressed={selected} onClick={onPick}>
        {children}
        <span className="pl">{label}</span>
        {sub && <span className="en">{sub}</span>}
      </button>
      {onEdit && (
        <button className="tile-edit" aria-label={label} onClick={onEdit}>
          <svg viewBox="-10 -10 20 20" aria-hidden="true">{PENCIL}</svg>
        </button>
      )}
    </div>
  );
}

function NewTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="tile">
      <button className="new" onClick={onClick}>
        <svg viewBox="-20 -20 40 40" aria-hidden="true">
          <path d="M0,-9 L0,9 M-9,0 L9,0" />
        </svg>
        <span className="pl">{label}</span>
      </button>
    </div>
  );
}

/** After choosing to plant a bratek: which colours it will bloom in. */
export function VarietyPicker({ designs, hidden, onPick, onDesign, onEdit, onClose }: {
  designs: Designs;
  /** Designs still a secret (mystery seeds), left out of the list. */
  hidden?: Set<string>;
  onPick: (variety: string) => void;
  onDesign: () => void;
  onEdit: (id: string) => void;
  onClose: () => void;
}) {
  const w = useWords();
  const title = w.lang === 'en' ? 'Which pansy?' : w.t('Which bratek?', 'Jaki bratek?');
  return (
    <div className="sheet" role="dialog" aria-label={title}>
      <div className="sheet-head">
        <h2>{title}</h2>
        <button className="close" aria-label={w.t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      <div className="picker scroll">
        {PANSY_PRESETS.map((v) => (
          <Tile key={v} label={w.preset(v)} onPick={() => onPick(v)}>
            <Preview species="pansy" variety={v} designs={designs} />
          </Tile>
        ))}
        {designs.pansies.filter((d) => !hidden?.has(designRef(d.id))).map((d) => (
          <Tile key={d.id} label={d.name || w.t('Mine', 'Mój')} onPick={() => onPick(designRef(d.id))} onEdit={() => onEdit(d.id)}>
            <Preview species="pansy" variety={designRef(d.id)} designs={designs} />
          </Tile>
        ))}
        <NewTile label={w.t('Design one', 'Zaprojektuj')} onClick={onDesign} />
      </div>
    </div>
  );
}

/** How a plant looks: its pot, and for a bratek its colours. */
export function StyleSheet({ plant, designs, hidden, now, onPot, onVariety, onPaint, onEditPot, onDesignPansy, onEditPansy, onClose }: {
  plant: Plant;
  designs: Designs;
  /** Designs still a secret (mystery seeds), left out of the list. */
  hidden?: Set<string>;
  now: number;
  onPot: (pot: PotRef) => void;
  onVariety: (variety: string) => void;
  onPaint: () => void;
  onEditPot: (id: string) => void;
  onDesignPansy: () => void;
  onEditPansy: (id: string) => void;
  onClose: () => void;
}) {
  const w = useWords();
  const stage = stageAt(plant.species, plant, now);
  const variety = plant.variety ?? 'mix';
  return (
    <div className="sheet" role="dialog" aria-label={w.t('Style', 'Wygląd')}>
      <div className="sheet-head">
        <h2>
          {w.flower(plant.species)} <small>{w.t('style', 'wygląd')}</small>
        </h2>
        <button className="close" aria-label={w.t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      <h3 className="sheet-sub">{w.t('Pot', 'Doniczka')}</h3>
      <div className="picker scroll">
        {POT_SHAPES.map((pot) => (
          <Tile key={pot} label="" selected={plant.pot === pot} onPick={() => onPot(pot)}>
            <Preview species={plant.species} stage={stage} pot={pot} variety={plant.variety} designs={designs} />
          </Tile>
        ))}
        {designs.pots.map((d) => (
          <Tile key={d.id} label="" selected={plant.pot === designRef(d.id)} onPick={() => onPot(designRef(d.id))} onEdit={() => onEditPot(d.id)}>
            <Preview species={plant.species} stage={stage} pot={designRef(d.id)} variety={plant.variety} designs={designs} />
          </Tile>
        ))}
        <NewTile label={w.t('Paint one', 'Pomaluj')} onClick={onPaint} />
      </div>
      {plant.species === 'pansy' && !(plant.mystery && stage !== 'bloom') && (
        <>
          <h3 className="sheet-sub">{w.t('Flowers', 'Kwiaty')}</h3>
          <div className="picker scroll">
            {PANSY_PRESETS.map((v) => (
              <Tile key={v} label={w.preset(v)} selected={variety === v} onPick={() => onVariety(v)}>
                <Preview species="pansy" pot={plant.pot} variety={v} designs={designs} />
              </Tile>
            ))}
            {designs.pansies.filter((d) => !hidden?.has(designRef(d.id))).map((d) => (
              <Tile key={d.id} label={d.name || w.t('Mine', 'Mój')} selected={variety === designRef(d.id)} onPick={() => onVariety(designRef(d.id))} onEdit={() => onEditPansy(d.id)}>
                <Preview species="pansy" pot={plant.pot} variety={designRef(d.id)} designs={designs} />
              </Tile>
            ))}
            <NewTile label={w.t('Design one', 'Zaprojektuj')} onClick={onDesignPansy} />
          </div>
        </>
      )}
    </div>
  );
}

/** A long single word is set a little smaller so it fits its tile; names of two words wrap instead. */
function fitName(name: string): { fontSize: string } | undefined {
  const longest = Math.max(...name.split(' ').map((part) => part.length));
  return longest > 8 ? { fontSize: `${Math.max(10.5, (14 * 8.4) / longest).toFixed(1)}px` } : undefined;
}

const WINDOW_ICON = <path d="M-8,10 L-8,-2 A8,8 0 0 1 8,-2 L8,10 Z M0,-10 L0,10 M-8,2 L8,2" />;

/** Naming the garden: the sign changes as she types; an empty name brings back "Olcia's garden". */
export function GardenNameSheet({ theme, name, onChange, onClose }: { theme: Theme; name: string | null; onChange: (name: string | null) => void; onClose: () => void }) {
  const w = useWords();
  const { t } = w;
  return (
    <div className="sheet garden-name" role="dialog" aria-label={t('Name the garden', 'Nazwij ogród')}>
      <div className="sheet-head">
        <h2>{t('Name the garden', 'Nazwij ogród')}</h2>
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      {/* the sign itself, as it will hang: the one on the wall may be behind the keyboard */}
      <svg className="sign-preview" viewBox="122 556 156 84" aria-hidden="true">
        <Sign theme={theme} name={name} />
      </svg>
      <input
        className="name-input"
        value={name ?? ''}
        maxLength={MAX_GARDEN_NAME}
        placeholder={t("Olcia's garden", 'Ogródek Olci')}
        aria-label={t("The garden's name", 'Nazwa ogrodu')}
        enterKeyHint="done"
        onChange={(e) => onChange(e.target.value || null)}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
      />
      <p className="name-count" aria-hidden="true">
        {(name ?? '').length} / {MAX_GARDEN_NAME}
      </p>
      <div className="actions two">
        <button className="quiet" disabled={!name} onClick={() => onChange(null)}>
          {t('Back to the original', 'Przywróć oryginalną')}
        </button>
        <button onClick={onClose}>{t('Done', 'Gotowe')}</button>
      </div>
    </div>
  );
}

/** A paper seed packet with her bratek painted on the front, and how many seeds are left in it. */
function SeedPacketArt({ packet, designs }: { packet: SeedPacket; designs: Designs }) {
  if (packet.mystery) return <MysterySeedsArt />;
  const c = pansyPalette(packet.variety, designs)[0]!;
  return (
    <svg viewBox="-24 -32 48 62" aria-hidden="true">
      <path className="ink" fill="#e9d6b0" d="M-18,-22 L18,-22 L18,26 L-18,26 Z" />
      <path className="ink" fill="#dcc497" d="M-18,-22 L-14,-28 L14,-28 L18,-22 Z" />
      <path d="M-15,-17 L15,-17 M-15,21 L15,21" stroke="#b9925e" strokeWidth="0.8" strokeDasharray="2 2" />
      <PansyFlower x={0} y={2} s={0.62} c={c} />
    </svg>
  );
}

export function PlantPicker({ onPick, onDrawing, onPaint, seeds = [], designs, onSow, busy, error, onClose, unlocked, met = [] }: {
  onPick: (s: SpeciesId) => void;
  /** The flowers she can plant; the others show as outlines, with whose seeds they are. */
  unlocked?: readonly SpeciesId[];
  /** Visitors she has met, so the hint can name who has the seeds. */
  met?: readonly VisitorId[];
  /** Her seed tin: packets of her own designs, sown one seed at a time. */
  seeds?: SeedPacket[];
  designs?: Designs;
  onSow?: (packetId: string) => void;
  /** Present on the shelves (not the hanging pots): stand one of her drawings here instead, or paint one. */
  onDrawing: (() => void) | null;
  onPaint: (() => void) | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const w = useWords();
  const [asked, setAsked] = useState<SpeciesId | null>(null);
  const open = (s: SpeciesId) => !unlocked || unlocked.includes(s);
  const keeper = asked ? whoHasSeeds(asked) : null;
  return (
    <div className="sheet" role="dialog" aria-label={w.t('Plant something', 'Posadź coś')}>
      <div className="sheet-head">
        <h2>{w.t('What shall we plant?', 'Co posadzimy?')}</h2>
        <button className="close" aria-label={w.t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      {seeds.length > 0 && designs && onSow && (
        <>
          <p className="meta seed-tin-title">{w.t('From your seed tin', 'Z Twojej puszki z nasionami')}</p>
          <div className="seed-tin">
            {seeds.map((packet) => {
              const name = packet.mystery
                ? w.t('Mystery seeds', 'Tajemnicze nasiona')
                : designs.pansies.find((d) => designRef(d.id) === packet.variety)?.name || w.flower('pansy');
              return (
                <button key={packet.id} data-sound="soil" onClick={() => onSow(packet.id)} aria-label={`${name}, ${packet.count}`}>
                  <SeedPacketArt packet={packet} designs={designs} />
                  <span className={`seed-name${packet.mystery ? " wrap" : ""}`}>{name}</span>
                  <span className="seed-count">× {packet.count}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
      <div className="picker">
        {SPECIES_IDS.map((s) =>
          open(s) ? (
            <button key={s} data-sound="soil" onClick={() => onPick(s)}>
              <Preview species={s} />
              <span className="pl" style={fitName(w.flower(s))}>
                {w.flower(s)}
              </span>
              {w.flowerSub(s) && <span className="en">{w.flowerSub(s)}</span>}
            </button>
          ) : (
            <button key={s} className="locked" aria-pressed={asked === s} onClick={() => setAsked((a) => (a === s ? null : s))}>
              <Preview species={s} />
              <span className="pl">?</span>
            </button>
          ),
        )}
      </div>
      {asked && (
        <p className="hint locked-hint">
          {w.t('Not yet: ', 'Jeszcze nie: ')}
          {keeper && met.includes(keeper)
            ? w.t(`${say(w, VISITOR_NAME[keeper])} has these seeds. Make them a bouquet when they knock.`, `te nasiona ma ${say(w, VISITOR_NAME[keeper])}. Ułóż bukiet, kiedy zapuka.`)
            : w.t('one of your visitors has these seeds. Make them a bouquet when they knock.', 'te nasiona ma ktoś z gości. Ułóż mu bukiet, kiedy zapuka.')}
        </p>
      )}
      {onDrawing && (
        <div className="press-row">
          <button onClick={onDrawing} disabled={busy}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">
              <path d="M-10,-9 L10,-9 L10,9 L-10,9 Z M-10,5 L-3,-1 L2,4 L5,1 L10,6" />
              <circle cx="4" cy="-4" r="2" />
            </svg>
            {busy ? w.t('Adding…', 'Dodaję…') : w.t('One of my drawings', 'Mój rysunek')}
          </button>
          {onPaint && (
            <button onClick={onPaint}>
              <svg viewBox="-14 -14 28 28" aria-hidden="true">
                <path d="M9,-10 L-1,1 M-1,1 C-4,0.5 -7.5,3.5 -8,9.5 C-2,9 1,6 0.5,2.5" />
              </svg>
              {w.t('Paint one here', 'Namaluj coś tutaj')}
            </button>
          )}
          {error && <p className="decor-error">{error}</p>}
        </div>
      )}
    </div>
  );
}

const NEXT_VERB: Record<Stage, string> = { seed: '', seedling: 'Sprouts', bud: 'Buds', bloom: 'Blooms' };
const NEXT_VERB_PL: Record<Stage, string> = { seed: '', seedling: 'Wykiełkuje', bud: 'Wypuści pąki', bloom: 'Zakwitnie' };
const HOUR = 3_600_000;

/**
 * Roughly when something will happen, in words rather than a countdown: "any moment now",
 * "in a couple of hours", "tomorrow morning", "in about 3 days".
 */
export function whenText(inMs: number, now: number, w: Words = words('mixed')): string {
  const { t } = w;
  const min = inMs / 60_000;
  if (min <= 2) return t('any moment now', 'lada chwila');
  if (min < 15) return t('in a few minutes', 'za kilka minut');
  if (min < 50) return t('within the hour', 'w ciągu godziny');
  if (inMs < 2.5 * HOUR) return t('in a couple of hours', 'za parę godzin');
  if (inMs < 6 * HOUR) return t('in a few hours', 'za kilka godzin');
  const at = new Date(now + inMs);
  const today = new Date(now);
  const days = Math.round((new Date(at).setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) / 86_400_000);
  const h = at.getHours();
  const part = h < 5 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  const partPl = { night: 'w nocy', morning: 'rano', afternoon: 'po południu', evening: 'wieczorem' }[part];
  if (days === 0) return part === 'evening' ? t('this evening', 'dziś wieczorem') : t('later today', 'jeszcze dziś');
  if (days === 1) return part === 'night' ? t('overnight', 'w nocy') : t(`tomorrow ${part}`, `jutro ${partPl}`);
  return t(`in about ${days} days`, `za jakieś ${days} dni`);
}

/** The line on a plant's card that says roughly when it grows next. */
export function growthText(plant: Plant, now: number, w: Words = words('mixed')): string {
  const next = nextStage(plant.species, plant, now);
  if (!next) return w.t('In full bloom', 'W pełnym rozkwicie');
  const sooner = waterWouldHelp(plant, now) && next.inMs > 30 * 60_000 ? w.t(' · sooner with water', ' · szybciej po podlaniu') : '';
  return `${(w.pl ? NEXT_VERB_PL : NEXT_VERB)[next.stage]} ${whenText(next.inMs, now, w)}${sooner}`;
}

/** The plant's name in its card's title, editable in place. */
function PlantTitle({ plant, onName }: { plant: Plant; onName: (name: string) => void }) {
  const w = useWords();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(plant.name ?? '');
  const save = () => {
    onName(draft);
    setEditing(false);
  };
  if (editing) {
    return (
      <form
        className="name-edit"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          autoFocus
          value={draft}
          maxLength={MAX_NAME}
          placeholder={w.t(`Name this ${w.marker(plant.species)}`, 'Nadaj imię')}
          aria-label={w.t('Name', 'Imię')}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
        />
        <button type="submit">{w.t('Done', 'Gotowe')}</button>
      </form>
    );
  }
  return (
    <h2>
      {plant.name ? (
        <>
          {plant.name} <small>{w.marker(plant.species)}</small>
        </>
      ) : (
        <>
          {w.flower(plant.species)} {w.flowerSub(plant.species) && <small>{w.flowerSub(plant.species)}</small>}
        </>
      )}
      <button className="name-pencil" aria-label={plant.name ? w.t('Rename', 'Zmień imię') : w.t('Give it a name', 'Nadaj imię')} onClick={() => setEditing(true)}>
        <svg viewBox="-14 -14 28 28" aria-hidden="true">
          <path d="M-7,7 L-6,2 L5,-9 L9,-5 L-2,6 Z M2,-6 L6,-2" />
        </svg>
      </button>
    </h2>
  );
}

function plantedText(plant: Plant, now: number, w: Words): string {
  const days = Math.floor((now - plant.plantedAt) / 86_400_000);
  if (days <= 0) return w.t('Planted today', 'W ziemi od dziś');
  if (days === 1) return w.t('Planted yesterday', 'W ziemi od wczoraj');
  return w.t(`Planted ${days} days ago`, `W ziemi od ${days} dni`);
}

/** Which of her plants goes into an empty window spot. */
export function WindowChooser({ plants, now, designs, onPick, onShelves, onClose }: {
  plants: Plant[];
  now: number;
  designs: Designs;
  onPick: (id: string) => void;
  onShelves: () => void;
  onClose: () => void;
}) {
  const w = useWords();
  return (
    <div className="sheet" role="dialog" aria-label={w.t('Put a plant in the window', 'Postaw roślinę w oknie')}>
      <div className="sheet-head">
        <h2>{w.t('Which one goes here?', 'Która tu stanie?')}</h2>
        <button className="close" aria-label={w.t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      {plants.length === 0 ? (
        <div className="empty-note">
          <p>{w.t('Everything on the shelves is already in the window.', 'Wszystko z półek stoi już w oknie.')}</p>
          <button onClick={onShelves}>{w.t('Plant something new', 'Posadź coś nowego')}</button>
        </div>
      ) : (
        <div className="picker scroll">
          {plants.map((p) => (
            <button key={p.id} onClick={() => onPick(p.id)}>
              <Preview species={p.species} stage={stageAt(p.species, p, now)} pot={p.pot} variety={p.variety} designs={designs} />
              <span className="pl">{w.flower(p.species)}</span>
              <span className="en">{w.stage(stageAt(p.species, p, now))}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const PRESS_ICON = (
  <g>
    <path d="M-10,-8 L10,-8 L10,9 L-10,9 Z" />
    <path d="M0,6 C0,2 -1,-1 -2,-3 M-2,-3 C-5,-4 -6,-2 -5,0 C-3,1 -2,0 -2,-3 Z M-2,-3 C0,-6 3,-5 3,-3 C3,-1 0,-1 -2,-3 Z M-1,2 C2,1 4,2 4,4" />
  </g>
);

export function PlantCard({ plant, now, inWindowView, onWater, onMove, onWindow, onStyle, onTrim, onPress, pressedToday, onBook, onName, onRemove, onClose }: {
  plant: Plant;
  now: number;
  /** In the window view the card offers taking the plant down; on the shelves, putting it up or removing it. */
  inWindowView: boolean;
  onWater: () => void;
  onMove: () => void;
  onWindow: () => void;
  onStyle: () => void;
  /** Present when the plant has a vine that can be cut back. */
  onTrim: (() => void) | null;
  /** Present while a flower can be pressed from it today. */
  onPress: (() => void) | null;
  pressedToday: boolean;
  onBook: () => void;
  onName: (name: string) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const w = useWords();
  const { t } = w;
  const stage = stageAt(plant.species, plant, now);
  return (
    <div className="sheet" role="dialog" aria-label={w.flower(plant.species)}>
      <div className="sheet-head">
        <PlantTitle plant={plant} onName={onName} />
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      <p className="meta">
        {w.stage(stage)} · {plantedText(plant, now, w)}
        {!inWindowView && plant.display && t(' · in the window', ' · w oknie')}
        {plant.vine && t(' · climbing', ' · pnie się')}
      </p>
      <p className="meta growth-line">
        <span className={isSoilWet(plant, now) ? 'tag wet' : 'tag dry'}>
          {isSoilWet(plant, now) ? t('Watered', 'Ma wodę') : t('Not watered yet', 'Czeka na wodę')}
        </span>
        <span>{growthText(plant, now, w)}</span>
      </p>
      {plant.trait && (
        <p className={`trait-line trait-${plant.trait.kind}`}>
          <span className="trait-chip">{t(...TRAIT_WORDS[plant.trait.kind].name)}</span>
          <span>{t(...TRAIT_WORDS[plant.trait.kind].about)}</span>
        </p>
      )}
      <div className={!inWindowView || (inWindowView && onTrim) ? 'actions five' : 'actions'}>
        <button data-sound="water" onClick={onWater}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-2,8 L-1,-3 C-1,-5 9,-5 9,-3 L10,8 Z M-1,0 L-11,-8 M-13,-10 L-9,-6 M9,-2 C14,-3 14,5 9.6,5" />
          </svg>
          {t('Water', 'Podlej')}
        </button>
        <button onClick={onMove}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-10,0 L10,0 M6,-4 L10,0 L6,4 M-6,-4 L-10,0 L-6,4" />
          </svg>
          {t('Move', 'Przesuń')}
        </button>
        {!inWindowView && (
          <button onClick={onWindow}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">{WINDOW_ICON}</svg>
            {plant.display ? t('Take down', 'Zdejmij') : t('Window', 'Do okna')}
          </button>
        )}
        {inWindowView && onTrim && (
          <button onClick={onTrim}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">
              <path d="M-8,-9 L5,5 M8,-9 L-5,5 M-5,5 A3.4,3.4 0 1 0 -5.01,5 M5,5 A3.4,3.4 0 1 0 5.01,5" />
            </svg>
            {t('Trim', 'Przytnij')}
          </button>
        )}
        <button onClick={onStyle}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-9,9 C-9,5 -6,3 -3,4 C-1,5 -1,8 -3,9 C-5,10 -8,10 -9,9 Z M-2,3 L8,-8 C9,-9 10,-8 9,-7 L-1,5" />
          </svg>
          {t('Style', 'Wygląd')}
        </button>
        {inWindowView ? (
          <button onClick={onWindow}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">
              <path d="M0,-9 L0,7 M-5,2 L0,7 L5,2 M-9,10 L9,10" />
            </svg>
            {t('Take down', 'Zdejmij')}
          </button>
        ) : (
          <button className={confirm ? 'danger' : undefined} onClick={() => (confirm ? onRemove() : setConfirm(true))}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">
              <path d="M-8,-6 L8,-6 M-3,-6 L-3,-9 L3,-9 L3,-6 M-6,-6 L-5,9 L5,9 L6,-6" />
            </svg>
            {confirm ? t('Sure?', 'Na pewno?') : t('Remove', 'Usuń')}
          </button>
        )}
      </div>
      {(onPress || pressedToday) && (
        <div className="press-row">
          {onPress ? (
            <button data-sound="page" onClick={onPress}>
              <svg viewBox="-14 -14 28 28" aria-hidden="true">{PRESS_ICON}</svg>
              {t('Press a flower for the book', 'Zasusz kwiatek do zielnika')}
            </button>
          ) : (
            <button className="quiet" onClick={onBook}>
              <svg viewBox="-14 -14 28 28" aria-hidden="true">{PRESS_ICON}</svg>
              {t('Pressed today · open the book', 'Zasuszony dziś · otwórz zielnik')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function MoveBanner({ text, onCancel }: { text: string; onCancel: () => void }) {
  const w = useWords();
  return (
    <div className="banner" role="status">
      <span>{text}</span>
      <button onClick={onCancel}>{w.t('Cancel', 'Anuluj')}</button>
    </div>
  );
}
