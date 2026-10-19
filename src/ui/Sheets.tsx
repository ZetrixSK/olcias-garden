import { useState, type ReactNode } from 'react';
import { isSoilWet, nextStage, stageAt, waterWouldHelp } from '../garden/growth';
import { MAX_NAME } from '../garden/pressed';
import {
  designRef,
  PANSY_PRESET_NAMES,
  PANSY_PRESETS,
  POT_SHAPES,
  type Designs,
  type PotRef,
} from '../garden/designs';
import { SPECIES, SPECIES_IDS, STAGE_LABEL, type SpeciesId, type Stage } from '../garden/species';
import type { Plant } from '../garden/state';
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
        <button className="tile-edit" aria-label={`Change ${label}`} onClick={onEdit}>
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
export function VarietyPicker({ designs, onPick, onDesign, onEdit, onClose }: {
  designs: Designs;
  onPick: (variety: string) => void;
  onDesign: () => void;
  onEdit: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="sheet" role="dialog" aria-label="Which bratek?">
      <div className="sheet-head">
        <h2>Which bratek?</h2>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <div className="picker scroll">
        {PANSY_PRESETS.map((v) => (
          <Tile key={v} label={PANSY_PRESET_NAMES[v]} onPick={() => onPick(v)}>
            <Preview species="pansy" variety={v} designs={designs} />
          </Tile>
        ))}
        {designs.pansies.map((d) => (
          <Tile key={d.id} label={d.name || 'Mine'} onPick={() => onPick(designRef(d.id))} onEdit={() => onEdit(d.id)}>
            <Preview species="pansy" variety={designRef(d.id)} designs={designs} />
          </Tile>
        ))}
        <NewTile label="Design one" onClick={onDesign} />
      </div>
    </div>
  );
}

/** How a plant looks: its pot, and for a bratek its colours. */
export function StyleSheet({ plant, designs, now, onPot, onVariety, onPaint, onEditPot, onDesignPansy, onEditPansy, onClose }: {
  plant: Plant;
  designs: Designs;
  now: number;
  onPot: (pot: PotRef) => void;
  onVariety: (variety: string) => void;
  onPaint: () => void;
  onEditPot: (id: string) => void;
  onDesignPansy: () => void;
  onEditPansy: (id: string) => void;
  onClose: () => void;
}) {
  const stage = stageAt(plant.species, plant, now);
  const variety = plant.variety ?? 'mix';
  return (
    <div className="sheet" role="dialog" aria-label="Style">
      <div className="sheet-head">
        <h2>
          {SPECIES[plant.species].polish} <small>style</small>
        </h2>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <h3 className="sheet-sub">Pot</h3>
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
        <NewTile label="Paint one" onClick={onPaint} />
      </div>
      {plant.species === 'pansy' && (
        <>
          <h3 className="sheet-sub">Flowers</h3>
          <div className="picker scroll">
            {PANSY_PRESETS.map((v) => (
              <Tile key={v} label={PANSY_PRESET_NAMES[v]} selected={variety === v} onPick={() => onVariety(v)}>
                <Preview species="pansy" pot={plant.pot} variety={v} designs={designs} />
              </Tile>
            ))}
            {designs.pansies.map((d) => (
              <Tile key={d.id} label={d.name || 'Mine'} selected={variety === designRef(d.id)} onPick={() => onVariety(designRef(d.id))} onEdit={() => onEditPansy(d.id)}>
                <Preview species="pansy" pot={plant.pot} variety={designRef(d.id)} designs={designs} />
              </Tile>
            ))}
            <NewTile label="Design one" onClick={onDesignPansy} />
          </div>
        </>
      )}
    </div>
  );
}

const WINDOW_ICON = <path d="M-8,10 L-8,-2 A8,8 0 0 1 8,-2 L8,10 Z M0,-10 L0,10 M-8,2 L8,2" />;

export function PlantPicker({ onPick, onDrawing, busy, error, onClose }: {
  onPick: (s: SpeciesId) => void;
  /** Present on the shelves (not the hanging pots): stand one of her drawings here instead. */
  onDrawing: (() => void) | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
}) {
  return (
    <div className="sheet" role="dialog" aria-label="Plant something">
      <div className="sheet-head">
        <h2>What shall we plant?</h2>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <div className="picker">
        {SPECIES_IDS.map((s) => (
          <button key={s} data-sound="soil" onClick={() => onPick(s)}>
            <Preview species={s} />
            <span className="pl" style={SPECIES[s].polish.length > 9 ? { fontSize: '0.82em' } : undefined}>
              {SPECIES[s].polish}
            </span>
            <span className="en">{SPECIES[s].name}</span>
          </button>
        ))}
      </div>
      {onDrawing && (
        <div className="press-row">
          <button onClick={onDrawing} disabled={busy}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">
              <path d="M-10,-9 L10,-9 L10,9 L-10,9 Z M-10,5 L-3,-1 L2,4 L5,1 L10,6" />
              <circle cx="4" cy="-4" r="2" />
            </svg>
            {busy ? 'Adding…' : 'One of my drawings'}
          </button>
          {error && <p className="decor-error">{error}</p>}
        </div>
      )}
    </div>
  );
}

const NEXT_VERB: Record<Stage, string> = { seed: '', seedling: 'Sprouts', bud: 'Buds', bloom: 'Blooms' };
const HOUR = 3_600_000;

/**
 * Roughly when something will happen, in words rather than a countdown: "any moment now",
 * "in a couple of hours", "tomorrow morning", "in about 3 days".
 */
export function whenText(inMs: number, now: number): string {
  const min = inMs / 60_000;
  if (min <= 2) return 'any moment now';
  if (min < 15) return 'in a few minutes';
  if (min < 50) return 'within the hour';
  if (inMs < 2.5 * HOUR) return 'in a couple of hours';
  if (inMs < 6 * HOUR) return 'in a few hours';
  const at = new Date(now + inMs);
  const today = new Date(now);
  const days = Math.round((new Date(at).setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) / 86_400_000);
  const h = at.getHours();
  const part = h < 5 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  if (days === 0) return part === 'evening' ? 'this evening' : 'later today';
  if (days === 1) return part === 'night' ? 'overnight' : `tomorrow ${part}`;
  return `in about ${days} days`;
}

/** The line on a plant's card that says roughly when it grows next. */
export function growthText(plant: Plant, now: number): string {
  const next = nextStage(plant.species, plant, now);
  if (!next) return 'In full bloom';
  const sooner = waterWouldHelp(plant, now) && next.inMs > 30 * 60_000 ? ' · sooner with water' : '';
  return `${NEXT_VERB[next.stage]} ${whenText(next.inMs, now)}${sooner}`;
}

/** The plant's name in its card's title, editable in place. */
function PlantTitle({ plant, onName }: { plant: Plant; onName: (name: string) => void }) {
  const info = SPECIES[plant.species];
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
          placeholder={`Name this ${info.polish}`}
          aria-label="Name"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
        />
        <button type="submit">Done</button>
      </form>
    );
  }
  return (
    <h2>
      {plant.name ? (
        <>
          {plant.name} <small>{info.polish}</small>
        </>
      ) : (
        <>
          {info.polish} <small>{info.name}</small>
        </>
      )}
      <button className="name-pencil" aria-label={plant.name ? 'Rename' : 'Give it a name'} onClick={() => setEditing(true)}>
        <svg viewBox="-14 -14 28 28" aria-hidden="true">
          <path d="M-7,7 L-6,2 L5,-9 L9,-5 L-2,6 Z M2,-6 L6,-2" />
        </svg>
      </button>
    </h2>
  );
}

function plantedText(plant: Plant, now: number): string {
  const days = Math.floor((now - plant.plantedAt) / 86_400_000);
  if (days <= 0) return 'Planted today';
  if (days === 1) return 'Planted yesterday';
  return `Planted ${days} days ago`;
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
  return (
    <div className="sheet" role="dialog" aria-label="Put a plant in the window">
      <div className="sheet-head">
        <h2>Which one goes here?</h2>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      {plants.length === 0 ? (
        <div className="empty-note">
          <p>Everything on the shelves is already in the window.</p>
          <button onClick={onShelves}>Plant something new</button>
        </div>
      ) : (
        <div className="picker scroll">
          {plants.map((p) => (
            <button key={p.id} onClick={() => onPick(p.id)}>
              <Preview species={p.species} stage={stageAt(p.species, p, now)} pot={p.pot} variety={p.variety} designs={designs} />
              <span className="pl">{SPECIES[p.species].polish}</span>
              <span className="en">{STAGE_LABEL[stageAt(p.species, p, now)]}</span>
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
  const info = SPECIES[plant.species];
  const stage = stageAt(plant.species, plant, now);
  return (
    <div className="sheet" role="dialog" aria-label={info.name}>
      <div className="sheet-head">
        <PlantTitle plant={plant} onName={onName} />
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <p className="meta">
        {STAGE_LABEL[stage]} · {plantedText(plant, now)}
        {!inWindowView && plant.display && ' · in the window'}
        {plant.vine && ' · climbing'}
      </p>
      <p className="meta growth-line">
        <span className={isSoilWet(plant, now) ? 'tag wet' : 'tag dry'}>{isSoilWet(plant, now) ? 'Watered' : 'Not watered yet'}</span>
        <span>{growthText(plant, now)}</span>
      </p>
      <div className={!inWindowView || (inWindowView && onTrim) ? 'actions five' : 'actions'}>
        <button data-sound="water" onClick={onWater}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-2,8 L-1,-3 C-1,-5 9,-5 9,-3 L10,8 Z M-1,0 L-11,-8 M-13,-10 L-9,-6 M9,-2 C14,-3 14,5 9.6,5" />
          </svg>
          Water
        </button>
        <button onClick={onMove}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-10,0 L10,0 M6,-4 L10,0 L6,4 M-6,-4 L-10,0 L-6,4" />
          </svg>
          Move
        </button>
        {!inWindowView && (
          <button onClick={onWindow}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">{WINDOW_ICON}</svg>
            {plant.display ? 'Take down' : 'Window'}
          </button>
        )}
        {inWindowView && onTrim && (
          <button onClick={onTrim}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">
              <path d="M-8,-9 L5,5 M8,-9 L-5,5 M-5,5 A3.4,3.4 0 1 0 -5.01,5 M5,5 A3.4,3.4 0 1 0 5.01,5" />
            </svg>
            Trim
          </button>
        )}
        <button onClick={onStyle}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-9,9 C-9,5 -6,3 -3,4 C-1,5 -1,8 -3,9 C-5,10 -8,10 -9,9 Z M-2,3 L8,-8 C9,-9 10,-8 9,-7 L-1,5" />
          </svg>
          Style
        </button>
        {inWindowView ? (
          <button onClick={onWindow}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">
              <path d="M0,-9 L0,7 M-5,2 L0,7 L5,2 M-9,10 L9,10" />
            </svg>
            Take down
          </button>
        ) : (
          <button className={confirm ? 'danger' : undefined} onClick={() => (confirm ? onRemove() : setConfirm(true))}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">
              <path d="M-8,-6 L8,-6 M-3,-6 L-3,-9 L3,-9 L3,-6 M-6,-6 L-5,9 L5,9 L6,-6" />
            </svg>
            {confirm ? 'Sure?' : 'Remove'}
          </button>
        )}
      </div>
      {(onPress || pressedToday) && (
        <div className="press-row">
          {onPress ? (
            <button data-sound="page" onClick={onPress}>
              <svg viewBox="-14 -14 28 28" aria-hidden="true">{PRESS_ICON}</svg>
              Press a flower for the book
            </button>
          ) : (
            <button className="quiet" onClick={onBook}>
              <svg viewBox="-14 -14 28 28" aria-hidden="true">{PRESS_ICON}</svg>
              Pressed today · open the book
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function MoveBanner({ text, onCancel }: { text: string; onCancel: () => void }) {
  return (
    <div className="banner" role="status">
      <span>{text}</span>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
