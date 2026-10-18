import { useState, type ReactNode } from 'react';
import {
  PANSY_FACES,
  PANSY_SWATCHES,
  POT_PATTERNS,
  POT_SHAPES,
  POT_SWATCHES,
  SWATCH_NAMES,
  type PansyDesign,
  type PansyFace,
  type PotDesign,
  type PotPattern,
} from '../garden/designs';
import { newId } from '../garden/state';
import { designColors } from '../plants/looks';
import { PansyFlower, PansyPlant } from '../plants/Pansy';
import { PaintedFront } from '../plants/PaintedPot';
import { Potted } from '../plants/Pots';
import { FLOOR_SWATCHES, ROOM_SWATCH_NAMES, ROOM_SWATCHES, type OwnRoom, type RoomPart } from '../theme/ownRoom';
import type { Theme } from '../theme/palettes';

function Swatches({ colors, value, onPick, none, names = SWATCH_NAMES }: {
  colors: readonly string[];
  value: string | null;
  onPick: (c: string | null) => void;
  none?: boolean;
  names?: Record<string, string>;
}) {
  return (
    <div className="swatches">
      {none && (
        <button className="swatch none" aria-label="None" aria-pressed={value === null} onClick={() => onPick(null)}>
          <svg viewBox="-10 -10 20 20" aria-hidden="true">
            <path d="M-6,6 L6,-6" />
          </svg>
        </button>
      )}
      {colors.map((c) => (
        <button key={c} className="swatch" aria-label={names[c] ?? c} aria-pressed={value === c} style={{ background: c }} onClick={() => onPick(c)} />
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="studio-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function StudioFrame({ title, preview, children, editing, onSave, onDelete, onClose, compact = false }: {
  title: string;
  /** Left out when the room itself shows the result, above the sheet. */
  preview?: ReactNode;
  compact?: boolean;
  children: ReactNode;
  editing: boolean;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className={compact ? 'sheet studio compact' : 'sheet studio'} role="dialog" aria-label={title}>
      <div className="sheet-head">
        <h2>{title}</h2>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      {preview && <div className="studio-preview">{preview}</div>}
      <div className="studio-body">{children}</div>
      <div className="studio-actions">
        {editing &&
          (confirm ? (
            <button className="danger" onClick={onDelete}>Throw it away?</button>
          ) : (
            <button className="quiet" onClick={() => setConfirm(true)}>Delete</button>
          ))}
        <button className="primary" onClick={onSave}>Save</button>
      </div>
    </div>
  );
}

// ---- pots ----

const PATTERN_NAMES: Record<PotPattern, string> = {
  none: 'Plain', scallops: 'Scallops', dots: 'Dots', stripes: 'Stripes', bands: 'Bands',
  hearts: 'Hearts', moons: 'Moons', checks: 'Checks', zigzag: 'Zigzag', flowers: 'Flowers',
};
const SHAPE_NAMES: Record<PotDesign['shape'], string> = { wide: 'Bowl', slim: 'Flowerpot', round: 'Jar', cauldron: 'Cauldron', teacup: 'Teacup' };

/** A pot drawn small, for the option buttons. */
function MiniPot({ d }: { d: PotDesign }) {
  return (
    <svg viewBox="-50 -8 100 66" aria-hidden="true">
      <PaintedFront d={d} />
    </svg>
  );
}

export const NEW_POT = (): PotDesign => ({ id: newId(), shape: 'wide', body: '#2b2229', pattern: 'scallops', patternColor: '#e79ab4', rim: '#4a2f4a' });

export function PotStudio({ initial, editing, children, onSave, onDelete, onClose }: {
  initial: PotDesign;
  editing: boolean;
  /** What grows in the preview pot. */
  children: ReactNode;
  onSave: (d: PotDesign) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [d, setD] = useState(initial);
  const set = (patch: Partial<PotDesign>) => setD((x) => ({ ...x, ...patch }));
  return (
    <StudioFrame
      title={editing ? 'Repaint the pot' : 'Paint a pot'}
      editing={editing}
      onSave={() => onSave(d)}
      onDelete={onDelete}
      onClose={onClose}
      preview={
        <svg viewBox="-60 -128 120 192" aria-hidden="true">
          <Potted kind={d.shape} design={d}>
            {children}
          </Potted>
        </svg>
      }
    >
      <Section title="Shape">
        <div className="options five">
          {POT_SHAPES.map((shape) => (
            <button key={shape} aria-pressed={d.shape === shape} onClick={() => set({ shape })}>
              <MiniPot d={{ ...d, shape }} />
              <span>{SHAPE_NAMES[shape]}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Colour">
        <Swatches colors={POT_SWATCHES} value={d.body} onPick={(c) => c && set({ body: c })} />
      </Section>
      <Section title="Pattern">
        <div className="options five">
          {POT_PATTERNS.map((pattern) => (
            <button key={pattern} aria-pressed={d.pattern === pattern} onClick={() => set({ pattern })}>
              <MiniPot d={{ ...d, pattern }} />
              <span>{PATTERN_NAMES[pattern]}</span>
            </button>
          ))}
        </div>
      </Section>
      {d.pattern !== 'none' && (
        <Section title="Pattern colour">
          <Swatches colors={POT_SWATCHES} value={d.patternColor} onPick={(c) => c && set({ patternColor: c })} />
        </Section>
      )}
      <Section title="Rim">
        <Swatches colors={POT_SWATCHES} value={d.rim} onPick={(c) => c && set({ rim: c })} />
      </Section>
    </StudioFrame>
  );
}

// ---- bratki ----

const FACE_NAMES: Record<PansyFace, string> = { blotch: 'Blotch', whiskers: 'Whiskers', clear: 'Clear' };

export const NEW_PANSY = (): PansyDesign => ({
  id: newId(), name: '', top: '#4a2350', low: '#eaa2bb', face: 'blotch', faceColor: '#241326', edge: null,
});

export function PansyStudio({ initial, editing, onSave, onDelete, onClose }: {
  initial: PansyDesign;
  editing: boolean;
  onSave: (d: PansyDesign) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [d, setD] = useState(initial);
  const set = (patch: Partial<PansyDesign>) => setD((x) => ({ ...x, ...patch }));
  const colors = designColors(d);
  return (
    <StudioFrame
      title={editing ? 'Your bratek' : 'Design a bratek'}
      editing={editing}
      onSave={() => onSave({ ...d, name: d.name.trim() })}
      onDelete={onDelete}
      onClose={onClose}
      preview={
        <svg viewBox="-110 -128 220 192" aria-hidden="true">
          <g transform="translate(-48 -40)">
            <PansyFlower x={0} y={0} s={2} c={colors} />
          </g>
          <g transform="translate(58 6) scale(0.72)">
            <Potted kind="wide">
              <PansyPlant stage="bloom" palette={[colors]} />
            </Potted>
          </g>
        </svg>
      }
    >
      <Section title="Name">
        <input
          className="studio-name"
          value={d.name}
          maxLength={32}
          placeholder="Name your bratek"
          onChange={(e) => set({ name: e.target.value })}
        />
      </Section>
      <Section title="Top petals">
        <Swatches colors={PANSY_SWATCHES} value={d.top} onPick={(c) => c && set({ top: c })} />
      </Section>
      <Section title="Lower petals">
        <Swatches colors={PANSY_SWATCHES} value={d.low} onPick={(c) => c && set({ low: c })} />
      </Section>
      <Section title="Face">
        <div className="options three">
          {PANSY_FACES.map((face) => (
            <button key={face} aria-pressed={d.face === face} onClick={() => set({ face })}>
              <svg viewBox="-34 -30 68 64" aria-hidden="true">
                <PansyFlower x={0} y={0} c={designColors({ ...d, face })} />
              </svg>
              <span>{FACE_NAMES[face]}</span>
            </button>
          ))}
        </div>
      </Section>
      {d.face !== 'clear' && (
        <Section title="Face colour">
          <Swatches colors={PANSY_SWATCHES} value={d.faceColor} onPick={(c) => c && set({ faceColor: c })} />
        </Section>
      )}
      <Section title="Petal edge">
        <Swatches colors={PANSY_SWATCHES} value={d.edge} onPick={(edge) => set({ edge })} none />
      </Section>
    </StudioFrame>
  );
}

// ---- her room ----

const ROOM_SECTIONS: Array<[RoomPart, string]> = [
  ['wall', 'Walls'],
  ['motif', 'Wallpaper pattern'],
  ['curtain', 'Curtains'],
  ['frame', 'Window frame'],
  ['floor', 'Floor'],
  ['bed', 'Dog bed'],
];

/**
 * Painting her own room. The room itself is the preview: every tap shows straight away above the
 * sheet, and nothing is kept until she saves.
 */
export function RoomStudio({ room, editing, onChange, onSave, onClose }: {
  room: OwnRoom;
  editing: boolean;
  onChange: (room: OwnRoom) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const set = (patch: Partial<OwnRoom>) => onChange({ ...room, ...patch });
  return (
    <StudioFrame compact title={editing ? 'My room' : 'Paint my room'} editing={false} onSave={onSave} onDelete={() => {}} onClose={onClose}>
      <Section title="Furniture and decorations">
        <div className="decor-choice two">
          {(['cozy', 'witchy'] as Theme[]).map((base) => (
            <button key={base} aria-pressed={room.base === base} onClick={() => set({ base })}>
              {base === 'cozy' ? 'Cozy' : 'Witchy'}
            </button>
          ))}
        </div>
      </Section>
      {ROOM_SECTIONS.map(([part, title]) => (
        <Section key={part} title={title}>
          <Swatches
            colors={part === 'floor' ? FLOOR_SWATCHES : ROOM_SWATCHES}
            names={ROOM_SWATCH_NAMES}
            value={room[part]}
            onPick={(c) => c && set({ [part]: c } as Partial<OwnRoom>)}
          />
        </Section>
      ))}
    </StudioFrame>
  );
}
